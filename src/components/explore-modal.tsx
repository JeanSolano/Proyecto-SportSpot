import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import EstablishmentDetailModal from '@/components/establishment-detail-modal';
import { BorderRadius, Shadows, Spacing, Typography } from '@/constants/theme';
import { getEstablecimientos, type EstablecimientoResumen } from '@/data/establecimientos';
import { sportColor, sportLabel } from '@/data/sports';
import { useTheme } from '@/hooks/use-theme';

function initials(nombre: string): string {
  return nombre.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

function EstablecimientoCard({ item, onPress }: { item: EstablecimientoResumen; onPress: () => void }) {
  const theme = useTheme();
  const mainSport = item.deportes[0];
  const accent = mainSport ? sportColor(mainSport) : theme.primary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { backgroundColor: theme.surface, opacity: pressed ? 0.92 : 1 }, Shadows.card]}
      accessibilityRole="button"
      accessibilityLabel={`Ver ${item.nombre}`}>
      <LinearGradient colors={[accent, '#1B2880']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        {!item.logo && <Text style={styles.heroWatermark} numberOfLines={1}>{initials(item.nombre)}</Text>}
        <View style={styles.heroTopRow}>
          {mainSport ? (
            <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>{sportLabel(mainSport)}</Text></View>
          ) : <View />}
          {item.abierto_hoy && (
            <View style={styles.availBadge}><Text style={styles.availText}>Disponible hoy</Text></View>
          )}
        </View>
        <View style={styles.heroNameRow}>
          {item.logo && (
            <View style={styles.logoCircle}>
              <Image source={{ uri: item.logo }} style={styles.logoImg} contentFit="cover" />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.heroName} numberOfLines={1}>{item.nombre}</Text>
            <Text style={styles.heroAddress} numberOfLines={1}>{item.direccion}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.cardBody}>
        {item.deportes.length > 0 && (
          <View style={styles.chipRow}>
            {item.deportes.map((d) => (
              <View key={d} style={[styles.chip, { backgroundColor: sportColor(d) + '1A' }]}>
                <Text style={[styles.chipText, { color: sportColor(d) }]}>{sportLabel(d)}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={styles.cardFooter}>
          <Text style={[styles.footerMeta, { color: theme.textSecondary }]}>
            {item.canchas} {item.canchas === 1 ? 'cancha' : 'canchas'}
          </Text>
          {item.precio_desde != null ? (
            <Text style={[styles.price, { color: theme.text }]}>
              Desde <Text style={{ fontWeight: '700', color: theme.primary }}>${item.precio_desde.toFixed(2)}</Text>/h
            </Text>
          ) : (
            <Text style={[styles.footerMeta, { color: theme.textTertiary }]}>Sin canchas aún</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

function SkeletonCard() {
  const theme = useTheme();
  const block = (w: number | string, h: number) => (
    <View style={{ width: w as any, height: h, borderRadius: 6, backgroundColor: theme.backgroundElement }} />
  );
  return (
    <View style={[styles.card, { backgroundColor: theme.surface }, Shadows.card]}>
      <View style={[styles.hero, { backgroundColor: theme.backgroundElement }]} />
      <View style={styles.cardBody}>
        {block('45%', 18)}
        <View style={styles.cardFooter}>{block('30%', 12)}{block('25%', 12)}</View>
      </View>
    </View>
  );
}

export default function ExploreModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<EstablecimientoResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [sport, setSport] = useState('Todos');
  const [detailId, setDetailId] = useState<string | null>(null);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDebounced(search), 400);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [search]);

  const cargar = useCallback(async (q: string, isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError('');
    try {
      setItems(await getEstablecimientos(q));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los establecimientos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Carga al abrir y cuando cambia la búsqueda.
  useEffect(() => { if (visible) cargar(debounced); }, [visible, debounced, cargar]);

  const onRefresh = () => { setRefreshing(true); cargar(debounced, true); };

  const sportOptions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((e) => e.deportes.forEach((d) => set.add(d)));
    return ['Todos', ...[...set].sort()];
  }, [items]);

  const filtered = useMemo(
    () => (sport === 'Todos' ? items : items.filter((e) => e.deportes.includes(sport))),
    [items, sport],
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        {/* Header con volver + buscador */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
          <View style={styles.headerRow}>
            <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Volver">
              <Text style={[styles.back, { color: theme.text }]}>←</Text>
            </Pressable>
            <View style={[styles.searchBox, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Buscar por nombre o dirección"
                placeholderTextColor={theme.textTertiary}
                value={search}
                onChangeText={setSearch}
                autoCapitalize="none"
                autoFocus
                returnKeyType="search"
                accessibilityLabel="Buscar establecimientos"
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch('')} hitSlop={10} accessibilityLabel="Limpiar búsqueda">
                  <Text style={[styles.clearBtn, { color: theme.textSecondary }]}>✕</Text>
                </Pressable>
              )}
            </View>
          </View>

          {sportOptions.length > 2 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
              {sportOptions.map((sName) => {
                const active = sName === sport;
                return (
                  <Pressable
                    key={sName}
                    onPress={() => setSport(sName)}
                    style={[styles.filterPill, { backgroundColor: active ? theme.primary : theme.backgroundElement }]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}>
                    <Text style={[styles.filterText, { color: active ? '#fff' : theme.textSecondary }]}>{sportLabel(sName)}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>

        {loading ? (
          <View style={styles.feed}>{[0, 1, 2].map((i) => <SkeletonCard key={i} />)}</View>
        ) : error && items.length === 0 ? (
          <View style={styles.centerState}>
            <Text style={[styles.stateTitle, { color: theme.text }]}>No se pudo cargar</Text>
            <Text style={[styles.stateText, { color: theme.textSecondary }]}>{error}</Text>
            <Pressable onPress={() => cargar(debounced)} style={[styles.retryBtn, { backgroundColor: theme.primary }]} accessibilityRole="button">
              <Text style={styles.retryText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[styles.feed, { paddingBottom: insets.bottom + Spacing.six }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}>
            {filtered.map((item) => (
              <EstablecimientoCard key={item.id_establecimiento} item={item} onPress={() => setDetailId(item.id_establecimiento)} />
            ))}
            {filtered.length === 0 && (
              <View style={styles.centerState}>
                <Text style={[styles.stateTitle, { color: theme.text }]}>
                  {debounced || sport !== 'Todos' ? 'Sin resultados' : 'Aún no hay establecimientos'}
                </Text>
                <Text style={[styles.stateText, { color: theme.textSecondary }]}>
                  {debounced || sport !== 'Todos'
                    ? 'Prueba con otra búsqueda o quita los filtros.'
                    : 'Cuando un dueño registre su establecimiento, aparecerá aquí.'}
                </Text>
              </View>
            )}
          </ScrollView>
        )}

        <EstablishmentDetailModal id={detailId} onClose={() => setDetailId(null)} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.two },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  back: { fontSize: 26, lineHeight: 30 },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.three, height: 46, gap: Spacing.two,
  },
  searchInput: { flex: 1, ...Typography.body },
  clearBtn: { fontSize: 15, fontWeight: '700' },

  pillRow: { gap: Spacing.two, paddingTop: Spacing.three },
  filterPill: { minHeight: 34, justifyContent: 'center', paddingHorizontal: Spacing.three, borderRadius: BorderRadius.full },
  filterText: { ...Typography.bodyBold },

  feed: { paddingTop: Spacing.two, gap: Spacing.three, paddingHorizontal: Spacing.three },

  card: { borderRadius: BorderRadius.md, overflow: 'hidden' },
  hero: { minHeight: 132, padding: Spacing.three, justifyContent: 'space-between', gap: Spacing.three },
  heroWatermark: { position: 'absolute', right: Spacing.two, top: -8, fontSize: 96, fontWeight: '800', color: 'rgba(255,255,255,0.12)' },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroBadge: { backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: Spacing.two, paddingVertical: 4, borderRadius: BorderRadius.sm },
  heroBadgeText: { ...Typography.badge, color: '#fff' },
  availBadge: { backgroundColor: 'rgba(255,255,255,0.92)', paddingHorizontal: Spacing.two, paddingVertical: 4, borderRadius: BorderRadius.full },
  availText: { ...Typography.badge, color: '#0A7B34' },
  heroName: { ...Typography.heading, color: '#fff' },
  heroAddress: { ...Typography.caption, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  heroNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  logoCircle: { width: 44, height: 44, borderRadius: BorderRadius.full, overflow: 'hidden', backgroundColor: '#fff', borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)' },
  logoImg: { width: '100%', height: '100%' },
  cardBody: { padding: Spacing.three, gap: Spacing.two },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  chip: { paddingHorizontal: Spacing.two, paddingVertical: 4, borderRadius: BorderRadius.sm },
  chipText: { ...Typography.badge },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerMeta: { ...Typography.caption },
  price: { ...Typography.body, fontVariant: ['tabular-nums'] },

  centerState: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.four, paddingVertical: Spacing.six, gap: Spacing.two },
  stateTitle: { ...Typography.subheading },
  stateText: { ...Typography.body, textAlign: 'center' },
  retryBtn: { marginTop: Spacing.two, minHeight: 46, justifyContent: 'center', paddingHorizontal: Spacing.five, borderRadius: BorderRadius.sm },
  retryText: { ...Typography.bodyBold, color: '#fff' },
});
