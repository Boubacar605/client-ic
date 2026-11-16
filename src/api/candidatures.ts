import { api, unwrap } from './client';
import { asList, toCandidature } from '../lib/normalize';
import type { Candidature } from './types';

/** Candidatures du travailleur connecté, ou celles d'une mission (recruteur). */
export async function listCandidatures(missionId?: string): Promise<Candidature[]> {
  const params = missionId ? { limit: 100, missionId } : { limit: 100 };
  const rows = asList(unwrap(await api.get('/applications', { params })));
  return rows.map(toCandidature);
}

/** Le travailleur postule : il se candidate lui-même, en un geste. */
export const apply = (missionId: string) => api.post('/applications', { missionId }).then(unwrap);

export const selectCandidature = (id: string) => api.post(`/applications/${id}/select`);
export const interestCandidature = (id: string) => api.post(`/applications/${id}/interest`);
export const rejectCandidature = (id: string) => api.post(`/applications/${id}/reject`);
export const confirmCandidature = (id: string) => api.post(`/applications/${id}/confirm`);
export const withdrawCandidature = (id: string) => api.post(`/applications/${id}/withdraw`);
export const getCandidature = (id: string) => api.get(`/applications/${id}`).then((r) => unwrap<any>(r));
