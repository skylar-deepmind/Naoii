import type { SessionUser } from "@/lib/auth";

export type { SessionUser };

export interface NavLink {
  label: string;
  href: string;
}

export interface ExpressionCard {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  correctionCount: number;
  createdAt: string;
}

export interface CorrectionCard {
  id: string;
  suggestedText: string;
  comment: string | null;
  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  isAdopted: boolean;
  createdAt: string;
}

export interface LanguageOption {
  id: string;
  code: string;
  name: string;
  nativeName: string;
}
