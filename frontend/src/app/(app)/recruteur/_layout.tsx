import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { useSession } from '../../../auth/session';
import { tabIcon, useTabScreenOptions } from '../../../ui/tabStyle';

// Espace recruteur : missions, publication, profil. Un travailleur qui arrive ici est renvoyé chez lui.
export default function RecruteurLayout() {
  const { profil } = useSession();
  const options = useTabScreenOptions();
  if (profil && profil.role !== 'RECRUTEUR') return <Redirect href={profil.role === 'AGENT' ? '/agent' : profil.role === 'ADMINISTRATEUR' ? '/admin' : '/travailleur'} />;
  return (
    <Tabs screenOptions={options}>
      <Tabs.Screen name="index" options={{ title: 'Missions', tabBarIcon: tabIcon('list', 'list-outline') }} />
      <Tabs.Screen name="publier" options={{ title: 'Publier', tabBarIcon: tabIcon('add-circle', 'add-circle-outline') }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil', tabBarIcon: tabIcon('person', 'person-outline') }} />
      <Tabs.Screen name="notifications" options={{ title: 'Alertes', tabBarIcon: tabIcon('notifications', 'notifications-outline') }} />
    </Tabs>
  );
}
