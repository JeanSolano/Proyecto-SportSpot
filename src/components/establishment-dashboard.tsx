import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { VENUES } from '@/app/index';
import { BorderRadius, Gradients, Shadows, Spacing, Typography } from '@/constants/theme';
import { useBookings } from '@/context/bookings';
import { useTheme } from '@/hooks/use-theme';

const ALL_HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

const VENUE_TAKEN_HOURS: Record<string, number[]> = {
  '1': [9, 10, 15, 16],
  '2': [10, 11, 17, 18],
  '3': [8, 9, 14, 15],
  '4': [11, 12, 19, 20],
};

const INITIAL_BLOCKED: Record<string, number[]> = {
  '1': [13],
  '2': [12, 13],
  '3': [12],
  '4': [13],
};

const MOCK_BOOKINGS: Record<string, { name: string; hour: number; duration: number }[]> = {
  '1': [
    { name: 'Luis Herrera', hour: 9, duration: 1 },
    { name: 'Equipo Albrook FC', hour: 15, duration: 2 },
  ],
  '2': [
    { name: 'Pedro Martínez', hour: 10, duration: 2 },
    { name: 'Club Miraflores', hour: 17, duration: 1 },
  ],
  '3': [
    { name: 'Ana González', hour: 8, duration: 1 },
    { name: 'Torneo Paitilla', hour: 14, duration: 2 },
  ],
  '4': [
    { name: 'María López', hour: 11, duration: 2 },
    { name: 'Volei Costa FC', hour: 19, duration: 1 },
  ],
};

const SPORT_EMOJI: Record<string, string> = {
  Basketball: '🏀',
  Fútbol: '⚽',
  Tenis: '🎾',
  Voleibol: '🏐',
};

export default function EstablishmentDashboard({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { bookings } = useBookings();
  const [selectedVenueIdx, setSelectedVenueIdx] = useState(0);
  const [blockedHours, setBlockedHours] = useState<Record<string, number[]>>(INITIAL_BLOCKED);

  const venue = VENUES[selectedVenueIdx];
  const venueId = venue.id;
  const taken = VENUE_TAKEN_HOURS[venueId] ?? [];
  const blocked = blockedHours[venueId] ?? [];

  const sessionBookings = bookings.filter(b => b.venueId === venueId && b.status === 'confirmed');

  const sessionHours: number[] = [];
  sessionBookings.forEach(b => {
    const startH = parseInt(b.startTime.split(':')[0], 10);
    const endH = parseInt(b.endTime.split(':')[0], 10);
    for (let h = startH; h < endH; h++) sessionHours.push(h);
  });
  const occupiedHours = [...new Set([...taken, ...sessionHours])];

  const mockBookingsForVenue = MOCK_BOOKINGS[venueId] ?? [];
  const todayBookings = mockBookingsForVenue.length + sessionBookings.length;
  const mockRevenue = mockBookingsForVenue.reduce((sum, b) => sum + b.duration * venue.pricePerHour, 0);
  const sessionRevenue = sessionBookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const totalRevenue = mockRevenue + sessionRevenue;
  const occupancyPct = Math.round((occupiedHours.length / ALL_HOURS.length) * 100);

  function toggleBlock(hour: number) {
    if (occupiedHours.includes(hour)) return;
    const current = blockedHours[venueId] ?? [];
    const isBlocked = current.includes(hour);
    const next = isBlocked ? current.filter(h => h !== hour) : [...current, hour];
    setBlockedHours(prev => ({ ...prev, [venueId]: next }));
  }

  function slotState(hour: number): 'occupied' | 'blocked' | 'available' {
    if (occupiedHours.includes(hour)) return 'occupied';
    if (blocked.includes(hour)) return 'blocked';
    return 'available';
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={[dash.screen, { backgroundColor: theme.background }]}>
        {/* Header */}
        <LinearGradient
          colors={Gradients.header.colors as [string, string, ...string[]]}
          start={Gradients.header.start}
          end={Gradients.header.end}
          style={[dash.header, { paddingTop: insets.top + Spacing.two }]}>
          <Pressable onPress={onClose} style={dash.closeBtn} hitSlop={12}>
            <Text style={dash.closeBtnText}>✕</Text>
          </Pressable>
          <View style={dash.headerCenter}>
            <Text style={dash.headerTitle}>Panel de Establecimiento</Text>
            <Text style={dash.headerSub}>Vista de propietario · Demo</Text>
          </View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {/* Venue selector tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={dash.venueTabsRow}>
            {VENUES.map((v, i) => {
              const active = i === selectedVenueIdx;
              return (
                <TouchableOpacity
                  key={v.id}
                  onPress={() => setSelectedVenueIdx(i)}
                  activeOpacity={0.7}
                  style={[
                    dash.venueTab,
                    {
                      borderColor: active ? v.sportColor : theme.border,
                      backgroundColor: active ? v.sportColor + '22' : theme.backgroundElement,
                    },
                  ]}>
                  <Text style={dash.venueTabEmoji}>{SPORT_EMOJI[v.sport]}</Text>
                  <Text
                    style={[dash.venueTabName, { color: active ? v.sportColor : theme.textSecondary }]}
                    numberOfLines={1}>
                    {v.venueName.split(' ').slice(0, 2).join(' ')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Stats row */}
          <View style={dash.statsRow}>
            <View style={[dash.statCard, { backgroundColor: theme.surface }, Shadows.card]}>
              <Text style={dash.statEmoji}>📅</Text>
              <Text style={[dash.statValue, { color: theme.text }]}>{todayBookings}</Text>
              <Text style={[dash.statLabel, { color: theme.textSecondary }]}>Reservas hoy</Text>
            </View>
            <View style={[dash.statCard, { backgroundColor: theme.surface }, Shadows.card]}>
              <Text style={dash.statEmoji}>💵</Text>
              <Text style={[dash.statValue, { color: theme.text }]}>${totalRevenue}</Text>
              <Text style={[dash.statLabel, { color: theme.textSecondary }]}>Ingresos</Text>
            </View>
            <View style={[dash.statCard, { backgroundColor: theme.surface }, Shadows.card]}>
              <Text style={dash.statEmoji}>📊</Text>
              <Text style={[dash.statValue, { color: theme.text }]}>{occupancyPct}%</Text>
              <Text style={[dash.statLabel, { color: theme.textSecondary }]}>Ocupación</Text>
            </View>
          </View>

          {/* Today's bookings */}
          <View style={dash.section}>
            <Text style={[dash.sectionTitle, { color: theme.text }]}>Reservas de hoy</Text>
            <View style={dash.bookingList}>
              {mockBookingsForVenue.map((mb, idx) => (
                <View key={idx} style={[dash.bookingRow, { backgroundColor: theme.surface }, Shadows.card]}>
                  <View style={[dash.bookingDot, { backgroundColor: venue.sportColor }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[dash.bookingName, { color: theme.text }]}>{mb.name}</Text>
                    <Text style={[dash.bookingMeta, { color: theme.textSecondary }]}>
                      {mb.hour}:00 – {mb.hour + mb.duration}:00  ·  {mb.duration}h  ·  ${mb.duration * venue.pricePerHour}
                    </Text>
                  </View>
                  <View style={[dash.statusChip, { backgroundColor: theme.backgroundSelected }]}>
                    <Text style={[dash.statusChipText, { color: theme.primary }]}>● Confirmada</Text>
                  </View>
                </View>
              ))}
              {sessionBookings.map(b => (
                <View key={b.id} style={[dash.bookingRow, { backgroundColor: theme.surface }, Shadows.card]}>
                  <View style={[dash.bookingDot, { backgroundColor: venue.sportColor }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[dash.bookingName, { color: theme.text }]}>Carlos Méndez</Text>
                    <Text style={[dash.bookingMeta, { color: theme.textSecondary }]}>
                      {b.startTime} – {b.endTime}  ·  ${b.totalPrice}
                    </Text>
                  </View>
                  <View style={[dash.statusChip, { backgroundColor: '#E3F2FD' }]}>
                    <Text style={[dash.statusChipText, { color: '#1565C0' }]}>● Nueva</Text>
                  </View>
                </View>
              ))}
              {todayBookings === 0 && (
                <View style={[dash.emptyBookings, { backgroundColor: theme.backgroundElement }]}>
                  <Text style={[dash.emptyBookingsText, { color: theme.textSecondary }]}>
                    Sin reservas para hoy
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Availability grid */}
          <View style={dash.section}>
            <Text style={[dash.sectionTitle, { color: theme.text }]}>Disponibilidad – Hoy</Text>
            <Text style={[dash.sectionHint, { color: theme.textSecondary }]}>
              Toca un horario libre para bloquearlo o desbloquearlo
            </Text>
            <View style={dash.slotGrid}>
              {ALL_HOURS.map(hour => {
                const state = slotState(hour);
                const isOccupied = state === 'occupied';
                const isBlocked = state === 'blocked';

                const bgColor = isOccupied
                  ? '#E6394620'
                  : isBlocked
                  ? '#FF7F0020'
                  : theme.backgroundSelected;
                const textColor = isOccupied ? '#E63946' : isBlocked ? '#FF7F00' : theme.primary;
                const borderColor = isOccupied ? '#E63946' : isBlocked ? '#FF7F00' : theme.primary;
                const icon = isOccupied ? '🔴' : isBlocked ? '🔒' : '✓';

                return (
                  <TouchableOpacity
                    key={hour}
                    onPress={() => toggleBlock(hour)}
                    disabled={isOccupied}
                    activeOpacity={0.7}
                    style={[dash.slot, { backgroundColor: bgColor, borderColor }]}>
                    <Text style={[dash.slotTime, { color: textColor }]}>{hour}:00</Text>
                    <Text style={dash.slotIcon}>{icon}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Legend */}
            <View style={dash.legend}>
              <View style={dash.legendItem}>
                <View style={[dash.legendDot, { backgroundColor: theme.primary }]} />
                <Text style={[dash.legendText, { color: theme.textSecondary }]}>Disponible</Text>
              </View>
              <View style={dash.legendItem}>
                <View style={[dash.legendDot, { backgroundColor: '#FF7F00' }]} />
                <Text style={[dash.legendText, { color: theme.textSecondary }]}>Bloqueado</Text>
              </View>
              <View style={dash.legendItem}>
                <View style={[dash.legendDot, { backgroundColor: '#E63946' }]} />
                <Text style={[dash.legendText, { color: theme.textSecondary }]}>Reservado</Text>
              </View>
            </View>
          </View>

          {/* Disclaimer */}
          <View style={[dash.disclaimer, { backgroundColor: theme.backgroundElement }]}>
            <Text style={dash.disclaimerIcon}>ℹ️</Text>
            <Text style={[dash.disclaimerText, { color: theme.textSecondary }]}>
              Los cambios de disponibilidad se reflejarán en tiempo real cuando se integre el backend. Esta es una vista de demostración.
            </Text>
          </View>

          <View style={{ height: insets.bottom + Spacing.four }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const dash = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingBottom: Spacing.three,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute',
    left: Spacing.three,
    bottom: Spacing.three,
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  headerCenter: { alignItems: 'center', gap: 2 },
  headerTitle: { ...Typography.subheading, color: '#fff' },
  headerSub: { ...Typography.caption, color: 'rgba(255,255,255,0.8)' },
  venueTabsRow: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  venueTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  venueTabEmoji: { fontSize: 16 },
  venueTabName: { ...Typography.badge, maxWidth: 90 },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.md,
    gap: 2,
  },
  statEmoji: { fontSize: 20 },
  statValue: { ...Typography.heading },
  statLabel: { ...Typography.badge, textAlign: 'center' },
  section: {
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.three,
  },
  sectionTitle: { ...Typography.subheading, marginBottom: Spacing.one },
  sectionHint: { ...Typography.caption, marginBottom: Spacing.two },
  bookingList: { gap: Spacing.two },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    padding: Spacing.two,
    gap: Spacing.two,
  },
  bookingDot: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.full,
  },
  bookingName: { ...Typography.bodyBold },
  bookingMeta: { ...Typography.caption, marginTop: 2 },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusChipText: { ...Typography.badge },
  emptyBookings: {
    borderRadius: BorderRadius.md,
    padding: Spacing.three,
    alignItems: 'center',
  },
  emptyBookingsText: { ...Typography.body },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  slot: {
    width: '30%',
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 2,
  },
  slotTime: { ...Typography.badge },
  slotIcon: { fontSize: 12 },
  legend: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.one,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  legendDot: { width: 8, height: 8, borderRadius: BorderRadius.full },
  legendText: { ...Typography.caption },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    margin: Spacing.three,
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
  },
  disclaimerIcon: { fontSize: 16 },
  disclaimerText: { ...Typography.caption, flex: 1, lineHeight: 18 },
});
