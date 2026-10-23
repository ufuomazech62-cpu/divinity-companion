import { Global, Module } from '@nestjs/common';
import { CloudWalletClient } from './cloud-wallet.client';

@Global()
@Module({
  providers: [CloudWalletClient],
  exports: [CloudWalletClient],
})
export class BillingModule {}
