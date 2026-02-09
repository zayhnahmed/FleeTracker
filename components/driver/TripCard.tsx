/**
 * TripCard Component
 * Display trip history entry
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TripHistory } from '../../types';
import { colors, spacing, radius, textStyles, shadows } from '../../themes';

interface TripCardProps {
  trip: TripHistory;
}

export const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(trip.startTime)}</Text>
        <Text style={styles.duration}>{formatDuration(trip.duration)}</Text>
      </View>

      <View style={styles.route}>
        <View style={styles.locationContainer}>
          <View style={styles.dotStart} />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>From</Text>
            <Text style={styles.locationValue}>{trip.startLocation}</Text>
            <Text style={styles.time}>{formatTime(trip.startTime)}</Text>
          </View>
        </View>

        <View style={styles.connector} />

        <View style={styles.locationContainer}>
          <View style={styles.dotEnd} />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>To</Text>
            <Text style={styles.locationValue}>{trip.destination}</Text>
            <Text style={styles.time}>{formatTime(trip.endTime)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.vehicleId}>Vehicle: {trip.vehicleId}</Text>
      </View>
    </View>
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
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  date: {
    ...textStyles.label,
    color: colors.textPrimary,
  },
  duration: {
    ...textStyles.label,
    color: colors.primary,
    fontWeight: '600',
  },
  route: {
    marginBottom: spacing.md,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  dotStart: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    marginTop: 4,
  },
  dotEnd: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  connector: {
    width: 2,
    height: 24,
    backgroundColor: colors.border,
    marginLeft: 5,
    marginVertical: spacing.xs,
  },
  locationLabel: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  locationValue: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  time: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  vehicleId: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
});