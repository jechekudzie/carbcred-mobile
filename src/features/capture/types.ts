/**
 * Everything the app can file from the field.
 *
 * Each kind names the endpoint it posts to and carries its own payload; the
 * queue and the sync engine treat them all alike, so adding a capture is a
 * matter of describing it rather than of writing another send path.
 */
export type CaptureKind =
  | 'field-submission'
  | 'wash-reading'
  | 'attendance'
  | 'inspection'
  | 'complaint';

export type SubmissionType = 'planting' | 'survival' | 'monitoring' | 'incident';

export type QueueStatus = 'pending' | 'sending' | 'failed';

export type QueuedWrite = {
  kind: CaptureKind;
  /** Path under /api/v1, resolved when the capture is made, not when it sends. */
  endpoint: string;
  payload: Record<string, unknown> & { client_ref: string };
  /** What to call this row in the queue list — the officer's own words for it. */
  label: string;
  context: string;
  status: QueueStatus;
  attempts: number;
  lastError: string | null;
  queuedAt: string;
};

export const KIND_LABELS: Record<CaptureKind, string> = {
  'field-submission': 'Field submission',
  'wash-reading': 'Wash reading',
  attendance: 'Attendance',
  inspection: 'Inspection',
  complaint: 'Complaint',
};
