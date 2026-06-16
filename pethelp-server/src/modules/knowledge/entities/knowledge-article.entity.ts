import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { KnowledgeCategory } from './knowledge-category.entity';

@Entity('knowledge_articles')
export class KnowledgeArticle {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  categoryId: number;

  @Column({ type: 'varchar', length: 256 })
  title: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  summary: string | null;

  @Column({ type: 'varchar', length: 256, nullable: true })
  coverUrl: string | null;

  @Column({ type: 'longtext' })
  content: string;

  @Column({ type: 'varchar', length: 256, nullable: true })
  tags: string | null;

  @Column({ type: 'enum', enum: ['curated', 'user', 'cms'], default: 'curated' })
  sourceType: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  sourceAuthor: string | null;

  @Column({ type: 'int', unsigned: true, default: 0 })
  viewCount: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  likeCount: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  shareCount: number;

  @Column({ type: 'tinyint', default: 0 })
  isPublished: boolean;

  @Column({ type: 'datetime', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => KnowledgeCategory, (kc) => kc.articles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: KnowledgeCategory;
}
