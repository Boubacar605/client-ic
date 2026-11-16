import { api, unwrap } from './client';
import type { AuthUser, Profil } from './types';

export interface RegisterWorker {
  email: string;
  password: string;
  confirmationPassword: string;
  nom: string;
  telephone: string;
  langue: string;
}
export interface RegisterRecruiter {
  email: string;
  password: string;
  nom: string;
  telephone: string;
  typeRecruteur: 'PARTICULIER' | 'ENTREPRISE';
  raisonSociale: string;
}
export interface RegisterAgent {
  email: string;
  password: string;
  confirmationPassword: string;
  nom: string;
  telephone: string;
  perimetre?: string | null;
  langue: string;
}
export interface RegisterResult { message: string; userId: string; emailConfirmationRequired: boolean }

export const registerWorker = (b: RegisterWorker) => api.post('/auth/register/worker', b).then((r) => unwrap<RegisterResult>(r));
export const registerRecruiter = (b: RegisterRecruiter) => api.post('/auth/register/recruiter', b).then((r) => unwrap<RegisterResult>(r));
export const registerAgent = (b: RegisterAgent) => api.post('/auth/register/agent', b).then((r) => unwrap<RegisterResult>(r));
export const forgotPassword = (email: string) => api.post('/auth/forgot-password', { email: email.trim().toLowerCase() }).then(unwrap);
export const resendConfirmation = (email: string) => api.post('/auth/resend-confirmation', { email: email.trim().toLowerCase() }).then(unwrap);
export const resetPassword = (token: string, newPassword: string, confirmPassword: string) =>
  api.post('/auth/reset-password', { token, newPassword, confirmPassword }).then(unwrap);

export interface LoginResult { accessToken: string; refreshToken: string; user?: AuthUser }
export async function login(email: string, password: string): Promise<LoginResult> {
  const d = unwrap<any>(await api.post('/auth/login', { email: email.trim().toLowerCase(), password }));
  return { accessToken: d.accessToken, refreshToken: d.refreshToken, user: d.user ?? d.utilisateur };
}

export const fetchMe = () => api.get('/auth/me').then((r) => unwrap<AuthUser>(r));
export const logoutApi = () => api.post('/auth/logout').then(() => undefined);

const PROFIL_PATH: Record<string, string> = { TRAVAILLEUR: '/me/profile', RECRUTEUR: '/recruiters/me', AGENT: '/agents/me' };

/** Complète l'utilisateur avec son nom et son téléphone (profil propre à son rôle). */
export async function fetchProfil(user: AuthUser): Promise<Profil> {
  const path = PROFIL_PATH[user.role];
  if (!path) return user;
  const raw = unwrap<any>(await api.get(path));
  const p = raw?.profile ?? raw ?? {};
  return { ...user, nom: p.nom, telephone: p.telephone, scoreFiabilite: raw?.scoreFiabilite, typeRecruteur: raw?.typeRecruteur, raisonSociale: raw?.raisonSociale };
}

export const fetchDashboard = (role: string) => {
  return api.get('/dashboard').then((r) => unwrap<Record<string, any>>(r));
};
