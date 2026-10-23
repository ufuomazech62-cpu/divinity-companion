import { Injectable, Logger } from '@nestjs/common';
import { TenantContextStore } from '../tenancy/tenant-context';

/**
 * Upstream-aligned pivot-phase wallet client.
 * P1 hosted-keys work replaces this with the real cloud wallet service calls;
 * today it resolves the owner phone from the tenant frame and treats every
 * charge as an accepted no-op so the platform stays bootable without keys.
 */
@Injectable()
export class CloudWalletClient {
  private readonly logger = new Logger(CloudWalletClient.name);

  resolveOwnerPhone(): string | null {
    return TenantContextStore.get()?.phone ?? null;
  }

  async charge(kind: string, idempotencyKey: string, quantity = 1): Promise<void> {
    this.logger.log(
      `[wallet] charge skipped (pivot staging): kind=${kind} key=${idempotencyKey} qty=${quantity}`,
    );
  }

  async refund(_idempotencyKey: string): Promise<void> {
    this.logger.log(`[wallet] refund skipped (pivot staging): key=${_idempotencyKey}`);
  }
}
