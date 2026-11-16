import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { radius } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}

/**
 * Liste déroulante accessible : un champ fermé qui ouvre une feuille de choix.
 * Utilisée pour les lieux, les rôles, les statuts, etc.
 */
export function SelectField({
  label,
  placeholder = 'Choisir',
  options,
  value,
  onChange,
  error,
  icon,
  title,
  searchable = true,
}: {
  label: string;
  placeholder?: string;
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  error?: string | null;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  title?: string;
  searchable?: boolean;
}) {
  const t = useTheme();
  const { width, height } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find((o) => o.value === value);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => `${o.label} ${o.hint ?? ''}`.toLowerCase().includes(q));
  }, [options, query]);

  const choose = (next: string) => {
    onChange(next);
    setOpen(false);
    setQuery('');
  };

  return (
    <View style={{ gap: 6 }}>
      <AppText variant="label">{label}</AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        style={[s.field, { backgroundColor: t.bg, borderColor: error ? t.error : t.line }]}
      >
        {icon ? <Ionicons name={icon} size={20} color={t.muted} /> : null}
        <AppText style={{ flex: 1 }} color={selected ? t.text : t.muted} numberOfLines={1}>
          {selected?.label ?? placeholder}
        </AppText>
        <Ionicons name="chevron-down" size={20} color={t.muted} />
      </Pressable>
      {error ? <AppText variant="caption" color={t.error} style={{ paddingHorizontal: 8 }}>{error}</AppText> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={s.overlay}>
          <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="Fermer" onPress={() => setOpen(false)} />
          <View style={[s.sheet, { backgroundColor: t.bg, borderColor: t.line, maxHeight: Math.min(height * 0.8, 640), maxWidth: Math.min(width - 24, 560) }]}>
            <View style={s.header}>
              <AppText variant="heading">{title ?? label}</AppText>
              <Pressable accessibilityRole="button" accessibilityLabel="Fermer" onPress={() => setOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color={t.muted} />
              </Pressable>
            </View>
            {searchable ? (
              <View style={[s.search, { backgroundColor: t.card, borderColor: t.line }]}>
                <Ionicons name="search" size={18} color={t.muted} />
                <TextInput
                  accessibilityLabel={`Rechercher dans ${label}`}
                  placeholder="Rechercher…"
                  placeholderTextColor={t.muted}
                  value={query}
                  onChangeText={setQuery}
                  autoCorrect={false}
                  style={[s.input, { color: t.text }]}
                />
              </View>
            ) : null}
            <FlatList
              data={filtered}
              keyExtractor={(o) => o.value}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={s.list}
              ListEmptyComponent={<AppText muted style={{ padding: 16 }}>Aucun résultat.</AppText>}
              renderItem={({ item }) => {
                const on = item.value === value;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={item.hint ? `${item.label}, ${item.hint}` : item.label}
                    onPress={() => choose(item.value)}
                    style={[s.row, { borderColor: on ? t.brand : t.line, backgroundColor: on ? t.soft : t.card }]}
                  >
                    <View style={{ flex: 1 }}>
                      <AppText variant="label" color={on ? t.brand : t.text} numberOfLines={1}>{item.label}</AppText>
                      {item.hint ? <AppText variant="caption" muted numberOfLines={1}>{item.hint}</AppText> : null}
                    </View>
                    {on ? <Ionicons name="checkmark-circle" size={22} color={t.brand} /> : null}
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
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 56, borderWidth: 1.5, borderRadius: radius.pill, paddingHorizontal: 18 },
  overlay: { flex: 1, backgroundColor: 'rgba(10, 20, 16, 0.55)', alignItems: 'center', justifyContent: 'center', padding: 12 },
  sheet: { width: '100%', borderWidth: 1, borderRadius: radius.xl, padding: 14, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 14, minHeight: 46 },
  input: { flex: 1, fontSize: 15, paddingVertical: 10 },
  list: { gap: 8, paddingBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 12 },
});
