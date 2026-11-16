import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/useTheme';

export function Logo({ size = 64 }: { size?: number }) {
  const t = useTheme();
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.3, backgroundColor: t.sun, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="people" size={size * 0.55} color="#14201c" />
    </View>
  );
}
