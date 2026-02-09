/**
 * VehicleCard Component
 * Display vehicle information for master dashboard
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Vehicle, VehicleState } from '../../types';
import { StatusBadge } from '../shared/StatusBadge';
import { colors, spacing, radius, textStyles, shadows } from '../../themes';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const router = useRouter();

  const formatTime = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePress = () => {
    // Navigate to vehicle details with vehicleId as query param
    router.push(`/(master)/vehicle-details?vehicleId=${vehicle.id}`);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.vehicleId}>{vehicle.id}</Text>
          <Text style={styles.warehouse}>{vehicle.warehouse}</Text>
        </View>
        <StatusBadge status={vehicle.status} />
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <Text style={styles.label}>Location</Text>
        <Text style={styles.value}>{vehicle.currentLocation}</Text>
      </View>

      {vehicle.destination && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Destination</Text>
          <Text style={styles.value}>{vehicle.destination}</Text>
        </View>
      )}

      {vehicle.driverName && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Driver</Text>
          <Text style={styles.value}>{vehicle.driverName}</Text>
        </View>
      )}

      {vehicle.status === VehicleState.IN_TRANSIT && vehicle.timestamps.startedAt && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Started At</Text>
          <Text style={styles.value}>{formatTime(vehicle.timestamps.startedAt)}</Text>
        </View>
      )}

      {vehicle.status === VehicleState.ASSIGNED && vehicle.timestamps.assignedAt && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Assigned {formatTime(vehicle.timestamps.assignedAt)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  vehicleId: {
    ...textStyles.h3,
    color: colors.textPrimary,
  },
  warehouse: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
  },
  value: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.md,
  },
  footer: {
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
});