import { VehicleState } from '../types';

export const APP_NAME = 'Fleet Manager';

export const ROUTES = {
  LOGIN: '/(auth)',
  DRIVER_DASHBOARD: '/(driver)/driver-dashboard',
  DRIVER_HISTORY: '/(driver)/driver-history',
  MASTER_DASHBOARD: '/(master)/master-dashboard',
  VEHICLE_DETAILS: '/(master)/vehicle-details',
} as const;

export const VEHICLE_STATUS_LABELS: Record<VehicleState, string> = {
  [VehicleState.AVAILABLE]: 'Available',
  [VehicleState.ASSIGNED]: 'Assigned',
  [VehicleState.IN_TRANSIT]: 'In Transit',
  [VehicleState.RETURNING]: 'Returning',
};

export const PAGINATION = {
  VEHICLES_PER_PAGE: 20,
  TRIPS_PER_PAGE: 15,
} as const;

export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  DRIVERS: 'drivers',
  VEHICLES: 'vehicles',
  ASSIGNMENTS: 'assignments',
  VEHICLE_REQUESTS: 'vehicle_requests',
  TRIP_HISTORY: 'trip_history',
  NOTIFICATIONS: 'notifications',
} as const;

export const ERROR_MESSAGES = {
  AUTH_FAILED: 'Invalid email or password',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  PERMISSION_DENIED: 'You do not have permission to perform this action',
  VEHICLE_NOT_FOUND: 'Vehicle not found',
  INVALID_STATE_TRANSITION: 'Invalid vehicle state transition',
} as const;