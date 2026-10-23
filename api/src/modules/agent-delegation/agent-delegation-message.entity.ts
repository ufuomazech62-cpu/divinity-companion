import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

// One transcript line inside a delegation collaboration thread.
@Entity('agent_delegation_messages')
@Index(['delegationId'])
export class AgentDelegationMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  delegationId: string;

  @Column({ type: 'text', nullable: true })
  ownerId: string | null;

  @Column()
  senderType: string;

  @Column()
  senderId: string;

  @Column()
  senderName: string;

  @Column('text')
  text: string;

  @CreateDateColumn()
  createdAt: Date;
}
