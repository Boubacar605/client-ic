import { readStorage, writeStorage } from './lib/storage';
import { Platform } from 'react-native';

const KEY = 'xs_api_url_v2';
export const ADMIN_ROUTE_SECRET = (process.env.EXPO_PUBLIC_ADMIN_ROUTE ?? '').replace(/^\/+|\/+$/g, '');
const configuredUrl = Platform.OS === 'web'
  ? (process.env.EXPO_PUBLIC_API_URL_WEB ?? process.env.EXPO_PUBLIC_API_URL ?? '')
  : (process.env.EXPO_PUBLIC_API_URL ?? '');
let current = configuredUrl.replace(/\/+$/, '');

export const getBaseUrl = () => current;

/** Reprend l'adresse enregistrée dans l'application (prioritaire sur le fichier .env). */
export async function loadBaseUrl() {
  try { const v = await readStorage(KEY); if (v) current = v; } catch { /* on garde .env */ }
  return current;
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
