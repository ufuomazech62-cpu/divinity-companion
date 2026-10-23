import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

// A retrievable chunk of one knowledge document.
@Entity('knowledge_chunks')
@Index(['documentId'])
export class KnowledgeChunkEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  documentId: string;

  @Column({ type: 'text', nullable: true })
  ownerId?: string | null;

  @Column({ type: 'text', nullable: true })
  characterId?: string | null;

  @Column('int', { default: 0 })
  position: number;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
