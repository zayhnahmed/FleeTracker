/**
 * StatusBadge Component
 * Display vehicle status with color coding
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { VehicleState } from '../../types';
import { colors, spacing, radius, textStyles } from '../../themes';
import { VEHICLE_STATUS_LABELS } from '../../constants/app.constants';

interface StatusBadgeProps {
  status: VehicleState;
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, style }) => {
  const getStatusColor = (state: VehicleState): string => {
    switch (state) {
      case VehicleState.AVAILABLE:
        return colors.status.available;
      case VehicleState.ASSIGNED:
        return colors.status.assigned;
      case VehicleState.IN_TRANSIT:
        return colors.status.inTransit;
      case VehicleState.RETURNING:
        return colors.status.returning;
      default:
        return colors.textSecondary;
    }
  };

  const statusColor = getStatusColor(status);

  return (
    <View style={[styles.badge, { backgroundColor: `${statusColor}20` }, style]}>
      <View style={[styles.dot, { backgroundColor: statusColor }]} />
      <Text style={[styles.text, { color: statusColor }]}>
        {VEHICLE_STATUS_LABELS[status]}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  text: {
    ...textStyles.caption,
    fontWeight: '600',
  },
});