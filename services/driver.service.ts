/**
 * Driver Service
 * Handle driver-specific operations
 */

import {
  collection,
  query,
  where,
  onSnapshot,
  Unsubscribe,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { Vehicle, TripHistory } from '../types';
import { FIRESTORE_COLLECTIONS } from '../constants/app.constants';

/**
 * Subscribe to driver's current vehicle
 */
export const subscribeToDriverVehicle = (
  driverId: string,
  callback: (vehicle: Vehicle | null) => void
): Unsubscribe => {
  const vehiclesRef = collection(db, FIRESTORE_COLLECTIONS.VEHICLES);
  const q = query(vehiclesRef, where('driverId', '==', driverId));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        callback(null);
        return;
      }

      const vehicleData = snapshot.docs[0].data() as Vehicle;
      callback({
        ...vehicleData,
        id: snapshot.docs[0].id,
      });
    },
    (error) => {
      console.error('Error subscribing to driver vehicle:', error);
      callback(null);
    }
  );
};

/**
 * Subscribe to driver's trip history
 */
export const subscribeToDriverHistory = (
  driverId: string,
  callback: (trips: TripHistory[]) => void,
  limitCount: number = 20
): Unsubscribe => {
  const historyRef = collection(db, FIRESTORE_COLLECTIONS.TRIP_HISTORY);
  const q = query(
    historyRef,
    where('driverId', '==', driverId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const trips = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as TripHistory[];
      callback(trips);
    },
    (error) => {
      console.error('Error subscribing to trip history:', error);
      callback([]);
    }
  );
};