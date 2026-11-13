import type { Candidature, Metier, Mission, Reference, TypeHoraire, Zone } from '../api/types';

/** Les listes peuvent arriver sous plusieurs formes tant que le contrat ne les fixe pas. */
export function asList(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  for (const k of ['items', 'data', 'results', 'rows', 'missions', 'candidatures']) if (Array.isArray(data[k])) return data[k];
  return [];
}

export const makeReference = (metiers: Metier[], zones: Zone[], settings: Record<string, any> = {}): Reference => ({
  metiers, zones, settings,
  metierById: new Map(metiers.map((m) => [m.id, m])),
  zoneById: new Map(zones.map((z) => [z.id, z])),
});

const day = (v: any): string => (typeof v === 'string' ? v.slice(0, 10) : '');
const hhmm = (v: any): string | null => (typeof v === 'string' && v.length >= 5 ? v.slice(0, 5) : null);

export function toMission(raw: any, ref: Reference): Mission {
  const metierId = raw.metierId ?? raw.metier?.id ?? '';
  const zoneId = raw.zoneId ?? raw.zone?.id ?? '';
  return {
    id: String(raw.id),
    recruteurId: raw.recruteurId ?? raw.recruteur?.id ?? raw.recruteur?.userId,
    recruteurNom: raw.recruteur?.nom ?? raw.recruteur?.profile?.nom ?? raw.recruteurNom,
    metierId, metier: raw.metier?.libelle ?? ref.metierById.get(metierId)?.libelle ?? 'Métier',
    zoneId, zone: raw.zone?.nom ?? ref.zoneById.get(zoneId)?.nom ?? 'Zone',
    lieu: raw.lieu ?? null,
    description: raw.description ?? '',
    nombrePostes: Number(raw.nombrePostes ?? 1),
    postesConfirmes: raw.postesConfirmes ?? undefined,
    postesRestants: raw.postesRestants ?? undefined,
    date: day(raw.dateMission ?? raw.date),
    typeHoraire: (raw.typeHoraire ?? 'TRAVAIL_JOURNALIER') as TypeHoraire,
    heureDebut: hhmm(raw.heureDebut), heureFin: hhmm(raw.heureFin),
    remunerationFcfa: Number(raw.remunerationFcfa ?? 0),
    urgente: !!raw.urgente, modeAttribution: raw.modeAttribution, statut: String(raw.statut ?? 'PUBLIEE'),
  };
}

export function toCandidature(raw: any): Candidature {
  const w = raw.travailleur ?? raw.worker;
  return {
    id: String(raw.id), missionId: raw.missionId ?? raw.mission?.id ?? '', travailleurId: raw.travailleurId ?? w?.id ?? w?.userId ?? '',
    travailleurNom: w?.profile?.nom ?? w?.nom, statut: String(raw.statut ?? 'INTERESSE'), canal: raw.canal,
    dateReponse: raw.dateReponse ?? null, telephone: w?.profile?.telephone ?? w?.telephone ?? null,
  };
}
