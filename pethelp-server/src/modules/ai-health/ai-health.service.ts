import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AiConsultation } from './entities/ai-consultation.entity';
import { AiDailyUsage } from './entities/ai-daily-usage.entity';
import { KnowledgeArticle } from '../knowledge/entities/knowledge-article.entity';
import { RedisService } from '../../redis/redis.service';
import { sha256Normalize } from '../../shared/hash-utils';

const DAILY_LIMIT = 10;

@Injectable()
export class AiHealthService {
  private readonly logger = new Logger(AiHealthService.name);

  constructor(
    @InjectRepository(AiConsultation)
    private consultRepo: Repository<AiConsultation>,
    @InjectRepository(AiDailyUsage)
    private usageRepo: Repository<AiDailyUsage>,
    @InjectRepository(KnowledgeArticle)
    private articleRepo: Repository<KnowledgeArticle>,
    private redis: RedisService,
    private configService: ConfigService,
  ) {}

  async consult(userId: number, queryText: string, petId?: number): Promise<Record<string, unknown>> {
    // Check daily limit
    const today = new Date().toISOString().split('T')[0];
    const usageKey = `ai:usage:${userId}:${today}`;
    const count = await this.redis.get<number>(usageKey) || 0;
    if (count >= DAILY_LIMIT) throw new BadRequestException('Daily AI consultation limit reached (10/day)');

    // Check cache
    const queryHash = sha256Normalize(queryText);
    const cacheKey = `ai:cache:${queryHash}`;
    const cached = await this.redis.get<Record<string, unknown>>(cacheKey);
    if (cached) {
      await this.incrementUsage(userId, today);
      await this.saveConsultation(userId, queryText, cached, queryHash, petId);
      return cached;
    }

    // RAG: Search knowledge articles
    const articles = await this.searchArticles(queryText);
    const context = articles.map((a) => `[${a.title}]: ${a.summary || a.content}`).join('\n\n');

    // Build prompt and call LLM
    const response = await this.callLLM(queryText, context);

    // Cache and save
    await this.redis.set(cacheKey, response, 86400);
    await this.incrementUsage(userId, today);
    await this.saveConsultation(userId, queryText, response, queryHash, petId);

    return response;
  }

  async getHistory(userId: number, page = 1, limit = 20) {
    const [items, total] = await this.consultRepo.findAndCount({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { userId } as any,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async getDailyUsage(userId: number) {
    const today = new Date().toISOString().split('T')[0];
    const count = await this.redis.get<number>(`ai:usage:${userId}:${today}`) || 0;
    return { used: Math.min(count, DAILY_LIMIT), limit: DAILY_LIMIT, remaining: Math.max(0, DAILY_LIMIT - count) };
  }

  private async searchArticles(query: string): Promise<KnowledgeArticle[]> {
    try {
      return await this.articleRepo
        .createQueryBuilder('a')
        .where('MATCH(a.title, a.content) AGAINST (:kw IN NATURAL LANGUAGE MODE)', { kw: query })
        .andWhere('a.isPublished = 1')
        .orderBy('a.viewCount', 'DESC')
        .take(5)
        .getMany();
    } catch {
      // Fulltext not available — use LIKE with query terms
      try {
        const terms = query.split(/[\s，,。！？、]/).filter((t) => t.length >= 2).slice(0, 3);
        if (terms.length === 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return this.articleRepo.find({ where: { isPublished: true } as any, order: { viewCount: 'DESC' } as any, take: 5 });
        }
        const qb = this.articleRepo.createQueryBuilder('a').where('a.isPublished = 1');
        terms.forEach((t, i) => {
          qb.orWhere(`a.title LIKE :term${i}`, { [`term${i}`]: `%${t}%` });
          qb.orWhere(`a.content LIKE :cterm${i}`, { [`cterm${i}`]: `%${t}%` });
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return qb.orderBy('a.viewCount', 'DESC' as any).take(5).getMany();
      } catch {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.articleRepo.find({ where: { isPublished: true } as any, order: { viewCount: 'DESC' } as any, take: 5 });
      }
    }
  }

  private async callLLM(query: string, context: string): Promise<Record<string, unknown>> {
    const apiKey = this.configService.get<string>('LLM_API_KEY', '');

    // If LLM API key is configured, use it
    if (apiKey) {
      return this.callRealLLM(query, context, apiKey);
    }

    // Otherwise, return keyword-matched knowledge base results (free, no API cost)
    return this.buildKnowledgeResponse(query, context);
  }

  private async callRealLLM(query: string, context: string, apiKey: string): Promise<Record<string, unknown>> {
    const baseUrl = this.configService.get<string>('LLM_BASE_URL', 'https://api.deepseek.com/v1');
    const model = this.configService.get<string>('LLM_MODEL', 'deepseek-chat');

    const systemPrompt = `你是 PetHelp AI 宠物健康助手，由资深兽医知识库支持。你必须严格基于提供的知识库上下文回答。不得编造信息。

## 角色定位
你是一个经验丰富的宠物医生助手，擅长：
- 根据症状分析可能的疾病（鉴别诊断）
- 提供科学、安全的居家护理建议
- 判断紧急程度，指导何时必须就医
- 解释疾病成因和预防方法
- 关注不同品种的特殊风险

## 回答规则
1. 如果有匹配的知识库内容，严格基于它回答
2. 如果知识库不够，基于通用兽医学知识，标注"[通用知识]"
3. 永远建议"以下内容仅供参考，不能替代专业兽医诊断"
4. 涉及中毒、严重外伤、呼吸困难 → urgency_level 必须是 "emergency"
5. 涉及幼宠（<6个月）或老年宠（>7岁）→ 提高一个紧急等级

## 输出格式（严格 JSON）
{
  "possible_conditions": [
    {
      "name": "疾病名称（中文）",
      "probability": "high|medium|low",
      "description": "为什么会怀疑这个病，典型症状解释（100字内）"
    }
  ],
  "urgency_level": "low|medium|high|emergency",
  "urgency_reason": "紧急程度判断依据（一句话）",
  "home_care": ["具体可操作的居家护理步骤", "每条约30字", "按优先级排序"],
  "when_to_see_vet": "明确列出哪些情况下必须立即就医（3-5条）",
  "prevention": "后续如何预防（如适用）",
  "related_articles_hint": "知识库中有相关文章建议查看",
  "disclaimer": "AI建议仅供参考，不能替代兽医诊断。紧急情况请立即带宠物就医。"
}

## 知识库上下文
${context || '暂无相关文章，请基于通用兽医学知识回答，并标注[通用知识]'}`;

    try {
      const { data } = await axios.post(`${baseUrl}/chat/completions`, {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }, {
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      });

      const content = data.choices?.[0]?.message?.content || '';
      return this.parseResponse(content);
    } catch (error) {
      this.logger.error('LLM call failed, falling back to knowledge search', error);
      return this.buildKnowledgeResponse(query, context);
    }
  }

  private buildKnowledgeResponse(query: string, context: string): Record<string, unknown> {
    // Smart keyword matching for free mode
    const emergencyKeywords = ['中毒', '吐血', '抽搐', '休克', '呼吸困难', '喘不过气', '车祸', '严重外伤', '瘫痪', '被车撞', '摔伤', '坠楼', '尿闭', '难产', '异物卡喉'];
    const highKeywords = ['不吃', '绝食', '不喝', '血便', '便血', '高烧', '弓背', '惨叫', '尿血', '眼睛睁不开', '昏睡', '无法站立', '走路不稳', '浑身发抖', '口吐白沫', '倒地'];
    const mediumKeywords = ['拉稀', '腹泻', '拉肚子', '软便', '呕吐', '吐了', '咳嗽', '打喷嚏', '流鼻涕', '皮肤红', '耳朵臭', '抓挠', '痒', '不吃东西', '精神不好', '没精神', '蔫了', '发抖', '不吃不喝', '食欲不振', '消瘦', '口臭', '掉毛', '脱毛', '皮屑', '耳螨', '泪痕'];
    const lowKeywords = ['打嗝', '放屁', '打呼噜', '脚臭'];

    const q = query.toLowerCase();
    const isEmergency = emergencyKeywords.some((k) => q.includes(k));
    const isHigh = highKeywords.some((k) => q.includes(k));
    const isMedium = mediumKeywords.some((k) => q.includes(k));
    const isLow = lowKeywords.some((k) => q.includes(k));

    const urgency = isEmergency ? 'emergency' : isHigh ? 'high' : isMedium ? 'medium' : isLow ? 'low' : 'medium';

    const urgencyReasons: Record<string, string> = {
      emergency: '⚠️ 症状可能危及生命，必须立即就医',
      high: '🔴 症状较严重，强烈建议尽快就医检查',
      medium: '🟡 症状需要关注，建议观察后就医',
      low: '🟢 症状较轻，可先居家观察护理',
    };

    // Extract article titles from context for suggestions
    const articleNames = context ? context.match(/\[([^\]]+)\]/g)?.map((m) => m.slice(1, -1)).slice(0, 3) || [] : [];
    const hasArticles = articleNames.length > 0;

    return {
      possible_conditions: [
        {
          name: hasArticles ? `知识库匹配到 ${articleNames.length} 篇相关文章` : '建议补充详细信息',
          probability: hasArticles ? 'medium' : 'low',
          description: hasArticles
            ? `根据"${query}"，宠物知识库中有相关文章供参考。${urgencyReasons[urgency]}。请点击下方文章阅读详细症状分析和护理方法。`
            : `根据"${query}"，知识库暂无精确匹配。建议补充：宠物品种、年龄、症状开始时间、是否进食喝水、二便情况。${urgencyReasons[urgency]}`,
        },
      ],
      urgency_level: urgency,
      urgency_reason: urgencyReasons[urgency],
      home_care: [
        '密切观察宠物状态变化，记录症状细节',
        '确保宠物有充足的清洁饮水',
        '保持环境安静舒适，避免应激',
        '暂时不要改变饮食，避免加重肠胃负担',
      ],
      when_to_see_vet: isEmergency
        ? '⚠️ 立即前往最近的宠物医院急诊！不要耽搁！'
        : isHigh
          ? '建议尽快（24小时内）带宠物就医，不要拖延'
          : '如症状持续超过24小时、加重、或出现新的严重症状，请立即就医',
      prevention: '定期体检、按时接种疫苗、保持良好卫生习惯',
      related_articles_hint: hasArticles ? `📚 建议阅读：${articleNames.join('、')}` : '💡 试试更具体的描述，如"金毛拉稀呕吐精神不好"',
      disclaimer: 'AI建议仅供参考，不能替代兽医诊断。紧急情况请立即带宠物就医。',
    };
  }

  private parseResponse(content: string): Record<string, unknown> {
    try {
      // Extract JSON block (with or without markdown fences)
      const fenceMatch = content.match(/\`\`\`(?:json)?\s*([\s\S]*?)\`\`\`/);
      const jsonStr = fenceMatch ? fenceMatch[1].trim() : content;
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Validate required fields
        if (parsed.possible_conditions && parsed.urgency_level) {
          return {
            possible_conditions: parsed.possible_conditions || [],
            urgency_level: parsed.urgency_level || 'medium',
            urgency_reason: parsed.urgency_reason || '',
            home_care: parsed.home_care || [],
            when_to_see_vet: parsed.when_to_see_vet || '如症状持续或加重，建议就医检查',
            prevention: parsed.prevention || '',
            related_articles_hint: parsed.related_articles_hint || '',
            disclaimer: parsed.disclaimer || 'AI建议仅供参考，不能替代兽医诊断。',
          };
        }
      }
    } catch (e) {
      this.logger.warn('Failed to parse LLM JSON response, falling back to text wrap');
    }
    // Fallback: wrap text content
    return {
      possible_conditions: [{ name: '分析结果', probability: 'medium', description: content.slice(0, 300) }],
      urgency_level: 'medium',
      urgency_reason: '',
      home_care: ['密切观察宠物状态', '确保充足的饮水', '保持正常饮食和环境安静'],
      when_to_see_vet: '如症状持续超过24小时或加重，请立即就医',
      prevention: '',
      disclaimer: 'AI建议仅供参考，不能替代兽医诊断。紧急情况请立即就医。',
    };
  }

  private fallbackResponse(query: string): Record<string, unknown> {
    return {
      possible_conditions: [{ name: '建议线下就诊', probability: 'unknown', description: 'AI服务暂时不可用，建议带宠物到附近宠物医院检查' }],
      urgency_level: 'medium',
      home_care: ['观察宠物状态变化', '记录症状细节', '保持正常饮食'],
      when_to_see_vet: '建议尽快安排检查',
      disclaimer: 'AI服务暂时不可用。如有紧急情况请立即前往宠物医院。',
    };
  }

  private async incrementUsage(userId: number, today: string) {
    await this.redis.incr(`ai:usage:${userId}:${today}`);
    await this.redis.expire(`ai:usage:${userId}:${today}`, 86400);

    // Also persist to DB
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await this.usageRepo.findOne({ where: { userId, queryDate: today } as any });
    if (existing) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.usageRepo.update(existing.id, { count: () => 'count + 1' } as any);
    } else {
      await this.usageRepo.save(this.usageRepo.create({ userId, queryDate: today, count: 1 }));
    }
  }

  private async saveConsultation(userId: number, queryText: string, response: Record<string, unknown>, queryHash: string, petId?: number) {
    const consult = this.consultRepo.create({
      userId, petId: petId || null, queryText, response, queryHash,
      urgencyLevel: response.urgency_level as string || 'medium',
      consultationType: 'symptom',
    });
    await this.consultRepo.save(consult);
  }
}
