/**
 * Button Component
 * Reusable action button with variants
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, radius, textStyles, shadows } from '../../themes';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const base: ViewStyle = {
      ...styles.button,
      ...shadows.sm,
    };

    if (fullWidth) {
      base.width = '100%';
    }

    // Variant styles
    if (variant === 'primary') {
      base.backgroundColor = colors.primary;
    } else if (variant === 'secondary') {
      base.backgroundColor = colors.surface;
    } else if (variant === 'outline') {
      base.backgroundColor = 'transparent';
      base.borderWidth = 2;
      base.borderColor = colors.primary;
    } else if (variant === 'danger') {
      base.backgroundColor = colors.error;
    }

    // Size styles
    if (size === 'small') {
      base.paddingVertical = spacing.sm;
      base.paddingHorizontal = spacing.md;
    } else if (size === 'large') {
      base.paddingVertical = spacing.md + 4;
      base.paddingHorizontal = spacing.xl;
    }

    // Disabled state
    if (disabled) {
      base.opacity = 0.5;
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = {
      ...textStyles.button,
    };

    if (variant === 'primary') {
      base.color = colors.background;
    } else if (variant === 'secondary') {
      base.color = colors.textPrimary;
    } else if (variant === 'outline') {
      base.color = colors.primary;
    } else if (variant === 'danger') {
      base.color = colors.textPrimary;
    }

    if (size === 'small') {
      base.fontSize = 14;
    } else if (size === 'large') {
      base.fontSize = 18;
    }

    return base;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? colors.primary : colors.background}
          size="small"
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
});