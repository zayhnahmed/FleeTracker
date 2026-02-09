/**
 * RequestApprovalModal Component
 * Masters use this to review and approve/reject driver vehicle requests
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { VehicleRequest, RequestStatus } from '../../types';
import { Button } from '../shared/Button';
import { colors, spacing, radius, textStyles, shadows } from '../../themes';

interface RequestApprovalModalProps {
  visible: boolean;
  onClose: () => void;
  request: VehicleRequest | null;
  onApprove: (requestId: string, vehicleId: string, driverId: string, driverName: string, destination: string) => Promise<void>;
  onReject: (requestId: string) => Promise<void>;
}

export const RequestApprovalModal: React.FC<RequestApprovalModalProps> = ({
  visible,
  onClose,
  request,
  onApprove,
  onReject,
}) => {
  const [loading, setLoading] = useState(false);

  if (!request) return null;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      await onApprove(
        request.id,
        request.vehicleId,
        request.driverId,
        request.driverName,
        request.destination
      );
      Alert.alert('Success', 'Request approved and vehicle assigned');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to approve request');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    Alert.alert(
      'Reject Request',
      'Are you sure you want to reject this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await onReject(request.id);
              Alert.alert('Success', 'Request rejected');
              onClose();
            } catch (error) {
              Alert.alert('Error', 'Failed to reject request');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>Vehicle Request</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.requestCard}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Driver</Text>
                <Text style={styles.value}>{request.driverName}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Vehicle ID</Text>
                <Text style={styles.valueHighlight}>{request.vehicleId}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Destination</Text>
                <Text style={styles.value}>{request.destination}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.reasonSection}>
                <Text style={styles.label}>Reason</Text>
                <Text style={styles.reasonText}>{request.reason}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text style={styles.label}>Requested</Text>
                <Text style={styles.valueSmall}>
                  {formatDate(request.requestedAt)}
                </Text>
              </View>

              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {request.status === RequestStatus.PENDING
                    ? '⏳ Pending Review'
                    : request.status === RequestStatus.APPROVED
                    ? '✓ Approved'
                    : '✗ Rejected'}
                </Text>
              </View>
            </View>

            {request.status === RequestStatus.PENDING && (
              <View style={styles.actions}>
                <Button
                  title="Approve & Assign"
                  onPress={handleApprove}
                  variant="primary"
                  fullWidth
                  loading={loading}
                  style={styles.approveButton}
                />

                <Button
                  title="Reject"
                  onPress={handleReject}
                  variant="danger"
                  fullWidth
                  disabled={loading}
                />
              </View>
            )}

            {request.status !== RequestStatus.PENDING && (
              <View style={styles.completedMessage}>
                <Text style={styles.completedText}>
                  This request has been {request.status.toLowerCase()}
                </Text>
                {request.respondedAt && (
                  <Text style={styles.completedDate}>
                    on {formatDate(request.respondedAt)}
                  </Text>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
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
    maxHeight: '80%',
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
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
  requestCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
  },
  value: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  valueHighlight: {
    ...textStyles.body,
    color: colors.primary,
    fontWeight: '700',
  },
  valueSmall: {
    ...textStyles.bodySmall,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  reasonSection: {
    marginBottom: spacing.md,
  },
  reasonText: {
    ...textStyles.body,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: `${colors.primary}20`,
    borderRadius: radius.full,
    marginTop: spacing.sm,
  },
  statusText: {
    ...textStyles.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  actions: {
    gap: spacing.md,
  },
  approveButton: {
    marginBottom: spacing.xs,
  },
  completedMessage: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  completedText: {
    ...textStyles.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  completedDate: {
    ...textStyles.bodySmall,
    color: colors.textTertiary,
  },
});