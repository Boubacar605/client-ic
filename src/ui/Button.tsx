import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { radius } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  large?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
};

export function Button({ label, onPress, variant = 'primary', large, loading, disabled, icon }: Props) {
  const t = useTheme();
  const bg = variant === 'primary' ? t.brand : variant === 'secondary' ? t.soft : 'transparent';
  const fg = variant === 'primary' ? t.onBrand : variant === 'secondary' ? t.brand : t.muted;
  const hasShadow = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        s.btn,
        hasShadow && s.shadow,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1, minHeight: large ? 58 : 50 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={large ? 24 : 20} color={fg} />}
          <Text style={[s.label, { color: fg, fontSize: large ? 17 : 15 }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 20 },
  label: { fontWeight: '700', letterSpacing: 0.3 },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});
