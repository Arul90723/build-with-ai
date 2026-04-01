export type SummaryMode = 
  | 'quick' 
  | 'detailed' 
  | 'exam' 
  | 'eli10' 
  | 'professional' 
  | 'critical' 
  | 'compare';

export type OutputFormat = 'bullet' | 'paragraph' | 'structured';
export type TonePreference = 'simple' | 'academic' | 'friendly' | 'technical';

export interface SummaryResult {
  tldr: string;
  keyPoints: string[];
  keywords: string[];
  insights: string[];
  simplifiedExplanation?: string;
  questions?: { question: string; answer: string }[];
  contentType?: string;
}

export interface SummaryRecord {
  id?: string;
  userId: string;
  title: string;
  originalContent: string;
  summaryResult: SummaryResult;
  mode: SummaryMode;
  format: OutputFormat;
  tone: TonePreference;
  createdAt: any;
  tags: string[];
}
