import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CharacterUnlockEntity } from './character-unlock.entity';

export interface GrantUnlockInput {
  source?: string | null;
  priceCents?: number | null;
  orderId?: string | null;
}

/**
 * Paid character unlock entitlements. P1 wires real purchase callbacks on top.
 */
@Injectable()
export class CharacterUnlockService {
  private readonly logger = new Logger(CharacterUnlockService.name);

  constructor(
    @InjectRepository(CharacterUnlockEntity)
    private readonly unlockRepo: Repository<CharacterUnlockEntity>,
  ) {}

  async hasUnlocked(ownerId: string, characterId: string): Promise<boolean> {
    if (!ownerId) return false;
    const row = await this.unlockRepo.findOneBy({ ownerId, characterId });
    return Boolean(row);
  }

  async grantUnlock(
    ownerId: string,
    characterId: string,
    input: GrantUnlockInput = {},
  ): Promise<CharacterUnlockEntity> {
    const owner = ownerId || null;
    const existing = owner
      ? await this.unlockRepo.findOneBy({ ownerId: owner, characterId })
      : null;
    if (existing) {
      if (input.source !== undefined && input.source !== existing.source) {
        existing.source = input.source;
      }
      if (input.priceCents !== undefined) {
        existing.priceCents = input.priceCents;
      }
      if (input.orderId !== undefined) {
        existing.orderId = input.orderId;
      }
      return this.unlockRepo.save(existing);
    }
    return this.unlockRepo.save(
      this.unlockRepo.create({
        ownerId: owner,
        characterId,
        source: input.source ?? 'admin_grant',
        priceCents: input.priceCents ?? null,
        orderId: input.orderId ?? null,
        unlockedAt: new Date(),
      }),
    );
  }
}
