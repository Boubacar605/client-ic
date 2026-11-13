export type Role = 'TRAVAILLEUR' | 'RECRUTEUR' | 'AGENT' | 'ADMINISTRATEUR';
export type TypeHoraire = 'TRAVAIL_JOURNALIER' | 'DEMI_JOURNEE' | 'CRENEAU_PRECIS';

export interface AuthUser { id: string; email: string; role: Role; statut: string }
export interface Profil extends AuthUser { nom?: string; telephone?: string; scoreFiabilite?: number | null; typeRecruteur?: string; raisonSociale?: string }

export interface Metier { id: string; code?: string; libelle: string; categorie?: string }
export interface Zone { id: string; nom: string; niveau?: string; parentId?: string | null }
export interface Reference {
  metiers: Metier[]; zones: Zone[]; settings: Record<string, any>;
  metierById: Map<string, Metier>; zoneById: Map<string, Zone>;
}

// Formes normalisées utilisées par les écrans (construites par lib/normalize.ts).
export interface Mission {
  id: string; recruteurId?: string; recruteurNom?: string;
  metierId: string; metier: string; zoneId: string; zone: string;
  lieu?: string | null;
  description: string; nombrePostes: number; postesConfirmes?: number; postesRestants?: number;
  date: string; typeHoraire: TypeHoraire; heureDebut?: string | null; heureFin?: string | null;
  remunerationFcfa: number; urgente: boolean; modeAttribution?: string; statut: string;
}
export interface Candidature {
  id: string; missionId: string; travailleurId: string; travailleurNom?: string;
  statut: string; canal?: string; dateReponse?: string | null; telephone?: string | null;
}

export interface Notification {
  id: string; missionId: string | null; type: string; canal: string; statut: string;
  lu: boolean; luAt: string | null; createdAt: string; updatedAt: string;
}
export interface NotificationPage { data: Notification[]; page: number; limit: number; total: number; totalPages: number }
export interface WorkerProfile {
  id: string; nom: string; telephone: string | null; langue: string; photoUrl: string; scoreFiabilite: number | null;
  possedeSonMateriel: boolean; agent?: { id: string; nom: string; codeParrainage: string | null } | null;
  metiers: { id: string; code?: string; libelle: string; categorie?: string; experienceAnnees?: number }[];
  zones: { id: string; nom: string; niveau?: string; parentId?: string | null }[];
}
export interface WorkerStats { scoreFiabilite: number | null; totalApplications: number; pendingApplications: number; acceptedApplications: number; completedMissions: number; nextMissionDate: string | null }
export interface WorkerEarnings { grossRevenue: number; totalCommission: number; netRevenue: number; completedMissions: number }
export interface RecruiterProfile { id: string; nom: string; telephone: string | null; langue: string; photoUrl: string; typeRecruteur: string; raisonSociale: string; missionsCount: number; createdAt: string }
export interface AgentProfile { id: string; nom: string; telephone: string | null; langue: string; photoUrl: string; codeParrainage: string | null; perimetre: string | null; workersManaged: number; createdAt: string }
export interface AgentWorker { id: string; nom: string; telephone: string | null; photoUrl: string; scoreFiabilite: number | null; possedeSonMateriel: boolean; metiers: { id: string; libelle: string; experienceAnnees: number }[]; zones: { id: string; nom: string }[]; applicationsCount: number; createdAt: string }
export interface AgentWorkerPage { data: AgentWorker[]; page: number; limit: number; total: number; totalPages: number }
