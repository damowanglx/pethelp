import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { Match } from '../walking/entities/match.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private chatRepo: Repository<ChatMessage>,
    @InjectRepository(Match)
    private matchRepo: Repository<Match>,
  ) {}

  private async assertParticipant(matchId: number, userId: number): Promise<Match> {
    const match = await this.matchRepo.findOne({
      where: { id: matchId },
      relations: ['request'],
    });
    if (!match) throw new ForbiddenException('匹配不存在');
    if (match.helperId !== userId && match.request.ownerId !== userId) {
      throw new ForbiddenException('您不是该匹配的参与者');
    }
    return match;
  }

  async saveMessage(dto: { matchId: number; senderId: number; receiverId: number; content: string; msgType: string }) {
    await this.assertParticipant(dto.matchId, dto.senderId);
    const msg = this.chatRepo.create(dto);
    return this.chatRepo.save(msg);
  }

  async getMessages(matchId: number, userId: number, page = 1, limit = 50) {
    await this.assertParticipant(matchId, userId);
    const [items, total] = await this.chatRepo.findAndCount({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { matchId } as any,
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items: items.reverse(), total, page, limit };
  }

  async getConversations(userId: number) {
    // 1. Get active matches (accepted/in_progress) where user is owner or helper
    const activeMatches = await this.matchRepo
      .createQueryBuilder('match')
      .leftJoin('match.request', 'request')
      .leftJoin('match.helper', 'helper')
      .leftJoin('request.owner', 'owner')
      .select('match.id', 'matchId')
      .addSelect('helper.nickname', 'helperName')
      .addSelect('owner.nickname', 'ownerName')
      .addSelect('request.id', 'requestId')
      .addSelect('request.ownerId', 'ownerId')
      .addSelect('match.helperId', 'helperId')
      .addSelect('match.status', 'status')
      .where(
        '(request.ownerId = :userId OR match.helperId = :userId) AND match.status IN (:...statuses)',
        { userId, statuses: ['accepted', 'in_progress'] },
      )
      .getRawMany();

    // 2. Get message-based conversations (for matches that had messages but may be completed)
    const msgConvs = await this.chatRepo
      .createQueryBuilder('m')
      .select('m.matchId', 'matchId')
      .addSelect('MAX(m.createdAt)', 'lastMessageAt')
      .addSelect('SUM(CASE WHEN m.isRead = 0 AND m.receiverId = :userId THEN 1 ELSE 0 END)', 'unreadCount')
      .where('m.senderId = :userId OR m.receiverId = :userId', { userId })
      .groupBy('m.matchId')
      .orderBy('MAX(m.createdAt)', 'DESC')
      .getRawMany();

    // Merge: active matches + message conversations, dedup by matchId
    const seen = new Set<number>();
    const result: Array<Record<string, unknown>> = [];

    const msgMap = new Map(msgConvs.map((m: Record<string, unknown>) => [Number(m.matchId), m]));

    for (const m of activeMatches) {
      if (seen.has(Number(m.matchId))) continue;
      seen.add(Number(m.matchId));
      const msgInfo = msgMap.get(Number(m.matchId));
      result.push({
        matchId: Number(m.matchId),
        otherUser: {
          nickname: Number(userId) === Number(m.ownerId) ? m.helperName : m.ownerName,
        },
        unreadCount: msgInfo ? (parseInt(String(msgInfo.unreadCount)) || 0) : 0,
        lastMessageAt: msgInfo?.lastMessageAt || null,
      });
    }

    for (const m of msgConvs) {
      if (seen.has(Number(m.matchId))) continue;
      seen.add(Number(m.matchId));
      result.push({
        matchId: Number(m.matchId),
        unreadCount: parseInt(String(m.unreadCount)) || 0,
        lastMessageAt: m.lastMessageAt,
      });
    }

    return result;
  }

  async markAsRead(messageIds: number[]) {
    if (!messageIds.length) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.chatRepo.update(messageIds, { isRead: true, readAt: new Date() } as any);
  }
}
