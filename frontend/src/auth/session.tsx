import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchMe, fetchProfil, logoutApi, LoginResult } from '../api/auth';
import { setSessionExpiredHandler } from '../api/client';
import type { AuthUser, Profil } from '../api/types';
import { loadBaseUrl } from '../config';
import { tokens } from './tokens';

type Status = 'loading' | 'signedOut' | 'signedIn';
interface Session {
  status: Status;
  profil: Profil | null;
  signIn: (r: LoginResult) => Promise<void>;
  signOut: () => Promise<void>;
}
const Ctx = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [profil, setProfil] = useState<Profil | null>(null);

  useEffect(() => {
    setSessionExpiredHandler(() => { setProfil(null); setStatus('signedOut'); });
    (async () => {
      await loadBaseUrl();
      const { refresh } = await tokens.load();
      if (!refresh) return setStatus('signedOut');
      try {
        const me = await fetchMe(); // renouvelle le jeton au besoin
        setProfil(me); setStatus('signedIn');
        fetchProfil(me).then(setProfil).catch(() => {});
      } catch { await tokens.clear(); setStatus('signedOut'); }
    })();
  }, []);

  const signIn = useCallback(async (r: LoginResult) => {
    await tokens.save(r.accessToken, r.refreshToken);
    // Le rôle doit venir du serveur : un utilisateur sans rôle ferait atterrir tout le monde sur le même espace.
    let base: AuthUser;
    try {
      base = await fetchMe();
    } catch (error) {
      if (!r.user?.role) {
        await tokens.clear();
        throw error;
      }
      base = r.user;
    }
    setProfil(base); setStatus('signedIn');
    fetchProfil(base).then(setProfil).catch(() => {}); // nom et téléphone arrivent juste après
  }, []);

  const signOut = useCallback(async () => {
    try { await logoutApi(); } catch { /* hors ligne : on déconnecte quand même */ }
    await tokens.clear();
    setProfil(null); setStatus('signedOut');
  }, []);

  const value = useMemo(() => ({ status, profil, signIn, signOut }), [status, profil, signIn, signOut]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSession doit être utilisé dans SessionProvider');
  return v;
}
