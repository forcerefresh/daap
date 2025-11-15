import { Industry } from "./industry";
import { DocumentType } from "./document-type";

export enum AiPromptKind {
  UNKNOWN = "UNKNOWN",
  TEMPLATE = "TEMPLATE",
  COLOR_PALETTE = "COLOR_PALETTE",
  IMAGE = "IMAGE",
  VECTOR = "VECTOR",
  LAYOUT = "LAYOUT",
}

export enum AiPromptStatus {
  INIT = "INIT",
  LOADING = "LOADING",
  DONE = "DONE",
  ERROR = "ERROR",
  CANCELLED = "CANCELLED",
}

export enum AiProcessingStatus {
  NOT_PROCESSED = "NOT_PROCESSED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  IN_PROGRESS = "IN_PROGRESS",
}

export interface AiPrompt {
  id: string;
  promptKind: AiPromptKind;
  industryId: string;
  documentTypeId: string;
  layoutId: string;
  prompt: string;
  template: string;
  parameters: Record<string, string | number | any> | null;
  neutralColors: boolean;
  aiResponse: string | null;
  aiResponseJson: Record<string, any> | null;
  errorMessage: string | null;
  status: AiPromptStatus;
  processingStatus: AiProcessingStatus;
  processingComplete: boolean;
  templateGenerated: boolean;
  provider: string;
  model: string;
  cost: number | null;
  tokensUsed: number | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  parentPromptId: string | null;
  userUid: string;
  industry: Industry;
  documentType: DocumentType;
  layout: any;
  childPrompts: AiPrompt[];
  simplifiedLayout: string;
  metadata: Record<string, any>;
  noAnyWritingsInImages: boolean;
  noHandsInImages: boolean;
  uncrowdedImages: boolean;
  overrideObjectProperties: string;
}
