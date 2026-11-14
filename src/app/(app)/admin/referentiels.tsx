import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  createAdminJob, createAdminZone, deleteAdminJob, deleteAdminZone,
  listAdminJobs, listAdminZones, updateAdminJob, updateAdminZone,
} from '../../../api/admin';
import { ApiError } from '../../../api/client';
import { getMetierReference, getZoneReference } from '../../../api/reference';
import { useTheme } from '../../../theme/useTheme';
import { AppText } from '../../../ui/AppText';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { ErrorBox } from '../../../ui/ErrorBox';
import { TextField } from '../../../ui/TextField';

const NIVEAUX = ['REGION', 'DEPARTEMENT', 'COMMUNE', 'QUARTIER'];

function RefDetail({ kind, id }: { kind: 'job' | 'zone'; id: string }) {
  const t = useTheme();
  const q = useQuery({
    queryKey: ['ref-detail', kind, id],
    queryFn: () => (kind === 'job' ? getMetierReference(id) : getZoneReference(id)),
  });
  if (q.isLoading) return <ActivityIndicator color={t.brand} />;
  if (q.isError) return <AppText variant="caption" muted>Détail indisponible.</AppText>;
  const d = q.data ?? {};
  return (
    <View style={{ gap: 2, paddingLeft: 4 }}>
      <AppText variant="caption" muted>Créé le {d.createdAt ? new Date(d.createdAt).toLocaleDateString('fr-FR') : '—'}{d.updatedAt ? ` · modifié le ${new Date(d.updatedAt).toLocaleDateString('fr-FR')}` : ''}</AppText>
      {kind === 'job' ? <AppText variant="caption" muted>{d.actif ? 'Référence active' : 'Référence inactive'} · code {d.code ?? '—'} · {d.categorie ?? '—'}</AppText> : null}
      {d.parent ? <AppText variant="caption" muted>Zone parente : {d.parent.nom}</AppText> : null}
      {Array.isArray(d.children) && d.children.length ? <AppText variant="caption" muted>Zones rattachées : {d.children.map((c: any) => c.nom).join(', ')}</AppText> : null}
    </View>
  );
}

export default function Referentiels() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const jobs = useQuery({ queryKey: ['admin-jobs'], queryFn: listAdminJobs });
  const zones = useQuery({ queryKey: ['admin-zones'], queryFn: listAdminZones });
  const invalidate = () => { qc.invalidateQueries({ queryKey: ['admin-jobs'] }); qc.invalidateQueries({ queryKey: ['admin-zones'] }); qc.invalidateQueries({ queryKey: ['reference'] }); };

  const [code, setCode] = useState('');
  const [libelle, setLibelle] = useState('');
  const [categorie, setCategorie] = useState('');
  const [zoneNom, setZoneNom] = useState('');
  const [niveau, setNiveau] = useState('COMMUNE');
  const [parentId, setParentId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ kind: 'job' | 'zone'; id: string } | null>(null);
  const [editZone, setEditZone] = useState<{ id: string; nom: string; niveau: string; parentId: string | null } | null>(null);
  const toggleDetail = (kind: 'job' | 'zone', id: string) => setDetail((d) => (d?.kind === kind && d.id === id ? null : { kind, id }));

  const addJob = useMutation({ mutationFn: () => createAdminJob({ code: code.trim(), libelle: libelle.trim(), categorie: categorie.trim(), actif: true }), onSuccess: () => { setCode(''); setLibelle(''); setCategorie(''); invalidate(); } });
  const toggleJob = useMutation({ mutationFn: ({ id, actif }: { id: string; actif: boolean }) => updateAdminJob(id, { actif }), onSuccess: invalidate });
  const removeJob = useMutation({ mutationFn: deleteAdminJob, onSuccess: invalidate });
  const addZone = useMutation({ mutationFn: () => createAdminZone({ nom: zoneNom.trim(), niveau, parentId }), onSuccess: () => { setZoneNom(''); setParentId(null); invalidate(); } });
  const removeZone = useMutation({ mutationFn: deleteAdminZone, onSuccess: invalidate });
  const saveZone = useMutation({
    mutationFn: () => updateAdminZone(editZone!.id, { nom: editZone!.nom.trim(), niveau: editZone!.niveau, parentId: editZone!.parentId }),
    onSuccess: () => { setEditZone(null); invalidate(); },
  });

  const error = jobs.error ?? zones.error ?? addJob.error ?? addZone.error ?? toggleJob.error ?? removeJob.error ?? removeZone.error ?? saveZone.error;
  const zoneList = zones.data ?? [];

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={[s.body, { paddingTop: insets.top + 16 }]}>
      <View style={s.head}>
        <View style={{ flex: 1 }}><AppText variant="display">Référentiels</AppText><AppText muted>Métiers et zones géographiques.</AppText></View>
      </View>

      {error && <ErrorBox message={error instanceof ApiError ? error.title : 'Impossible de gérer les référentiels.'} />}

      <Card>
        <View style={s.row}><Ionicons name="hammer-outline" size={22} color={t.brand} /><AppText variant="heading">Métiers</AppText></View>
        <TextField label="Code" value={code} onChangeText={setCode} autoCapitalize="characters" placeholder="MACON" />
        <TextField label="Libellé" value={libelle} onChangeText={setLibelle} placeholder="Maçon" />
        <TextField label="Catégorie" value={categorie} onChangeText={setCategorie} placeholder="Construction" />
        <Button label="Ajouter le métier" icon="add" loading={addJob.isPending} disabled={!code.trim() || !libelle.trim() || !categorie.trim()} onPress={() => addJob.mutate()} />
        {jobs.isLoading && <ActivityIndicator color={t.brand} />}
        {(jobs.data ?? []).map((job: any) => (
          <View key={job.id} style={{ gap: 6 }}>
            <View style={s.itemRow}>
              <View style={{ flex: 1 }}>
                <AppText variant="label" numberOfLines={1}>{job.libelle}</AppText>
                <AppText variant="caption" muted>{job.code} · {job.categorie} · {job.actif ? 'actif' : 'inactif'}</AppText>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={`Détail de ${job.libelle}`} hitSlop={8} onPress={() => toggleDetail('job', job.id)}>
                <Ionicons name={detail?.kind === 'job' && detail.id === job.id ? 'information-circle' : 'information-circle-outline'} size={22} color={t.muted} />
              </Pressable>
              <Button label={job.actif ? 'Désactiver' : 'Activer'} variant="ghost" onPress={() => toggleJob.mutate({ id: job.id, actif: !job.actif })} />
              <Button label={confirmed === job.id ? 'Confirmer' : 'Suppr.'} variant="ghost" onPress={() => (confirmed === job.id ? removeJob.mutate(job.id) : setConfirmed(job.id))} />
            </View>
            {detail?.kind === 'job' && detail.id === job.id && <RefDetail kind="job" id={job.id} />}
          </View>
        ))}
      </Card>

      <Card>
        <View style={s.row}><Ionicons name="map-outline" size={22} color={t.brand} /><AppText variant="heading">Zones</AppText></View>
        <TextField label="Nom de la zone" value={zoneNom} onChangeText={setZoneNom} placeholder="Médina" />
        <View style={s.filters}>
          {NIVEAUX.map((n) => (
            <Pressable key={n} accessibilityRole="button" onPress={() => setNiveau(n)}
              style={[s.chip, { borderColor: niveau === n ? t.brand : t.line, backgroundColor: niveau === n ? t.soft : t.card }]}>
              <AppText variant="caption" color={niveau === n ? t.brand : t.muted}>{n}</AppText>
            </Pressable>
          ))}
        </View>
        {zoneList.length > 0 && (
          <View style={{ gap: 6 }}>
            <AppText variant="caption" muted>Zone parente (facultatif)</AppText>
            <View style={s.filters}>
              <Pressable accessibilityRole="button" onPress={() => setParentId(null)}
                style={[s.chip, { borderColor: !parentId ? t.brand : t.line, backgroundColor: !parentId ? t.soft : t.card }]}>
                <AppText variant="caption" color={!parentId ? t.brand : t.muted}>Aucune</AppText>
              </Pressable>
              {zoneList.slice(0, 12).map((z: any) => (
                <Pressable key={z.id} accessibilityRole="button" onPress={() => setParentId(z.id)}
                  style={[s.chip, { borderColor: parentId === z.id ? t.brand : t.line, backgroundColor: parentId === z.id ? t.soft : t.card }]}>
                  <AppText variant="caption" color={parentId === z.id ? t.brand : t.muted}>{z.nom}</AppText>
                </Pressable>
              ))}
            </View>
          </View>
        )}
        <Button label="Ajouter la zone" icon="add" loading={addZone.isPending} disabled={!zoneNom.trim()} onPress={() => addZone.mutate()} />
        {zones.isLoading && <ActivityIndicator color={t.brand} />}
        {zoneList.map((z: any) => (
          <View key={z.id} style={{ gap: 8 }}>
            <View style={s.itemRow}>
              <View style={{ flex: 1 }}>
                <AppText variant="label" numberOfLines={1}>{z.nom}</AppText>
                <AppText variant="caption" muted>{z.niveau}{z.parentId ? ' · rattachée' : ''}</AppText>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={`Détail de ${z.nom}`} hitSlop={8} onPress={() => toggleDetail('zone', z.id)}>
                <Ionicons name={detail?.kind === 'zone' && detail.id === z.id ? 'information-circle' : 'information-circle-outline'} size={22} color={t.muted} />
              </Pressable>
              <Button label="Modifier" variant="ghost" onPress={() => setEditZone(editZone?.id === z.id ? null : { id: z.id, nom: z.nom, niveau: z.niveau, parentId: z.parentId ?? null })} />
              <Button label={confirmed === z.id ? 'Confirmer' : 'Suppr.'} variant="ghost" onPress={() => (confirmed === z.id ? removeZone.mutate(z.id) : setConfirmed(z.id))} />
            </View>
            {editZone?.id === z.id && (
              <View style={{ gap: 8 }}>
                <TextField label="Nom" value={editZone.nom} onChangeText={(v) => setEditZone({ ...editZone, nom: v })} />
                <View style={s.filters}>
                  {NIVEAUX.map((n) => (
                    <Pressable key={n} accessibilityRole="button" onPress={() => setEditZone({ ...editZone, niveau: n })}
                      style={[s.chip, { borderColor: editZone.niveau === n ? t.brand : t.line, backgroundColor: editZone.niveau === n ? t.soft : t.card }]}>
                      <AppText variant="caption" color={editZone.niveau === n ? t.brand : t.muted}>{n}</AppText>
                    </Pressable>
                  ))}
                </View>
                <View style={s.filters}>
                  <Pressable accessibilityRole="button" onPress={() => setEditZone({ ...editZone, parentId: null })}
                    style={[s.chip, { borderColor: !editZone.parentId ? t.brand : t.line, backgroundColor: !editZone.parentId ? t.soft : t.card }]}>
                    <AppText variant="caption" color={!editZone.parentId ? t.brand : t.muted}>Aucune parente</AppText>
                  </Pressable>
                  {zoneList.filter((p: any) => p.id !== z.id).map((p: any) => (
                    <Pressable key={p.id} accessibilityRole="button" onPress={() => setEditZone({ ...editZone, parentId: p.id })}
                      style={[s.chip, { borderColor: editZone.parentId === p.id ? t.brand : t.line, backgroundColor: editZone.parentId === p.id ? t.soft : t.card }]}>
                      <AppText variant="caption" color={editZone.parentId === p.id ? t.brand : t.muted}>{p.nom}</AppText>
                    </Pressable>
                  ))}
                </View>
                <View style={s.filters}>
                  <Button label="Enregistrer la zone" icon="checkmark" loading={saveZone.isPending} disabled={!editZone.nom.trim()} onPress={() => saveZone.mutate()} />
                  <Button label="Annuler" variant="ghost" onPress={() => setEditZone(null)} />
                </View>
              </View>
            )}
            {detail?.kind === 'zone' && detail.id === z.id && <RefDetail kind="zone" id={z.id} />}
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { padding: 20, paddingBottom: 140, gap: 14, maxWidth: 900, width: '100%', alignSelf: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#d9e1dc', paddingTop: 8 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderWidth: 1, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 },
});
