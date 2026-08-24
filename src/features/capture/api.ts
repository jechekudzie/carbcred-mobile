import { api, errorMessage } from '@api/client';
import type { QueuedWrite } from './types';

export type Site = {
  id: number;
  code: string;
  name: string;
  status: string;
  river: string | null;
  province: string | null;
  project_id: number | null;
};

/** The sites this organisation can capture against. */
export async function fetchSites(organisationSlug: string): Promise<Site[]> {
  const { data } = await api.get<{ data: Site[] }>(`/organisations/${organisationSlug}/sites`);

  return data.data;
}

/**
 * Send one queued write. Every capture endpoint speaks the same replay
 * contract, so this needs to know nothing about which kind it is holding: a
 * replayed client_ref comes back 200 with the original record, which is success
 * here rather than a duplicate.
 */
export async function send(write: QueuedWrite): Promise<void> {
  await api.post(write.endpoint, write.payload);
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
