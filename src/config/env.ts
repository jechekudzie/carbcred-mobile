/**
 * Where the app talks to.
 *
 * Development points at the machine's LAN address rather than Herd's
 * `carbcred-system.test`: a simulator can resolve a .test host through the Mac's
 * resolver, but a real handset on the same wifi cannot, and the first time this
 * app runs on a physical phone is not the moment to discover that. The LAN
 * address works for both.
 *
 * Override without touching code by setting EXPO_PUBLIC_API_URL before starting
 * Metro — necessary whenever the machine's IP changes, which it will.
 *
 *   EXPO_PUBLIC_API_URL=http://192.168.1.50:8000 npx expo start
 */
const LOCAL_API = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.100.117:8000';
const TEST_SERVER_API = 'https://carbcred-system.on-forge.com';

export const API_BASE_URL = __DEV__ ? LOCAL_API : TEST_SERVER_API;

/** Every endpoint lives under this prefix; breaking changes go to /api/v2. */
export const API_PREFIX = '/api/v1';

/** Names the token this handset holds, so it can be revoked on its own. */
export const DEVICE_NAME = 'CarbCred Mobile';
