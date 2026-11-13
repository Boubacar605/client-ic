import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useResponsive } from '../lib/responsive';

/** Colonne de contenu centrée et bornée : évite tout débordement sur tablette et desktop. */
export function Content({
  children,
  style,
  padded = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}) {
  const { contentWidth, gutter } = useResponsive();
  return (
    <View
      style={[
        { width: '100%', maxWidth: contentWidth, alignSelf: 'center' },
        padded && { paddingHorizontal: gutter },
        style,
      ]}
    >
      {children}
    </View>
  );
}
