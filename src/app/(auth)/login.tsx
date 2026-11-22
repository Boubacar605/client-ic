import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { login } from '../../api/auth';
import { ApiError, fieldErrors } from '../../api/client';
import { useSession } from '../../auth/session';
import { getBaseUrl, ADMIN_ROUTE_SECRET } from '../../config';
import { emailOk } from '../../lib/validation';
import { AppText } from '../../ui/AppText';
import { ErrorBox } from '../../ui/ErrorBox';
import { TextField } from '../../ui/TextField';

const HERO = require('../../../assets/images/hero-1.jpeg');
const LOGO = require('../../../assets/images/logo-xeuysil.jpeg');

const DEMO_COMPTES = [
  { role: 'TRAVAILLEUR',    label: 'Travailleur', icon: 'construct-outline' },
  { role: 'RECRUTEUR',      label: 'Recruteur',   icon: 'business-outline'  },
  { role: 'AGENT',          label: 'Agent',       icon: 'people-outline'    },
  { role: 'ADMINISTRATEUR', label: 'Admin',       icon: 'shield-outline'    },
] as const;

export default function Login() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { signIn } = useSession();

  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [show,        setShow]        = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [error,       setError]       = useState<ApiError | null>(null);
  const [fe,          setFe]          = useState<Record<string, string>>({});

  async function submit() {
    setError(null);
    const e: Record<string, string> = {};
    if (!emailOk(email)) e.email = 'Adresse e-mail invalide.';
    if (!password)       e.password = 'Mot de passe requis.';
    setFe(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try   { await signIn(await login(email, password)); }
    catch (err) { setError(err as ApiError); setFe(fieldErrors(err)); }
    finally     { setLoading(false); }
  }

  async function connecterDemo(role: string) {
    setDemoLoading(role);
    try {
      const result = await login(`demo.${role.toLowerCase()}@xeuysil.sn`, '', role);
      await signIn(result);
    } catch (err) { setError(err as ApiError); }
    finally       { setDemoLoading(null); }
  }

  // Formulaire partagé
  const FormContent = (
    <>
      <View style={f.logoRow}>
        <Image source={LOGO} style={f.logoImg} />
        <View>
          <AppText style={f.appName}>XeuySil</AppText>
          <AppText style={f.tagline}>Travaillez · Trouvez · Avancez</AppText>
        </View>
      </View>
      <AppText style={f.heading}>Bon retour !</AppText>
      <AppText style={f.sub}>Connectez-vous pour retrouver vos missions.</AppText>
      <View style={f.fields}>
        <TextField label="Adresse e-mail" icon="mail-outline" keyboardType="email-address"
          autoCapitalize="none" autoCorrect={false} placeholder="nom@exemple.com"
          value={email} onChangeText={setEmail} error={fe.email} />
        <TextField label="Mot de passe" icon="lock-closed-outline" secureTextEntry={!show}
          autoCapitalize="none" value={password} onChangeText={setPassword} error={fe.password}
          right={
            <Pressable onPress={() => setShow(!show)} accessibilityRole="button">
              <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={22} color="#5a7260" />
            </Pressable>
          } />
        <Pressable onPress={() => router.push('/forgot-password')} style={{ alignSelf: 'flex-end' }}>
          <AppText style={f.forgot}>Mot de passe oublié ?</AppText>
        </Pressable>
      </View>
      {error && <ErrorBox message={error.title} code={error.code} />}
      <Pressable style={[f.loginBtn, loading && { opacity: 0.7 }]} onPress={submit}
        disabled={loading} accessibilityRole="button">
        <AppText style={f.loginBtnText}>{loading ? 'Connexion...' : 'Se connecter'}</AppText>
        {!loading && <Ionicons name="arrow-forward" size={20} color="#ffffff" />}
      </Pressable>
      <View style={f.sep}>
        <View style={f.sepLine} /><AppText style={f.sepTxt}>Accès démo</AppText><View style={f.sepLine} />
      </View>
      <View style={f.demoGrid}>
        {DEMO_COMPTES.map((item) => (
          <Pressable key={item.role} style={f.demoBtn}
            onPress={() => connecterDemo(item.role)} disabled={demoLoading !== null} accessibilityRole="button">
            <Ionicons name={item.icon} size={18} color="#1a6b2a" />
            <AppText style={f.demoBtnTxt}>{demoLoading === item.role ? '...' : item.label}</AppText>
          </Pressable>
        ))}
      </View>
      <View style={f.signupRow}>
        <AppText style={f.signupTxt}>Pas encore de compte ?</AppText>
        <Pressable onPress={() => router.push('/register')}>
          <AppText style={f.signupLink}> Créer un compte</AppText>
        </Pressable>
      </View>
      <Pressable onPress={() => router.push('/debug')}
        onLongPress={() => { if (ADMIN_ROUTE_SECRET) router.push(`/acces/${ADMIN_ROUTE_SECRET}` as never); }}
        style={{ marginTop: 8, alignItems: 'center' }}>
        <AppText style={f.serverTxt}>{getBaseUrl().replace(/^https?:\/\//, '') || 'serveur non défini'}</AppText>
      </Pressable>
    </>
  );

  // WEB : image gauche | formulaire droit
  if (Platform.OS === 'web') {
    return (
      <View style={w.root}>
        {/* Gauche — image hero plein panneau */}
        <View style={w.imagePane}>
          <Image source={HERO} style={w.heroImg} resizeMode="cover" />
          <LinearGradient colors={['transparent', 'rgba(10,40,15,0.80)']}
            style={w.heroGrad} />
          <View style={w.heroCaption}>
            <AppText style={w.heroClaim}>« Viens travailler »</AppText>
            <AppText style={w.heroSub}>XeuySil — Votre plateforme de missions journalières au Sénégal</AppText>
          </View>
        </View>

        {/* Droite — formulaire sur fond blanc */}
        <ScrollView style={w.formPane}
          contentContainerStyle={[w.formScroll, { paddingTop: Math.max(insets.top + 32, 48) }]}
          showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {FormContent}
        </ScrollView>
      </View>
    );
  }

  // MOBILE : formulaire seul
  return (
    <KeyboardAvoidingView style={m.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[m.scroll,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {FormContent}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Styles formulaire (partagés)
const f = StyleSheet.create({
  logoRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 28 },
  logoImg:      { width: 48, height: 48, borderRadius: 10 },
  appName:      { fontSize: 20, fontWeight: '700', color: '#0d1f10' },
  tagline:      { fontSize: 11, color: '#5a7260', letterSpacing: 1.5, textTransform: 'uppercase' as any },
  heading:      { fontSize: 30, fontWeight: '800', color: '#0d1f10', marginBottom: 4 },
  sub:          { fontSize: 14, color: '#5a7260', marginBottom: 24 },
  fields:       { gap: 12 },
  forgot:       { fontSize: 13, color: '#1a6b2a', marginTop: -4 },
  loginBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                  gap: 8, backgroundColor: '#1a6b2a', borderRadius: 999, height: 52, marginTop: 20 },
  loginBtnText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  sep:          { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 16 },
  sepLine:      { flex: 1, height: 1, backgroundColor: '#d4e8d8' },
  sepTxt:       { fontSize: 12, color: '#5a7260', letterSpacing: 0.5 },
  demoGrid:     { flexDirection: 'row', flexWrap: 'wrap' as any, gap: 8 },
  demoBtn:      { flex: 1, minWidth: '45%', flexDirection: 'row', alignItems: 'center',
                  justifyContent: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 8,
                  borderRadius: 12, backgroundColor: '#d4f0da', borderWidth: 1, borderColor: '#1a6b2a30' },
  demoBtnTxt:   { fontSize: 13, fontWeight: '600', color: '#1a6b2a' },
  signupRow:    { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  signupTxt:    { fontSize: 14, color: '#5a7260' },
  signupLink:   { fontSize: 14, fontWeight: '700', color: '#1a6b2a' },
  serverTxt:    { fontSize: 10, color: '#5a726040' },
});

// Styles web
const w = StyleSheet.create({
  root:       { flex: 1, flexDirection: 'row', width: '100vw' as any, height: '100vh' as any },
  imagePane:  { flex: 1, position: 'relative' as any, overflow: 'hidden' as any },
  heroImg:    { position: 'absolute' as any, top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  heroGrad:   { position: 'absolute' as any, bottom: 0, left: 0, right: 0, height: '50%' },
  heroCaption:{ position: 'absolute' as any, bottom: 40, left: 40, right: 40 },
  heroClaim:  { fontSize: 28, fontWeight: '800', color: '#ffffff', marginBottom: 8 },
  heroSub:    { fontSize: 14, color: 'rgba(255,255,255,0.80)', lineHeight: 20 },
  formPane:   { width: 480, backgroundColor: '#f4f8f4' },
  formScroll: { paddingHorizontal: 48, paddingBottom: 48 },
});

// Styles mobile
const m = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#f4f8f4' },
  scroll: { paddingHorizontal: 24 },
});
