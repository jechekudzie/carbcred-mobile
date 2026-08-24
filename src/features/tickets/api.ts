import { api } from '@api/client';

export type TicketStatus = 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export type TicketEvent = {
  id: number;
  kind: 'created' | 'assigned' | 'status_changed' | 'priority_changed' | 'comment';
  note: string | null;
  meta: Record<string, unknown>;
  actor: string | null;
  created_at: string | null;
};

export type Ticket = {
  id: number;
  reference: string;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  channel: string;
  /** The moves the platform will accept from here — never guessed locally. */
  available_transitions: TicketStatus[];
  is_overdue: boolean;
  due_at: string | null;
  resolution_notes: string | null;
  category: { id: number; name: string; slug: string; kind: string; sla_hours: number | null } | null;
  site_id: number | null;
  site: string | null;
  grievance_reference?: string | null;
  assigned_to: number | null;
  assignee: string | null;
  events?: TicketEvent[];
  created_at: string | null;
};

export type TicketVocabulary = {
  categories: { id: number; name: string; slug: string; kind: string; default_priority: TicketPriority; sla_hours: number | null }[];
  statuses: TicketStatus[];
  priorities: TicketPriority[];
  channels: string[];
  transitions: Record<TicketStatus, TicketStatus[]>;
};

export type TicketFilters = {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: string;
  assigned?: 'me' | 'unassigned';
  overdue?: boolean;
};

export async function fetchVocabulary(): Promise<TicketVocabulary> {
  return (await api.get<{ data: TicketVocabulary }>('/ticket-categories')).data.data;
}

export async function fetchTickets(organisationSlug: string, filters: TicketFilters = {}): Promise<Ticket[]> {
  const { data } = await api.get<{ data: Ticket[] }>(`/organisations/${organisationSlug}/tickets`, {
    params: {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.priority ? { priority: filters.priority } : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.assigned ? { assigned: filters.assigned } : {}),
      ...(filters.overdue ? { overdue: 1 } : {}),
    },
  });

  return data.data;
}

export async function fetchTicket(organisationSlug: string, ticketId: number): Promise<Ticket> {
  return (await api.get<{ data: Ticket }>(`/organisations/${organisationSlug}/tickets/${ticketId}`)).data.data;
}

export async function transitionTicket(
  organisationSlug: string,
  ticketId: number,
  status: TicketStatus,
  note?: string,
): Promise<Ticket> {
  const { data } = await api.post<{ data: Ticket }>(
    `/organisations/${organisationSlug}/tickets/${ticketId}/transition`,
    { status, ...(note ? { note } : {}) },
  );

  return data.data;
}

export async function commentOnTicket(organisationSlug: string, ticketId: number, note: string): Promise<Ticket> {
  const { data } = await api.post<{ data: Ticket }>(
    `/organisations/${organisationSlug}/tickets/${ticketId}/comment`,
    { note },
  );

  return data.data;
}

export const PRIORITY_COLOURS: Record<TicketPriority, string> = {
  critical: '#f97066',
  high: '#f5a524',
  medium: '#7c9a3f',
  low: '#9aa39a',
};

/** Sentence case for a status the API sends as a slug. */
export function label(value: string): string {
  return value.replace(/_/g, ' ').replace(/^./, (character) => character.toUpperCase());
}
