/**
 * Vehicle Service
 * Handle vehicle operations and state management
 */

import {
  collection,
  query,
  where,
  onSnapshot,
  Unsubscribe,
  doc,
  updateDoc,
  orderBy,
  limit as firestoreLimit,
  addDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Vehicle, VehicleState, TripHistory } from '../types';
import { FIRESTORE_COLLECTIONS, ERROR_MESSAGES } from '../constants/app.constants';

/**
 * Subscribe to all vehicles with optional status filter
 */
export const subscribeToVehicles = (
  callback: (vehicles: Vehicle[]) => void,
  statusFilter?: VehicleState,
  limitCount: number = 50
): Unsubscribe => {
  const vehiclesRef = collection(db, FIRESTORE_COLLECTIONS.VEHICLES);
  
  let q = query(vehiclesRef, orderBy('updatedAt', 'desc'), firestoreLimit(limitCount));
  
  if (statusFilter) {
    q = query(vehiclesRef, where('status', '==', statusFilter), orderBy('updatedAt', 'desc'), firestoreLimit(limitCount));
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const vehicles = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Vehicle[];
      callback(vehicles);
    },
    (error) => {
      console.error('Error subscribing to vehicles:', error);
      callback([]);
    }
  );
};

/**
 * Update vehicle status and timestamps
 */
export const updateVehicleStatus = async (
  vehicleId: string,
  newStatus: VehicleState,
  updates?: Partial<Vehicle>
): Promise<void> => {
  try {
    const vehicleRef = doc(db, FIRESTORE_COLLECTIONS.VEHICLES, vehicleId);
    
    const timestampUpdates: Partial<Vehicle['timestamps']> = {};
    
    // Update timestamps based on status
    if (newStatus === VehicleState.IN_TRANSIT) {
      timestampUpdates.startedAt = new Date().toISOString();
    } else if (newStatus === VehicleState.AVAILABLE) {
      timestampUpdates.returnedAt = new Date().toISOString();
    }

    await updateDoc(vehicleRef, {
      status: newStatus,
      ...updates,
      ...(Object.keys(timestampUpdates).length > 0 && {
        'timestamps.startedAt': timestampUpdates.startedAt || null,
        'timestamps.returnedAt': timestampUpdates.returnedAt || null,
      }),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating vehicle status:', error);
    throw new Error(ERROR_MESSAGES.INVALID_STATE_TRANSITION);
  }
};

/**
 * Start trip - transition from ASSIGNED to IN_TRANSIT
 */
export const startTrip = async (vehicleId: string): Promise<void> => {
  await updateVehicleStatus(vehicleId, VehicleState.IN_TRANSIT);
};

/**
 * Start return - transition from IN_TRANSIT to RETURNING
 */
export const startReturn = async (vehicleId: string): Promise<void> => {
  await updateVehicleStatus(vehicleId, VehicleState.RETURNING);
};

/**
 * Complete trip - transition from RETURNING to AVAILABLE and log to history
 */
export const completeTrip = async (vehicle: Vehicle): Promise<void> => {
  try {
    // Update vehicle to AVAILABLE
    const vehicleRef = doc(db, FIRESTORE_COLLECTIONS.VEHICLES, vehicle.id);
    await updateDoc(vehicleRef, {
      status: VehicleState.AVAILABLE,
      driverId: null,
      driverName: null,
      destination: null,
      'timestamps.assignedAt': null,
      'timestamps.startedAt': null,
      'timestamps.returnedAt': new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Log trip to history
    if (vehicle.timestamps.startedAt && vehicle.driverId && vehicle.destination) {
      const startTime = new Date(vehicle.timestamps.startedAt);
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 60000); // minutes

      await addDoc(collection(db, FIRESTORE_COLLECTIONS.TRIP_HISTORY), {
        vehicleId: vehicle.id,
        driverId: vehicle.driverId,
        driverName: vehicle.driverName,
        startLocation: vehicle.currentLocation,
        destination: vehicle.destination,
        startTime: vehicle.timestamps.startedAt,
        endTime: endTime.toISOString(),
        duration,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error completing trip:', error);
    throw error;
  }
};

/**
 * Assign vehicle to driver
 */
export const assignVehicle = async (
  vehicleId: string,
  driverId: string,
  driverName: string,
  destination: string
): Promise<void> => {
  try {
    const vehicleRef = doc(db, FIRESTORE_COLLECTIONS.VEHICLES, vehicleId);
    await updateDoc(vehicleRef, {
      status: VehicleState.ASSIGNED,
      driverId,
      driverName,
      destination,
      'timestamps.assignedAt': new Date().toISOString(),
      'timestamps.startedAt': null,
      'timestamps.returnedAt': null,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error assigning vehicle:', error);
    throw error;
  }
};

