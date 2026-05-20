
export enum CEFRLevel {
  A1 = "A1",
  A2 = "A2",
  B1 = "B1",
  B2 = "B2",
  C1 = "C1",
  C2 = "C2",
}

export enum Interest {
  Everyday     = "everyday",
  Professional = "professional",
  Grammar      = "grammar",
  Travel       = "travel",
  Culture      = "culture",
  Business     = "business",
  Technology   = "technology",
}



export interface LanguageProfile {
  id: string;
  language: string;
  level: CEFRLevel;
  interests: Interest[];
  createdAt: string;
  lastSessionAt: string | null;
}


export interface VocabularyItem {
  id: number;
  languageId: string;
  word: string;
  translation: string;
  context: string | null;
  easeFactor: number;
  interval: number;
  repetitions: number;
  score: number;
  nextReview: string;
  createdAt: string;
}


export enum SessionFormat {
  Review     = "review",
  Vocabulary = "vocabulary",
  Grammar    = "grammar",
  Reading    = "reading",
  Writing    = "writing",
  Speaking   = "speaking",
}


export interface Session {
  id: number;
  languageId: string;
  format: SessionFormat;
  startedAt: string;
  endedAt: string | null;
  itemsReviewed: number;
  avgScore: number;
}


export interface ProgressSummary {
  totalWords: number;
  dueToday: number;
  streakDays: number;
  totalSessions: number;
  totalMinutes: number;
  weakItems: VocabularyItem[];
  strongItems: VocabularyItem[];
}


export enum MessageRole {
  User      = "user",
  Assistant = "assistant",
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  feedback?: AIFeedback;
  isLocal?: boolean;
  createdAt: string;
}

export interface AIFeedback {
  score?: number;
  correct?: boolean;
  wordId?: number;
  newWord?: {
    word: string;
    translation: string;
    context: string;
  };
}


export interface PlacementResult {
  level: CEFRLevel;
  confidence: number;
  reasoning: string;
}


export interface SendMessagePayload {
  messages: { role: MessageRole; content: string }[];
  languageId: string;
  format: SessionFormat;
  sessionId?: number;
}

export interface PlacementTestPayload {
  messages: { role: MessageRole; content: string }[];
  language: string;
}
