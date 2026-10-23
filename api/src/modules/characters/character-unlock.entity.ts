import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

// Paid character unlock entitlement (upstream notes (ownerId, id) semantics;
// P1 hardens to the mode-aware composite key).
@Entity('character_unlocks')
@Index(['ownerId', 'characterId'], { unique: true })
export class CharacterUnlockEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  ownerId?: string | null;

  @Column()
  characterId: string;

  @Column({ type: 'text', nullable: true })
  source?: string | null;

  @Column({ type: 'integer', nullable: true })
  priceCents?: number | null;

  @Column({ type: 'text', nullable: true })
  orderId?: string | null;

  @Column({ type: 'datetime', nullable: true })
  unlockedAt?: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
