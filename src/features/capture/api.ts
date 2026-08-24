import { api, errorMessage } from '@api/client';
import type { FieldSubmissionPayload } from './types';

export type Site = {
  id: number;
  code: string;
  name: string;
  status: string;
  river: string | null;
  province: string | null;
};

/** The sites this organisation can capture against. */
export async function fetchSites(organisationSlug: string): Promise<Site[]> {
  const { data } = await api.get<{ data: Site[] }>(`/organisations/${organisationSlug}/sites`);

  return data.data;
}

export type SubmitResult = {
  /** True when the server had already filed this client_ref. */
  replayed: boolean;
  id: number | null;
};

/**
 * File one capture. A replayed `client_ref` comes back `200 {replayed: true}`
 * with the original record, which is a success here, not a duplicate.
 */
export async function submitCapture(payload: FieldSubmissionPayload): Promise<SubmitResult> {
  const { data } = await api.post<{ data: { id: number } | null; replayed: boolean }>(
    '/field-submissions',
    payload,
  );

  return { replayed: data.replayed, id: data.data?.id ?? null };
}

/**
 * Whether a failure is worth retrying. A validation error or a permission
 * refusal will fail identically forever — retrying it just burns battery and
 * hides the problem from the person who could fix it.
 */
export function isPermanentFailure(error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response?.status;

  return status !== undefined && status >= 400 && status < 500 && status !== 429;
}

export { errorMessage };
