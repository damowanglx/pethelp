import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Pet } from '../../pets/entities/pet.entity';
import { Match } from './match.entity';

@Entity('walking_requests')
export class WalkingRequest {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  ownerId: number;

  @Column({ type: 'bigint', unsigned: true })
  petId: number;

  @Column({ type: 'enum', enum: ['open', 'matched', 'in_progress', 'completed', 'cancelled'], default: 'open' })
  status: string;

  @Column({ type: 'date' })
  walkDate: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'int', unsigned: true })
  durationMinutes: number;

  @Column({ type: 'varchar', length: 256 })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ type: 'enum', enum: ['free', 'points', 'cash'], default: 'free' })
  rewardType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  rewardAmount: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'tinyint', default: 0 })
  requireExperience: boolean;

  @Column({ type: 'int', unsigned: true, default: 0 })
  applyCount: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  matchedHelperId: number | null;

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

  @ManyToOne(() => User, (user) => user.walkingRequests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @ManyToOne(() => Pet, (pet) => pet.walkingRequests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'matched_helper_id' })
  matchedHelper: User | null;

  @OneToMany(() => Match, (m) => m.request)
  matches: Match[];
}
