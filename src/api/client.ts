import axios, { AxiosError } from 'axios';
import { API_BASE_URL, API_PREFIX } from '@config/env';
import { useAuthStore } from '@stores/authStore';

/**
 * The one HTTP client. Every request carries the Sanctum bearer token; a 401
 * means the token died on the server (revoked, or a password change ended every
 * session), so the app signs out rather than retrying into a wall.
 */
export const api = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  headers: { Accept: 'application/json' },
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      void useAuthStore.getState().signOut();
    }

    return Promise.reject(error);
  },
);

/** Laravel's validation shape: `{message, errors: {field: [messages]}}`. */
export type ValidationErrors = Record<string, string[]>;

export function validationErrors(error: unknown): ValidationErrors | null {
  const response = (error as AxiosError<{ errors?: ValidationErrors }>)?.response;

  return response?.status === 422 ? (response.data?.errors ?? null) : null;
}

/**
 * A message worth showing a human. Prefers the server's own wording, falls back
 * to something honest rather than "Request failed with status code 500".
 */
export function errorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  const response = (error as AxiosError<{ message?: string }>)?.response;

  if (response?.status === 403) {
    return response.data?.message || 'You do not have permission to do that.';
  }

  if (!response) {
    return 'No connection. This will be retried when you are back online.';
  }

  return response.data?.message || fallback;
}
