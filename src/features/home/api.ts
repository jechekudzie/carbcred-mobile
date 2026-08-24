import { api } from '@api/client';

export type Dashboard = {
  stats: { organisations: number; members: number; modules: number };
  overview: {
    programmes: number;
    projects: number;
    active_workflows: number;
    open_tasks: number;
    open_requisitions: number;
    approved_spend: number;
  };
  insights: { tone: string; title: string; body: string; href: string | null }[];
  tip: { title: string; body: string };
};

export type CarbonSummary = {
  summary: { net_verified: number; net_estimated: number; credits_issued: number };
};

export type Performance = { date: string; actual: number; expected: number | null; efficiency: number | null };

export async function fetchDashboard(): Promise<Dashboard> {
  return (await api.get<{ data: Dashboard }>('/dashboard')).data.data;
}

export async function fetchCarbon(organisationSlug: string): Promise<CarbonSummary> {
  return (await api.get<{ data: CarbonSummary }>(`/organisations/${organisationSlug}/carbon-summary`)).data.data;
}

/**
 * The wash performance of the site that is actually running. Two calls, because
 * the readings live on the site rather than on the dashboard — worth it, since
 * expected-against-actual is the number the operation is judged on daily.
 */
export async function fetchLeadSitePerformance(
  organisationSlug: string,
): Promise<{ siteName: string; performance: Performance[] } | null> {
  const sites = (
    await api.get<{ data: { id: number; name: string; project_id: number | null }[] }>(
      `/organisations/${organisationSlug}/sites`,
    )
  ).data.data;

  const operating = sites.find((site) => site.project_id !== null) ?? sites[0];

  if (!operating) {
    return null;
  }

  const detail = (
    await api.get<{ data: { name: string; operations: { performance: Performance[] } } }>(
      `/organisations/${organisationSlug}/sites/${operating.id}`,
    )
  ).data.data;

  return { siteName: detail.name, performance: detail.operations.performance ?? [] };
}
