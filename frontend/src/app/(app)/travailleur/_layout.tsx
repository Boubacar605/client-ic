import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { useSession } from '../../../auth/session';
import { tabIcon, useTabScreenOptions } from '../../../ui/tabStyle';

// Espace travailleur : annonces, demandes, disponibilités, profil. Un recruteur qui arrive ici est renvoyé chez lui.
export default function TravailleurLayout() {
  const { profil } = useSession();
  const options = useTabScreenOptions();
  if (profil && profil.role !== 'TRAVAILLEUR') return <Redirect href={profil.role === 'AGENT' ? '/agent' : profil.role === 'ADMINISTRATEUR' ? '/admin' : '/recruteur'} />;
  return (
    <Tabs screenOptions={options}>
      <Tabs.Screen name="index" options={{ title: 'Annonces', tabBarIcon: tabIcon('briefcase', 'briefcase-outline') }} />
      <Tabs.Screen name="demandes" options={{ title: 'Demandes', tabBarIcon: tabIcon('paper-plane', 'paper-plane-outline') }} />
      <Tabs.Screen name="disponibilites" options={{ title: 'Dispo', tabBarIcon: tabIcon('calendar', 'calendar-outline') }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil', tabBarIcon: tabIcon('person', 'person-outline') }} />
      <Tabs.Screen name="notifications" options={{ title: 'Alertes', tabBarIcon: tabIcon('notifications', 'notifications-outline') }} />
    </Tabs>
  );
}
