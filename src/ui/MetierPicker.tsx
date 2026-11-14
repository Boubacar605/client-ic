import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { normalizeMetier } from '../data/metiers';
import { radius } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';
import { MetierThumb } from './MetierThumb';

export interface MetierOption {
  key: string;
  label: string;
  categorie?: string;
}

/**
 * Liste déroulante de métiers en grille : chaque tuile affiche l'icône et le nom.
 * Utilisable pour filtrer (clé = libellé) ou pour choisir un métier de référence (clé = id).
 */
export function MetierPicker({
  options,
  value,
  onChange,
  label,
  placeholder = 'Choisir un métier',
  error,
  allowAll = false,
  allLabel = 'Tous les métiers',
}: {
  options: MetierOption[];
  value: string | null;
  onChange: (key: string | null) => void;
  label?: string;
  placeholder?: string;
  error?: string | null;
  allowAll?: boolean;
  allLabel?: string;
}) {
  const t = useTheme();
  const { width, height } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const columns = width >= 1024 ? 5 : width >= 760 ? 4 : width >= 520 ? 3 : 2;
  const selected = options.find((o) => o.key === value);
  const filtered = useMemo(() => {
    const q = normalizeMetier(query);
    if (!q) return options;
    return options.filter((o) => normalizeMetier(`${o.label} ${o.categorie ?? ''}`).includes(q));
  }, [options, query]);

  const choose = (key: string | null) => {
    onChange(key);
    setOpen(false);
    setQuery('');
  };

  return (
    <View style={{ gap: 6 }}>
      {label ? <AppText variant="label">{label}</AppText> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
        onPress={() => setOpen(true)}
        style={[s.field, { backgroundColor: t.card, borderColor: error ? '#d94a4a' : t.line }]}
      >
        {selected ? <MetierThumb metier={selected.label} size={38} radius={11} /> : null}
        <AppText style={{ flex: 1 }} color={selected ? t.text : t.muted} numberOfLines={1}>
          {selected?.label ?? placeholder}
        </AppText>
        <Ionicons name="chevron-down" size={20} color={t.muted} />
      </Pressable>
      {error ? <AppText variant="caption" color="#d94a4a">{error}</AppText> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={s.overlay}>
          <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="Fermer" onPress={() => setOpen(false)} />
          <View style={[s.sheet, { backgroundColor: t.bg, borderColor: t.line, maxHeight: Math.min(height * 0.8, 640), maxWidth: Math.min(width - 24, 720) }]}>
            <View style={s.header}>
              <AppText variant="heading">Choisir un métier</AppText>
              <Pressable accessibilityRole="button" accessibilityLabel="Fermer" onPress={() => setOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color={t.muted} />
              </Pressable>
            </View>
            <View style={[s.search, { backgroundColor: t.card, borderColor: t.line }]}>
              <Ionicons name="search" size={18} color={t.muted} />
              <TextInput
                accessibilityLabel="Rechercher un métier"
                placeholder="Rechercher un métier…"
                placeholderTextColor={t.muted}
                value={query}
                onChangeText={setQuery}
                autoCorrect={false}
                style={[s.input, { color: t.text }]}
              />
            </View>
            <FlatList
              data={allowAll ? [{ key: '__all__', label: allLabel }, ...filtered] : filtered}
              key={columns}
              numColumns={columns}
              keyExtractor={(o) => o.key}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={s.grid}
              ListEmptyComponent={<AppText muted style={{ padding: 16 }}>Aucun métier ne correspond.</AppText>}
              renderItem={({ item }) => {
                const isAll = item.key === '__all__';
                const on = isAll ? value === null : item.key === value;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={item.label}
                    onPress={() => choose(isAll ? null : item.key)}
                    style={[s.tile, { borderColor: on ? t.brand : 'transparent', backgroundColor: on ? t.soft : 'transparent' }]}
                  >
                    {isAll
                      ? <View style={[s.allIcon, { backgroundColor: t.brand }]}><Ionicons name="apps" size={24} color={t.onBrand} /></View>
                      : <MetierThumb metier={item.label} size={52} radius={15} />}
                    <AppText variant="caption" numberOfLines={2} style={{ fontWeight: '700', textAlign: 'center' }} color={on ? t.brand : t.text}>
                      {item.label}
                    </AppText>
                    {on ? <Ionicons name="checkmark-circle" size={16} color={t.brand} style={s.check} /> : null}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 58, borderWidth: 1.5, borderRadius: radius.lg, paddingHorizontal: 14 },
  overlay: { flex: 1, backgroundColor: 'rgba(10, 20, 16, 0.55)', alignItems: 'center', justifyContent: 'center', padding: 12 },
  sheet: { width: '100%', borderWidth: 1, borderRadius: radius.xl, padding: 14, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 14, minHeight: 46 },
  input: { flex: 1, fontSize: 15, paddingVertical: 10 },
  grid: { gap: 8, paddingBottom: 8 },
  tile: { flex: 1, borderWidth: 2, borderRadius: radius.lg, padding: 8, alignItems: 'center', gap: 6, minWidth: 0 },
  allIcon: { width: 52, height: 52, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  check: { position: 'absolute', top: 6, right: 6 },
});
