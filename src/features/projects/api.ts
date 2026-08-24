import { api } from '@api/client';

export type ProjectSummary = {
  id: number;
  name: string;
  slug: string;
  code: string | null;
  status: string;
  status_label: string;
  start_date: string | null;
  end_date: string | null;
  programme?: { name: string; slug: string };
};

export type WorkflowTask = {
  id: number;
  title: string;
  subtitle: string | null;
  status: string;
  status_label: string;
  is_mandatory: boolean;
  assignee: string | null;
  due_date: string | null;
};

export type WorkflowStage = {
  id: number;
  name: string;
  status: string;
  status_label: string;
  tasks: WorkflowTask[];
};

export type WorkflowPhase = {
  id: number;
  name: string;
  description: string | null;
  status: string;
  status_label: string;
  approved_at: string | null;
  stages: WorkflowStage[];
};

export type Workflow = {
  id: number;
  status: string;
  status_label: string;
  current_phase_id: number | null;
  phases: WorkflowPhase[];
};

export type ProjectDetail = ProjectSummary & {
  description: string | null;
  sites: { id: number; name: string; code: string; status: string }[];
  workflow: Workflow | null;
};

export async function fetchProjects(organisationSlug: string): Promise<ProjectSummary[]> {
  const { data } = await api.get<{ data: ProjectSummary[] }>(`/organisations/${organisationSlug}/projects`);

  return data.data;
}

export async function fetchProject(organisationSlug: string, projectSlug: string): Promise<ProjectDetail> {
  const { data } = await api.get<{ data: ProjectDetail }>(
    `/organisations/${organisationSlug}/projects/${projectSlug}`,
  );

  return data.data;
}

/**
 * How far along a workflow is, as completed phases over total. The platform
 * decides what "completed" means; this only counts what it says.
 */
export function phaseProgress(workflow: Workflow | null): { done: number; total: number; percent: number } {
  const total = workflow?.phases.length ?? 0;
  const done = workflow?.phases.filter((phase) => phase.status === 'completed').length ?? 0;

  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}
