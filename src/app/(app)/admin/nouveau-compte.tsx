import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createAdminUser } from '../../../api/admin';
import { ApiError } from '../../../api/client';
import { useTheme } from '../../../theme/useTheme';
import { AppText } from '../../../ui/AppText';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { ErrorBox } from '../../../ui/ErrorBox';
import { TextField } from '../../../ui/TextField';

type Created = { nom: string; email: string | null; role: string; codeParrainage: string | null };

// Les comptes agent et administrateur ne s'inscrivent pas seuls : ils sont créés ici.
export default function NouveauCompte() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'AGENT' | 'ADMINISTRATEUR'>('AGENT');
  const [perimetre, setPerimetre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [created, setCreated] = useState<Created | null>(null);

  async function submit() {
    const tel = telephone.replace(/[\s.-]/g, '');
    const normalizedTel = /^\+2217\d{8}$/.test(tel) ? tel : /^7\d{8}$/.test(tel) ? `+221${tel}` : '';
    if (!nom.trim() || !normalizedTel || !email.trim() || password.length < 8) {
      setError(new ApiError(400, 'FORMULAIRE', 'Renseignez le nom, un mobile sénégalais (+221 7X XXX XX XX), l’e-mail et un mot de passe de 8 caractères minimum.'));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await createAdminUser({
        nom: nom.trim(),
        telephone: normalizedTel,
        email: email.trim().toLowerCase(),
        password,
        role,
        ...(role === 'AGENT' ? { perimetre: perimetre.trim() || null } : {}),
      });
      setCreated(result);
      setNom(''); setTelephone(''); setEmail(''); setPassword(''); setPerimetre('');
    } catch (e) {
      setError(e as ApiError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={[s.body, { paddingTop: insets.top + 16 }]}>
      <View style={s.head}>
        <Pressable accessibilityRole="button" accessibilityLabel="Retour" onPress={() => (router.canGoBack() ? router.back() : router.navigate('/admin'))}
          style={[s.back, { backgroundColor: t.card, borderColor: t.line }]}><Ionicons name="arrow-back" size={22} color={t.text} /></Pressable>
        <View style={{ flex: 1 }}><AppText variant="display">Nouveau compte</AppText><AppText muted>Agent ou administrateur, e-mail confirmé immédiatement.</AppText></View>
      </View>

      <Card>
        <AppText variant="heading">Rôle du compte</AppText>
        <View style={s.row}>
          {(['AGENT', 'ADMINISTRATEUR'] as const).map((r) => (
            <Pressable key={r} accessibilityRole="button" onPress={() => setRole(r)}
              style={[s.choice, { flex: 1, borderColor: role === r ? t.brand : t.line, backgroundColor: role === r ? t.soft : t.card }]}>
              <Ionicons name={r === 'AGENT' ? 'sparkles-outline' : 'shield-checkmark-outline'} size={22} color={role === r ? t.brand : t.muted} />
              <AppText variant="caption" color={role === r ? t.brand : t.muted}>{r === 'AGENT' ? 'Agent' : 'Administrateur'}</AppText>
            </Pressable>
          ))}
        </View>
        <TextField label="Nom complet" icon="person-outline" autoCapitalize="words" value={nom} onChangeText={setNom} />
        <TextField label="Téléphone" icon="call-outline" keyboardType="phone-pad" placeholder="+221 77 123 45 67" hint="Mobile sénégalais : +221 puis 9 chiffres commençant par 7" value={telephone} onChangeText={setTelephone} />
        <TextField label="E-mail" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <TextField label="Mot de passe" icon="lock-closed-outline" secureTextEntry autoCapitalize="none" hint="8 caractères au moins" value={password} onChangeText={setPassword} />
        {role === 'AGENT' && <TextField label="Périmètre (facultatif)" icon="map-outline" value={perimetre} onChangeText={setPerimetre} />}
        {error ? <ErrorBox message={error.title} code={error.code} /> : null}
        <Button label="Créer le compte" icon="checkmark" loading={loading} onPress={submit} />
      </Card>

      {created && (
        <Card>
          <View style={s.row}><Ionicons name="checkmark-circle" size={22} color={t.brand} /><AppText variant="heading">Compte créé</AppText></View>
          <AppText>{created.nom} · {created.role}</AppText>
          <AppText muted>{created.email}</AppText>
          {created.codeParrainage ? <AppText color={t.brand}>Code de parrainage : {created.codeParrainage}</AppText> : null}
          <Button label="Retour au pilotage" variant="secondary" onPress={() => router.navigate('/admin')} />
        </Card>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { padding: 20, paddingBottom: 140, gap: 14, maxWidth: 760, width: '100%', alignSelf: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  choice: { borderWidth: 1, borderRadius: 14, padding: 12, alignItems: 'center', gap: 6 },
});
