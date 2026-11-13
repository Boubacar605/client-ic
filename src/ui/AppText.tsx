import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme } from '../theme/useTheme';

const VARIANTS = {
  display: { fontSize: 30, fontWeight: '800', lineHeight: 36 },
  title: { fontSize: 24, fontWeight: '800', lineHeight: 30 },
  heading: { fontSize: 19, fontWeight: '700', lineHeight: 25 },
  body: { fontSize: 16, lineHeight: 22 },
  label: { fontSize: 15, fontWeight: '700' },
  caption: { fontSize: 13, lineHeight: 18 },
} as const;

type Props = TextProps & { variant?: keyof typeof VARIANTS; muted?: boolean; color?: string };

export function AppText({ variant = 'body', muted, color, style, ...rest }: Props) {
  const t = useTheme();
  return <Text {...rest} style={[VARIANTS[variant], { color: color ?? (muted ? t.muted : t.text) }, style]} />;
}
