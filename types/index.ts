/**
 * Domain Types
 * Type-safe data models for fleet management
 */

export enum DriverRole {
  DRIVER = 'DRIVER',
  VEHICLE_MASTER = 'VEHICLE_MASTER'
}

export enum VehicleState {
  AVAILABLE = 'AVAILABLE',
  ASSIGNED = 'ASSIGNED',
  IN_TRANSIT = 'IN_TRANSIT',
  RETURNING = 'RETURNING'
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: DriverRole;
  isActive: boolean;
  currentVehicleId: string | null;
  fcmToken: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  driverId: string | null;
  driverName: string | null;
  status: VehicleState;
  currentLocation: string;
  destination: string | null;
  warehouse: string;
  timestamps: {
    assignedAt: string | null;
    startedAt: string | null;
    reachedDestinationAt?: string | null; // ADDED: Optional destination reached timestamp
    returnedAt: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  vehicleId: string;
  driverId: string;
  driverName: string;
  startTime: string;
  endTime: string | null;
  destination: string;
  status: 'ACTIVE' | 'COMPLETED';
  createdAt: string;
}

export interface VehicleRequest {
  id: string;
  vehicleId: string;
  driverId: string;
  driverName: string;
  destination: string;
  reason: string;
  status: RequestStatus;
  requestedAt: string;
  respondedAt: string | null;
  respondedBy: string | null;
}

export interface TripHistory {
  id: string;
  vehicleId: string;
  driverId: string;
  driverName: string;
  startLocation: string;
  destination: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ASSIGNMENT' | 'REQUEST' | 'STATUS_CHANGE' | 'GENERAL';
  isRead: boolean;
  createdAt: string;
}

// UI State Types
export interface FilterOption {
  label: string;
  value: VehicleState | 'ALL';
}

export interface DashboardStats {
  totalVehicles: number;
  available: number;
  assigned: number;
  inTransit: number;
  returning: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: DriverRole;
  isActive: boolean;
  currentVehicleId: string | null; // Track which vehicle is assigned
  fcmToken: string | null;
  createdAt: string;
  updatedAt: string;
}