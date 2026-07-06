import { Image } from 'expo-image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BorderRadius, Shadows, Spacing, Typography } from '@/constants/theme';
import { getEstablecimientos, type EstablecimientoResumen } from '@/data/establecimientos';
import { useTheme } from '@/hooks/use-theme';

// Color de marca por deporte (los nombres vienen de la BD).
function sportColor(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('futbol') || n.includes('fútbol')) return '#00CA4E';
  if (n.includes('basket')) return '#0066FF';
  if (n.includes('tenis')) return '#FF7F00';
  if (n.includes('voley') || n.includes('voleibol')) return '#9C27B0';
  if (n.includes('nataci')) return '#00B8D4';
  return '#5A5A72';
}

const AVATAR_COLORS = ['#56B330', '#1E7FE0', '#F4511E', '#1B2880', '#9C27B0'];
function avatarColor(s: string): string {
  const sum = [...s].reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}
function initials(nombre: string): string {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

// ─── Tarjeta de establecimiento ───────────────────────────────────────────────
function EstablecimientoCard({ item }: { item: EstablecimientoResumen }) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.surface }, Shadows.card]}>
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: avatarColor(item.nombre) }]}>
          <Text style={styles.avatarText}>{initials(item.nombre)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>{item.nombre}</Text>
          <Text style={[styles.address, { color: theme.textSecondary }]} numberOfLines={1}>
            {item.direccion}
          </Text>
        </View>
      </View>

      {item.deportes.length > 0 && (
        <View style={styles.chipRow}>
          {item.deportes.map((d) => (
            <View key={d} style={[styles.chip, { backgroundColor: sportColor(d) + '1A' }]}>
              <Text style={[styles.chipText, { color: sportColor(d) }]}>{d}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

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
  );
}

// ─── Skeleton de carga ────────────────────────────────────────────────────────
function SkeletonCard() {
  const theme = useTheme();
  const block = (w: number | string, h: number, mt = 0) => (
    <View style={{ width: w as any, height: h, marginTop: mt, borderRadius: 6, backgroundColor: theme.backgroundElement }} />
  );
  return (
    <View style={[styles.card, { backgroundColor: theme.surface }, Shadows.card]}>
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: theme.backgroundElement }]} />
        <View style={{ flex: 1 }}>
          {block('70%', 16)}
          {block('50%', 12, 8)}
        </View>
      </View>
      {block('40%', 20, 12)}
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      <View style={styles.cardFooter}>{block('30%', 12)}{block('25%', 12)}</View>
    </View>
  );
}

// ─── Pantalla ─────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<EstablecimientoResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [sport, setSport] = useState('Todos');

  // Debounce del buscador (400ms) para no golpear el API en cada tecla.
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

  useEffect(() => { cargar(debounced); }, [debounced, cargar]);

  const onRefresh = () => { setRefreshing(true); cargar(debounced, true); };

  // Filtros de deporte derivados de los datos reales.
  const sportOptions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((e) => e.deportes.forEach((d) => set.add(d)));
    return ['Todos', ...[...set].sort()];
  }, [items]);

  const filtered = useMemo(
    () => (sport === 'Todos' ? items : items.filter((e) => e.deportes.includes(sport))),
    [items, sport],
  );

  const header = (
    <View>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.two, backgroundColor: theme.background }]}>
        <View style={styles.brandRow}>
          <Image source={require('@/assets/images/logo-official.png')} style={styles.brandLogo} contentFit="contain" />
          <Text style={[styles.brandName, { color: theme.navy }]}>SportSpot</Text>
        </View>
      </View>

      <Text style={[styles.discoverTitle, { color: theme.text }]}>Descubre</Text>

      {/* Buscador */}
      <View style={[styles.searchBox, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Buscar por nombre o dirección"
          placeholderTextColor={theme.textTertiary}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          returnKeyType="search"
          accessibilityLabel="Buscar establecimientos"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={10} accessibilityLabel="Limpiar búsqueda">
            <Text style={[styles.clearBtn, { color: theme.textSecondary }]}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Filtros por deporte (solo si hay más de un deporte en los datos) */}
      {sportOptions.length > 2 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillRow}>
          {sportOptions.map((s) => {
            const active = s === sport;
            return (
              <Pressable
                key={s}
                onPress={() => setSport(s)}
                style={[styles.filterPill, { backgroundColor: active ? theme.primary : theme.backgroundElement }]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}>
                <Text style={[styles.filterText, { color: active ? '#fff' : theme.textSecondary }]}>{s}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );

  // Estado de error (con reintento).
  if (error && items.length === 0 && !loading) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        {header}
        <View style={styles.centerState}>
          <Text style={[styles.stateTitle, { color: theme.text }]}>No se pudo cargar</Text>
          <Text style={[styles.stateText, { color: theme.textSecondary }]}>{error}</Text>
          <Pressable
            onPress={() => cargar(debounced)}
            style={[styles.retryBtn, { backgroundColor: theme.primary }]}
            accessibilityRole="button">
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      {loading ? (
        <View>
          {header}
          <View style={styles.feed}>
            {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
          </View>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(e) => e.id_establecimiento}
          renderItem={({ item }) => <EstablecimientoCard item={item} />}
          ListHeaderComponent={header}
          contentContainerStyle={[styles.feed, { paddingBottom: insets.bottom + Spacing.six }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
          ListEmptyComponent={
            <View style={styles.centerState}>
              <Text style={[styles.stateTitle, { color: theme.text }]}>
                {debounced || sport !== 'Todos' ? 'Sin resultados' : 'Aún no hay establecimientos'}
              </Text>
              <Text style={[styles.stateText, { color: theme.textSecondary }]}>
                {debounced || sport !== 'Todos'
                  ? 'Prueba con otra búsqueda o quita los filtros.'
                  : 'Cuando un dueño registre su establecimiento desde el panel web, aparecerá aquí.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  brandLogo: { width: 34, height: 34 },
  brandName: { ...Typography.displayMd },
  discoverTitle: { ...Typography.heading, paddingHorizontal: Spacing.three, paddingBottom: Spacing.two },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.three,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.three,
    height: 46,
    gap: Spacing.two,
  },
  searchInput: { flex: 1, ...Typography.body },
  clearBtn: { fontSize: 15, fontWeight: '700' },

  pillRow: { paddingHorizontal: Spacing.three, gap: Spacing.two, paddingTop: Spacing.three },
  filterPill: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: BorderRadius.full,
  },
  filterText: { ...Typography.bodyBold },

  feed: { paddingTop: Spacing.two, gap: Spacing.three, paddingHorizontal: Spacing.three },

  // Card
  card: { borderRadius: BorderRadius.md, padding: Spacing.three, gap: Spacing.two },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...Typography.bodyBold, color: '#fff' },
  name: { ...Typography.subheading },
  address: { ...Typography.caption, marginTop: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  chip: { paddingHorizontal: Spacing.two, paddingVertical: 4, borderRadius: BorderRadius.sm },
  chipText: { ...Typography.badge },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 2 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerMeta: { ...Typography.caption },
  price: { ...Typography.body, fontVariant: ['tabular-nums'] },

  // States
  centerState: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.four, paddingVertical: Spacing.six, gap: Spacing.two },
  stateTitle: { ...Typography.subheading },
  stateText: { ...Typography.body, textAlign: 'center' },
  retryBtn: {
    marginTop: Spacing.two,
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: Spacing.five,
    borderRadius: BorderRadius.sm,
  },
  retryText: { ...Typography.bodyBold, color: '#fff' },
});
