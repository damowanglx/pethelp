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
      // Fallback: LIKE search if FULLTEXT not available
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return this.articleRepo.find({ where: { isPublished: true } as any, take: 5 });
    }
  }

  private async callLLM(query: string, context: string): Promise<Record<string, unknown>> {
    const apiKey = this.configService.get<string>('LLM_API_KEY', '');
    const baseUrl = this.configService.get<string>('LLM_BASE_URL', 'https://api.deepseek.com/v1');
    const model = this.configService.get<string>('LLM_MODEL', 'deepseek-chat');

    const systemPrompt = `你是 PetHelp AI 宠物健康助手。根据知识库文章回答宠物健康问题。
每条回答必须包含:
1. possible_conditions: 可能的病症列表 (数组,每项含name/probability/description)
2. urgency_level: low|medium|high|emergency
3. home_care: 居家护理建议 (字符串数组)
4. when_to_see_vet: 何时必须就医
5. disclaimer: "AI建议仅供参考，不能替代兽医诊断。紧急情况请立即就医。"

上下文知识库: ${context || '暂无相关文章'}`;

    try {
      const { data } = await axios.post(`${baseUrl}/chat/completions`, {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }, {
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      });

      const content = data.choices?.[0]?.message?.content || '';
      return this.parseResponse(content);
    } catch (error) {
      this.logger.error('LLM call failed', error);
      return this.fallbackResponse(query);
    }
  }

  private parseResponse(content: string): Record<string, unknown> {
    try {
      // Try to extract JSON if LLM wrapped it
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch { /* not JSON */ }
    return {
      possible_conditions: [{ name: '无法确定', probability: 'unknown', description: content.slice(0, 200) }],
      urgency_level: 'medium',
      home_care: ['观察宠物状态', '确保充足的饮水', '保持环境安静舒适'],
      when_to_see_vet: '如症状持续超过24小时或加重，请立即就医',
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
