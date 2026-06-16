import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_deposits')
export class UserDeposit {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  amountCents: number;

  @Column({ type: 'enum', enum: ['held', 'released', 'refunded', 'forfeited'], default: 'held' })
  status: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  matchId: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  transactionId: string | null;

  @Column({ type: 'datetime', nullable: true })
  heldAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  releasedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.deposits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
