import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { WalkingRequest } from './walking-request.entity';
import { ChatMessage } from '../../chat/entities/chat-message.entity';
import { ReviewRating } from '../../reviews/entities/review-rating.entity';
import { WalkTrail } from './walk-trail.entity';
import { WalkLocation } from './walk-location.entity';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  requestId: number;

  @Column({ type: 'bigint', unsigned: true })
  helperId: number;

  @Column({ type: 'enum', enum: ['applied', 'accepted', 'rejected', 'cancelled', 'in_progress', 'completed', 'disputed'], default: 'applied' })
  status: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  ownerMessage: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  helperMessage: string | null;

  @Column({ type: 'datetime', nullable: true })
  respondedAt: Date | null;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  startedAt: Date | null;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  endedAt: Date | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  trackDistanceM: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  trackDurationS: number | null;

  @Column({ type: 'tinyint', unsigned: true, default: 5 })
  syncIntervalS: number;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  cancelledAt: Date | null;

  @Column({ type: 'varchar', length: 256, nullable: true })
  cancelReason: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => WalkingRequest, (wr) => wr.matches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request: WalkingRequest;

  @ManyToOne(() => User, (user) => user.matches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'helper_id' })
  helper: User;

  @OneToMany(() => ChatMessage, (cm) => cm.match)
  messages: ChatMessage[];

  @OneToMany(() => ReviewRating, (rr) => rr.match)
  reviews: ReviewRating[];

  @OneToMany(() => WalkTrail, (wt) => wt.match)
  trails: WalkTrail[];

  @OneToMany(() => WalkLocation, (wl) => wl.match)
  locations: WalkLocation[];
}
