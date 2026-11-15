import { backendConfigured, BACKEND_URL } from './config';
import { demoExplanation } from './medicines';
import type { Explanation, ExplainResponse } from './types';

/**
 * Explanation client.
 *
 * Live mode: POSTs the label text to the Spring Boot backend
 * (POST /api/explain), which calls Gemini server-side with the key held
 * there. On web the app talks to the configured backend origin; native
 * builds use the same origin.
 *
 * Demo mode: when no backend is configured, or the live call fails, a
 * curated on-device explanation is returned instead (source 'demo') and
 * the UI says so honestly — the schedule builder works fully offline.
 */

export interface ExplainResult {
  explanation: Explanation;
  /** True when the live backend was configured but could not answer. */
  liveFailed: boolean;
}

function isExplanation(value: unknown): value is Explanation {
  if (!value || typeof value !== 'object') return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.id === 'string' &&
    typeof e.medicineName === 'string' &&
    typeof e.purpose === 'string' &&
    typeof e.howToTake === 'string' &&
    Array.isArray(e.warnings) &&
    Array.isArray(e.schedule)
  );
}

export async function explainLabel(labelText: string): Promise<ExplainResult> {
  const trimmed = labelText.trim();
  if (!trimmed) throw new Error('Paste or type a medicine label first.');
  if (!backendConfigured) {
    return { explanation: demoExplanation(trimmed), liveFailed: false };
  }
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL.replace(/\/$/, '')}/api/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ labelText: trimmed }),
    });
  } catch {
    return { explanation: demoExplanation(trimmed), liveFailed: true };
  }
  const data = (await response.json().catch(() => ({}))) as ExplainResponse;
  if (!response.ok || !isExplanation(data.explanation)) {
    return { explanation: demoExplanation(trimmed), liveFailed: true };
  }
  const live = data.explanation;
  return {
    explanation: {
      ...live,
      labelText: trimmed,
      source: 'live',
      at: Date.now(),
    },
    liveFailed: false,
  };
}
