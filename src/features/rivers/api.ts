import { api } from '@api/client';

export type River = {
  id: number;
  name: string;
  province: string;
  status: string;
  color: string;
  description: string | null;
  sites_count: number;
  /** The boundary coordinates of the authorised reach. */
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
};

/** The approved rivers — the top of the geography everything else hangs from. */
export async function fetchRivers(): Promise<River[]> {
  return (await api.get<{ data: River[] }>('/rivers')).data.data;
}
