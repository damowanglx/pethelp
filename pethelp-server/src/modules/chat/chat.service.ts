import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './entities/chat-message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private chatRepo: Repository<ChatMessage>,
  ) {}

  async saveMessage(dto: { matchId: number; senderId: number; receiverId: number; content: string; msgType: string }) {
    const msg = this.chatRepo.create(dto);
    return this.chatRepo.save(msg);
  }

  async getMessages(matchId: number, page = 1, limit = 50) {
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
    const messages = await this.chatRepo
      .createQueryBuilder('m')
      .select('m.matchId', 'matchId')
      .addSelect('MAX(m.createdAt)', 'lastMessageAt')
      .addSelect('SUM(CASE WHEN m.isRead = 0 AND m.receiverId = :userId THEN 1 ELSE 0 END)', 'unreadCount')
      .where('m.senderId = :userId OR m.receiverId = :userId', { userId })
      .groupBy('m.matchId')
      .orderBy('MAX(m.createdAt)', 'DESC')
      .getRawMany();

    return messages.map((m) => ({
      matchId: m.matchId,
      unreadCount: parseInt(m.unreadCount) || 0,
      lastMessageAt: m.lastMessageAt,
    }));
  }

  async markAsRead(messageIds: number[]) {
    if (!messageIds.length) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.chatRepo.update(messageIds, { isRead: true, readAt: new Date() } as any);
  }
}
