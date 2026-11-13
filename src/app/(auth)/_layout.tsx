import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { useSession } from '../../auth/session';

export default function AuthLayout() {
  const { status } = useSession();
  if (status === 'signedIn') return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
