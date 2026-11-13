import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import * as Crypto from 'expo-crypto';
import { tokens } from '../auth/tokens';
import { getBaseUrl } from '../config';
import { addLog } from './log';

export const api = axios.create({ timeout: 20000, headers: { Accept: 'application/json', 'ngrok-skip-browser-warning': 'true' } });

/** Erreur normalisée. `code` = errorCode du backend, `title` = son message (en français). */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public title: string,
    public errors?: { champ: string; message: string }[],
    public correlationId?: string,
  ) { super(title); }
}

/** Le backend enveloppe tout dans { success, message, data } : on renvoie le contenu de `data`. */
export const unwrap = <T = any>(r: AxiosResponse): T => {
  const b = r.data;
  return (b && typeof b === 'object' && 'data' in b ? b.data : b) as T;
};

export const errorText = (e: unknown) => (e instanceof ApiError ? e.title : 'Une erreur est survenue.');
export const fieldErrors = (e: unknown): Record<string, string> => {
  const out: Record<string, string> = {};
  if (e instanceof ApiError) for (const f of e.errors ?? []) if (f.champ && !out[f.champ]) out[f.champ] = f.message;
  return out;
};

const hide = (s: unknown) => {
  try {
    const t = typeof s === 'string' ? s : JSON.stringify(s ?? '');
    return t.replace(/"(password|refreshToken|accessToken)"\s*:\s*"[^"]*"/g, '"$1":"***"').slice(0, 500);
  } catch { return ''; }
};

function toApiError(e: unknown): ApiError {
  const err = e as AxiosError<any>;
  if (err.response) {
    const d = err.response.data;
    const status = err.response.status;
    if (d == null || typeof d !== 'object') {
      const ngrok = typeof d === 'string' && d.toLowerCase().includes('ngrok');
      return new ApiError(status, 'REPONSE_INVALIDE', ngrok
        ? 'Le tunnel ngrok est arrêté ou son adresse a changé. Demandez la nouvelle adresse à Ibrahima.'
        : 'Le serveur a répondu autre chose que du JSON. Vérifiez l’adresse du serveur.');
    }
    let errors: { champ: string; message: string }[] | undefined;
    const list = Array.isArray(d.errors) ? d.errors : Array.isArray(d.details) ? d.details : undefined;
    if (list) errors = list.map((x: any) => ({ champ: x.field ?? x.champ ?? x.property ?? '', message: x.message ?? String(x) }));
    const rawTitle = Array.isArray(d.message) ? d.message.join(' ; ') : d.message ?? d.title;
    const title = typeof rawTitle === 'string'
      ? rawTitle
      : rawTitle && typeof rawTitle === 'object' && typeof rawTitle.message === 'string'
        ? rawTitle.message
        : 'Une erreur est survenue';
    if (!errors && Array.isArray(d.message)) errors = d.message.map((m: string) => ({ champ: '', message: m }));
    return new ApiError(status, d.errorCode ?? d.code ?? `HTTP_${status}`, title, errors, d.correlationId);
  }
  if (err.code === 'ECONNABORTED') return new ApiError(0, 'DELAI', 'Le serveur met trop de temps à répondre.');
  return new ApiError(0, 'RESEAU', 'Pas de connexion au serveur. Vérifiez le réseau et l’adresse du serveur.');
}

api.interceptors.request.use((config) => {
  config.baseURL = getBaseUrl();
  const t = tokens.getAccess();
  if (t && !config.headers.Authorization) config.headers.Authorization = `Bearer ${t}`;
  config.headers['X-Correlation-Id'] = Crypto.randomUUID();
  (config as any).metadata = { start: Date.now() };
  return config;
});

let onSessionExpired: (() => void) | null = null;
export const setSessionExpiredHandler = (fn: () => void) => { onSessionExpired = fn; };

let refreshing: Promise<string | null> | null = null;
async function refresh(): Promise<string | null> {
  const refreshToken = await tokens.getRefresh();
  if (!refreshToken) return null;
  try {
    const r = await axios.post(`${getBaseUrl()}/auth/refresh`, { refreshToken },
      { timeout: 15000, headers: { 'ngrok-skip-browser-warning': 'true' } });
    const d = r.data?.data ?? r.data;
    if (!d?.accessToken) throw new Error('pas de jeton');
    if (d.refreshToken) await tokens.save(d.accessToken, d.refreshToken); else await tokens.setAccess(d.accessToken);
    return d.accessToken as string;
  } catch { await tokens.clear(); return null; }
}

const log = (config: InternalAxiosRequestConfig | undefined, status: number | string, res: unknown) => {
  if (!config) return;
  const start = (config as any).metadata?.start ?? Date.now();
  addLog({ t: Date.now(), method: (config.method ?? 'get').toUpperCase(), url: `${config.baseURL ?? ''}${config.url ?? ''}`,
    status, ms: Date.now() - start, req: config.data ? hide(config.data) : undefined, res: hide(res) });
};

api.interceptors.response.use(
  (r) => { log(r.config, r.status, r.data); return r; },
  async (error: AxiosError) => {
    log(error.config, error.response?.status ?? error.code ?? 'ERR', error.response?.data ?? error.message);
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isAuth = /^\/auth\/(login|register|refresh)/.test(original?.url ?? '');
    if (error.response?.status === 401 && original && !original._retry && !isAuth) {
      original._retry = true;
      refreshing ??= refresh().finally(() => { refreshing = null; });
      const token = await refreshing;
      if (token) { original.headers.Authorization = `Bearer ${token}`; return api(original); }
      onSessionExpired?.();
    }
    return Promise.reject(toApiError(error));
  },
);
