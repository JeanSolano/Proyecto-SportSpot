import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBookings } from '@/context/bookings';
import { BorderRadius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// ─── Date helpers ─────────────────────────────────────────────────────────────
const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

interface Day {
  key: string;
  dayName: string;
  dayNum: number;
  monthName: string;
  isToday: boolean;
}

function buildDays(count = 7): Day[] {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      key: d.toISOString().slice(0, 10),
      dayName: DAYS_ES[d.getDay()],
      dayNum: d.getDate(),
      monthName: MONTHS_ES[d.getMonth()],
      isToday: i === 0,
    };
  });
}

// ─── Mock time slots ──────────────────────────────────────────────────────────
const ALL_HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

const VENUE_TAKEN_HOURS: Record<string, number[]> = {
  '1': [9, 10, 15, 16],
  '2': [10, 11, 17, 18],
  '3': [8, 9, 14, 15],
  '4': [11, 12, 19, 20],
};

function fmt(h: number) {
  return `${String(h).padStart(2, '0')}:00`;
}

// ─── Summary row ──────────────────────────────────────────────────────────────
function SummaryRow({
  label,
  value,
  theme,
  valueColor,
}: {
  label: string;
  value: string;
  theme: { text: string; textSecondary: string };
  valueColor?: string;
}) {
  return (
    <View style={s.summaryRow}>
      <Text style={[s.summaryLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[s.summaryValue, { color: valueColor ?? theme.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
type Phase = 'form' | 'loading' | 'success';
const DAYS = buildDays(7);

export default function BookingModal() {
  const { bookingVenue, closeBooking, addBooking } = useBookings();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [dateIdx, setDateIdx] = useState(0);
  const [hour, setHour] = useState<number | null>(null);
  const [duration, setDuration] = useState<1 | 2 | 3>(1);
  const [phase, setPhase] = useState<Phase>('form');
  const [confirmationId, setConfirmationId] = useState('');

  // Reset form whenever a new venue is opened
  useEffect(() => {
    if (bookingVenue) {
      setDateIdx(0);
      setHour(null);
      setDuration(1);
      setPhase('form');
      setConfirmationId('');
    }
  }, [bookingVenue?.id]);

  const venue = bookingVenue;

  const takenHours = venue ? (VENUE_TAKEN_HOURS[venue.id] ?? []) : [];
  const selectedDay = DAYS[dateIdx];
  const totalPrice = venue ? venue.pricePerHour * duration : 0;
  const canConfirm = hour !== null && phase === 'form';

  const startLabel = hour !== null ? fmt(hour) : '--:--';
  const endLabel = hour !== null ? fmt(hour + duration) : '--:--';
  const dateLabelFull = selectedDay.isToday
    ? `Hoy, ${selectedDay.dayNum} ${selectedDay.monthName}`
    : `${selectedDay.dayName}, ${selectedDay.dayNum} ${selectedDay.monthName}`;

  // Time slot grid: 3 columns
  const slotW = (width - Spacing.three * 2 - Spacing.two * 2) / 3;

  function handleConfirm() {
    if (!canConfirm || !venue || hour === null) return;
    const id = `SP-${Math.floor(100000 + Math.random() * 900000)}`;
    setConfirmationId(id);
    setPhase('loading');
    setTimeout(() => {
      addBooking({
        venueId: venue.id,
        venueName: venue.venueName,
        sport: venue.sport,
        sportColor: venue.sportColor,
        imageUrl: venue.imageUrl,
        location: venue.location,
        dateKey: selectedDay.key,
        dateLabel: dateLabelFull,
        startTime: fmt(hour),
        endTime: fmt(hour + duration),
        duration,
        pricePerHour: venue.pricePerHour,
        totalPrice,
      });
      setPhase('success');
    }, 900);
  }

  function handleClose() {
    closeBooking();
    setTimeout(() => {
      setPhase('form');
      setHour(null);
      setDateIdx(0);
      setDuration(1);
    }, 350);
  }

  return (
    <Modal
      visible={!!venue}
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent>
      <View style={[s.screen, { backgroundColor: theme.background }]}>

        {/* ── Form / Loading ─────────────────────────────────────── */}
        {phase !== 'success' && venue && (
          <>
            {/* Header */}
            <View style={[s.header, { paddingTop: insets.top + Spacing.two }]}>
              <Pressable onPress={handleClose} style={s.backBtn} hitSlop={8}>
                <Text style={[s.backArrow, { color: theme.text }]}>←</Text>
              </Pressable>
              <Text style={[s.headerTitle, { color: theme.text }]}>Reservar Cancha</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 88 }}>

              {/* Venue mini card */}
              <View style={[s.venueCard, { backgroundColor: theme.surface }, Shadows.card]}>
                <View style={s.venueThumb}>
                  <Image source={{ uri: venue.imageUrl }} style={s.venueImg} contentFit="cover" />
                  <View style={[s.sportChip, { backgroundColor: venue.sportColor }]}>
                    <Text style={s.sportChipText}>{venue.sport}</Text>
                  </View>
                </View>
                <View style={s.venueInfo}>
                  <Text style={[s.venueName, { color: theme.text }]} numberOfLines={2}>
                    {venue.venueName}
                  </Text>
                  <Text style={[s.venueMeta, { color: theme.textSecondary }]}>
                    ★ {venue.rating}  📍 {venue.location}
                  </Text>
                  <Text style={[s.venuePrice, { color: theme.primary }]}>
                    ${venue.pricePerHour}/hora
                  </Text>
                </View>
              </View>

              {/* Date selector */}
              <View style={s.section}>
                <Text style={[s.sectionTitle, { color: theme.text }]}>📅 Fecha</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.dateRow}>
                  {DAYS.map((day, i) => {
                    const active = i === dateIdx;
                    return (
                      <Pressable
                        key={day.key}
                        onPress={() => { setDateIdx(i); setHour(null); }}
                        style={[
                          s.dayChip,
                          { borderColor: active ? theme.primary : theme.border },
                          active && { backgroundColor: theme.primary },
                        ]}>
                        <Text style={[s.dayName, { color: active ? '#fff' : theme.textSecondary }]}>
                          {day.isToday ? 'Hoy' : day.dayName}
                        </Text>
                        <Text style={[s.dayNum, { color: active ? '#fff' : theme.text }]}>
                          {day.dayNum}
                        </Text>
                        <Text style={[s.dayMonth, { color: active ? 'rgba(255,255,255,0.75)' : theme.textTertiary }]}>
                          {day.monthName}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Time slot grid */}
              <View style={s.section}>
                <Text style={[s.sectionTitle, { color: theme.text }]}>🕐 Hora de inicio</Text>
                <View style={s.slotGrid}>
                  {ALL_HOURS.map(h => {
                    const taken = takenHours.includes(h);
                    const selected = hour === h;
                    return (
                      <Pressable
                        key={h}
                        disabled={taken}
                        onPress={() => setHour(selected ? null : h)}
                        style={[
                          s.slotChip,
                          {
                            width: slotW,
                            backgroundColor: selected
                              ? theme.primary
                              : taken
                                ? theme.backgroundElement
                                : theme.surface,
                            borderColor: selected ? theme.primary : theme.border,
                            opacity: taken ? 0.45 : 1,
                          },
                          Shadows.card,
                        ]}>
                        <Text style={[
                          s.slotTime,
                          { color: selected ? '#fff' : taken ? theme.textTertiary : theme.text },
                        ]}>
                          {fmt(h)}
                        </Text>
                        {taken && (
                          <Text style={[s.slotTaken, { color: theme.textTertiary }]}>No disp.</Text>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Duration selector */}
              <View style={s.section}>
                <Text style={[s.sectionTitle, { color: theme.text }]}>⏱ Duración</Text>
                <View style={s.durationRow}>
                  {([1, 2, 3] as const).map(d => {
                    const active = duration === d;
                    return (
                      <Pressable
                        key={d}
                        onPress={() => setDuration(d)}
                        style={[
                          s.durationChip,
                          {
                            flex: 1,
                            backgroundColor: active ? theme.primary : theme.backgroundElement,
                            borderColor: active ? theme.primary : theme.border,
                          },
                        ]}>
                        <Text style={[s.durationLabel, { color: active ? '#fff' : theme.text }]}>
                          {d}h
                        </Text>
                        <Text style={[s.durationPrice, { color: active ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>
                          ${venue.pricePerHour * d}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Price summary */}
              <View style={s.section}>
                <Text style={[s.sectionTitle, { color: theme.text }]}>📋 Resumen</Text>
                <View style={[s.summaryCard, { backgroundColor: theme.surface }, Shadows.card]}>
                  <SummaryRow label="Cancha" value={venue.venueName} theme={theme} />
                  <SummaryRow label="Fecha" value={dateLabelFull} theme={theme} />
                  <SummaryRow
                    label="Horario"
                    value={hour !== null ? `${startLabel} – ${endLabel}` : 'Selecciona una hora'}
                    theme={theme}
                    valueColor={hour !== null ? theme.text : theme.textTertiary}
                  />
                  <SummaryRow label="Duración" value={`${duration} hora${duration > 1 ? 's' : ''}`} theme={theme} />
                  <View style={[s.divider, { backgroundColor: theme.border }]} />
                  <View style={s.totalRow}>
                    <Text style={[s.totalLabel, { color: theme.text }]}>Total</Text>
                    <Text style={[s.totalValue, { color: theme.primary }]}>${totalPrice}.00</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Sticky confirm button */}
            <View style={[
              s.bottomBar,
              { paddingBottom: insets.bottom + Spacing.two, borderTopColor: theme.border, backgroundColor: theme.background },
            ]}>
              <TouchableOpacity
                disabled={!canConfirm}
                onPress={handleConfirm}
                activeOpacity={0.85}
                style={[s.confirmBtn, { opacity: canConfirm ? 1 : 0.42 }]}>
                <LinearGradient
                  colors={['#00CA4E', '#0066FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.confirmGradient}>
                  {phase === 'loading'
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={s.confirmText}>
                        {canConfirm
                          ? `Confirmar Reserva · $${totalPrice}.00`
                          : 'Selecciona una hora para continuar'}
                      </Text>
                  }
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── Success screen ────────────────────────────────────── */}
        {phase === 'success' && venue && (
          <View style={[s.successScreen, { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing.three }]}>
            <View style={s.successIconWrap}>
              <LinearGradient colors={['#00CA4E', '#0066FF']} style={s.successIconGradient}>
                <Text style={s.successCheck}>✓</Text>
              </LinearGradient>
            </View>

            <Text style={[s.successTitle, { color: theme.text }]}>¡Reserva Confirmada!</Text>
            <Text style={[s.successId, { color: theme.textSecondary }]}>
              N.º {confirmationId}
            </Text>

            <View style={[s.successCard, { backgroundColor: theme.surface }, Shadows.card]}>
              <View style={s.successVenueRow}>
                <Image source={{ uri: venue.imageUrl }} style={s.successImg} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <Text style={[s.venueName, { color: theme.text }]} numberOfLines={2}>
                    {venue.venueName}
                  </Text>
                  <Text style={[s.venueMeta, { color: theme.textSecondary }]}>
                    {venue.sport}  ·  📍 {venue.location}
                  </Text>
                </View>
              </View>
              <View style={[s.divider, { backgroundColor: theme.border, marginVertical: Spacing.two }]} />
              <SummaryRow label="Fecha" value={dateLabelFull} theme={theme} />
              <SummaryRow label="Horario" value={`${startLabel} – ${endLabel}`} theme={theme} />
              <SummaryRow label="Duración" value={`${duration} hora${duration > 1 ? 's' : ''}`} theme={theme} />
              <View style={[s.divider, { backgroundColor: theme.border }]} />
              <View style={s.totalRow}>
                <Text style={[s.totalLabel, { color: theme.text }]}>Total pagado</Text>
                <Text style={[s.totalValue, { color: theme.primary }]}>${totalPrice}.00</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleClose}
              activeOpacity={0.85}
              style={s.doneBtn}>
              <LinearGradient
                colors={['#00CA4E', '#0066FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.confirmGradient}>
                <Text style={s.confirmText}>Listo</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={[s.successHint, { color: theme.textTertiary }]}>
              Puedes ver y cancelar tus reservas en tu Perfil
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  backArrow: { fontSize: 24 },
  headerTitle: { ...Typography.subheading, flex: 1, textAlign: 'center' },

  // Venue card
  venueCard: {
    flexDirection: 'row',
    margin: Spacing.three,
    borderRadius: BorderRadius.md,
    padding: Spacing.two,
    gap: Spacing.two,
  },
  venueThumb: { width: 88, height: 88, borderRadius: BorderRadius.sm, overflow: 'hidden' },
  venueImg: { width: '100%', height: '100%' },
  sportChip: {
    position: 'absolute', top: 4, left: 4,
    paddingHorizontal: 4, paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  sportChipText: { ...Typography.badge, color: '#fff' },
  venueInfo: { flex: 1, justifyContent: 'center', gap: 4 },
  venueName: { ...Typography.bodyBold, lineHeight: 20 },
  venueMeta: { ...Typography.caption },
  venuePrice: { ...Typography.bodyBold },

  // Sections
  section: { paddingHorizontal: Spacing.three, marginBottom: Spacing.four },
  sectionTitle: { ...Typography.subheading, marginBottom: Spacing.two },

  // Date chips
  dateRow: { gap: Spacing.two, paddingRight: Spacing.three },
  dayChip: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    minWidth: 62,
  },
  dayName: { ...Typography.badge },
  dayNum: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  dayMonth: { ...Typography.badge },

  // Time slots
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  slotChip: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
  },
  slotTime: { ...Typography.bodyBold },
  slotTaken: { ...Typography.badge, marginTop: 2 },

  // Duration
  durationRow: { flexDirection: 'row', gap: Spacing.two },
  durationChip: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    gap: 2,
  },
  durationLabel: { ...Typography.bodyBold },
  durationPrice: { ...Typography.caption },

  // Summary card
  summaryCard: { borderRadius: BorderRadius.md, padding: Spacing.three, gap: Spacing.two },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { ...Typography.caption },
  summaryValue: { ...Typography.bodyBold, flex: 1, textAlign: 'right', marginLeft: Spacing.two },
  divider: { height: StyleSheet.hairlineWidth },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { ...Typography.subheading },
  totalValue: { ...Typography.heading },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  confirmBtn: { borderRadius: BorderRadius.sm, overflow: 'hidden' },
  confirmGradient: { height: 52, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.three },
  confirmText: { ...Typography.bodyBold, color: '#fff' },

  // Success
  successScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  successIconWrap: { width: 80, height: 80, borderRadius: BorderRadius.full, overflow: 'hidden', marginBottom: Spacing.two },
  successIconGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  successCheck: { fontSize: 38, color: '#fff', fontWeight: '700' as const },
  successTitle: { ...Typography.displayMd },
  successId: { ...Typography.body },
  successCard: {
    width: '100%',
    borderRadius: BorderRadius.md,
    padding: Spacing.three,
    gap: Spacing.two,
    marginVertical: Spacing.two,
  },
  successVenueRow: { flexDirection: 'row', gap: Spacing.two, alignItems: 'center' },
  successImg: { width: 56, height: 56, borderRadius: BorderRadius.sm },
  doneBtn: { width: '100%', borderRadius: BorderRadius.sm, overflow: 'hidden' },
  successHint: { ...Typography.caption, textAlign: 'center', marginTop: Spacing.one },
});
