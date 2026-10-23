import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

// One expert delegation row inside a self-agent collaboration batch.
@Entity('agent_delegations')
@Index(['batchId'])
@Index(['status'])
export class AgentDelegationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  ownerId: string;

  @Column()
  batchId: string;

  @Column()
  parentConversationId: string;

  @Column({ type: 'text', nullable: true })
  anchorMessageId?: string | null;

  @Column({ type: 'text', nullable: true })
  triggerMessageId?: string | null;

  @Column('text', { nullable: true })
  triggerMessageText?: string | null;

  @Column()
  expertCharacterId: string;

  @Column()
  expertName: string;

  @Column('text')
  taskBrief: string;

  @Column({ default: 'pending_anchor' })
  status: string;

  @Column({ default: false })
  synthesized: boolean;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string | null;

  @Column({ type: 'datetime', nullable: true })
  lastAttemptAt?: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
