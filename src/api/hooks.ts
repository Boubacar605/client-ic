import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from '../auth/session';
import { fetchDashboard } from './auth';
import { getCandidature, listCandidatures } from './candidatures';
import { listDisponibilites } from './disponibilites';
import { getMission, listMissions } from './missions';
import { useReference } from './reference';
import { getAgentDashboard, getAgentProfile, getAgentWorkers, getPublicWorker, getRecruiterDashboard, getRecruiterProfile, getWorkerApplications, getWorkerCommissions, getWorkerEarnings, getWorkerMissions, getWorkerProfile, getWorkerStats, markAllNotificationsRead, markNotificationRead, updateAgentProfile, updateRecruiterProfile, updateWorkerProfile } from './roles';
import { getNotification, listNotifications, unreadCount } from './notifications';

export function useMissions() {
  const { profil } = useSession();
  const ref = useReference();
  return useQuery({
    queryKey: ['missions', profil?.role, profil?.id],
    enabled: !!ref.data && !!profil,
    queryFn: () => listMissions(profil!, ref.data!),
  });
}

export function useMission(id?: string) {
  const ref = useReference();
  return useQuery({ queryKey: ['mission', id], enabled: !!ref.data && !!id, queryFn: () => getMission(id!, ref.data!) });
}

export function useCandidatures(missionId?: string, enabled = true) {
  const { profil } = useSession();
  return useQuery({ queryKey: ['candidatures', missionId ?? 'toutes', profil?.id], enabled: !!profil && enabled, queryFn: () => listCandidatures(missionId) });
}

export function useDashboard() {
  const { profil } = useSession();
  return useQuery({ queryKey: ['dashboard', profil?.role], enabled: !!profil, retry: false, queryFn: () => fetchDashboard(profil!.role) });
}

export function useDisponibilites() {
  const { profil } = useSession();
  return useQuery({ queryKey: ['disponibilites', profil?.id], enabled: profil?.role === 'TRAVAILLEUR', queryFn: listDisponibilites });
}

export const useNotifications = () => useQuery({ queryKey: ['notifications'], queryFn: () => listNotifications() });
export const useUnreadCount = () => useQuery({ queryKey: ['notifications', 'unread'], queryFn: unreadCount });
export const useNotification = (id?: string) => useQuery({ queryKey: ['notification', id], enabled: !!id, queryFn: () => getNotification(id!) });
export function useNotificationActions() {
  const qc = useQueryClient();
  return {
    read: useMutation({ mutationFn: markNotificationRead, onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); } }),
    readAll: useMutation({ mutationFn: markAllNotificationsRead, onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); } }),
  };
}
export const useWorkerProfile = (enabled = true) => useQuery({ queryKey: ['worker-profile'], enabled, queryFn: getWorkerProfile });
export const useWorkerStats = (enabled = true) => useQuery({ queryKey: ['worker-stats'], enabled, queryFn: getWorkerStats });
export const useWorkerEarnings = (enabled = true) => useQuery({ queryKey: ['worker-earnings'], enabled, queryFn: getWorkerEarnings });
export const useWorkerCommissions = (enabled = true) => useQuery({ queryKey: ['worker-commissions'], enabled, queryFn: getWorkerCommissions });
export const useWorkerApplications = (enabled = true) => useQuery({ queryKey: ['worker-applications'], enabled, queryFn: getWorkerApplications });
export const useWorkerMissions = (enabled = true) => useQuery({ queryKey: ['worker-missions'], enabled, queryFn: getWorkerMissions });
export const usePublicWorker = (id?: string) => useQuery({ queryKey: ['worker-public', id], enabled: !!id, queryFn: () => getPublicWorker(id!) });
export const useCandidature = (id?: string) => useQuery({ queryKey: ['candidature', id], enabled: !!id, queryFn: () => getCandidature(id!) });
export const useWorkerProfileMutation = () => { const qc = useQueryClient(); return useMutation({ mutationFn: updateWorkerProfile, onSuccess: () => qc.invalidateQueries({ queryKey: ['worker-profile'] }) }); };
export const useRecruiterProfile = (enabled = true) => useQuery({ queryKey: ['recruiter-profile'], enabled, queryFn: getRecruiterProfile });
export const useRecruiterDashboard = () => useQuery({ queryKey: ['recruiter-dashboard'], queryFn: getRecruiterDashboard });
export const useRecruiterProfileMutation = () => { const qc = useQueryClient(); return useMutation({ mutationFn: updateRecruiterProfile, onSuccess: () => qc.invalidateQueries({ queryKey: ['recruiter-profile'] }) }); };
export const useAgentProfile = () => useQuery({ queryKey: ['agent-profile'], queryFn: getAgentProfile });
export const useAgentDashboard = () => useQuery({ queryKey: ['agent-dashboard'], queryFn: getAgentDashboard });
export const useAgentWorkers = () => useQuery({ queryKey: ['agent-workers'], queryFn: () => getAgentWorkers(1, 100) });
export const useAgentProfileMutation = () => { const qc = useQueryClient(); return useMutation({ mutationFn: updateAgentProfile, onSuccess: () => qc.invalidateQueries({ queryKey: ['agent-profile'] }) }); };
