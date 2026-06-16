import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_certifications')
export class UserCertification {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @Column({ type: 'varchar', length: 50, default: 'pet_experience' })
  certType: string;

  @Column({ type: 'json', nullable: true })
  speciesExperience: Array<{ species: string; years: number; count: number }> | null;

  @Column({ type: 'tinyint', unsigned: true, default: 0 })
  years: number;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  selfDescription: string | null;

  @Column({ type: 'json', nullable: true })
  proofPhotos: string[] | null;

  @Column({ type: 'enum', enum: ['pending', 'approved', 'rejected'], default: 'pending' })
  status: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  adminRemark: string | null;

  @Column({ type: 'datetime', nullable: true })
  verifiedAt: Date | null;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  verifiedBy: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.certifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
