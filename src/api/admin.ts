import { api, unwrap } from './client';

export type AdminUser = { id: string; nom: string; role: string; statut: string; isPremium?: boolean; telephone?: string };
export type AdminPage<T> = { data: T[]; page: number; limit: number; total: number; totalPages: number };

export const getPlatformStats = () => api.get('/admin/platform-stats').then((r) => unwrap<Record<string, number>>(r));
export const listAdminUsers = (params: Record<string, string | number | boolean | undefined> = {}) =>
  api.get('/admin/users', { params }).then((r) => unwrap<AdminPage<AdminUser>>(r));
export const updateUserStatus = (id: string, statut: string) =>
  api.patch(`/admin/users/${id}/status`, { statut }).then((r) => unwrap<AdminUser>(r));
export const updateUserPremium = (id: string, isPremium: boolean) =>
  api.patch(`/admin/users/${id}/premium`, { isPremium }).then((r) => unwrap<AdminUser>(r));

export const listAdminMissions = (params: Record<string, string | number | undefined> = {}) =>
  api.get('/admin/missions', { params }).then((r) => unwrap<AdminPage<Record<string, any>>>(r));
export const getMissionStats = () => api.get('/admin/missions/stats').then((r) => unwrap<Record<string, any>>(r));
export const updateAdminMissionStatus = (id: string, statut: string) =>
  api.patch(`/admin/missions/${id}/status`, { statut }).then((r) => unwrap(r));

export const listCommissions = (params: Record<string, string | number | undefined> = {}) =>
  api.get('/admin/commissions', { params }).then((r) => unwrap<AdminPage<Record<string, any>>>(r));
export const getCommissionStats = () => api.get('/admin/commissions/stats').then((r) => unwrap<Record<string, any>>(r));
export const recordCommissionPayment = (id: string, body: { montant: number; methode?: string; reference?: string }) =>
  api.post(`/admin/commissions/${id}/payments`, body).then((r) => unwrap(r));
export const sendCommissionReminder = (id: string) => api.post(`/admin/commissions/${id}/reminder`).then(unwrap);

export const getAdminSettings = () => api.get('/admin/settings').then((r) => unwrap<Record<string, any>>(r));
export const patchAdminSettings = (body: { commissionPercent?: number; maxCommissionDebt?: number }) =>
  api.patch('/admin/settings', body).then((r) => unwrap<Record<string, any>>(r));
export const listAdminJobs = () => api.get('/admin/jobs').then((r) => unwrap<any[]>(r));
export const createAdminJob = (body: { code: string; libelle: string; categorie: string; actif?: boolean }) =>
  api.post('/admin/jobs', body).then((r) => unwrap(r));
export const listAdminZones = () => api.get('/admin/zones').then((r) => unwrap<any[]>(r));
export const createAdminZone = (body: { nom: string; niveau: string; parentId?: string | null }) =>
  api.post('/admin/zones', body).then((r) => unwrap(r));
export const listRestrictedWorkers = () => api.get('/admin/restricted-workers', { params: { page: 1, limit: 50 } }).then((r) => unwrap<any>(r));
