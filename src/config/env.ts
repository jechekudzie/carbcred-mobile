/**
 * Where the app talks to.
 *
 * Local development runs against Herd over plain http: the .test certificate is
 * self-signed, which a simulator will not trust, and iOS App Transport Security
 * blocks it before the request leaves the app. The live test server is https and
 * needs no exception, so device testing uses that.
 */
const LOCAL_API = 'http://carbcred-system.test';
const TEST_SERVER_API = 'https://carbcred-system.on-forge.com';

export const API_BASE_URL = __DEV__ ? LOCAL_API : TEST_SERVER_API;

/** Every endpoint lives under this prefix; breaking changes go to /api/v2. */
export const API_PREFIX = '/api/v1';

/** Names the token this handset holds, so it can be revoked on its own. */
export const DEVICE_NAME = 'CarbCred Mobile';
