import { api } from '@api/client';

export type EmergencyContact = {
  id: number;
  name: string;
  type: string;
  phone: string | null;
  alternate_phone: string | null;
  province: string | null;
  address: string | null;
  is_24_7: boolean;
  notes: string | null;
};

export type SiteWeather = {
  id: number;
  name: string;
  code: string;
  project: string | null;
  weather: {
    temperature: number | null;
    humidity: number | null;
    precipitation: number | null;
    wind_speed: number | null;
    condition: string | null;
    daily: { date: string; max_temperature: number | null; min_temperature: number | null; precipitation: number | null; condition: string | null }[];
  } | null;
};

export async function fetchEmergencyContacts(organisationSlug: string): Promise<EmergencyContact[]> {
  const { data } = await api.get<{ data: EmergencyContact[] }>(
    `/organisations/${organisationSlug}/emergency-contacts`,
  );

  return data.data;
}

export async function fetchWeather(organisationSlug: string): Promise<SiteWeather[]> {
  const { data } = await api.get<{ data: SiteWeather[] }>(`/organisations/${organisationSlug}/weather`);

  return data.data;
}
