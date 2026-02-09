/**
 * ActionButton Component
 * State-driven action button for drivers
 */

import React from 'react';
import { VehicleState } from '../../types';
import { Button } from '../shared/Button';

interface ActionButtonProps {
  vehicleStatus: VehicleState;
  onStartTrip: () => void;
  onStartReturn: () => void;
  loading?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  vehicleStatus,
  onStartTrip,
  onStartReturn,
  loading = false,
}) => {
  // Button logic based on vehicle state
  if (vehicleStatus === VehicleState.ASSIGNED) {
    return (
      <Button
        title="Start Trip"
        onPress={onStartTrip}
        variant="primary"
        size="large"
        fullWidth
        loading={loading}
      />
    );
  }

  if (vehicleStatus === VehicleState.IN_TRANSIT) {
    return (
      <Button
        title="Start Return"
        onPress={onStartReturn}
        variant="primary"
        size="large"
        fullWidth
        loading={loading}
      />
    );
  }

  // No button for AVAILABLE or RETURNING states
  return null;
};