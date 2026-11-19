export interface WelcomeLocation {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}
export interface WelcomeAiMessage {
  text: string;
  origin?: string;
  source: 'deepseek';
  version: string;
  fingerprint: string;
}
export interface WelcomeMessageResponse {
  status: 'ready' | 'reference' | 'pending';
  message: WelcomeAiMessage | null;
}
export interface WelcomePortrait {
  name_ai_message?: WelcomeAiMessage | null;
  birth_ai_message?: WelcomeAiMessage | null;
  name_fingerprint?: string;
  birth_fingerprint?: string;
  step_messages?: { name: string; birth: string; sky: string };
  greeting?: string;
  message_fingerprint?: string;
  ai_message?: WelcomeAiMessage | null;
  name: { name: string; origin: string; message: string; verified: boolean };
  number: { value: number; title: string; message: string; formula: string; birth_date?: string } | null;
  sky: { available: boolean; timezone?: string; time_known?: boolean; sun?: string[]; moon?: string[]; ascendant?: string | null; element?: string | null; message?: string; note: string } | null;
  summary: string;
}
export interface WelcomeState {
  started: boolean;
  completed: boolean;
  next_step: number;
  profile: { full_name: string; birth_date: string | null; birth_time: string | null; birth_location: WelcomeLocation | null; zodiac_sign?: string | null };
  portrait: WelcomePortrait;
}
export type WelcomeStep = { step: 'name'; full_name: string } | { step: 'birth'; birth_date: string | null } | { step: 'sky'; birth_time: string | null; birth_location: WelcomeLocation | null; zodiac_sign?: string | null };
export interface WelcomePlace extends WelcomeLocation { label: string }
