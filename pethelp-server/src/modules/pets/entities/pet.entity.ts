import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { WalkingRequest } from '../../walking/entities/walking-request.entity';

@Entity('pets')
export class Pet {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @Column({ type: 'varchar', length: 32 })
  name: string;

  @Column({ type: 'enum', enum: ['dog', 'cat', 'other'], default: 'dog' })
  species: string;

  @Column({ type: 'varchar', length: 64 })
  breed: string;

  @Column({ type: 'varchar', length: 256, nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'date', nullable: true })
  birthDate: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weightKg: number | null;

  @Column({ type: 'enum', enum: ['male', 'female', 'unknown'], default: 'unknown' })
  gender: string;

  @Column({ type: 'tinyint', default: 0 })
  isNeutered: boolean;

  @Column({ type: 'varchar', length: 128, nullable: true })
  temperament: string | null;

  @Column({ type: 'text', nullable: true })
  medicalNotes: string | null;

  @Column({ type: 'int', unsigned: true, default: 30 })
  walkDurationMin: number;

  @Column({ type: 'tinyint', default: 0 })
  isDisabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.pets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => WalkingRequest, (wr) => wr.pet)
  walkingRequests: WalkingRequest[];
}
