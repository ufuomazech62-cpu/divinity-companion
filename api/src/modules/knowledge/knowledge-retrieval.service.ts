import { Injectable, Logger } from '@nestjs/common';

export interface KnowledgeRetrievalInput {
  query: string;
  characterId?: string | null;
}

/**
 * Knowledge-base RAG retrieval. Pivot staging: returns an empty context so the
 * chat pipeline degrades gracefully (callers treat '' as "nothing found").
 * P1 replaces this with real indexing + vector retrieval.
 */
@Injectable()
export class KnowledgeRetrievalService {
  private readonly logger = new Logger(KnowledgeRetrievalService.name);

  async retrieve(_input: KnowledgeRetrievalInput): Promise<string> {
    return '';
  }
}
