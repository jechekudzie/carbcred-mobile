import { api } from '@api/client';

export type EngagementSite = {
  id: number;
  name: string;
  code: string;
  status: string;
  readings_count: number;
  last_reading: string | null;
  recent: {
    id: number;
    reading_date: string;
    tonnes_processed: number;
    hours_run: number;
    utilisation: number | null;
    throughput_efficiency: number | null;
  }[];
};

export type Engagement = {
  id: number;
  name: string;
  code: string | null;
  status: string;
  lead: string | null;
  role: string;
  contract: {
    reference: string;
    title: string;
    status: string;
    start_date: string | null;
    end_date: string | null;
  } | null;
  sites: EngagementSite[];
};

/** A contractor's own view: the projects it is engaged on and what it operates. */
export async function fetchEngagements(organisationSlug: string): Promise<Engagement[]> {
  const { data } = await api.get<{ data: Engagement[] }>(`/organisations/${organisationSlug}/engagements`);

  return data.data;
}
