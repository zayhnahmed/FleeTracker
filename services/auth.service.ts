/**
 * Authentication Service
 * Handle user authentication and role-based routing
 */

import { signInWithEmailAndPassword, signOut as firebaseSignOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Driver, DriverRole } from '../types';
import { FIRESTORE_COLLECTIONS, ERROR_MESSAGES } from '../constants/app.constants';

/**
 * Sign in user and fetch their role
 */
export const signIn = async (
  email: string,
  password: string
): Promise<{ user: User; role: DriverRole; driver: Driver }> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('🔐 User authenticated:', user.uid);
    console.log('📧 Email:', user.email);

    // Fetch user document to get role
    const userDocRef = doc(db, FIRESTORE_COLLECTIONS.USERS, user.uid);
    const userDoc = await getDoc(userDocRef);

    console.log('📄 Document exists:', userDoc.exists());

    if (!userDoc.exists()) {
      throw new Error('User profile not found');
    }

    const userData = userDoc.data() as Driver;
    
    console.log('👤 User data:', JSON.stringify(userData, null, 2));
    console.log('🎭 Role from Firestore:', userData.role);

    if (!userData.role) {
      throw new Error('User role not assigned');
    }

    if (!userData.isActive) {
      throw new Error('User account is inactive');
    }

    return {
      user,
      role: userData.role,
      driver: userData,
    };
  } catch (error: unknown) {
    console.error('❌ Sign in error:', error);
    if (error instanceof Error) {
      if (error.message.includes('auth/invalid-credential') || 
          error.message.includes('auth/user-not-found') ||
          error.message.includes('auth/wrong-password')) {
        throw new Error(ERROR_MESSAGES.AUTH_FAILED);
      }
      throw error;
    }
    throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
  }
};

/**
 * Sign out current user
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw new Error('Failed to sign out');
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Fetch driver profile
 */
export const getDriverProfile = async (userId: string): Promise<Driver> => {
  try {
    const driverDocRef = doc(db, FIRESTORE_COLLECTIONS.USERS, userId);
    const driverDoc = await getDoc(driverDocRef);

    if (!driverDoc.exists()) {
      throw new Error('Driver profile not found');
    }

    return driverDoc.data() as Driver;
  } catch (error) {
    console.error('Error fetching driver profile:', error);
    throw error;
  }
};