/** MediGuide shared types. */

export type MedicineCategory =
  | 'tablets'
  | 'liquid'
  | 'cream'
  | 'inhaler'
  | 'vitamins'
  | 'other';

export type ExplanationSource = 'live' | 'demo';

export interface Reminder {
  id: string;
  /** '08:00' 24-hour clock. */
  time: string;
  /** Free-text dose, e.g. '1 tablet'. */
  dose: string;
  /** Optional note, e.g. 'with food'. */
  note: string;
  enabled: boolean;
}

export interface Explanation {
  /** Stable id — slug of the medicine name + timestamp for live results. */
  id: string;
  medicineName: string;
  /** The label text the user pasted (or the sample label). */
  labelText: string;
  category: MedicineCategory;
  /** Plain-language summary: what it is for. */
  purpose: string;
  /** Plain-language: how to take it. */
  howToTake: string;
  /** Plain-language warnings, each one short sentence. */
  warnings: string[];
  /** Suggested daily times, e.g. ['08:00', '20:00']. */
  schedule: string[];
  /** '1 tablet' style dose text shown on reminder chips. */
  dose: string;
  source: ExplanationSource;
  /** Epoch milliseconds the explanation was made. */
  at: number;
}

export interface SavedMedicine {
  explanation: Explanation;
  reminders: Reminder[];
  /** Epoch milliseconds it was saved. */
  savedAt: number;
}

export interface HistoryEntry {
  id: string;
  labelText: string;
  medicineName: string;
  category: MedicineCategory;
  /** Epoch milliseconds of the explanation. */
  at: number;
}

export interface ExplainRequest {
  labelText: string;
}

export interface ExplainResponse {
  explanation?: Explanation;
  error?: { message?: string };
}
