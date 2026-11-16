import { api, unwrap } from './client';
import { asList } from '../lib/normalize';
import type { Profil } from './types';

export type Periode = 'JOURNEE' | 'MATIN' | 'APRES_MIDI' | 'CRENEAU';
export interface Disponibilite { id: string; date: string; periode: Periode; heureDebut?: string | null; heureFin?: string | null }

export async function listDisponibilites(): Promise<Disponibilite[]> {
  return asList(unwrap(await api.get('/availability'))).map((r) => ({
    id: String(r.id), date: String(r.dateDisponibilite ?? r.date ?? '').slice(0, 10), periode: r.periode as Periode,
    heureDebut: r.heureDebut ?? null, heureFin: r.heureFin ?? null,
  }));
}
export const addDisponibilite = (date: string, periode: Periode, profil: Profil) =>
  api.post('/availability', { dateDisponibilite: date, periode }).then(unwrap);
export const removeDisponibilite = (id: string) => api.delete(`/availability/${id}`);
