import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth';
import { type Booking, useBookings } from '@/context/bookings';
import { BorderRadius, Gradients, Shadows, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const STATS = [
  {
    icon: { ios: 'calendar' as const, android: 'calendar_today' as const, web: 'calendar' as const },
    count: 24,
    label: 'Reservas',
  },
  {
    icon: { ios: 'heart' as const, android: 'favorite' as const, web: 'favorite' as const },
    count: 12,
    label: 'Favoritos',
  },
  {
    icon: { ios: 'trophy' as const, android: 'emoji_events' as const, web: 'emoji_events' as const },
    count: 3,
    label: 'Torneos',
  },
];

const AVATAR_SIZE = 84;
const BANNER_HEIGHT = 150;
const AVATAR_OVERLAP = AVATAR_SIZE / 2;

const SPORT_EMOJI: Record<string, string> = {
  Basketball: '🏀', Fútbol: '⚽', Tenis: '🎾', Voleibol: '🏐',
};

function BookingCard({
  booking,
  onCancel,
}: {
  booking: Booking;
  onCancel: () => void;
}) {
  const theme = useTheme();
  const confirmed = booking.status === 'confirmed';
  return (
    <View style={[bk.card, { backgroundColor: theme.surface }, Shadows.card]}>
      <View style={[bk.sportIcon, { backgroundColor: booking.sportColor }]}>
        <Text style={bk.sportEmoji}>{SPORT_EMOJI[booking.sport] ?? '🏟'}</Text>
      </View>
      <View style={bk.info}>
        <View style={bk.topRow}>
          <Text style={[bk.name, { color: theme.text }]} numberOfLines={1}>{booking.venueName}</Text>
          <View style={[bk.statusChip, { backgroundColor: confirmed ? theme.backgroundSelected : theme.backgroundElement }]}>
            <Text style={[bk.statusText, { color: confirmed ? theme.primary : theme.textTertiary }]}>
              {confirmed ? '● Confirmada' : '✗ Cancelada'}
            </Text>
          </View>
        </View>
        <Text style={[bk.meta, { color: theme.textSecondary }]}>
          {booking.dateLabel}  ·  {booking.startTime}–{booking.endTime}
        </Text>
        <View style={bk.footerRow}>
          <Text style={[bk.price, { color: theme.text }]}>${booking.totalPrice}.00</Text>
          {confirmed && (
            <Pressable
              onPress={onCancel}
              style={[bk.cancelBtn, { borderColor: theme.error }]}>
              <Text style={[bk.cancelText, { color: theme.error }]}>Cancelar</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { bookings, cancelBooking } = useBookings();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  function handleCancel(id: string) {
    Alert.alert(
      'Cancelar reserva',
      '¿Deseas cancelar esta reserva?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí, cancelar', style: 'destructive', onPress: () => cancelBooking(id) },
      ],
    );
  }

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
        <Text style={[styles.brandName, { color: theme.primary }]}>SportSpot</Text>
      </View>

      {/* Banner + avatar */}
      <View style={{ marginBottom: AVATAR_OVERLAP }}>
        <LinearGradient
          colors={Gradients.header.colors as [string, string, ...string[]]}
          start={Gradients.header.start}
          end={Gradients.header.end}
          style={{ height: BANNER_HEIGHT }}
        />
        <View style={[
          styles.avatarRing,
          { backgroundColor: theme.background, bottom: -AVATAR_OVERLAP },
        ]}>
          <LinearGradient colors={['#aaa', '#666']} style={styles.avatarGradient}>
            <Text style={styles.avatarEmoji}>🏃</Text>
          </LinearGradient>
        </View>
      </View>

      {/* User info */}
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: theme.text }]}>Carlos Méndez</Text>
        <Text style={[styles.handle, { color: theme.textSecondary }]}>@carlosdeportivo</Text>

        <View style={styles.badgesRow}>
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>🏅 Miembro Premium</Text>
          </View>
          <View style={styles.sportTag}>
            <Text style={styles.sportTagText}>🌐 Fútbol</Text>
          </View>
        </View>

        <Text style={[styles.bio, { color: theme.textSecondary }]}>
          Apasionado del deporte 🏃 | Buscando siempre nuevos retos deportivos | Panamá 🇵🇦
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {STATS.map(stat => (
          <View key={stat.label} style={[styles.statCard, { backgroundColor: theme.background }, Shadows.card]}>
            <SymbolView name={stat.icon as any} size={26} tintColor={theme.secondary} />
            <Text style={[styles.statCount, { color: theme.text }]}>{stat.count}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Mis Reservas */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Mis Reservas</Text>
        {bookings.length === 0 ? (
          <View style={[bk.empty, { backgroundColor: theme.backgroundElement }]}>
            <Text style={bk.emptyIcon}>📅</Text>
            <Text style={[bk.emptyTitle, { color: theme.text }]}>Sin reservas aún</Text>
            <Text style={[bk.emptyHint, { color: theme.textSecondary }]}>
              Reserva una cancha desde Inicio o Mapa
            </Text>
          </View>
        ) : (
          <View style={bk.list}>
            {bookings.map(b => (
              <BookingCard key={b.id} booking={b} onCancel={() => handleCancel(b.id)} />
            ))}
          </View>
        )}
      </View>

      {/* Account settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Cuenta</Text>

        <View style={[styles.settingsList, { backgroundColor: theme.surface }, Shadows.card]}>
          {/* Editar Perfil */}
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <View style={[styles.settingIcon, { backgroundColor: theme.backgroundElement }]}>
              <SymbolView
                name={{ ios: 'person.circle', android: 'account_circle', web: 'person' } as any}
                size={20}
                tintColor={theme.textSecondary}
              />
            </View>
            <Text style={[styles.settingLabel, { color: theme.text }]}>Editar Perfil</Text>
            <Text style={[styles.chevron, { color: theme.textTertiary }]}>›</Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Ubicación */}
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <View style={[styles.settingIcon, { backgroundColor: theme.backgroundElement }]}>
              <SymbolView
                name={{ ios: 'location', android: 'location_on', web: 'location_on' } as any}
                size={20}
                tintColor={theme.textSecondary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Ubicación</Text>
              <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>Ciudad de Panamá</Text>
            </View>
            <Text style={[styles.chevron, { color: theme.textTertiary }]}>›</Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Notificaciones */}
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: theme.backgroundElement }]}>
              <SymbolView
                name={{ ios: 'bell', android: 'notifications', web: 'notifications' } as any}
                size={20}
                tintColor={theme.textSecondary}
              />
            </View>
            <Text style={[styles.settingLabel, { color: theme.text, flex: 1 }]}>Notificaciones</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity
        onPress={logout}
        activeOpacity={0.7}
        style={[styles.logoutBtn, { borderColor: theme.error, marginHorizontal: Spacing.three }]}>
        <Text style={[styles.logoutText, { color: theme.error }]}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <View style={{ height: insets.bottom + Spacing.six }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  brandName: { ...Typography.displayMd },
  avatarRing: {
    position: 'absolute',
    left: Spacing.three,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: BorderRadius.full,
    padding: 3,
    ...Shadows.card,
  },
  avatarGradient: {
    flex: 1,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 38 },
  userInfo: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    gap: Spacing.one,
  },
  userName: { ...Typography.displayMd },
  handle: { ...Typography.body },
  badgesRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  premiumBadge: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  premiumText: { ...Typography.badge, color: '#F57F17' },
  sportTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  sportTagText: { ...Typography.badge, color: '#1565C0' },
  bio: { ...Typography.body, marginTop: Spacing.two, lineHeight: 22 },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.md,
    gap: Spacing.one,
  },
  statCount: { ...Typography.displayMd },
  statLabel: { ...Typography.caption },
  section: {
    paddingHorizontal: Spacing.three,
    marginTop: Spacing.three,
  },
  sectionTitle: { ...Typography.subheading, marginBottom: Spacing.two },
  settingsList: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: { ...Typography.body },
  settingSubtitle: { ...Typography.caption, marginTop: 1 },
  chevron: { fontSize: 22, fontWeight: '300' },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.three + 36 + Spacing.two,
  },
  logoutBtn: {
    height: 50,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  logoutText: { ...Typography.bodyBold },
});

// ─── Booking card styles ──────────────────────────────────────────────────────
const bk = StyleSheet.create({
  list: { gap: Spacing.two },
  card: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    padding: Spacing.two,
    gap: Spacing.two,
  },
  sportIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportEmoji: { fontSize: 24 },
  info: { flex: 1, gap: 4 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  name: { ...Typography.bodyBold, flex: 1 },
  statusChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusText: { ...Typography.badge },
  meta: { ...Typography.caption },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  price: { ...Typography.bodyBold },
  cancelBtn: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  cancelText: { ...Typography.badge },
  empty: {
    borderRadius: BorderRadius.md,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.one,
  },
  emptyIcon: { fontSize: 36 },
  emptyTitle: { ...Typography.bodyBold },
  emptyHint: { ...Typography.caption, textAlign: 'center' },
});
