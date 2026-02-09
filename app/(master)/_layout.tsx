/**
 * Master Layout
 * Stack navigation for master dashboard screens
 */

import { Stack } from 'expo-router';
import { colors } from '../../themes';

export default function MasterLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="master-dashboard" 
        options={{ 
          title: 'Fleet Overview',
        }} 
      />
      <Stack.Screen 
        name="vehicle-details" 
        options={{ 
          title: 'Vehicle Details',
          presentation: 'card',
        }} 
      />
    </Stack>
  );
}