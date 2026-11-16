import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { verifyEmail } from '../../api/auth';
import { ApiError } from '../../api/client';
import { useTheme } from '../../theme/useTheme';
import { AppText } from '../../ui/AppText';
import { AuthShell } from '../../ui/AuthShell';
import { Button } from '../../ui/Button';

type EmailParams = {
  token?: string;
  token_hash?: string;
  access_token?: string;
  type?: string;
  error?: string;
  error_description?: string;
};

/** Supabase renvoie soit `?token_hash=…`, soit un fragment `#access_token=…&type=signup`. */
function extractToken(params: EmailParams, fragment: string): string | null {
  if (params.token) return params.token;
  if (params.token_hash) return params.token_hash;
  if (params.access_token) return params.access_token;
  const hash = fragment.startsWith('#') ? fragment.slice(1) : fragment;
  if (!hash) return null;
  const search = new URLSearchParams(hash);
  return search.get('access_token') ?? search.get('token_hash') ?? search.get('token');
}

export default function VerifyEmail() {
  const t = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<EmailParams>();
  const fragment = typeof window !== 'undefined' && window.location ? window.location.hash : '';
  const token = useMemo(() => extractToken(params, fragment), [params.token, params.token_hash, params.access_token, fragment]);
  const linkError = params.error_description ?? params.error ?? null;
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function confirm() {
      if (linkError) {
        setState('error');
        setMessage('Le lien de confirmation est invalide ou a expiré. Demandez un nouvel e-mail depuis la connexion.');
        return;
      }
      if (!token) {
        setState('error');
        setMessage('Ce lien ne contient pas de jeton de confirmation. Ouvrez le lien complet reçu par e-mail.');
        return;
      }
      try {
        await verifyEmail(token);
        if (!cancelled) setState('success');
      } catch (e) {
        if (!cancelled) {
          setState('error');
          setMessage(e instanceof ApiError ? e.title : 'Impossible de confirmer cette adresse pour le moment.');
        }
      }
    }
    confirm();
    return () => { cancelled = true; };
  }, [token, linkError]);

  return (
    <AuthShell title="Confirmation de l’e-mail" subtitle="Dernière étape avant de pouvoir vous connecter."
      footer={<Button label="Aller à la connexion" icon="arrow-forward" onPress={() => router.replace('/login')} />}>
      <View style={{ alignItems: 'center', gap: 12, paddingVertical: 8 }}>
        <View style={{ width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', backgroundColor: state === 'error' ? t.errorSoft : t.soft }}>
          <Ionicons
            name={state === 'success' ? 'checkmark-circle-outline' : state === 'error' ? 'alert-circle-outline' : 'mail-unread-outline'}
            size={40}
            color={state === 'error' ? t.error : t.brand}
          />
        </View>
        {state === 'loading' ? (
          <ActivityIndicator color={t.brand} />
        ) : (
          <AppText style={{ textAlign: 'center' }}>
            {state === 'success'
              ? 'Votre adresse e-mail est confirmée. Vous pouvez maintenant vous connecter à votre espace.'
              : message}
          </AppText>
        )}
      </View>
    </AuthShell>
  );
}
