export const fdate = (iso: string) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) : '';
export const fcfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;

export const HORAIRE: Record<string, string> = { TRAVAIL_JOURNALIER: 'Journée', DEMI_JOURNEE: 'Demi-journée', CRENEAU_PRECIS: 'Créneau précis' };

export const STATUT_MISSION: Record<string, string> = {
  BROUILLON: 'Brouillon', PUBLIEE: 'Publiée', PARTIELLEMENT_POURVUE: 'Partiellement pourvue', POURVUE: 'Pourvue',
  EN_COURS: 'En cours', TERMINEE: 'Terminée', CLOTUREE: 'Clôturée', ANNULEE: 'Annulée', EXPIREE: 'Expirée', SUSPENDUE: 'Suspendue',
};
export const STATUT_CANDIDATURE: Record<string, string> = {
  PROPOSEE: 'Proposée', INTERESSE: 'Candidat', SELECTIONNEE: 'Retenu, à confirmer', CONFIRMEE: 'Confirmé', REFUSEE: 'Refusé',
  EXPIREE: 'Délai dépassé', ANNULEE: 'Désisté', LISTE_ATTENTE: 'Liste d’attente', RETIREE: 'Retirée',
};
