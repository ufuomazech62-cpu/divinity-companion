import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentDelegationEntity } from './agent-delegation.entity';
import { AgentDelegationMessageEntity } from './agent-delegation-message.entity';
import { AgentDelegationService } from './agent-delegation.service';

@Module({
  imports: [TypeOrmModule.forFeature([AgentDelegationEntity, AgentDelegationMessageEntity])],
  providers: [AgentDelegationService],
  exports: [AgentDelegationService],
})
export class AgentDelegationModule {}
