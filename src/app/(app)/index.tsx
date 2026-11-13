import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSession } from '../../auth/session';

// Point d'entrée après la connexion : chacun est envoyé dans SON espace, selon le rôle renvoyé par le serveur.
export default function Entree() {
  const { profil } = useSession();
  if (!profil) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;
  if (profil.role === 'ADMINISTRATEUR') return <Redirect href={'/admin' as never} />;
  if (profil.role === 'AGENT') return <Redirect href={'/agent' as never} />;
  return <Redirect href={profil.role === 'TRAVAILLEUR' ? '/travailleur' : '/recruteur'} />;
}
