import React from 'react';
import { Image, View } from 'react-native';

const logoImg = require('../../assets/images/logo-xeuysil.jpeg');

export function Logo({ size = 64 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.2, overflow: 'hidden' }}>
      <Image
        source={logoImg}
        style={{ width: size, height: size }}
        resizeMode="cover"
      />
    </View>
  );
}
