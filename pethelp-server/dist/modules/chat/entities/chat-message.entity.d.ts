import { Match } from '../../walking/entities/match.entity';
import { User } from '../../users/entities/user.entity';
export declare class ChatMessage {
    id: number;
    matchId: number;
    senderId: number;
    receiverId: number;
    msgType: string;
    content: string;
    isRead: boolean;
    readAt: Date | null;
    createdAt: Date;
    match: Match;
    sender: User;
    receiver: User;
}
