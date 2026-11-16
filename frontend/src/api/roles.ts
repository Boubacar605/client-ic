import { api, unwrap } from './client';
import type { AgentProfile, AgentWorkerPage, RecruiterProfile, WorkerEarnings, WorkerProfile, WorkerStats } from './types';

export const getWorkerProfile = () => api.get('/me/profile').then((r) => unwrap<WorkerProfile>(r));
export const updateWorkerProfile = (body: { langue: string; possedeSonMateriel: boolean; metierIds: string[]; zoneIds: string[] }) =>
  api.put('/me/profile', body).then((r) => unwrap<WorkerProfile>(r));
export const getWorkerStats = () => api.get('/me/stats').then((r) => unwrap<WorkerStats>(r));
export const getWorkerEarnings = () => api.get('/me/earnings').then((r) => unwrap<WorkerEarnings>(r));
export const getWorkerCommissions = () => api.get('/me/commissions').then((r) => unwrap<any>(r));
export const getRecruiterProfile = () => api.get('/recruiters/me').then((r) => unwrap<RecruiterProfile>(r));
export const updateRecruiterProfile = (body: { raisonSociale?: string }) => api.put('/recruiters/me', body).then((r) => unwrap<RecruiterProfile>(r));
export const getRecruiterDashboard = () => api.get('/recruiters/dashboard').then((r) => unwrap<Record<string, any>>(r));
export const getAgentProfile = () => api.get('/agents/me').then((r) => unwrap<AgentProfile>(r));
export const updateAgentProfile = (body: { perimetre?: string }) => api.put('/agents/me', body).then((r) => unwrap<AgentProfile>(r));
export const getAgentDashboard = () => api.get('/agents/dashboard').then((r) => unwrap<Record<string, any>>(r));
export const getAgentWorkers = (page = 1, limit = 20) => api.get('/agents/workers', { params: { page, limit } }).then((r) => unwrap<AgentWorkerPage>(r));
export const createAgentProposal = (body: { travailleurId: string; missionId: string }) => api.post('/agents/proposals', body).then((r) => unwrap<any>(r));
