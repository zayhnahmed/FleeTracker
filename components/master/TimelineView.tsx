/**
 * TimelineView Component
 * Displays 3-step vertical timeline for vehicle journey
 * Reacts to vehicle status and timestamps
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Vehicle, VehicleState } from '../../types';
import { colors, spacing, textStyles } from '../../themes';

interface TimelineViewProps {
  vehicle: Vehicle;
}

interface TimelineStep {
  label: string;
  location: string;
  timestamp: string | null;
  status: 'completed' | 'active' | 'pending';
  timeLeft?: string; // e.g., "15 min left"
}

export const TimelineView: React.FC<TimelineViewProps> = ({ vehicle }) => {
  /**
   * Calculate timeline steps based on vehicle state and timestamps
   */
  const getTimelineSteps = (): TimelineStep[] => {
    const { status, timestamps, warehouse, destination } = vehicle;

    // Step 1: Start (Warehouse)
    const startStep: TimelineStep = {
      label: 'Start',
      location: warehouse,
      timestamp: timestamps.startedAt,
      status: timestamps.startedAt ? 'completed' : 'pending',
    };

    // Step 2: Destination
    const destinationStep: TimelineStep = {
      label: 'Destination',
      location: destination || 'Not set',
      timestamp: timestamps.reachedDestinationAt || null,
      status: 'pending',
    };

    // Determine destination step status
    if (status === VehicleState.IN_TRANSIT) {
      destinationStep.status = 'active';
      // Calculate estimated time left (mock calculation - 30 min default)
      if (timestamps.startedAt && !timestamps.reachedDestinationAt) {
        const elapsed = Math.floor(
          (Date.now() - new Date(timestamps.startedAt).getTime()) / 60000
        );
        const estimated = Math.max(30 - elapsed, 5); // At least 5 min
        destinationStep.timeLeft = `${estimated} min left`;
      }
    } else if (
      status === VehicleState.RETURNING ||
      status === VehicleState.AVAILABLE
    ) {
      destinationStep.status = 'completed';
    }

    // Step 3: Return (Back to Warehouse)
    const returnStep: TimelineStep = {
      label: 'Return',
      location: warehouse,
      timestamp: timestamps.returnedAt,
      status: 'pending',
    };

    // Determine return step status
    if (status === VehicleState.RETURNING) {
      returnStep.status = 'active';
      // Calculate estimated return time
      if (timestamps.reachedDestinationAt && !timestamps.returnedAt) {
        const elapsed = Math.floor(
          (Date.now() - new Date(timestamps.reachedDestinationAt).getTime()) / 60000
        );
        const estimated = Math.max(25 - elapsed, 5);
        returnStep.timeLeft = `${estimated} min left`;
      }
    } else if (status === VehicleState.AVAILABLE) {
      returnStep.status = 'completed';
    }

    return [startStep, destinationStep, returnStep];
  };

  const steps = getTimelineSteps();

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp: string | null): string => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Get dot style based on step status
   */
  const getDotStyle = (status: TimelineStep['status']) => {
    switch (status) {
      case 'completed':
        return [styles.dot, styles.dotCompleted];
      case 'active':
        return [styles.dot, styles.dotActive];
      case 'pending':
        return [styles.dot, styles.dotPending];
    }
  };

  /**
   * Get line style based on whether next step is completed
   */
  const getLineStyle = (currentIndex: number) => {
    const nextStep = steps[currentIndex + 1];
    if (!nextStep) return null;

    const isCompleted = nextStep.status === 'completed';
    return [
      styles.line,
      isCompleted ? styles.lineSolid : styles.lineDashed,
    ];
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Journey Timeline</Text>

      {steps.map((step, index) => (
        <View key={index} style={styles.stepContainer}>
          <View style={styles.timelineColumn}>
            {/* Dot */}
            <View style={getDotStyle(step.status)}>
              {step.status === 'completed' && (
                <View style={styles.dotInner} />
              )}
            </View>

            {/* Connecting line (if not last step) */}
            {index < steps.length - 1 && (
              <View style={getLineStyle(index)} />
            )}
          </View>

          <View style={styles.contentColumn}>
            <View style={styles.stepHeader}>
              <Text
                style={[
                  styles.stepLabel,
                  step.status === 'active' && styles.stepLabelActive,
                ]}
              >
                {step.label}
              </Text>
              {step.timeLeft && (
                <Text style={styles.timeLeft}>{step.timeLeft}</Text>
              )}
            </View>

            <Text style={styles.location}>{step.location}</Text>

            {step.timestamp && (
              <Text style={styles.timestamp}>
                {formatTimestamp(step.timestamp)}
              </Text>
            )}

            {/* Add spacing after each step except the last */}
            {index < steps.length - 1 && <View style={styles.stepSpacing} />}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
  },
  title: {
    ...textStyles.h3,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  stepContainer: {
    flexDirection: 'row',
  },
  timelineColumn: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCompleted: {
    backgroundColor: colors.status.available,
    borderColor: colors.status.available,
  },
  dotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dotPending: {
    backgroundColor: 'transparent',
    borderColor: colors.textTertiary,
  },
  dotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 40,
    marginVertical: 4,
  },
  lineSolid: {
    backgroundColor: colors.status.available,
  },
  lineDashed: {
    backgroundColor: colors.border,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.border,
  },
  contentColumn: {
    flex: 1,
    paddingBottom: spacing.xs,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  stepLabel: {
    ...textStyles.label,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  stepLabelActive: {
    color: colors.primary,
  },
  timeLeft: {
    ...textStyles.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  location: {
    ...textStyles.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  timestamp: {
    ...textStyles.caption,
    color: colors.textTertiary,
  },
  stepSpacing: {
    height: spacing.sm,
  },
});