/**
 * Driver Dashboard
 * Shows current vehicle status and action buttons
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Header } from '../../components/shared/Header';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { ActionButton } from '../../components/driver/ActionButton';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { Button } from '../../components/shared/Button';
import { DriverRequestModal } from '../../components/driver/DriverRequestModal';
import { subscribeToDriverVehicle } from '../../services/driver.service';
import { startTrip, startReturn } from '../../services/vehicle.service';
import { getCurrentUser, signOut, getDriverProfile } from '../../services/auth.service';
import { createVehicleRequest } from '../../services/assignment.service';
import { Vehicle, VehicleState } from '../../types';
import { ROUTES } from '../../constants/app.constants';
import { colors, spacing, radius, textStyles, shadows } from '../../themes';

export default function DriverDashboard() {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [driverName, setDriverName] = useState('Driver');

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    // Fetch driver profile for name
    getDriverProfile(user.uid).then((profile) => {
      setDriverName(profile.name);
    }).catch((err) => {
      console.error('Error fetching driver profile:', err);
    });

    const unsubscribe = subscribeToDriverVehicle(user.uid, (vehicleData) => {
      setVehicle(vehicleData);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStartTrip = async () => {
    if (!vehicle) return;

    try {
      setActionLoading(true);
      await startTrip(vehicle.id);
      Alert.alert('Success', 'Trip started successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to start trip. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartReturn = async () => {
    if (!vehicle) return;

    try {
      setActionLoading(true);
      await startReturn(vehicle.id);
      Alert.alert('Success', 'Return journey started');
    } catch (error) {
      Alert.alert('Error', 'Failed to start return. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace(ROUTES.LOGIN);
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
  };

  const handleRequestVehicle = async (
    vehicleId: string,
    destination: string,
    reason: string
  ) => {
    const user = getCurrentUser();
    if (!user) return;

    try {
      await createVehicleRequest(
        vehicleId,
        user.uid,
        driverName,
        destination,
        reason
      );
      Alert.alert('Success', 'Vehicle request submitted successfully. The vehicle master will review your request.');
    } catch (error) {
      console.error('Error creating request:', error);
      throw error;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Driver Dashboard"
        subtitle={`Welcome, ${driverName}`}
        rightAction={{
          label: 'Sign Out',
          onPress: handleSignOut,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {!vehicle ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>🚗</Text>
            </View>
            <Text style={styles.emptyTitle}>No Vehicle Assigned</Text>
            <Text style={styles.emptyText}>
              You currently don't have a vehicle assigned. You can request one from the vehicle master.
            </Text>
            
            <View style={styles.requestButtonContainer}>
              <Button
                title="Request Vehicle"
                onPress={() => setRequestModalVisible(true)}
                variant="primary"
                size="large"
              />
            </View>
          </View>
        ) : (
          <View style={styles.vehicleContainer}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Current Vehicle</Text>
                <StatusBadge status={vehicle.status} />
              </View>

              <View style={styles.divider} />

              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Vehicle ID</Text>
                  <Text style={styles.infoValue}>{vehicle.id}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Warehouse</Text>
                  <Text style={styles.infoValue}>{vehicle.warehouse}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Current Location</Text>
                  <Text style={styles.infoValue}>{vehicle.currentLocation}</Text>
                </View>

                {vehicle.destination && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Destination</Text>
                    <Text style={[styles.infoValue, styles.destination]}>
                      {vehicle.destination}
                    </Text>
                  </View>
                )}
              </View>

              {vehicle.timestamps.assignedAt && (
                <View style={styles.timestampSection}>
                  <Text style={styles.timestampText}>
                    Assigned:{' '}
                    {new Date(vehicle.timestamps.assignedAt).toLocaleString()}
                  </Text>
                </View>
              )}

              {vehicle.timestamps.startedAt && (
                <View style={styles.timestampSection}>
                  <Text style={styles.timestampText}>
                    Started:{' '}
                    {new Date(vehicle.timestamps.startedAt).toLocaleString()}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.actionContainer}>
              <ActionButton
                vehicleStatus={vehicle.status}
                onStartTrip={handleStartTrip}
                onStartReturn={handleStartReturn}
                loading={actionLoading}
              />
            </View>

            {(vehicle.status === VehicleState.AVAILABLE ||
              vehicle.status === VehicleState.RETURNING) && (
              <View style={styles.statusMessage}>
                <Text style={styles.statusMessageText}>
                  {vehicle.status === VehicleState.AVAILABLE
                    ? 'Waiting for assignment'
                    : 'Returning to warehouse'}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Driver Request Vehicle Modal */}
      <DriverRequestModal
        visible={requestModalVisible}
        onClose={() => setRequestModalVisible(false)}
        onSubmit={handleRequestVehicle}
        driverId={getCurrentUser()?.uid || ''}
        driverName={driverName}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    ...textStyles.h2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptyText: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  requestButtonContainer: {
    marginTop: spacing.lg,
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  vehicleContainer: {
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...textStyles.h3,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  infoSection: {
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
  infoValue: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.md,
  },
  destination: {
    color: colors.primary,
  },
  timestampSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  timestampText: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  actionContainer: {
    paddingHorizontal: spacing.md,
  },
  statusMessage: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  statusMessageText: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
});