/**
 * Assignment Service
 * Handle vehicle assignment requests
 */

import {
  collection,
  query,
  where,
  onSnapshot,
  Unsubscribe,
  addDoc,
  doc,
  updateDoc,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { VehicleRequest, RequestStatus } from '../types';
import { FIRESTORE_COLLECTIONS } from '../constants/app.constants';

/**
 * Subscribe to vehicle requests (with optional status filter)
 */
export const subscribeToVehicleRequests = (
  callback: (requests: VehicleRequest[]) => void,
  statusFilter?: RequestStatus
): Unsubscribe => {
  const requestsRef = collection(db, FIRESTORE_COLLECTIONS.VEHICLE_REQUESTS);
  
  let q = query(requestsRef, orderBy('requestedAt', 'desc'));
  
  if (statusFilter) {
    q = query(requestsRef, where('status', '==', statusFilter), orderBy('requestedAt', 'desc'));
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const requests = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as VehicleRequest[];
      callback(requests);
    },
    (error) => {
      console.error('Error subscribing to vehicle requests:', error);
      callback([]);
    }
  );
};

/**
 * Create vehicle request (Driver action)
 */
export const createVehicleRequest = async (
  vehicleId: string,
  driverId: string,
  driverName: string,
  destination: string,
  reason: string
): Promise<void> => {
  try {
    await addDoc(collection(db, FIRESTORE_COLLECTIONS.VEHICLE_REQUESTS), {
      vehicleId,
      driverId,
      driverName,
      destination,
      reason,
      status: RequestStatus.PENDING,
      requestedAt: new Date().toISOString(),
      respondedAt: null,
      respondedBy: null,
    });
  } catch (error) {
    console.error('Error creating vehicle request:', error);
    throw error;
  }
};

/**
 * Approve vehicle request (Master action)
 */
export const approveVehicleRequest = async (
  requestId: string,
  respondedBy: string
): Promise<void> => {
  try {
    const requestRef = doc(db, FIRESTORE_COLLECTIONS.VEHICLE_REQUESTS, requestId);
    await updateDoc(requestRef, {
      status: RequestStatus.APPROVED,
      respondedAt: new Date().toISOString(),
      respondedBy,
    });
  } catch (error) {
    console.error('Error approving vehicle request:', error);
    throw error;
  }
};

/**
 * Reject vehicle request (Master action)
 */
export const rejectVehicleRequest = async (
  requestId: string,
  respondedBy: string
): Promise<void> => {
  try {
    const requestRef = doc(db, FIRESTORE_COLLECTIONS.VEHICLE_REQUESTS, requestId);
    await updateDoc(requestRef, {
      status: RequestStatus.REJECTED,
      respondedAt: new Date().toISOString(),
      respondedBy,
    });
  } catch (error) {
    console.error('Error rejecting vehicle request:', error);
    throw error;
  }
};