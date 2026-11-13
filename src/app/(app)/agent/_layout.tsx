import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { useSession } from '../../../auth/session';
import { tabIcon, useTabScreenOptions } from '../../../ui/tabStyle';
export default function AgentLayout() {
  const { profil } = useSession();
  if (profil && profil.role !== 'AGENT') return <Redirect href={profil.role === 'ADMINISTRATEUR' ? '/admin' : profil.role === 'RECRUTEUR' ? '/recruteur' : '/travailleur'} />;
  const options = useTabScreenOptions();
  return <Tabs screenOptions={options}>
    <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: tabIcon('grid', 'grid-outline') }} />
    <Tabs.Screen name="workers" options={{ title: 'Travailleurs', tabBarIcon: tabIcon('people', 'people-outline') }} />
    <Tabs.Screen name="proposal" options={{ title: 'Proposer', tabBarIcon: tabIcon('send', 'send-outline') }} />
    <Tabs.Screen name="profil" options={{ title: 'Profil', tabBarIcon: tabIcon('person', 'person-outline') }} />
  </Tabs>;
}
