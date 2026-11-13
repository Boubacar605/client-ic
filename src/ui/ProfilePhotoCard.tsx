import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeProfilePhoto, uploadProfilePhoto } from '../api/profile-photo';
import { ApiError } from '../api/client';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';
import { Button } from './Button';
import { Card } from './Card';
import { ErrorBox } from './ErrorBox';

type Props = { photoUrl?: string | null; queryKeys: string[][] };

export function ProfilePhotoCard({ photoUrl, queryKeys }: Props) {
  const t = useTheme();
  const qc = useQueryClient();
  const [pickerError, setPickerError] = useState<string | null>(null);
  const upload = useMutation({
    mutationFn: (asset: ImagePicker.ImagePickerAsset) =>
      uploadProfilePhoto(asset.uri, asset.mimeType ?? 'image/jpeg', asset.fileName ?? 'profile.jpg'),
    onSuccess: () => queryKeys.forEach((key) => qc.invalidateQueries({ queryKey: key })),
  });
  const remove = useMutation({
    mutationFn: removeProfilePhoto,
    onSuccess: () => queryKeys.forEach((key) => qc.invalidateQueries({ queryKey: key })),
  });

  const choosePhoto = async () => {
    setPickerError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setPickerError('Autorisez l’accès aux photos pour choisir une image de profil.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > 2 * 1024 * 1024) {
      setPickerError('La photo doit peser 2 Mo ou moins.');
      return;
    }
    upload.mutate(asset);
  };

  const error = pickerError ?? (upload.error instanceof ApiError ? upload.error.title : remove.error instanceof ApiError ? remove.error.title : null);
  return (
    <Card>
      <View style={s.row}>
        <View style={[s.avatar, { backgroundColor: t.soft }]}>
          {photoUrl ? <Image source={{ uri: photoUrl }} style={s.image} /> : <Ionicons name="person-outline" size={32} color={t.brand} />}
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <AppText variant="heading">Photo de profil</AppText>
          <AppText muted>JPG, PNG ou WebP · 2 Mo maximum</AppText>
        </View>
      </View>
      {error ? <ErrorBox message={error} /> : null}
      <View style={s.actions}>
        <Button label="Choisir une photo" icon="camera-outline" loading={upload.isPending} onPress={choosePhoto} />
        {photoUrl ? <Button label="Supprimer" icon="trash-outline" variant="secondary" loading={remove.isPending} onPress={() => remove.mutate()} /> : null}
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  actions: { gap: 8, marginTop: 14 },
});
