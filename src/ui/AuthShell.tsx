import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';
import { Card } from './Card';
import { Logo } from './Logo';

// Cadre commun de la connexion et de l'inscription : logo, carte centrée, bouton retour.
export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: t.bg }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Retour" hitSlop={10}
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))}
        style={[s.back, { top: insets.top + 8, backgroundColor: t.card, borderColor: t.line }]}>
        <Ionicons name="arrow-back" size={24} color={t.text} />
      </Pressable>
      <ScrollView contentContainerStyle={[s.scroll, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.col}>
          <View style={s.brand}><Logo size={60} /><AppText variant="title">XeuySil</AppText></View>
          <Card>
            <AppText variant="title">{title}</AppText>
            {subtitle ? <AppText muted>{subtitle}</AppText> : null}
            {children}
          </Card>
          {footer}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const s = StyleSheet.create({
  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 20 },
  col: { width: '100%', maxWidth: 440, gap: 16 },
  brand: { alignItems: 'center', gap: 6 },
  back: { position: 'absolute', left: 16, zIndex: 10, width: 46, height: 46, borderRadius: 23, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
