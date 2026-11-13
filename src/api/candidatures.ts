import { api, unwrap } from './client';
import { asList, toCandidature } from '../lib/normalize';
import type { Candidature, Profil } from './types';

/** Candidatures du travailleur connecté, ou celles d'une mission (recruteur). */
export async function listCandidatures(missionId?: string): Promise<Candidature[]> {
  const rows = asList(unwrap(await api.get('/applications', { params: { limit: 100 } })));
  const all = rows.map(toCandidature);
  return missionId ? all.filter((c) => c.missionId === missionId) : all;
}

/** Le travailleur postule : il se candidate lui-même, en un geste. */
export const apply = (missionId: string, profil: Profil) =>
  api.post('/applications', { missionId }).then(unwrap);

export const selectCandidature = (id: string) => api.post(`/applications/${id}/select`);
export const rejectCandidature = (id: string) => api.post(`/applications/${id}/reject`);
export const confirmCandidature = (id: string) => api.post(`/applications/${id}/confirm`);
export const withdrawCandidature = (id: string) => api.post(`/applications/${id}/withdraw`);
