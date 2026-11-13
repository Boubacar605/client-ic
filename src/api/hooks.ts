import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from '../auth/session';
import { fetchDashboard } from './auth';
import { listCandidatures } from './candidatures';
import { listDisponibilites } from './disponibilites';
import { getMission, listMissions } from './missions';
import { useReference } from './reference';
import { getAgentDashboard, getAgentProfile, getAgentWorkers, getRecruiterDashboard, getRecruiterProfile, getWorkerCommissions, getWorkerEarnings, getWorkerProfile, getWorkerStats, markAllNotificationsRead, markNotificationRead, updateAgentProfile, updateRecruiterProfile, updateWorkerProfile } from './roles';
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

export function useCandidatures(missionId?: string) {
  const { profil } = useSession();
  return useQuery({ queryKey: ['candidatures', missionId ?? 'toutes', profil?.id], enabled: !!profil, queryFn: () => listCandidatures(missionId) });
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
export const useWorkerProfile = () => useQuery({ queryKey: ['worker-profile'], queryFn: getWorkerProfile });
export const useWorkerStats = () => useQuery({ queryKey: ['worker-stats'], queryFn: getWorkerStats });
export const useWorkerEarnings = () => useQuery({ queryKey: ['worker-earnings'], queryFn: getWorkerEarnings });
export const useWorkerCommissions = () => useQuery({ queryKey: ['worker-commissions'], queryFn: getWorkerCommissions });
export const useWorkerProfileMutation = () => { const qc = useQueryClient(); return useMutation({ mutationFn: updateWorkerProfile, onSuccess: () => qc.invalidateQueries({ queryKey: ['worker-profile'] }) }); };
export const useRecruiterProfile = () => useQuery({ queryKey: ['recruiter-profile'], queryFn: getRecruiterProfile });
export const useRecruiterDashboard = () => useQuery({ queryKey: ['recruiter-dashboard'], queryFn: getRecruiterDashboard });
export const useRecruiterProfileMutation = () => { const qc = useQueryClient(); return useMutation({ mutationFn: updateRecruiterProfile, onSuccess: () => qc.invalidateQueries({ queryKey: ['recruiter-profile'] }) }); };
export const useAgentProfile = () => useQuery({ queryKey: ['agent-profile'], queryFn: getAgentProfile });
export const useAgentDashboard = () => useQuery({ queryKey: ['agent-dashboard'], queryFn: getAgentDashboard });
export const useAgentWorkers = () => useQuery({ queryKey: ['agent-workers'], queryFn: () => getAgentWorkers() });
export const useAgentProfileMutation = () => { const qc = useQueryClient(); return useMutation({ mutationFn: updateAgentProfile, onSuccess: () => qc.invalidateQueries({ queryKey: ['agent-profile'] }) }); };
