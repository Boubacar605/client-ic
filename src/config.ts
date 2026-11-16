import { readStorage, writeStorage } from './lib/storage';
import { Platform } from 'react-native';

const KEY = 'xs_api_url_v2';
export const ADMIN_ROUTE_SECRET = (process.env.EXPO_PUBLIC_ADMIN_ROUTE ?? '').replace(/^\/+|\/+$/g, '');

const isLoopback = (host: string) => host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '[::1]';

/**
 * L'API tourne sur la même machine que le serveur web. Une adresse "localhost"
 * désigne la machine qui affiche la page : ouverte depuis un autre appareil du
 * réseau, elle ne joint rien. On réaligne donc l'hôte sur celui de la page
 * (protocole et port sont conservés).
 */
function alignWebHost(url: string): string {
  if (Platform.OS !== 'web' || !url) return url;
  if (typeof window === 'undefined' || !window.location?.hostname) return url;
  const pageHost = window.location.hostname;
  if (isLoopback(pageHost)) return url;
  try {
    const parsed = new URL(url);
    if (!isLoopback(parsed.hostname)) return url;
    parsed.hostname = pageHost;
    return parsed.toString().replace(/\/+$/, '');
  } catch {
    return url;
  }
}

const configuredUrl = (Platform.OS === 'web'
  ? (process.env.EXPO_PUBLIC_API_URL_WEB ?? process.env.EXPO_PUBLIC_API_URL ?? '')
  : (process.env.EXPO_PUBLIC_API_URL ?? '')).replace(/\/+$/, '');
let current = configuredUrl;

export const getBaseUrl = () => alignWebHost(current);

/** Reprend l'adresse enregistrée dans l'application (prioritaire sur le fichier .env). */
export async function loadBaseUrl() {
  try { const v = await readStorage(KEY); if (v) current = v; } catch { /* on garde .env */ }
  return getBaseUrl();
}
export async function setBaseUrl(url: string) {
  current = url.trim().replace(/\/+$/, '');
  await writeStorage(KEY, current);
}

/**
 * Publication d'une mission :
 *  - 'deux-temps' : POST /missions (BROUILLON) puis POST /missions/{id}/publish. Si /publish répond 409
 *    (déjà publiée), on le considère comme un succès.
 *  - 'direct' : POST /missions avec statut PUBLIEE.
 * À changer ici si le backend se comporte autrement.
 */
export const PUBLISH_MODE: 'direct' | 'deux-temps' = 'deux-temps';

export const COUNTRY_PREFIX = '+221';
