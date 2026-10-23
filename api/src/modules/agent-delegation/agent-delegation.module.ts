import { forwardRef } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentDelegationEntity } from './agent-delegation.entity';
import { AgentDelegationMessageEntity } from './agent-delegation-message.entity';
import { AgentDelegationService } from './agent-delegation.service';
import { AiModule } from '../ai/ai.module';
import { CharactersModule } from '../characters/characters.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentDelegationEntity, AgentDelegationMessageEntity]),
    forwardRef(() => AiModule),
    CharactersModule,
  ],
  providers: [AgentDelegationService],
  exports: [AgentDelegationService],
})
export class AgentDelegationModule {}
