/**
 * Root Layout
 * Expo Router configuration and auth state management
 */

import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getDriverProfile } from '../services/auth.service';
import { DriverRole } from '../types';
import { ROUTES } from '../constants/app.constants';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../themes';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔐 Auth state changed:', user?.email || 'No user');
      
      if (!user) {
        // User is signed out
        console.log('📤 No user - redirecting to login');
        setIsAuthChecked(true);
        if (segments[0] !== '(auth)') {
          router.replace(ROUTES.LOGIN);
        }
        return;
      }

      try {
        // User is signed in, fetch their role
        console.log('👤 Fetching profile for:', user.uid);
        const profile = await getDriverProfile(user.uid);
        console.log('📋 Profile role:', profile.role);
        
        setIsAuthChecked(true);

        // Only redirect if currently on auth screen
        if (segments[0] === '(auth)' || !segments[0]) {
          if (profile.role === DriverRole.DRIVER) {
            console.log('🚗 Routing to DRIVER dashboard');
            router.replace(ROUTES.DRIVER_DASHBOARD);
          } else if (profile.role === DriverRole.VEHICLE_MASTER) {
            console.log('🏢 Routing to MASTER dashboard');
            router.replace(ROUTES.MASTER_DASHBOARD);
          } else {
            console.warn('⚠️ Unknown role:', profile.role);
            router.replace(ROUTES.LOGIN);
          }
        } else {
          console.log('✅ Already on correct screen, not redirecting');
        }
      } catch (error) {
        console.error('❌ Error fetching user profile:', error);
        setIsAuthChecked(true);
        router.replace(ROUTES.LOGIN);
      }
    });

    return () => unsubscribe();
  }, []);

  // Show loading screen while checking auth
  if (!isAuthChecked) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(driver)" />
      <Stack.Screen name="(master)" />
    </Stack>
  );
}