import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { clearLogs, getLogs } from '../api/log';
import { api } from '../api/client';
import { getBaseUrl, setBaseUrl } from '../config';
import { useTheme } from '../theme/useTheme';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { TextField } from '../ui/TextField';

// Écran de test : l'adresse du serveur (qui change à chaque relance de ngrok) et les derniers appels.
export default function Debug() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [url, setUrl] = useState(getBaseUrl());
  const [msg, setMsg] = useState('');
  const [tick, setTick] = useState(0);
  const logs = getLogs();
  void tick;

  async function save() { await setBaseUrl(url); setUrl(getBaseUrl()); setMsg('Adresse enregistrée.'); }
  async function test() {
    setMsg('Test en cours…');
    try { await save(); const r = await api.get('/bootstrap'); setMsg(`Serveur joint : HTTP ${r.status}.`); }
    catch (e: any) { setMsg(`Échec : ${e?.title ?? e?.message ?? 'inconnu'} (${e?.code ?? '?'})`); }
    setTick((n) => n + 1);
  }

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={[s.body, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }]} keyboardShouldPersistTaps="handled">
      <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))} accessibilityRole="button"><AppText color={t.brand} style={{ fontWeight: '700' }}>‹ Retour</AppText></Pressable>
      <AppText variant="display">Diagnostic</AppText>
      <Card>
        <TextField label="Adresse du serveur" autoCapitalize="none" autoCorrect={false} keyboardType="url" value={url} onChangeText={setUrl}
          hint="Adresse ngrok complète, sans / à la fin et sans /v1." />
        <Button label="Enregistrer et tester" icon="pulse" onPress={test} />
        {msg ? <AppText variant="label" color={msg.startsWith('Échec') ? t.error : t.brand}>{msg}</AppText> : null}
      </Card>
      <View style={s.head}>
        <AppText variant="heading">Derniers appels ({logs.length})</AppText>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button label="Actualiser" variant="secondary" onPress={() => setTick((n) => n + 1)} />
          <Button label="Vider" variant="ghost" onPress={() => { clearLogs(); setTick((n) => n + 1); }} />
        </View>
      </View>
      {logs.length === 0 && <Card><AppText muted>Aucun appel pour le moment.</AppText></Card>}
      {logs.map((l, i) => {
        const ok = typeof l.status === 'number' && l.status < 400;
        return (
          <Card key={`${l.t}-${i}`}>
            <AppText variant="label" color={ok ? t.green : t.error}>{l.method} {l.status}  ({l.ms} ms)</AppText>
            <Text selectable style={[s.mono, { color: t.text }]}>{l.url}</Text>
            {l.req ? <Text selectable style={[s.mono, { color: t.muted }]}>envoyé : {l.req}</Text> : null}
            {l.res ? <Text selectable style={[s.mono, { color: t.muted }]}>reçu : {l.res}</Text> : null}
          </Card>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { padding: 20, gap: 14 },
  head: { gap: 8 },
  mono: { fontFamily: 'Courier', fontSize: 12 },
});
