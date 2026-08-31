import type { Incident, InvestigationRecord, PossibleRoute, ScoredCamera } from '@/types';

export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL ?? 'https://hack-back-61fw.onrender.com').replace(/\/$/, '');
export const API_BASE = `${BACKEND_URL}/api`;

export interface AnalyzeResponse {
  incident: Incident;
  investigation: InvestigationRecord;
  cameras: ScoredCamera[];
  routes: PossibleRoute[];
  generatedAt: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });

  let body: unknown = null;
  try { body = await response.json(); } catch { /* empty response */ }

  if (!response.ok) {
    const message = typeof body === 'object' && body && 'error' in body
      ? String((body as { error?: unknown }).error)
      : `Backend request failed (${response.status})`;
    throw new Error(message);
  }
  return body as T;
}

export function getHealth() {
  return request<{ ok: boolean; service: string; timestamp: string }>('/health');
}

export function getCameras() {
  return request<{ cameras: ScoredCamera[]; total: number }>('/cameras');
}

export function getInvestigations() {
  return request<{ investigations: InvestigationRecord[]; total: number }>('/investigations');
}

export function analyzeIncident(incident: Omit<Incident, 'id' | 'occurredAt'>) {
  return request<AnalyzeResponse>('/analyze', {
    method: 'POST',
    body: JSON.stringify(incident),
  });
}

export function updateInvestigation(id: string, patch: { status?: InvestigationRecord['status']; title?: string }) {
  return request<{ investigation: InvestigationRecord }>(`/investigations/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export function getReport(id: string) {
  return request<{
    reportId: string;
    generatedAt: string;
    investigation: InvestigationRecord;
    summary: string;
    findings: string[];
    disclaimer: string;
  }>(`/reports/${encodeURIComponent(id)}`);
}
