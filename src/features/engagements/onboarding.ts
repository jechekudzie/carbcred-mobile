import { api } from '@api/client';

export type Requirement = {
  key: string;
  title: string;
  note: string | null;
  uploaded: boolean;
  file_name: string | null;
  uploaded_at: string | null;
};

export type Onboarding = {
  organisation: { name: string; status: string; status_label: string; approved_at: string | null };
  kyc: {
    reference: string | null;
    status: string;
    status_label: string;
    completion: number;
    province: string | null;
    river: string | null;
    contact_name: string | null;
    contact_phone: string | null;
    review_notes: string | null;
    uploaded_count: number;
    total_requirements: number;
  } | null;
  requirements: Requirement[];
  documents: { id: number; title: string; category: string | null; requires_signature: boolean; acknowledged: boolean }[];
};

export async function fetchOnboarding(organisationSlug: string): Promise<Onboarding> {
  return (await api.get<{ data: Onboarding }>(`/organisations/${organisationSlug}/onboarding`)).data.data;
}
