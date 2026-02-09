/**
 * VehicleRequestModal Component
 * Modal for creating vehicle assignment requests
 */

import React, { useState } from 'react';
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
} from 'react-native';
import { Button } from '../shared/Button';
import { colors, spacing, radius, textStyles, shadows } from '../../themes';

interface VehicleRequestModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (destination: string, reason: string) => Promise<void>;
  vehicleId: string;
}

export const VehicleRequestModal: React.FC<VehicleRequestModalProps> = ({
  visible,
  onClose,
  onSubmit,
  vehicleId,
}) => {
  const [destination, setDestination] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

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
      await onSubmit(destination.trim(), reason.trim());
      setDestination('');
      setReason('');
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

            <Text style={styles.subtitle}>Vehicle ID: {vehicleId}</Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Destination *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter destination"
                  placeholderTextColor={colors.textTertiary}
                  value={destination}
                  onChangeText={setDestination}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Reason *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter reason for request"
                  placeholderTextColor={colors.textTertiary}
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {error && <Text style={styles.error}>{error}</Text>}

              <Button
                title="Submit Request"
                onPress={handleSubmit}
                variant="primary"
                fullWidth
                loading={loading}
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