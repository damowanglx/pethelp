import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Pet } from '../../pets/entities/pet.entity';
import { WalkingRequest } from '../../walking/entities/walking-request.entity';
import { Match } from '../../walking/entities/match.entity';
import { ChatMessage } from '../../chat/entities/chat-message.entity';
import { ReviewRating } from '../../reviews/entities/review-rating.entity';
import { UserBadge } from '../../trust/entities/user-badge.entity';
import { UserCertification } from '../../trust/entities/user-certification.entity';
import { UserDeposit } from '../../trust/entities/user-deposit.entity';
import { AiConsultation } from '../../ai-health/entities/ai-consultation.entity';
import { AiDailyUsage } from '../../ai-health/entities/ai-daily-usage.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 64, unique: true })
  openid: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  unionid: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  nickname: string | null;

  @Column({ type: 'varchar', length: 256, nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'enum', enum: ['pet_owner', 'helper', 'both'], default: 'both' })
  role: string;

  @Column({ type: 'tinyint', default: 0 })
  gender: number;

  @Column({ type: 'varchar', length: 64, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  province: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  @Column({ type: 'datetime', nullable: true })
  locationUpdatedAt: Date | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, unsigned: true, default: 0 })
  creditScore: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  completionCount: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  cancellationCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, unsigned: true, default: 0 })
  completionRate: number;

  @Column({ type: 'int', unsigned: true, nullable: true })
  avgResponseTimeS: number | null;

  @Column({ type: 'tinyint', default: 0 })
  isHelper: boolean;

  @Column({ type: 'tinyint', default: 0 })
  hasDeposit: boolean;

  @Column({ type: 'int', unsigned: true, default: 0 })
  completedWalks: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  ratingAvg: number;

  @Column({ type: 'tinyint', default: 0 })
  isDisabled: boolean;

  @Column({ type: 'datetime', nullable: true })
  lastLoginAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Pet, (pet) => pet.user)
  pets: Pet[];

  @OneToMany(() => WalkingRequest, (wr) => wr.owner)
  walkingRequests: WalkingRequest[];

  @OneToMany(() => Match, (m) => m.helper)
  matches: Match[];

  @OneToMany(() => ChatMessage, (cm) => cm.sender)
  sentMessages: ChatMessage[];

  @OneToMany(() => ChatMessage, (cm) => cm.receiver)
  receivedMessages: ChatMessage[];

  @OneToMany(() => ReviewRating, (rr) => rr.reviewer)
  writtenReviews: ReviewRating[];

  @OneToMany(() => ReviewRating, (rr) => rr.reviewee)
  receivedReviews: ReviewRating[];

  @OneToMany(() => UserBadge, (ub) => ub.user)
  badges: UserBadge[];

  @OneToMany(() => UserCertification, (uc) => uc.user)
  certifications: UserCertification[];

  @OneToMany(() => UserDeposit, (ud) => ud.user)
  deposits: UserDeposit[];

  @OneToMany(() => AiConsultation, (ac) => ac.user)
  consultations: AiConsultation[];

  @OneToMany(() => AiDailyUsage, (adu) => adu.user)
  dailyUsage: AiDailyUsage[];
}
