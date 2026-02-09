/**
 * FilterChips Component
 * Horizontal scrollable filter chips for vehicle status
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { VehicleState } from '../../types';
import { colors, spacing, radius, textStyles } from '../../themes';
import { VEHICLE_STATUS_LABELS } from '../../constants/app.constants';

interface FilterOption {
  label: string;
  value: VehicleState | 'ALL';
}

interface FilterChipsProps {
  options: FilterOption[];
  selectedValue: VehicleState | 'ALL';
  onSelect: (value: VehicleState | 'ALL') => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  options,
  selectedValue,
  onSelect,
}) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        bounces={false}
      >
        {options.map((option) => {
          const isSelected = option.value === selectedValue;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.chip,
                isSelected && styles.chipSelected,
              ]}
              onPress={() => onSelect(option.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.chipTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    paddingVertical: spacing.md,
  },
  container: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: spacing.xs,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow for depth
    shadowColor: colors.textPrimary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderWidth: 2,
    // Enhanced shadow for selected state
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  chipText: {
    ...textStyles.label,
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  chipTextSelected: {
    color: colors.background,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});