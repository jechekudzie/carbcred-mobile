import { api } from '@api/client';
import { fetchEngagements } from '@features/engagements/api';
import { fetchProject, fetchProjects, type ProjectDetail } from '@features/projects/api';

export type Dashboard = {
  overview: {
    programmes: number;
    projects: number;
    active_workflows: number;
    open_tasks: number;
    open_requisitions: number;
  };
  insights: { tone: string; title: string; body: string; href: string | null }[];
  tip: { title: string; body: string };
};

export type Performance = { date: string; actual: number; expected: number | null; efficiency: number | null };

/**
 * What the home screen is about: one project, the process it is in, and the
 * site that is running.
 *
 * Which project depends on who is asking. The CarbCred team sees the delivery
 * pipeline, so it is the organisation's active project with its workflow. A
 * contractor sees only what it is engaged on and operates — no workflow, since
 * the lead organisation's pipeline is not its business.
 */
export type Focus = {
  projectName: string;
  projectSlug: string | null;
  projectId: number | null;
  phases: { done: number; total: number; current: string | null } | null;
  siteName: string | null;
  siteCount: number;
  performance: Performance[];
};

export async function fetchDashboard(): Promise<Dashboard> {
  return (await api.get<{ data: Dashboard }>('/dashboard')).data.data;
}

export async function fetchFocusForDelivery(organisationSlug: string): Promise<Focus | null> {
  const projects = await fetchProjects(organisationSlug);
  const project = projects.find((candidate) => candidate.status === 'active') ?? projects[0];

  if (!project) {
    return null;
  }

  const detail: ProjectDetail = await fetchProject(organisationSlug, project.slug);
  const site = detail.sites[0] ?? null;
  const performance = site ? await fetchSitePerformance(organisationSlug, site.id) : [];

  return {
    projectName: detail.name,
    projectSlug: detail.slug,
    projectId: detail.id,
    phases: detail.workflow
      ? {
          done: detail.workflow.phases.filter((phase) => phase.status === 'completed').length,
          total: detail.workflow.phases.length,
          current:
            detail.workflow.phases.find((phase) => phase.status === 'in_progress')?.name ??
            detail.workflow.phases.find((phase) => phase.status === 'pending')?.name ??
            null,
        }
      : null,
    siteName: site?.name ?? null,
    siteCount: detail.sites.length,
    performance,
  };
}

export async function fetchFocusForContractor(organisationSlug: string): Promise<Focus | null> {
  const engagements = await fetchEngagements(organisationSlug);
  const engagement = engagements[0];

  if (!engagement) {
    return null;
  }

  const site = engagement.sites[0] ?? null;

  return {
    projectName: engagement.name,
    projectSlug: null,
    projectId: engagement.id,
    // A contractor does not see the lead's workflow.
    phases: null,
    siteName: site?.name ?? null,
    siteCount: engagement.sites.length,
    performance: [...(site?.recent ?? [])]
      .reverse()
      .map((reading) => ({
        date: reading.reading_date,
        actual: reading.tonnes_processed,
        expected: null,
        efficiency: reading.throughput_efficiency,
      })),
  };
}

async function fetchSitePerformance(organisationSlug: string, siteId: number): Promise<Performance[]> {
  const { data } = await api.get<{ data: { operations: { performance: Performance[] } } }>(
    `/organisations/${organisationSlug}/sites/${siteId}`,
  );

  return data.data.operations.performance ?? [];
}
