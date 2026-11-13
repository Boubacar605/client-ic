import React from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useNotification, useNotificationActions } from '../../../api/hooks';
import { ApiError } from '../../../api/client';
import { Screen } from '../../../ui/Screen';
import { AppText } from '../../../ui/AppText';
import { Card } from '../../../ui/Card';
import { ErrorBox } from '../../../ui/ErrorBox';
import { Button } from '../../../ui/Button';
export default function NotificationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>(); const q = useNotification(id); const actions = useNotificationActions();
  if (q.isLoading) return <Screen><ActivityIndicator /></Screen>;
  if (q.error || !q.data) return <Screen><ErrorBox message={q.error instanceof ApiError ? q.error.title : 'Notification introuvable.'} /></Screen>;
  return <Screen><AppText variant="display">Notification</AppText><Card><AppText variant="heading">{q.data.type.replaceAll('_', ' ')}</AppText><AppText muted>{new Date(q.data.createdAt).toLocaleString('fr-FR')}</AppText><AppText>Canal : {q.data.canal}</AppText><AppText>Statut : {q.data.statut}</AppText>{!q.data.lu ? <Button label="Marquer comme lue" loading={actions.read.isPending} onPress={() => actions.read.mutate(q.data!.id)} /> : null}</Card></Screen>;
}
