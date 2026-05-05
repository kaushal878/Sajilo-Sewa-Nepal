export type Category =
  | "नागरिकता"
  | "राहदानी"
  | "जग्गा"
  | "सवारी"
  | "शिक्षा"
  | "कर"
  | "स्वास्थ्य"
  | "वैदेशिक रोजगार"
  | "लोक सेवा"
  | "बैंकिङ"
  | "उपयोगिता"
  | "सामाजिक सुरक्षा"
  | "गुनासो"
  | "व्यापार तथा उद्योग"
  | "अन्य";

export interface Ministry {
  id: string;
  nameNe: string;
  nameEn: string;
  shortNe?: string;
  website?: string;
  description?: string;
}

export interface Office {
  id: string;
  nameNe: string;
  nameEn?: string;
  ministryId: string;
  addressNe?: string;
  phone?: string;
}

export interface FormDoc {
  id: string;
  titleNe: string;
  url: string;
  kind: "form" | "rule" | "notice";
}

export interface Service {
  id: string;
  slug: string;
  titleNe: string;
  titleEn?: string;
  category: Category;
  ministryId: string;
  officeId: string;
  summaryNe: string;
  steps: string[];
  documents: string[];
  estimatedTimeNe: string;
  feeNe: string;
  legalRefsNe: string[];
  forms?: FormDoc[];
  tags?: string[];
  /** Free-text alternate spellings/transliterations (Nepali + English) for matching. */
  aliases?: string[];
  updatedAt?: number;
}

export type Role = "admin" | "editor" | "viewer";
