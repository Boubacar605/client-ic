import { api, unwrap } from './client';

export type WhatsappKind = 'MISSION_PROPOSAL' | 'MISSION_SELECTION' | 'MISSION_REMINDER';

export interface SendWhatsappBody {
  kind: WhatsappKind;
  missionId: string;
  workerId?: string;
  applicationId?: string;
  workerIds?: string[];
}

export const sendWhatsapp = (body: SendWhatsappBody) =>
  api.post('/whatsapp/send', body).then((r) => unwrap<any>(r));

export const whatsappHistory = () =>
  api.get('/whatsapp/history').then((r) => unwrap<any[]>(r));
