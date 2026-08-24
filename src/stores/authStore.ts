import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

const TOKEN_KEY = 'carbcred.token';
/** Not a secret — which organisation this handset was last working in. */
const ORGANISATION_KEY = 'carbcred.organisation';

export type Organisation = {
  id: number;
  name: string;
  slug: string;
  is_primary: boolean;
  modules: { id: number; name: string; slug: string }[];
  permissions: string[];
};

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  platform_role: string | null;
  platform_role_label: string | null;
  is_super_admin: boolean;
  must_change_password: boolean;
  /** Whether the organisations list is the platform's or only this user's. */
  sees_every_organisation?: boolean;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  organisations: Organisation[];
  organisationSlug: string | null;
  /** True until the token has been read back from the keystore on launch. */
  isRestoring: boolean;
  /** The token can do nothing but set a new password. */
  passwordChangeRequired: boolean;

  restore: () => Promise<void>;
  hydrate: (user: AuthUser, organisations: Organisation[]) => Promise<void>;
  signIn: (payload: {
    token: string;
    user: AuthUser;
    organisations: Organisation[];
    passwordChangeRequired?: boolean;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  setOrganisation: (slug: string) => void;
  /** The organisation the app is currently working in. */
  currentOrganisation: () => Organisation | null;
  can: (permission: string) => boolean;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  organisations: [],
  organisationSlug: null,
  isRestoring: true,
  passwordChangeRequired: false,

  restore: async () => {
    // The password never touches storage; only the token the server issued.
    const token = await SecureStore.getItemAsync(TOKEN_KEY);

    set({ token, isRestoring: false });
  },

  /** Fill in who the token belongs to, once something has asked the server. */
  hydrate: async (user, organisations) => {
    // Someone who switched away from their home organisation meant it, so the
    // choice outlives the app being closed — but only while it is still a
    // choice they have.
    const remembered = await AsyncStorage.getItem(ORGANISATION_KEY);
    const stillReachable = organisations.some((organisation) => organisation.slug === remembered);

    set({
      user,
      organisations,
      organisationSlug:
        (stillReachable ? remembered : null) ??
        organisations.find((organisation) => organisation.is_primary)?.slug ??
        organisations[0]?.slug ??
        null,
    });
  },

  signIn: async ({ token, user, organisations, passwordChangeRequired = false }) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);

    set({
      token,
      user,
      organisations,
      passwordChangeRequired,
      // Multi-org users pick later; everyone else lands in their only one.
      organisationSlug:
        organisations.find((organisation) => organisation.is_primary)?.slug ??
        organisations[0]?.slug ??
        null,
    });
  },

  signOut: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await AsyncStorage.removeItem(ORGANISATION_KEY);

    set({
      token: null,
      user: null,
      organisations: [],
      organisationSlug: null,
      passwordChangeRequired: false,
    });
  },

  setOrganisation: (slug) => {
    void AsyncStorage.setItem(ORGANISATION_KEY, slug);
    set({ organisationSlug: slug });
  },

  currentOrganisation: () => {
    const { organisations, organisationSlug } = get();

    return organisations.find((organisation) => organisation.slug === organisationSlug) ?? null;
  },

  /**
   * Permissions come from the API per organisation — the app never decides for
   * itself what someone may do, it only shapes what it shows.
   */
  can: (permission) => get().currentOrganisation()?.permissions.includes(permission) ?? false,
}));

export { TOKEN_KEY };
