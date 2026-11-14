import { useQuery } from '@tanstack/react-query';
import { api, unwrap } from './client';
import { asList, makeReference } from '../lib/normalize';
import type { Reference } from './types';

/** Métiers, zones et réglages : GET /bootstrap, sinon les routes de référence dédiées. */
export async function loadReference(): Promise<Reference> {
  try {
    const d = unwrap<any>(await api.get('/bootstrap'));
    const metiers = asList(d?.metiers), zones = asList(d?.zones);
    if (metiers.length || zones.length) return makeReference(metiers, zones, d?.settings ?? {});
  } catch { /* on essaie les routes séparées */ }
  const [m, z, settings] = await Promise.all([
    api.get('/reference/jobs'),
    api.get('/reference/zones'),
    api.get('/settings/public').then((r) => unwrap<Record<string, any>>(r)).catch(() => ({})),
  ]);
  return makeReference(asList(unwrap(m)), asList(unwrap(z)), settings ?? {});
}

export const useReference = () => useQuery({ queryKey: ['reference'], queryFn: loadReference, staleTime: 10 * 60_000 });

/** Détail d'une référence précise (parent/enfants pour les zones). */
export const getMetierReference = (id: string) => api.get(`/reference/jobs/${id}`).then((r) => unwrap<any>(r));
export const getZoneReference = (id: string) => api.get(`/reference/zones/${id}`).then((r) => unwrap<any>(r));
export const getPublicSettings = () => api.get('/settings/public').then((r) => unwrap<Record<string, any>>(r));
