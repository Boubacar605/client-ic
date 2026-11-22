import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { login } from '../../api/auth';
import { ApiError, fieldErrors } from '../../api/client';
import { useSession } from '../../auth/session';
import { getBaseUrl, ADMIN_ROUTE_SECRET } from '../../config';
import { emailOk } from '../../lib/validation';
import { AppText } from '../../ui/AppText';
import { AuthShell } from '../../ui/AuthShell';
import { Button } from '../../ui/Button';
import { ErrorBox } from '../../ui/ErrorBox';
import { TextField } from '../../ui/TextField';

const HERO = require('../../../assets/images/hero-1.jpeg');
const LOGO = require('../../../assets/images/logo-xeuysil.jpeg');

const DEMO_COMPTES: { role: string; label: string; icon: string; color: string }[] = [
  { role: 'TRAVAILLEUR',    label: 'Travailleur', icon: 'construct-outline',  color: '#ffffff' },
  { role: 'RECRUTEUR',      label: 'Recruteur',   icon: 'business-outline',   color: '#ffffff' },
  { role: 'AGENT',          label: 'Agent',       icon: 'people-outline',     color: '#ffffff' },
  { role: 'ADMINISTRATEUR', label: 'Admin',       icon: 'shield-outline',     color: '#f2b705' },
];

export default function Login() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const { signIn } = useSession();
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [show, setShow]             = useState(false);
  const [loading, setLoading]       = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [error, setError]           = useState<ApiError | null>(null);
  const [fe, setFe]                 = useState<Record<string, string>>({});

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
    try {
      const result = await login(`demo.${item.role.toLowerCase()}@xeuysil.sn`, '', item.role);
      await signIn(result);
    } catch (err) { setError(err as ApiError); }
    finally { setDemoLoading(null); }
  }

  // ── Mise en page web split-screen ──────────────────────────────────────────
  if (Platform.OS === 'web') {
    return (
      <View style={sw.root}>
        {/* Panneau gauche — vert avec formulaire */}
        <LinearGradient
          colors={['#1a6b2a', '#0f4d1e']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={sw.left}
        >
          <ScrollView
            contentContainerStyle={[sw.leftScroll, { paddingTop: insets.top + 24 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo */}
            <View style={sw.logoRow}>
              <Image source={LOGO} style={sw.logoImg} />
              <View>
                <AppText style={sw.logoName}>XeuySil</AppText>
                <AppText style={sw.logoTagline}>Travaillez · Trouvez · Avancez</AppText>
              </View>
            </View>

            <AppText style={sw.heading}>Bon retour !</AppText>
            <AppText style={sw.sub}>Connectez-vous pour retrouver vos missions.</AppText>

            {/* Formulaire */}
            <View style={sw.form}>
              <TextField
                label="Adresse e-mail" icon="mail-outline"
                keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
                placeholder="nom@exemple.com" value={email} onChangeText={setEmail}
                error={fe.email}
              />
              <TextField
                label="Mot de passe" icon="lock-closed-outline"
                secureTextEntry={!show} autoCapitalize="none"
                value={password} onChangeText={setPassword} error={fe.password}
                right={
                  <Pressable onPress={() => setShow(!show)} accessibilityRole="button">
                    <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={22} color="rgba(255,255,255,0.7)" />
                  </Pressable>
                }
              />
              <Pressable onPress={() => router.push('/forgot-password')} style={{ alignSelf: 'flex-end' }}>
                <AppText style={sw.forgotLink}>Mot de passe oublié ?</AppText>
              </Pressable>
              {error && <ErrorBox message={error.title} code={error.code} />}
              <Pressable style={sw.loginBtn} onPress={submit} disabled={loading} accessibilityRole="button">
                <AppText style={sw.loginBtnText}>{loading ? 'Connexion...' : 'Se connecter'}</AppText>
                {!loading && <Ionicons name="arrow-forward" size={20} color="#1a6b2a" />}
              </Pressable>
            </View>

            {/* Séparateur démo */}
            <View style={sw.sep}>
              <View style={sw.sepLine} />
              <AppText style={sw.sepText}>Accès démo</AppText>
              <View style={sw.sepLine} />
            </View>

            {/* Boutons démo */}
            <View style={sw.demoGrid}>
              {DEMO_COMPTES.map((item) => (
                <Pressable
                  key={item.role}
                  style={sw.demoBtn}
                  onPress={() => connecterDemo(item)}
                  disabled={demoLoading !== null}
                  accessibilityRole="button"
                >
                  <Ionicons name={item.icon as any} size={18} color={item.color} />
                  <AppText style={[sw.demoBtnText, { color: item.color }]}>
                    {demoLoading === item.role ? '...' : item.label}
                  </AppText>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={() => router.push('/debug')}
              onLongPress={() => { if (ADMIN_ROUTE_SECRET) router.push(`/acces/${ADMIN_ROUTE_SECRET}` as never); }}
              style={{ marginTop: 16, alignItems: 'center' }}
            >
              <AppText style={sw.serverText}>
                {getBaseUrl().replace(/^https?:\/\//, '') || 'serveur non défini'}
              </AppText>
            </Pressable>
          </ScrollView>
        </LinearGradient>

        {/* Panneau droit — blanc avec image hero */}
        <View style={sw.right}>
          <Image source={HERO} style={sw.heroImg} resizeMode="cover" />
          <LinearGradient
            colors={['rgba(248,253,249,0)', 'rgba(248,253,249,0.6)', 'rgba(248,253,249,1)']}
            style={sw.heroOverlay}
          />
          <View style={sw.rightContent}>
            <AppText style={sw.newHere}>Nouveau ici ?</AppText>
            <AppText style={sw.newSub}>
              Rejoignez des milliers de travailleurs et recruteurs au Sénégal.
            </AppText>
            <Pressable style={sw.signupBtn} onPress={() => router.push('/register')} accessibilityRole="button">
              <AppText style={sw.signupBtnText}>Créer un compte</AppText>
              <Ionicons name="person-add-outline" size={20} color="#1a6b2a" />
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // ── Mise en page mobile (inchangée) ────────────────────────────────────────
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
        error={fe.password} right={<Pressable accessibilityRole="button" accessibilityLabel={show ? 'Masquer' : 'Afficher'} onPress={() => setShow(!show)}><Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={22} color="#5a7260" /></Pressable>} />
      <Pressable onPress={() => router.push('/forgot-password')} accessibilityRole="link" style={{ alignSelf: 'flex-end', paddingVertical: 4 }}>
        <AppText color="#1a6b2a">Mot de passe oublié ?</AppText>
      </Pressable>
      {error && <ErrorBox message={error.title} code={error.code} />}
      <Button label="Se connecter" icon="arrow-forward" large loading={loading} onPress={submit} />
      <View style={[sm.separator, { borderColor: '#d4e8d8' }]}>
        <View style={[sm.line, { backgroundColor: '#d4e8d8' }]} />
        <AppText variant="caption" muted style={sm.sepLabel}>Accès démo</AppText>
        <View style={[sm.line, { backgroundColor: '#d4e8d8' }]} />
      </View>
      <View style={sm.demoGrid}>
        {DEMO_COMPTES.map((item) => (
          <Pressable key={item.role} style={[sm.demoBtn, { backgroundColor: '#d4f0da', borderColor: '#1a6b2a40' }]}
            onPress={() => connecterDemo(item)} accessibilityRole="button" disabled={demoLoading !== null}>
            <Ionicons name={item.icon as any} size={20} color="#1a6b2a" />
            <AppText variant="caption" color="#1a6b2a" style={{ fontWeight: '600' }}>
              {demoLoading === item.role ? '...' : item.label}
            </AppText>
          </Pressable>
        ))}
      </View>
    </AuthShell>
  );
}

// ── Styles web split-screen ───────────────────────────────────────────────────
const sw = StyleSheet.create({
  root:        { flex: 1, flexDirection: 'row', width: '100vw' as any, height: '100vh' as any },
  left:        { flex: 1, maxWidth: 480 },
  leftScroll:  { paddingHorizontal: 40, paddingBottom: 40 },
  logoRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 36 },
  logoImg:     { width: 48, height: 48, borderRadius: 10 },
  logoName:    { fontSize: 20, fontWeight: '700', color: '#ffffff', fontFamily: 'Helvetica' },
  logoTagline: { fontSize: 11, color: 'rgba(255,255,255,0.65)', letterSpacing: 1.5, textTransform: 'uppercase' as any, fontFamily: 'Helvetica' },
  heading:     { fontSize: 32, fontWeight: '800', color: '#ffffff', marginBottom: 6 },
  sub:         { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 28 },
  form:        { gap: 14 },
  forgotLink:  { fontSize: 13, color: '#f2b705', textAlign: 'right' as any, marginTop: -6 },
  loginBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                 backgroundColor: '#f2b705', borderRadius: 999, height: 52, marginTop: 4 },
  loginBtnText:{ fontSize: 16, fontWeight: '700', color: '#1a6b2a' },
  sep:         { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 20 },
  sepLine:     { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  sepText:     { fontSize: 12, color: 'rgba(255,255,255,0.55)', letterSpacing: 1 },
  demoGrid:    { flexDirection: 'row', flexWrap: 'wrap' as any, gap: 8 },
  demoBtn:     { flex: 1, minWidth: '45%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                 gap: 6, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 12,
                 backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  demoBtnText: { fontSize: 13, fontWeight: '600' },
  serverText:  { fontSize: 10, color: 'rgba(255,255,255,0.3)' },
  right:       { flex: 1, position: 'relative' as any, backgroundColor: '#f4f8f4' },
  heroImg:     { position: 'absolute' as any, top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  heroOverlay: { position: 'absolute' as any, bottom: 0, left: 0, right: 0, height: '50%' },
  rightContent:{ position: 'absolute' as any, bottom: 60, left: 48, right: 48 },
  newHere:     { fontSize: 36, fontWeight: '800', color: '#0d1f10', marginBottom: 8 },
  newSub:      { fontSize: 15, color: '#5a7260', marginBottom: 28, lineHeight: 22 },
  signupBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                 backgroundColor: '#ffffff', borderRadius: 999, height: 52,
                 borderWidth: 2, borderColor: '#1a6b2a', alignSelf: 'flex-start' as any, paddingHorizontal: 28 },
  signupBtnText:{ fontSize: 16, fontWeight: '700', color: '#1a6b2a' },
});

// ── Styles mobile ─────────────────────────────────────────────────────────────
const sm = StyleSheet.create({
  separator: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 },
  line:      { flex: 1, height: 1 },
  sepLabel:  { paddingHorizontal: 4 },
  demoGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  demoBtn:   { flex: 1, minWidth: '45%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
               gap: 6, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 12, borderWidth: 1 },
});
