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
 * Send one queued write to an endpoint the queue has already resolved. Every
 * capture endpoint speaks the same replay contract, so this needs to know
 * nothing about which kind it holds: a replayed client_ref comes back 200 with
 * the original record, which is success here rather than a duplicate.
 *
 * Returns the id of the record that now exists, so anything queued behind it
 * can address itself to it.
 */
export async function send(write: QueuedWrite, endpoint: string): Promise<number | null> {
  if (write.file) {
    const form = new FormData();

    for (const [key, value] of Object.entries(write.payload)) {
      if (value !== null && value !== undefined) {
        form.append(key, String(value));
      }
    }

    // React Native's FormData takes this shape for a file; the cast is the
    // documented way to satisfy the DOM type it is checked against.
    form.append('photo', write.file as unknown as Blob);

    const { data } = await api.post<{ data: { id: number } | null }>(endpoint, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      // A photo on a bad line needs longer than a form does.
      timeout: 90000,
    });

    return data.data?.id ?? null;
  }

  const { data } = await api.post<{ data: { id: number } | null }>(endpoint, write.payload);

  return data.data?.id ?? null;
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
