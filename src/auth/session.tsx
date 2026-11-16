import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchMe, fetchProfil, logoutApi, LoginResult } from '../api/auth';
import { setSessionExpiredHandler } from '../api/client';
import type { Profil } from '../api/types';
import { loadBaseUrl } from '../config';
import { tokens } from './tokens';

type Status = 'loading' | 'signedOut' | 'signedIn';
interface Session {
  status: Status;
  profil: Profil | null;
  signIn: (r: LoginResult) => Promise<Profil>;
  signInDemo: (profil: Profil) => Promise<void>;
  signOut: () => Promise<void>;
}
const Ctx = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [profil, setProfil] = useState<Profil | null>(null);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      // En mode démo, on ignore l'expiration de session (pas de vrais jetons)
      if (typeof window !== 'undefined' && window.sessionStorage.getItem('xs_demo_profil')) return;
      setProfil(null); setStatus('signedOut');
    });
    (async () => {
      await loadBaseUrl();
      // Mode démo : le profil est stocké en sessionStorage pour survivre à la navigation
      if (typeof window !== 'undefined') {
        const raw = window.sessionStorage.getItem('xs_demo_profil');
        if (raw) {
          try { setProfil(JSON.parse(raw)); setStatus('signedIn'); return; } catch {}
        }
      }
      const { refresh } = await tokens.load();
      if (!refresh) return setStatus('signedOut');
      try {
        const me = await fetchMe();
        setProfil(me); setStatus('signedIn');
        fetchProfil(me).then(setProfil).catch(() => {});
      } catch { await tokens.clear(); setStatus('signedOut'); }
    })();
  }, []);

  const signIn = useCallback(async (r: LoginResult) => {
    await tokens.save(r.accessToken, r.refreshToken);
    // Le rôle doit venir du serveur : un utilisateur sans rôle ferait atterrir tout le monde sur le même espace.
    let base: Profil;
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
    return base;
  }, []);

  const signInDemo = useCallback(async (profil: Profil) => {
    await tokens.clear();
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('xs_demo_profil', JSON.stringify(profil));
    }
    setProfil(profil);
    setStatus('signedIn');
  }, []);

  const signOut = useCallback(async () => {
    try { await logoutApi(); } catch { /* hors ligne : on déconnecte quand même */ }
    await tokens.clear();
    if (typeof window !== 'undefined') window.sessionStorage.removeItem('xs_demo_profil');
    setProfil(null); setStatus('signedOut');
  }, []);

  const value = useMemo(() => ({ status, profil, signIn, signInDemo, signOut }), [status, profil, signIn, signInDemo, signOut]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSession doit être utilisé dans SessionProvider');
  return v;
}
