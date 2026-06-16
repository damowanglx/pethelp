import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversations')
  async getConversations(@CurrentUser() user: JwtPayload) {
    return this.chatService.getConversations(user.sub);
  }

  @Get('matches/:matchId/messages')
  async getMessages(@Param('matchId', ParseIntPipe) matchId: number, @Query('page') page = 1, @Query('limit') limit = 50) {
    return this.chatService.getMessages(matchId, page, limit);
  }

  @Post('matches/:matchId/messages')
  async sendMessage(@Param('matchId', ParseIntPipe) matchId: number, @CurrentUser() user: JwtPayload, @Body() body: { content: string; receiverId: number; msgType?: string }) {
    return this.chatService.saveMessage({
      matchId, senderId: user.sub, receiverId: body.receiverId,
      content: body.content, msgType: body.msgType || 'text',
    });
  }

  @Patch('messages/:id/read')
  async markRead(@Param('id', ParseIntPipe) _id: number) {
    await this.chatService.markAsRead([_id]);
    return { success: true };
  }
}
