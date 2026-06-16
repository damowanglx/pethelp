import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Pet } from '../../pets/entities/pet.entity';

@Entity('ai_consultations')
export class AiConsultation {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  petId: number | null;

  @Column({ type: 'enum', enum: ['symptom', 'follow_up'], default: 'symptom' })
  consultationType: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  parentId: number | null;

  @Column({ type: 'varchar', length: 2000 })
  queryText: string;

  @Column({ type: 'json' })
  response: Record<string, unknown>;

  @Column({ type: 'json', nullable: true })
  relatedArticleIds: number[] | null;

  @Column({ type: 'enum', enum: ['low', 'medium', 'high', 'emergency'], nullable: true })
  urgencyLevel: string | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  tokensUsed: number | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  queryHash: string | null;

  @CreateDateColumn({ precision: 3 })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.consultations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Pet, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'pet_id' })
  pet: Pet | null;
}
