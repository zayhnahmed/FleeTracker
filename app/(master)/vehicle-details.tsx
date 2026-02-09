/**
 * Vehicle Details Screen
 * Displays detailed vehicle information with real-time timeline
 * Includes back navigation and vehicle assignment
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Vehicle, VehicleState } from '../../types';
import { FIRESTORE_COLLECTIONS } from '../../constants/app.constants';
import { assignVehicle } from '../../services/vehicle.service';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { TimelineView } from '../../components/master/TimelineView';
import { Button } from '../../components/shared/Button';
import { colors, spacing, radius, textStyles, shadows } from '../../themes';

// Import AssignVehicleModal component inline since we need it
import {
  Modal,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Driver, DriverRole } from '../../types';

export default function VehicleDetailsScreen() {
  const router = useRouter();
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignModalVisible, setAssignModalVisible] = useState(false);

  useEffect(() => {
    // Validate vehicleId exists
    if (!vehicleId) {
      setError('No vehicle ID provided');
      setLoading(false);
      return;
    }

    // Subscribe to real-time vehicle updates
    const vehicleRef = doc(db, FIRESTORE_COLLECTIONS.VEHICLES, vehicleId);

    const unsubscribe = onSnapshot(
      vehicleRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const vehicleData = {
            ...snapshot.data(),
            id: snapshot.id,
          } as Vehicle;
          setVehicle(vehicleData);
          setError(null);
        } else {
          setError('Vehicle not found');
          setVehicle(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching vehicle:', err);
        setError('Failed to load vehicle data');
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [vehicleId]);

  /**
   * Handle vehicle assignment
   */
  const handleAssignVehicle = async (
    driverId: string,
    driverName: string,
    destination: string
  ) => {
    if (!vehicle) return;

    try {
      await assignVehicle(vehicle.id, driverId, driverName, destination);
      Alert.alert('Success', `Vehicle assigned to ${driverName}`);
      setAssignModalVisible(false);
    } catch (error) {
      console.error('Error assigning vehicle:', error);
      throw error; // Let modal handle the error
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vehicle Details</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading vehicle data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !vehicle) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vehicle Details</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error || 'Vehicle not found'}</Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  const canAssign = vehicle.status === VehicleState.AVAILABLE;

  // Main content
  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header with Back Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vehicle Details</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Vehicle Overview Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.vehicleId}>{vehicle.id}</Text>
              <Text style={styles.warehouse}>{vehicle.warehouse}</Text>
            </View>
            <StatusBadge status={vehicle.status} />
          </View>

          <View style={styles.divider} />

          {/* Vehicle Information */}
          <View style={styles.infoSection}>
            <InfoRow label="Current Location" value={vehicle.currentLocation} />
            {vehicle.destination && (
              <InfoRow label="Destination" value={vehicle.destination} />
            )}
            {vehicle.driverName && (
              <InfoRow label="Driver" value={vehicle.driverName} />
            )}
          </View>

          {/* Assign Button - Only show for available vehicles */}
          {canAssign && (
            <View style={styles.actionSection}>
              <Button
                title="Assign to Driver"
                onPress={() => setAssignModalVisible(true)}
                variant="primary"
                fullWidth
              />
            </View>
          )}

          {/* Timestamps Section */}
          {vehicle.timestamps.assignedAt && (
            <View style={styles.timestampSection}>
              <Text style={styles.sectionTitle}>Assignment History</Text>
              <InfoRow
                label="Assigned At"
                value={formatDate(vehicle.timestamps.assignedAt)}
                small
              />
              {vehicle.timestamps.startedAt && (
                <InfoRow
                  label="Started At"
                  value={formatDate(vehicle.timestamps.startedAt)}
                  small
                />
              )}
              {vehicle.timestamps.reachedDestinationAt && (
                <InfoRow
                  label="Reached Destination"
                  value={formatDate(vehicle.timestamps.reachedDestinationAt)}
                  small
                />
              )}
              {vehicle.timestamps.returnedAt && (
                <InfoRow
                  label="Returned At"
                  value={formatDate(vehicle.timestamps.returnedAt)}
                  small
                />
              )}
            </View>
          )}
        </View>

        {/* Timeline View - Only show if vehicle has destination */}
        {vehicle.destination && <TimelineView vehicle={vehicle} />}

        {/* No active trip message */}
        {!vehicle.destination && vehicle.status === VehicleState.AVAILABLE && (
          <View style={styles.card}>
            <Text style={styles.noTripText}>
              No active trip. Vehicle is currently available at {vehicle.warehouse}.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Assign Vehicle Modal - Inline Implementation */}
      <AssignVehicleModalInline
        visible={assignModalVisible}
        onClose={() => setAssignModalVisible(false)}
        onSubmit={handleAssignVehicle}
        vehicleId={vehicle.id}
      />
    </SafeAreaView>
  );
}

/**
 * Inline AssignVehicleModal Component
 */
interface AssignVehicleModalInlineProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (driverId: string, driverName: string, destination: string) => Promise<void>;
  vehicleId: string;
}

const AssignVehicleModalInline: React.FC<AssignVehicleModalInlineProps> = ({
  visible,
  onClose,
  onSubmit,
  vehicleId,
}) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingDrivers, setFetchingDrivers] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      fetchAvailableDrivers();
    } else {
      setSelectedDriver(null);
      setDestination('');
      setError('');
    }
  }, [visible]);

  const fetchAvailableDrivers = async () => {
  try {
    setFetchingDrivers(true);
    const usersRef = collection(db, FIRESTORE_COLLECTIONS.USERS);
    
    // Query for active drivers only
    const q = query(
      usersRef,
      where('role', '==', DriverRole.DRIVER),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    
    const availableDrivers = snapshot.docs
      .map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Driver[];

    const driversWithoutVehicles = availableDrivers.filter(
      driver => !driver.currentVehicleId || driver.currentVehicleId === null
    );

    console.log('All drivers:', availableDrivers);
    console.log('Available drivers:', driversWithoutVehicles);

    setDrivers(driversWithoutVehicles);
    setFetchingDrivers(false);
  } catch (err) {
    console.error('Error fetching drivers:', err);
    setError('Failed to load available drivers');
    setFetchingDrivers(false);
  }
};

  const handleSubmit = async () => {
    setError('');

    if (!selectedDriver) {
      setError('Please select a driver');
      return;
    }

    if (!destination.trim()) {
      setError('Destination is required');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(selectedDriver.id, selectedDriver.name, destination.trim());
      setDestination('');
      setSelectedDriver(null);
      onClose();
    } catch (err) {
      setError('Failed to assign vehicle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDestination('');
    setSelectedDriver(null);
    setError('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={modalStyles.container}
      >
        <TouchableOpacity
          style={modalStyles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View style={modalStyles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>Assign Vehicle</Text>
              <TouchableOpacity onPress={handleClose} style={modalStyles.closeButton}>
                <Text style={modalStyles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={modalStyles.subtitle}>Vehicle ID: {vehicleId}</Text>

            <View style={modalStyles.form}>
              <View style={modalStyles.inputGroup}>
                <Text style={modalStyles.label}>Select Driver *</Text>
                {fetchingDrivers ? (
                  <View style={modalStyles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={modalStyles.loadingText}>Loading drivers...</Text>
                  </View>
                ) : drivers.length === 0 ? (
                  <View style={modalStyles.noDriversContainer}>
                    <Text style={modalStyles.noDriversText}>
                      No available drivers found
                    </Text>
                  </View>
                ) : (
                  <ScrollView style={modalStyles.driverList} nestedScrollEnabled>
                    {drivers.map((driver) => (
                      <TouchableOpacity
                        key={driver.id}
                        style={[
                          modalStyles.driverCard,
                          selectedDriver?.id === driver.id &&
                            modalStyles.driverCardSelected,
                        ]}
                        onPress={() => setSelectedDriver(driver)}
                      >
                        <View style={modalStyles.driverInfo}>
                          <Text
                            style={[
                              modalStyles.driverName,
                              selectedDriver?.id === driver.id &&
                                modalStyles.driverNameSelected,
                            ]}
                          >
                            {driver.name}
                          </Text>
                          <Text style={modalStyles.driverPhone}>{driver.phone}</Text>
                        </View>
                        {selectedDriver?.id === driver.id && (
                          <View style={modalStyles.selectedIndicator}>
                            <Text style={modalStyles.checkmark}>✓</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              <View style={modalStyles.inputGroup}>
                <Text style={modalStyles.label}>Destination *</Text>
                <TextInput
                  style={modalStyles.input}
                  placeholder="Enter destination"
                  placeholderTextColor={colors.textTertiary}
                  value={destination}
                  onChangeText={setDestination}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>

              {error && <Text style={modalStyles.error}>{error}</Text>}

              <Button
                title="Assign Vehicle"
                onPress={handleSubmit}
                variant="primary"
                fullWidth
                loading={loading}
                disabled={!selectedDriver || !destination.trim()}
                style={modalStyles.submitButton}
              />

              <Button
                title="Cancel"
                onPress={handleClose}
                variant="outline"
                fullWidth
                disabled={loading}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

/**
 * Reusable Info Row Component
 */
interface InfoRowProps {
  label: string;
  value: string;
  small?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, small = false }) => (
  <View style={styles.infoRow}>
    <Text style={small ? styles.infoLabelSmall : styles.infoLabel}>{label}</Text>
    <Text style={small ? styles.infoValueSmall : styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.sm,
  },
  backButton: {
    width: 80,
  },
  backButtonText: {
    ...textStyles.body,
    color: colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    ...textStyles.h3,
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    ...textStyles.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorText: {
    ...textStyles.h3,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  vehicleId: {
    ...textStyles.h2,
    color: colors.textPrimary,
  },
  warehouse: {
    ...textStyles.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  infoSection: {
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  infoLabel: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
  infoValue: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.md,
  },
  infoLabelSmall: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
  },
  infoValueSmall: {
    ...textStyles.bodySmall,
    color: colors.textPrimary,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.md,
  },
  actionSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  timestampSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionTitle: {
    ...textStyles.label,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  noTripText: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    maxHeight: '90%',
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...textStyles.h2,
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.sm,
  },
  closeText: {
    ...textStyles.h3,
    color: colors.textSecondary,
  },
  subtitle: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  form: {
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    ...textStyles.label,
    color: colors.textPrimary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
  loadingText: {
    ...textStyles.body,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  noDriversContainer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  noDriversText: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  driverList: {
    maxHeight: 200,
  },
  driverCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  driverCardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  driverNameSelected: {
    color: colors.primary,
  },
  driverPhone: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    ...textStyles.body,
    color: colors.textPrimary,
  },
  error: {
    ...textStyles.bodySmall,
    color: colors.error,
  },
  submitButton: {
    marginTop: spacing.md,
  },
});