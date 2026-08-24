import { api } from '@api/client';
import { DEVICE_NAME } from '@config/env';
import type { AuthUser, Organisation } from '@stores/authStore';

/** A completed sign-in: the token plus who it belongs to. */
export type LoginSuccess = {
  token: string;
  token_type: 'Bearer';
  password_change_required: boolean;
  user: AuthUser;
  organisations: Organisation[];
};

/** The first pass, when the account has a second factor. */
export type TwoFactorChallenge = {
  two_factor_required: true;
  methods: ('authenticator' | 'email')[];
  masked_email: string | null;
  message: string;
};

export type LoginResult = LoginSuccess | TwoFactorChallenge;

export function isTwoFactorChallenge(result: LoginResult): result is TwoFactorChallenge {
  return 'two_factor_required' in result;
}

/**
 * Sign in. Two-factor is a two-pass exchange: call once, and if the answer is a
 * challenge, call again with the code the user typed.
 */
export async function login(input: {
  email: string;
  password: string;
  code?: string;
  recovery_code?: string;
}): Promise<LoginResult> {
  const { data } = await api.post<{ data: LoginResult }>('/auth/login', {
    ...input,
    device_name: DEVICE_NAME,
  });

  return data.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}
