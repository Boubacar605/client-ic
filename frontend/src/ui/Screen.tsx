import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { space } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { Content } from './Content';

export function Screen({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return (
    <SafeAreaView style={[s.flex, { backgroundColor: t.bg }]}>
      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        <Content style={s.gap}>{children}</Content>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  flex: { flex: 1 },
  body: { paddingVertical: space.lg, flexGrow: 1 },
  gap: { gap: space.md, paddingBottom: space.lg },
});
