import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { radius } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

type Props = TextInputProps & {
  label: string;
  error?: string | null;
  hint?: string;
  prefix?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  big?: boolean;
  right?: React.ReactNode;
};

export function TextField({ label, error, hint, prefix, icon, big, right, style, ...input }: Props) {
  const t = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text style={[s.label, { color: t.text }]}>{label}</Text>
      <View style={[s.box, { backgroundColor: t.bg, borderColor: error ? t.error : t.line }]}>
        {icon && <Ionicons name={icon} size={20} color={t.muted} />}
        {prefix && <Text style={[s.prefix, { color: t.text, borderColor: t.line }]}>{prefix}</Text>}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={t.muted}
          style={[s.input, { color: t.text, fontSize: big ? 24 : 16 }, big && s.big, style]}
          {...input}
        />
        {right}
      </View>
      {error ? <Text style={{ color: t.error, fontSize: 13, paddingHorizontal: 8 }}>{error}</Text>
        : hint ? <Text style={{ color: t.muted, fontSize: 13, paddingHorizontal: 8 }}>{hint}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  label: { fontWeight: '700', fontSize: 15, paddingHorizontal: 8 },
  box: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderRadius: radius.pill, paddingHorizontal: 18, minHeight: 56 },
  prefix: { fontSize: 16, fontWeight: '700', paddingRight: 10, borderRightWidth: 1 },
  input: { flex: 1, paddingVertical: 12 },
  big: { textAlign: 'center', letterSpacing: 8, fontWeight: '700' },
});
