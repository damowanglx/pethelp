import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BadgeDefinition } from './badge-definition.entity';

@Entity('user_badges')
export class UserBadge {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @Column({ type: 'varchar', length: 50 })
  badgeKey: string;

  @CreateDateColumn()
  awardedAt: Date;

  @ManyToOne(() => User, (user) => user.badges, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => BadgeDefinition, (bd) => bd.userBadges, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'badge_key' })
  badge: BadgeDefinition;
}
