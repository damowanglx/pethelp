import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { KnowledgeArticle } from './knowledge-article.entity';

@Entity('knowledge_categories')
export class KnowledgeCategory {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 64 })
  name: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  icon: string | null;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  parentId: number | null;

  @Column({ type: 'int', unsigned: true, default: 0 })
  sortOrder: number;

  @Column({ type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => KnowledgeCategory, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent: KnowledgeCategory | null;

  @OneToMany(() => KnowledgeCategory, (kc) => kc.parent)
  children: KnowledgeCategory[];

  @OneToMany(() => KnowledgeArticle, (ka) => ka.category)
  articles: KnowledgeArticle[];
}
