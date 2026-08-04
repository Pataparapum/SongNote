import * as Crypto from 'expo-crypto';

// Every workspace item, song line and lyric word gets a UUID instead of a local counter, so ids
// stay unique across devices once content syncs through a real database.
export function createId(): string {
  return Crypto.randomUUID();
}
