import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { Match } from '../walking/entities/match.entity';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { WsAuthGuard } from '../../common/guards/ws-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessage, Match])],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, WsAuthGuard],
  exports: [ChatService],
})
export class ChatModule {}
