/** The capture kinds the platform accepts; the API is the authority on this. */
export type SubmissionType = 'planting' | 'survival' | 'monitoring' | 'incident';

/** What the phone sends. `client_ref` is generated here, before anything else. */
export type FieldSubmissionPayload = {
  client_ref: string;
  site_id: number;
  type: SubmissionType;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string | null;
  captured_at?: string;
  planting?: {
    species: string;
    quantity: number;
    area_hectares?: number | null;
    planted_on: string;
  };
};

export type QueueStatus = 'pending' | 'sending' | 'failed';

export type QueuedCapture = {
  payload: FieldSubmissionPayload;
  status: QueueStatus;
  attempts: number;
  /** The last thing the server said, kept so the officer knows why it stuck. */
  lastError: string | null;
  queuedAt: string;
  /** Set once the server has accepted it — the row is then dropped. */
  siteName: string;
};
