import type { SessionUser } from "@/lib/auth";

export type { SessionUser };

export interface NavLink {
  label: string;
  href: string;
}

export interface ExpressionCard {
  id: string;
  type?: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  correctionCount: number;
  createdAt: string;
}

export interface MomentCard {
  id: string;
  type: string;
  title: string | null;
  content: string;
  expressionType: string | null;
  completeness: string | null;
  visibility: string;
  status: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  targetLanguage: {
    id: string;
    name: string;
    nativeName: string;
  } | null;
  correctionCount: number;
  hasAdoptedCorrection: boolean;
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
