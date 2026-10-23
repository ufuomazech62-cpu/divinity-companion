// Upstream-aligned replacement types (P1: tighten to upstream intent).
export type AgentDelegationStatus =
  | 'pending_anchor'
  | 'queued'
  | 'working'
  | 'completed'
  | 'failed';

export type AgentDelegationTranscriptSenderType = 'self' | 'user' | 'expert';

export interface AgentDelegationDispatchHandle {
  batchId: string;
  ackText: string;
}
