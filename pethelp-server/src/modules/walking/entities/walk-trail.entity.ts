import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Match } from './match.entity';

@Entity('walk_trails')
export class WalkTrail {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  matchId: number;

  @Column({ type: 'json' })
  coordinates: Array<{ lat: number; lng: number; timestamp: string }>;

  @Column({ type: 'int', unsigned: true, default: 0 })
  totalDistanceM: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  totalDurationS: number;

  @Column({ type: 'datetime', precision: 3 })
  startedAt: Date;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  endedAt: Date | null;

  @CreateDateColumn({ precision: 3 })
  createdAt: Date;

  @ManyToOne(() => Match, (match) => match.trails, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: Match;
}
