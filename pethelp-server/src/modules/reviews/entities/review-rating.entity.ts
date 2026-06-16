import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Match } from '../../walking/entities/match.entity';
import { User } from '../../users/entities/user.entity';

@Entity('review_ratings')
export class ReviewRating {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, unique: true })
  matchId: number;

  @Column({ type: 'bigint', unsigned: true })
  reviewerId: number;

  @Column({ type: 'bigint', unsigned: true })
  revieweeId: number;

  @Column({ type: 'tinyint', unsigned: true })
  rating: number;

  @Column({ type: 'json', nullable: true })
  tags: string[] | null;

  @Column({ type: 'enum', enum: ['owner', 'helper'] })
  fromRole: string;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Match, (match) => match.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @ManyToOne(() => User, (user) => user.writtenReviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User;

  @ManyToOne(() => User, (user) => user.receivedReviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewee_id' })
  reviewee: User;
}
