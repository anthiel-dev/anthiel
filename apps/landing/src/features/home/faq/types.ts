import type { ReactNode } from "react";

export interface FaqItem {
  id: string;
  question: string;
  answer: ReactNode;
  streamText: string;
}

export type ChatMessageStatus = "complete" | "typing" | "streaming";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content?: ReactNode;
  streamText?: string;
  status?: ChatMessageStatus;
  isNew?: boolean;
}
