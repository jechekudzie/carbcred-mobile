/**
 * A client reference for one queued write.
 *
 * Deliberately plain JavaScript rather than expo-crypto: this is a deduplication
 * key, not a secret. Nothing is authorised by it — the backend scopes every key
 * to the user who sent it — so it needs to be unique within one phone's queue,
 * not unguessable. A v4 shape over Math.random gives ~2^122 values, which is far
 * past any collision a single handset could produce, and it costs no native
 * module and no rebuild to add.
 */
export function clientRef(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;

    return value.toString(16);
  });
}
