import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

// Owner private knowledge base document (the "second brain" entry).
@Entity('knowledge_documents')
@Index(['ownerId'])
export class KnowledgeDocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  ownerId?: string | null;

  @Column({ nullable: true })
  characterId?: string | null;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  sourceKind?: string | null;

  @Column({ type: 'text', nullable: true })
  status?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
