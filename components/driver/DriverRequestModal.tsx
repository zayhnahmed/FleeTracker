/**
 * DriverRequestModal Component
 * Drivers use this to REQUEST vehicles from masters
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
import { Vehicle, VehicleState } from '../../types';
import { FIRESTORE_COLLECTIONS } from '../../constants/app.constants';
import { Button } from '../shared/Button';
import { StatusBadge } from '../shared/StatusBadge';
import { colors, spacing, radius, textStyles, shadows } from '../../themes';

interface DriverRequestModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (vehicleId: string, destination: string, reason: string) => Promise<void>;
  driverId: string;
  driverName: string;
}

export const DriverRequestModal: React.FC<DriverRequestModalProps> = ({
  visible,
  onClose,
  onSubmit,
  driverId,
  driverName,
}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [destination, setDestination] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingVehicles, setFetchingVehicles] = useState(false);
  const [error, setError] = useState('');

  // Fetch available vehicles when modal opens
  useEffect(() => {
    if (visible) {
      fetchAvailableVehicles();
    } else {
      // Reset form when modal closes
      setSelectedVehicle(null);
      setDestination('');
      setReason('');
      setError('');
    }
  }, [visible]);

  /**
   * Fetch vehicles that are available
   */
  const fetchAvailableVehicles = async () => {
  try {
    setFetchingVehicles(true);
    const vehiclesRef = collection(db, FIRESTORE_COLLECTIONS.VEHICLES);
    const q = query(
      vehiclesRef,
      where('status', '==', VehicleState.AVAILABLE)
    );

    const snapshot = await getDocs(q);
    const availableVehicles = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Vehicle[];

    console.log('Available vehicles:', availableVehicles);

    setVehicles(availableVehicles);
    setFetchingVehicles(false);
  } catch (err) {
    console.error('Error fetching vehicles:', err);
    setError('Failed to load available vehicles');
    setFetchingVehicles(false);
  }
};

  const handleSubmit = async () => {
    setError('');

    if (!selectedVehicle) {
      setError('Please select a vehicle');
      return;
    }

    if (!destination.trim()) {
      setError('Destination is required');
      return;
    }

    if (!reason.trim()) {
      setError('Reason is required');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(selectedVehicle.id, destination.trim(), reason.trim());
      setDestination('');
      setReason('');
      setSelectedVehicle(null);
      onClose();
    } catch (err) {
      setError('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDestination('');
    setReason('');
    setSelectedVehicle(null);
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
              <Text style={styles.title}>Request Vehicle</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>
              Select an available vehicle and provide trip details
            </Text>

            <View style={styles.form}>
              {/* Vehicle Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Select Vehicle *</Text>
                {fetchingVehicles ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading vehicles...</Text>
                  </View>
                ) : vehicles.length === 0 ? (
                  <View style={styles.noVehiclesContainer}>
                    <Text style={styles.noVehiclesText}>
                      No available vehicles at the moment
                    </Text>
                  </View>
                ) : (
                  <ScrollView style={styles.vehicleList} nestedScrollEnabled>
                    {vehicles.map((vehicle) => (
                      <TouchableOpacity
                        key={vehicle.id}
                        style={[
                          styles.vehicleCard,
                          selectedVehicle?.id === vehicle.id &&
                            styles.vehicleCardSelected,
                        ]}
                        onPress={() => setSelectedVehicle(vehicle)}
                      >
                        <View style={styles.vehicleInfo}>
                          <View style={styles.vehicleHeader}>
                            <Text
                              style={[
                                styles.vehicleId,
                                selectedVehicle?.id === vehicle.id &&
                                  styles.vehicleIdSelected,
                              ]}
                            >
                              {vehicle.id}
                            </Text>
                            <StatusBadge status={vehicle.status} />
                          </View>
                          <Text style={styles.vehicleLocation}>
                            {vehicle.warehouse} • {vehicle.currentLocation}
                          </Text>
                        </View>
                        {selectedVehicle?.id === vehicle.id && (
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
                  placeholder="Where are you going?"
                  placeholderTextColor={colors.textTertiary}
                  value={destination}
                  onChangeText={setDestination}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>

              {/* Reason Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Reason *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Why do you need this vehicle?"
                  placeholderTextColor={colors.textTertiary}
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!loading}
                />
              </View>

              {error && <Text style={styles.error}>{error}</Text>}

              <Button
                title="Submit Request"
                onPress={handleSubmit}
                variant="primary"
                fullWidth
                loading={loading}
                disabled={!selectedVehicle || !destination.trim() || !reason.trim()}
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
  noVehiclesContainer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  noVehiclesText: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  vehicleList: {
    maxHeight: 200,
  },
  vehicleCard: {
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
  vehicleCardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  vehicleId: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  vehicleIdSelected: {
    color: colors.primary,
  },
  vehicleLocation: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
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
  textArea: {
    minHeight: 100,
  },
  error: {
    ...textStyles.bodySmall,
    color: colors.error,
  },
  submitButton: {
    marginTop: spacing.md,
  },
});