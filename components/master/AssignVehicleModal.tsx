/**
 * AssignVehicleModal Component
 * Modal for assigning available vehicles to available drivers
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Driver, DriverRole } from '../../types';
import { FIRESTORE_COLLECTIONS } from '../../constants/app.constants';
import { Button } from '../shared/Button';
import { colors, spacing, radius, textStyles, shadows } from '../../themes';

interface AssignVehicleModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (driverId: string, driverName: string, destination: string) => Promise<void>;
  vehicleId: string;
}

export const AssignVehicleModal: React.FC<AssignVehicleModalProps> = ({
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

  // Fetch available drivers when modal opens
  useEffect(() => {
    if (visible) {
      fetchAvailableDrivers();
    } else {
      // Reset form when modal closes
      setSelectedDriver(null);
      setDestination('');
      setError('');
    }
  }, [visible]);

  /**
   * Fetch drivers who don't have a vehicle assigned
   */
  const fetchAvailableDrivers = async () => {
    try {
      setFetchingDrivers(true);
      const usersRef = collection(db, FIRESTORE_COLLECTIONS.USERS);
      const q = query(
        usersRef,
        where('role', '==', DriverRole.DRIVER),
        where('isActive', '==', true),
        where('currentVehicleId', '==', null)
      );

      const snapshot = await getDocs(q);
      const availableDrivers = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Driver[];

      setDrivers(availableDrivers);
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
        style={styles.container}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>Assign Vehicle</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>Vehicle ID: {vehicleId}</Text>

            <View style={styles.form}>
              {/* Driver Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Select Driver *</Text>
                {fetchingDrivers ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading drivers...</Text>
                  </View>
                ) : drivers.length === 0 ? (
                  <View style={styles.noDriversContainer}>
                    <Text style={styles.noDriversText}>
                      No available drivers found
                    </Text>
                  </View>
                ) : (
                  <ScrollView style={styles.driverList} nestedScrollEnabled>
                    {drivers.map((driver) => (
                      <TouchableOpacity
                        key={driver.id}
                        style={[
                          styles.driverCard,
                          selectedDriver?.id === driver.id &&
                            styles.driverCardSelected,
                        ]}
                        onPress={() => setSelectedDriver(driver)}
                      >
                        <View style={styles.driverInfo}>
                          <Text
                            style={[
                              styles.driverName,
                              selectedDriver?.id === driver.id &&
                                styles.driverNameSelected,
                            ]}
                          >
                            {driver.name}
                          </Text>
                          <Text style={styles.driverPhone}>{driver.phone}</Text>
                        </View>
                        {selectedDriver?.id === driver.id && (
                          <View style={styles.selectedIndicator}>
                            <Text style={styles.checkmark}>✓</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* Destination Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Destination *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter destination"
                  placeholderTextColor={colors.textTertiary}
                  value={destination}
                  onChangeText={setDestination}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>

              {error && <Text style={styles.error}>{error}</Text>}

              <Button
                title="Assign Vehicle"
                onPress={handleSubmit}
                variant="primary"
                fullWidth
                loading={loading}
                disabled={!selectedDriver || !destination.trim()}
                style={styles.submitButton}
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

const styles = StyleSheet.create({
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