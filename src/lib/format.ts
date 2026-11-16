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
export const NOTIFICATION_LABEL: Record<string, string> = {
  MISSION_PROPOSEE: 'Mission proposée',
  MISSION_SELECTIONNEE: 'Mission sélectionnée',
  MISSION_CONFIRMEE: 'Mission confirmée',
  MISSION_REJETEE: 'Candidature refusée',
  MISSION_ANNULEE: 'Mission annulée',
  MISSION_POURVUE: 'Mission pourvue',
  NOUVELLE_CANDIDATURE: 'Nouvelle candidature',
  CANDIDATURE_RETIREE: 'Candidature retirée',
  TRAVAILLEUR_INSCRIT: 'Nouveau travailleur',
  TRAVAILLEUR_SELECTIONNE: 'Travailleur retenu',
  TRAVAILLEUR_ABSENT: 'Absence signalée',
  COMMISSION_DUE: 'Commission à régler',
  COMMISSION_REMINDER: 'Rappel de commission',
  COMMISSION_BLOCKED: 'Compte restreint',
  ACCOUNT_STATUS_UPDATED: 'Statut du compte mis à jour',
};
export const CANAL_LABEL: Record<string, string> = { APPLICATION: 'Application', WHATSAPP: 'WhatsApp', APPEL: 'Appel', SMS: 'SMS' };
export const ROLE_LABEL: Record<string, string> = { TRAVAILLEUR: 'Travailleur', RECRUTEUR: 'Recruteur', AGENT: 'Agent', ADMINISTRATEUR: 'Administrateur' };
export const STATUT_COMPTE: Record<string, string> = { ACTIF: 'Actif', SUSPENDU: 'Suspendu', SUPPRIME: 'Supprimé' };
