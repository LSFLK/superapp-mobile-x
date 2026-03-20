export type { ApiResponse } from './api/types';
export { UserRole } from './features/user/types';
export type { User } from './features/user/types';
export type { PublicHoliday } from './features/holiday/types';
export { ResourceType, RESOURCE_TYPES } from './features/resource/types';
export type { Resource, FormField, ResourceUsageStats } from './features/resource/types';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  CHECKED_IN = 'checked_in',
  PROPOSED = 'proposed'
}

export interface Booking {
  id: string;
  resourceId: string;
  userId: string;
  start: string; // ISO String
  end: string;   // ISO String
  status: BookingStatus;
  createdAt: string;
  rejectionReason?: string;

  // Dynamic Answers
  details: Record<string, unknown>;
}
