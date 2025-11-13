import { ReceivedMemo } from '../types';

/**
 * Returns true if the memo is expired based on ttlDays and createdAt.
 * If ttlDays is not set, the memo never expires.
 */
export const isMemoExpired = (memo: ReceivedMemo | { ttlDays?: number; createdAt: string } ): boolean => {
  if (!memo.ttlDays || memo.ttlDays <= 0) return false;
  try {
    const created = new Date(memo.createdAt).getTime();
    if (Number.isNaN(created)) return false; // keep if date parsing fails
    const expiryMs = memo.ttlDays * 24 * 60 * 60 * 1000;
    return Date.now() > (created + expiryMs);
  } catch (e) {
    return false;
  }
};

export default isMemoExpired;
