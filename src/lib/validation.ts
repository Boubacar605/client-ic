import type { TypeHoraire } from '../api/types';

export interface MissionForm {
  metierId: string | null; zoneId: string | null; nombrePostes: number; dateMission: string;
  typeHoraire: TypeHoraire; heureDebut: string; heureFin: string; remunerationFcfa: string; urgente: boolean; description: string;
}

export const isoLocal = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

/** Contrôles avant envoi. Les clés sont les noms de champs du contrat (comme dans errors[].field). */
export function validateMission(f: MissionForm, today = isoLocal(new Date())): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.metierId) e.metierId = 'Choisissez un métier.';
  if (!f.zoneId) e.zoneId = 'Choisissez un quartier.';
  if (!Number.isInteger(f.nombrePostes) || f.nombrePostes < 1 || f.nombrePostes > 50) e.nombrePostes = 'Entre 1 et 50 personnes.';
  if (!f.dateMission || f.dateMission < today) e.dateMission = 'Choisissez un jour à partir d’aujourd’hui.';
  if (f.typeHoraire === 'CRENEAU_PRECIS' && f.heureFin <= f.heureDebut) e.heureFin = 'La fin doit être après le début (une mission dure au plus une journée).';
  const n = Number(f.remunerationFcfa.replace(/\s/g, ''));
  if (!/^\d+$/.test(f.remunerationFcfa.replace(/\s/g, '')) || n < 1) e.remunerationFcfa = 'Indiquez le paiement par personne, en FCFA.';
  else if (n > 1_000_000) e.remunerationFcfa = 'Ce montant semble trop élevé : vérifiez.';
  if (f.description.length > 1000) e.description = '1 000 caractères au plus.';
  return e;
}

export const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
