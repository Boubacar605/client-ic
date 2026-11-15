import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { login } from '../../api/auth';
import { ApiError, fieldErrors } from '../../api/client';
import type { Profil } from '../../api/types';
import { useSession } from '../../auth/session';
import { getBaseUrl, ADMIN_ROUTE_SECRET } from '../../config';
import { emailOk } from '../../lib/validation';
import { useTheme } from '../../theme/useTheme';
import { AppText } from '../../ui/AppText';
import { AuthShell } from '../../ui/AuthShell';
import { Button } from '../../ui/Button';
import { ErrorBox } from '../../ui/ErrorBox';
import { TextField } from '../../ui/TextField';

const DEMO_COMPTES: { role: Profil['role']; label: string; icon: string; profil: Profil }[] = [
  {
    role: 'TRAVAILLEUR',
    label: 'Travailleur',
    icon: 'construct-outline',
    profil: { id: 'demo-t', email: 'demo.travailleur@xeuysil.sn', role: 'TRAVAILLEUR', statut: 'ACTIF', nom: 'Amadou Demo', telephone: '+221771234567' },
  },
  {
    role: 'RECRUTEUR',
    label: 'Recruteur',
    icon: 'business-outline',
    profil: { id: 'demo-r', email: 'demo.recruteur@xeuysil.sn', role: 'RECRUTEUR', statut: 'ACTIF', nom: 'Fatou Demo', telephone: '+221772345678', raisonSociale: 'Demo SARL', typeRecruteur: 'PARTICULIER' },
  },
  {
    role: 'AGENT',
    label: 'Agent',
    icon: 'people-outline',
    profil: { id: 'demo-a', email: 'demo.agent@xeuysil.sn', role: 'AGENT', statut: 'ACTIF', nom: 'Moussa Demo', telephone: '+221773456789' },
  },
  {
    role: 'ADMINISTRATEUR',
    label: 'Admin',
    icon: 'shield-outline',
    profil: { id: 'demo-ad', email: 'demo.admin@xeuysil.sn', role: 'ADMINISTRATEUR', statut: 'ACTIF', nom: 'Admin Demo', telephone: '+221774567890' },
  },
];

export default function Login() {
  const t = useTheme();
  const router = useRouter();
  const { signIn, signInDemo } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [fe, setFe] = useState<Record<string, string>>({});

  async function submit() {
    setError(null);
    const e: Record<string, string> = {};
    if (!emailOk(email)) e.email = 'Entrez une adresse e-mail valide.';
    if (!password) e.password = 'Entrez votre mot de passe.';
    setFe(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try { await signIn(await login(email, password)); }
    catch (err) { setError(err as ApiError); setFe(fieldErrors(err)); }
    finally { setLoading(false); }
  }

  async function connecterDemo(item: typeof DEMO_COMPTES[0]) {
    setDemoLoading(item.role);
    try { await signInDemo(item.profil); }
    finally { setDemoLoading(null); }
  }

  return (
    <AuthShell title="Bon retour !" subtitle="Connectez-vous pour retrouver vos missions."
      footer={
        <>
          <Button label="Créer un compte" variant="secondary" icon="person-add-outline" large onPress={() => router.push('/register')} />
          <Pressable onPress={() => router.push('/debug')} onLongPress={() => { if (ADMIN_ROUTE_SECRET) router.push(`/acces/${ADMIN_ROUTE_SECRET}` as never); }}
            accessibilityRole="button" style={{ alignItems: 'center', padding: 8 }}>
            <AppText variant="caption" muted>Serveur : {getBaseUrl().replace(/^https?:\/\//, '') || 'non défini'}</AppText>
          </Pressable>
        </>
      }>
      <TextField label="Adresse e-mail" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
        placeholder="nom@exemple.com" value={email} onChangeText={setEmail} error={fe.email} />
      <TextField label="Mot de passe" icon="lock-closed-outline" secureTextEntry={!show} autoCapitalize="none" value={password} onChangeText={setPassword}
        error={fe.password} right={<Pressable accessibilityRole="button" accessibilityLabel={show ? 'Masquer' : 'Afficher'} onPress={() => setShow(!show)}><Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={22} color={t.muted} /></Pressable>} />
      <Pressable onPress={() => router.push('/forgot-password')} accessibilityRole="link" style={{ alignSelf: 'flex-end', paddingVertical: 4 }}>
        <AppText color={t.brand}>Mot de passe oublié ?</AppText>
      </Pressable>
      {error && <ErrorBox message={error.title} code={error.code} />}
      <Button label="Se connecter" icon="arrow-forward" large loading={loading} onPress={submit} />

      {/* Accès démo */}
      <View style={[s.separator, { borderColor: t.line }]}>
        <View style={[s.line, { backgroundColor: t.line }]} />
        <AppText variant="caption" muted style={s.sepLabel}>Accès démo</AppText>
        <View style={[s.line, { backgroundColor: t.line }]} />
      </View>
      <View style={s.demoGrid}>
        {DEMO_COMPTES.map((item) => (
          <Pressable
            key={item.role}
            style={[s.demoBtn, { backgroundColor: t.soft, borderColor: t.brand + '40' }]}
            onPress={() => connecterDemo(item)}
            accessibilityRole="button"
            disabled={demoLoading !== null}
          >
            <Ionicons name={item.icon as any} size={20} color={t.brand} />
            <AppText variant="caption" color={t.brand} style={{ fontWeight: '600' }}>
              {demoLoading === item.role ? '...' : item.label}
            </AppText>
          </Pressable>
        ))}
      </View>
    </AuthShell>
  );
}

const s = StyleSheet.create({
  separator: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 },
  line: { flex: 1, height: 1 },
  sepLabel: { paddingHorizontal: 4 },
  demoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  demoBtn: { flex: 1, minWidth: '45%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 12, borderWidth: 1 },
});
