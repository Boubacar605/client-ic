import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSession } from '../../auth/session';

export default function AppLayout() {
  const { status } = useSession();
  if (status === 'loading') return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;
  if (status === 'signedOut') return <Redirect href="/welcome" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
