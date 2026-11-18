/** Bounded server-owned result explanation. No arbitrary client context. */
export type ExplanationKind = 'tarot' | 'numerology' | 'iching' | 'dreams' | 'lenormand' | 'synastry';
export interface ResultExplanation {
  available: boolean;
  reason: 'ready' | 'subscription_required' | 'not_configured' | 'daily_limit' | 'result_limit';
  answer: string | null;
  clarification: { question: string; answer: string } | null;
  can_clarify: boolean;
}
