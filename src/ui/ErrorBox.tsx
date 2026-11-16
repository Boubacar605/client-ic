import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

export function ErrorBox({ message }: { message: string }) {
  const t = useTheme();
  return (
    <View style={[s.box, { backgroundColor: t.errorSoft }]} accessibilityRole="alert">
      <Ionicons name="alert-circle" size={22} color={t.error} />
      <View style={{ flex: 1 }}>
        <AppText color={t.error} style={{ fontWeight: '700' }}>{message}</AppText>
      </View>
    </View>
  );
}
const s = StyleSheet.create({ box: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: 16, alignItems: 'flex-start' } });
