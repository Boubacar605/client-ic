import { api, unwrap } from './client';

export type ProfilePhotoResponse = { photoUrl: string };

export async function uploadProfilePhoto(uri: string, mimeType = 'image/jpeg', fileName = 'profile.jpg') {
  const form = new FormData();
  form.append('file', { uri, type: mimeType, name: fileName } as unknown as Blob);
  const response = await api.post('/profile/photo', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrap<ProfilePhotoResponse>(response);
}

export const removeProfilePhoto = () =>
  api.delete('/profile/photo').then((response) => unwrap<ProfilePhotoResponse>(response));
