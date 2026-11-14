import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { useSession } from '../../../auth/session';
import { tabIcon, useTabScreenOptions } from '../../../ui/tabStyle';

// Back-office : réservé aux administrateurs. Tout autre rôle est renvoyé dans son espace.
export default function AdminLayout() {
  const { profil } = useSession();
  const options = useTabScreenOptions();
  if (profil && profil.role !== 'ADMINISTRATEUR') {
    const home = profil.role === 'AGENT' ? '/agent' : profil.role === 'RECRUTEUR' ? '/recruteur' : '/travailleur';
    return <Redirect href={home as never} />;
  }
  return (
    <Tabs screenOptions={options}>
      <Tabs.Screen name="index" options={{ title: 'Pilotage', tabBarIcon: tabIcon('grid', 'grid-outline') }} />
      <Tabs.Screen name="users" options={{ title: 'Comptes', tabBarIcon: tabIcon('people', 'people-outline') }} />
      <Tabs.Screen name="missions" options={{ title: 'Missions', tabBarIcon: tabIcon('briefcase', 'briefcase-outline') }} />
      <Tabs.Screen name="commissions" options={{ title: 'Commissions', tabBarIcon: tabIcon('cash', 'cash-outline') }} />
      <Tabs.Screen name="settings" options={{ title: 'Réglages', tabBarIcon: tabIcon('settings', 'settings-outline') }} />
      <Tabs.Screen name="nouveau-compte" options={{ href: null }} />
      <Tabs.Screen name="referentiels" options={{ href: null }} />
      <Tabs.Screen name="user/[id]" options={{ href: null }} />
      <Tabs.Screen name="mission/[id]" options={{ href: null }} />
    </Tabs>
  );
}
