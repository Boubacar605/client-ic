import { api, ApiError, unwrap } from './client';
import { PUBLISH_MODE } from '../config';
import { asList, toMission } from '../lib/normalize';
import type { MissionForm } from '../lib/validation';
import type { Metier, Mission, Profil, Reference, Zone } from './types';

const OUVERTES = ['PUBLIEE', 'PARTIELLEMENT_POURVUE'];

export type PublicMissionSummary = { total: number; page: number; limit: number; totalPages: number };

export const getPublicMissionSummary = () =>
  api.get('/missions/public', { params: { page: 1, limit: 1 } })
    .then((response) => unwrap<PublicMissionSummary>(response));

/** Recruteur : ses missions. Travailleur : les missions recommandées, sinon les missions ouvertes. */
export async function listMissions(profil: Profil, ref: Reference): Promise<Mission[]> {
  const fetchRows = async (path: string, params: Record<string, unknown>) =>
    asList(unwrap(await api.get(path, { params }))).map((r) => toMission(r, ref));

  if (profil.role === 'TRAVAILLEUR') {
    let ms: Mission[] = [];
    try { ms = await fetchRows('/missions/recommended', { limit: 50 }); } catch { /* repli ci-dessous */ }
    if (!ms.length) ms = await fetchRows('/missions/public', { limit: 50 });
    return ms.filter((m) => OUVERTES.includes(m.statut));
  }
  const ms = await fetchRows('/missions', { limit: 50 });
  // Si le serveur renvoie toutes les missions, on ne garde que celles du recruteur connecté.
  return profil.role === 'RECRUTEUR' ? ms.filter((m) => !m.recruteurId || m.recruteurId === profil.id) : ms;
}

export async function getMission(id: string, ref: Reference): Promise<Mission> {
  return toMission(unwrap(await api.get(`/missions/${id}`)), ref);
}

const sec = (h: string) => (h.length === 5 ? `${h}:00` : h);

export function buildMissionBody(f: MissionForm, metier?: Metier, zone?: Zone) {
  const creneau = f.typeHoraire === 'CRENEAU_PRECIS';
  return {
    metierId: f.metierId, zoneId: f.zoneId,
    // La description est obligatoire dans le contrat : on en génère une si le recruteur n'écrit rien.
    description: f.description.trim() || `${metier?.libelle ?? 'Mission'} à ${zone?.nom ?? ''}`.trim(),
    nombrePostes: f.nombrePostes,
    remunerationFcfa: Number(f.remunerationFcfa.replace(/\s/g, '')),
    dateMission: f.dateMission, typeHoraire: f.typeHoraire,
    ...(creneau && { heureDebut: sec(f.heureDebut), heureFin: sec(f.heureFin) }),
    urgente: f.urgente, modeAttribution: f.urgente ? 'PREMIER_ARRIVE' : 'SELECTION',
  };
}

export async function publishMission(id: string) {
  try { await api.post(`/missions/${id}/publish`); }
  catch (e) { if (!(e instanceof ApiError && e.status === 409)) throw e; } // déjà publiée : tout va bien
}

/** Crée la mission et la publie. Renvoie son identifiant. */
export async function createMission(f: MissionForm, profil: Profil, ref: Reference): Promise<string> {
  const body = buildMissionBody(f, ref.metierById.get(f.metierId ?? ''), ref.zoneById.get(f.zoneId ?? ''));
  const created = unwrap<any>(await api.post('/missions', body));
  const id = String(created?.id ?? created?.mission?.id ?? '');
  if (!id) throw new ApiError(0, 'REPONSE_INVALIDE', 'La mission a été créée mais le serveur n’a pas renvoyé son identifiant.');
  if (PUBLISH_MODE === 'deux-temps') await publishMission(id);
  return id;
}

export const cancelMission = (id: string) => api.post(`/missions/${id}/cancel`);
export const closeMission = (id: string) => api.post(`/missions/${id}/close`);
