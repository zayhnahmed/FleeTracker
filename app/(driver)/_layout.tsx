/**
 * Driver Layout
 * Stack navigation for driver screens
 */

import { Stack } from 'expo-router';
import { colors } from '../../themes';

export default function DriverLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="driver-dashboard" 
        options={{ 
          title: 'Driver Dashboard',
        }} 
      />
      <Stack.Screen 
        name="driver-history" 
        options={{ 
          title: 'Trip History',
        }} 
      />
    </Stack>
  );
}