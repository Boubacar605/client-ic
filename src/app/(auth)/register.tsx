import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { registerAgent, registerRecruiter, registerWorker } from '../../api/auth';
import { ApiError, fieldErrors } from '../../api/client';
import { COUNTRY_PREFIX } from '../../config';
import { emailOk } from '../../lib/validation';
import { useTheme } from '../../theme/useTheme';
import { AppText } from '../../ui/AppText';
import { AuthShell } from '../../ui/AuthShell';
import { Button } from '../../ui/Button';
import { ChoiceCard } from '../../ui/ChoiceCard';
import { ErrorBox } from '../../ui/ErrorBox';
import { Segmented } from '../../ui/Segmented';
import { TextField } from '../../ui/TextField';
import { useLocalSearchParams, useRouter } from 'expo-router';

type Role = 'TRAVAILLEUR' | 'RECRUTEUR' | 'AGENT';
const fmt = (d: string) => [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(' ');

export default function Register() {
  const t = useTheme();
  const router = useRouter();
  // Lien d'invitation d'un agent : /register?role=TRAVAILLEUR&code=AG-XXXXXX
  const params = useLocalSearchParams<{ code?: string; role?: string }>();
  const initialCode = typeof params.code === 'string' ? params.code.trim().toUpperCase() : '';
  const [role, setRole] = useState<Role | null>(params.role === 'TRAVAILLEUR' || initialCode ? 'TRAVAILLEUR' : null);
  const [nom, setNom] = useState('');
  const [digits, setDigits] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmationPassword, setConfirmationPassword] = useState('');
  const [show, setShow] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [type, setType] = useState<'PARTICULIER' | 'ENTREPRISE'>('PARTICULIER');
  const [raison, setRaison] = useState('');
  const [perimetre, setPerimetre] = useState('');
  const [agentCode, setAgentCode] = useState(initialCode);
  const [fe, setFe] = useState<Record<string, string>>({});
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    const e: Record<string, string> = {};
    if (nom.trim().length < 2) e.nom = 'Indiquez votre nom.';
    if (digits.length !== 9) e.telephone = 'Entrez les 9 chiffres, par exemple 77 123 45 67.';
    else if (!digits.startsWith('7')) e.telephone = 'Un mobile sénégalais commence par 7 (70, 75, 76, 77, 78).';
    if (!emailOk(email)) e.email = 'Entrez une adresse e-mail valide.';
    if (password.length < 8) e.password = '8 caractères au moins.';
    if (role !== 'RECRUTEUR' && confirmationPassword !== password) e.confirmationPassword = 'Les mots de passe doivent correspondre.';
    if (role === 'RECRUTEUR' && type === 'ENTREPRISE' && raison.trim().length < 2) e.raisonSociale = 'Indiquez le nom de l’entreprise.';
    if (role === 'TRAVAILLEUR' && agentCode.trim() && !/^AG-[A-Z0-9]{6}$/i.test(agentCode.trim())) e.agentReferralCode = 'Un code agent ressemble à AG-AB12CD.';
    setFe(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    const base = { email: email.trim().toLowerCase(), password, nom: nom.trim(), telephone: `${COUNTRY_PREFIX}${digits}` };
    try {
      const result = role === 'TRAVAILLEUR'
        ? await registerWorker({ ...base, confirmationPassword, langue: 'fr', agentReferralCode: agentCode.trim().toUpperCase() || null })
        : role === 'AGENT'
          ? await registerAgent({ ...base, confirmationPassword, perimetre: perimetre.trim() || null, langue: 'fr' })
          : await registerRecruiter({ ...base, typeRecruteur: type, raisonSociale: type === 'ENTREPRISE' ? raison.trim() : nom.trim() });
      // La connexion n'est possible qu'après confirmation de l'e-mail :
      // on ne crée jamais de session ici, on affiche toujours l'écran d'attente.
      setLoading(false);
      router.replace({ pathname: '/check-email', params: { email: email.trim().toLowerCase() } });
      return result;
    } catch (err) { setError(err as ApiError); setFe(fieldErrors(err)); setLoading(false); }
  }

  if (!role) {
    return (
      <AuthShell title="Créer un compte" subtitle="Vous êtes…">
        <ChoiceCard icon="hammer-outline" title="Je cherche du travail" subtitle="Travailleur" selected={false} onPress={() => setRole('TRAVAILLEUR')} />
        <ChoiceCard icon="briefcase-outline" title="Je cherche des travailleurs" subtitle="Recruteur" selected={false} onPress={() => setRole('RECRUTEUR')} />
        <ChoiceCard icon="people-outline" title="J’accompagne des travailleurs" subtitle="Agent" badge="Inscription libre" selected={false} onPress={() => setRole('AGENT')} />
      </AuthShell>
    );
  }

  const titles: Record<Role, string> = { TRAVAILLEUR: 'Compte travailleur', RECRUTEUR: 'Compte recruteur', AGENT: 'Compte agent' };
  return (
    <AuthShell title={titles[role]}
      subtitle="Quelques informations pour commencer."
      footer={<Button label="Changer de profil" variant="ghost" onPress={() => setRole(null)} />}>
      <TextField label="Votre nom" icon="person-outline" autoCapitalize="words" placeholder="Ex. Moussa Diop"
        value={nom} onChangeText={setNom} error={fe.nom} />
      <TextField label="Numéro de téléphone" icon="call-outline" prefix="🇸🇳 +221" keyboardType="number-pad" placeholder="77 123 45 67"
        value={fmt(digits)} onChangeText={(v) => { let d = v.replace(/\D/g, ''); if (d.startsWith('221') && d.length > 9) d = d.slice(3); setDigits(d.slice(0, 9)); }} error={fe.telephone} />
      <TextField label="Adresse e-mail" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
        placeholder="nom@exemple.com" value={email} onChangeText={setEmail} error={fe.email} />
      <TextField label="Mot de passe" icon="lock-closed-outline" secureTextEntry={!show} autoCapitalize="none" hint="8 caractères au moins"
        placeholder="8 caractères minimum" value={password} onChangeText={setPassword} error={fe.password}
        right={<Pressable accessibilityRole="button" accessibilityLabel={show ? 'Masquer' : 'Afficher'} onPress={() => setShow(!show)}><Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={22} color={t.muted} /></Pressable>} />
      {role !== 'RECRUTEUR' && (
        <TextField label="Confirmer le mot de passe" icon="lock-closed-outline" secureTextEntry={!showConfirmation} autoCapitalize="none"
          placeholder="Répétez le mot de passe" value={confirmationPassword} onChangeText={setConfirmationPassword} error={fe.confirmationPassword}
          right={<Pressable accessibilityRole="button" accessibilityLabel={showConfirmation ? 'Masquer' : 'Afficher'} onPress={() => setShowConfirmation(!showConfirmation)}><Ionicons name={showConfirmation ? 'eye-off-outline' : 'eye-outline'} size={22} color={t.muted} /></Pressable>} />
      )}

      {role === 'TRAVAILLEUR' && (
        <TextField label="Code agent (facultatif)" icon="people-outline" autoCapitalize="characters" placeholder="Ex. AG-AB12CD"
          hint="Renseignez-le si un agent vous accompagne."
          value={agentCode} onChangeText={setAgentCode} error={fe.agentReferralCode} />
      )}

      {role === 'AGENT' && (
        <TextField label="Zone d’intervention (facultatif)" icon="map-outline" placeholder="Ex. Médina, Parcelles Assainies"
          value={perimetre} onChangeText={setPerimetre} error={fe.perimetre} />
      )}

      {role === 'RECRUTEUR' && (
        <>
          <Segmented value={type} onChange={setType} options={[{ value: 'PARTICULIER', label: 'Particulier' }, { value: 'ENTREPRISE', label: 'Entreprise' }]} />
          {type === 'ENTREPRISE' && <TextField label="Nom de l’entreprise" icon="business-outline" placeholder="Ex. BTP Sénégal SARL"
            value={raison} onChangeText={setRaison} error={fe.raisonSociale} />}
        </>
      )}

      {error && <ErrorBox message={error.title} />}
      <Button label="Créer mon compte" icon="checkmark" large loading={loading} onPress={submit} />
    </AuthShell>
  );
}
