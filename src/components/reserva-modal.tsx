import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BorderRadius, Shadows, Spacing, Typography } from '@/constants/theme';
import type { Cancha } from '@/data/establecimientos';
import { crearReserva } from '@/data/reservas';
import { useTheme } from '@/hooks/use-theme';

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

interface Dia { key: string; dow: number; dayName: string; dayNum: number; monthName: string; isToday: boolean; }

function buildDays(count = 7): Dia[] {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      dow: d.getDay(),
      dayName: DAYS_ES[d.getDay()],
      dayNum: d.getDate(),
      monthName: MONTHS_ES[d.getMonth()],
      isToday: i === 0,
    };
  });
}

const hh = (h: number) => `${String(h).padStart(2, '0')}:00`;
const horaNum = (t: string) => parseInt(String(t).slice(0, 2), 10);

const DAYS = buildDays(7);

export default function ReservaModal({
  cancha,
  establecimiento,
  onClose,
  onReservada,
}: {
  cancha: Cancha | null;
  establecimiento: string;
  onClose: () => void;
  onReservada?: () => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [dateIdx, setDateIdx] = useState(0);
  const [hour, setHour] = useState<number | null>(null);
  const [duration, setDuration] = useState(1);
  const [phase, setPhase] = useState<'form' | 'saving' | 'success'>('form');
  const [error, setError] = useState('');
  const [okId, setOkId] = useState('');
  const [okTotal, setOkTotal] = useState(0);

  useEffect(() => {
    if (cancha) {
      setDateIdx(0); setHour(null); setDuration(1); setPhase('form'); setError(''); setOkId('');
    }
  }, [cancha?.id_cancha]);

  const day = DAYS[dateIdx];

  // Ventanas horarias habilitadas para el dia seleccionado (no bloqueadas).
  const windows = useMemo(() => {
    if (!cancha) return [] as { s: number; e: number }[];
    return cancha.horarios
      .filter((h) => h.dia_semana === day.dow && !h.bloqueado)
      .map((h) => ({ s: horaNum(h.hora_inicio), e: horaNum(h.hora_fin) }))
      .sort((a, b) => a.s - b.s);
  }, [cancha, day.dow]);

  const startHours = useMemo(() => {
    const set = new Set<number>();
    windows.forEach((w) => { for (let h = w.s; h < w.e; h++) set.add(h); });
    return [...set].sort((a, b) => a - b);
  }, [windows]);

  const maxDuration = useMemo(() => {
    if (hour === null) return 1;
    const w = windows.find((w) => hour >= w.s && hour < w.e);
    return w ? Math.min(3, w.e - hour) : 1;
  }, [hour, windows]);

  const dur = Math.min(duration, maxDuration);
  const total = cancha ? cancha.precio_hora * dur : 0;
  const canConfirm = hour !== null && phase === 'form';

  async function confirmar() {
    if (!cancha || hour === null) return;
    setError('');
    setPhase('saving');
    try {
      const r = await crearReserva({
        id_cancha: cancha.id_cancha,
        fecha_reserva: day.key,
        hora_inicio: hh(hour),
        hora_fin: hh(hour + dur),
      });
      setOkId(r.id_reserva.slice(0, 8).toUpperCase());
      setOkTotal(r.precio_total);
      setPhase('success');
      onReservada?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la reserva.');
      setPhase('form');
    }
  }

  return (
    <Modal visible={!!cancha} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={[s.screen, { backgroundColor: theme.background }]}>
        {phase === 'success' && cancha ? (
          <View style={[s.successWrap, { paddingTop: insets.top + Spacing.six, paddingBottom: insets.bottom + Spacing.three }]}>
            <View style={[s.successCircle, { backgroundColor: theme.primary }]}>
              <Text style={s.successCheck}>✓</Text>
            </View>
            <Text style={[s.successTitle, { color: theme.text }]}>¡Reserva creada!</Text>
            <Text style={[s.successSub, { color: theme.textSecondary }]}>N.º {okId}</Text>

            <View style={[s.card, { backgroundColor: theme.surface }, Shadows.card]}>
              <Row label="Establecimiento" value={establecimiento} theme={theme} />
              <Row label="Cancha" value={cancha.nombre} theme={theme} />
              <Row label="Fecha" value={`${day.isToday ? 'Hoy' : day.dayName} ${day.dayNum} ${day.monthName}`} theme={theme} />
              <Row label="Horario" value={`${hh(hour ?? 0)} – ${hh((hour ?? 0) + dur)}`} theme={theme} />
              <View style={[s.divider, { backgroundColor: theme.border }]} />
              <Row label="Total" value={`$${okTotal.toFixed(2)}`} theme={theme} bold />
            </View>

            <Text style={[s.pendingNote, { color: theme.textSecondary }]}>
              Estado: pendiente de pago. Coordina el pago con el establecimiento.
            </Text>

            <TouchableOpacity onPress={onClose} style={[s.primaryBtn, { backgroundColor: theme.primary }]} activeOpacity={0.85}>
              <Text style={s.primaryBtnText}>Listo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          cancha && (
            <>
              <View style={[s.header, { paddingTop: insets.top + Spacing.two, borderBottomColor: theme.border }]}>
                <Pressable onPress={onClose} hitSlop={10} style={s.headerBtn}>
                  <Text style={[s.headerBtnText, { color: theme.text }]}>Cancelar</Text>
                </Pressable>
                <Text style={[s.headerTitle, { color: theme.text }]} numberOfLines={1}>Reservar</Text>
                <View style={s.headerBtn} />
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.three, paddingBottom: insets.bottom + 100 }}>
                <Text style={[s.canchaName, { color: theme.text }]}>{cancha.nombre}</Text>
                <Text style={[s.canchaMeta, { color: theme.textSecondary }]}>
                  {cancha.deporte} · ${cancha.precio_hora.toFixed(2)}/h
                </Text>

                {/* Fecha */}
                <Text style={[s.label, { color: theme.text }]}>Fecha</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dateRow}>
                  {DAYS.map((d, i) => {
                    const active = i === dateIdx;
                    return (
                      <Pressable
                        key={d.key}
                        onPress={() => { setDateIdx(i); setHour(null); }}
                        style={[s.dayChip, { borderColor: active ? theme.primary : theme.border }, active && { backgroundColor: theme.primary }]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}>
                        <Text style={[s.dayName, { color: active ? '#fff' : theme.textSecondary }]}>{d.isToday ? 'Hoy' : d.dayName}</Text>
                        <Text style={[s.dayNum, { color: active ? '#fff' : theme.text }]}>{d.dayNum}</Text>
                        <Text style={[s.dayMonth, { color: active ? 'rgba(255,255,255,0.8)' : theme.textTertiary }]}>{d.monthName}</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                {/* Hora */}
                <Text style={[s.label, { color: theme.text }]}>Hora de inicio</Text>
                {startHours.length === 0 ? (
                  <Text style={[s.emptyDay, { color: theme.textSecondary, backgroundColor: theme.backgroundElement }]}>
                    Esta cancha no tiene horario disponible este día.
                  </Text>
                ) : (
                  <View style={s.slotGrid}>
                    {startHours.map((h) => {
                      const active = hour === h;
                      return (
                        <Pressable
                          key={h}
                          onPress={() => { setHour(active ? null : h); setDuration(1); }}
                          style={[s.slot, { borderColor: active ? theme.primary : theme.border, backgroundColor: active ? theme.primary : theme.surface }]}
                          accessibilityRole="button"
                          accessibilityState={{ selected: active }}>
                          <Text style={[s.slotText, { color: active ? '#fff' : theme.text }]}>{hh(h)}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}

                {/* Duracion */}
                {hour !== null && (
                  <>
                    <Text style={[s.label, { color: theme.text }]}>Duración</Text>
                    <View style={s.durRow}>
                      {[1, 2, 3].filter((d) => d <= maxDuration).map((d) => {
                        const active = dur === d;
                        return (
                          <Pressable
                            key={d}
                            onPress={() => setDuration(d)}
                            style={[s.durChip, { borderColor: active ? theme.primary : theme.border, backgroundColor: active ? theme.primary : theme.backgroundElement }]}
                            accessibilityRole="button"
                            accessibilityState={{ selected: active }}>
                            <Text style={[s.durText, { color: active ? '#fff' : theme.text }]}>{d}h</Text>
                            <Text style={[s.durPrice, { color: active ? 'rgba(255,255,255,0.85)' : theme.textSecondary }]}>
                              ${(cancha.precio_hora * d).toFixed(2)}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </>
                )}

                {error !== '' && (
                  <View style={[s.errorBox, { backgroundColor: theme.error + '1A', borderColor: theme.error }]}>
                    <Text style={[s.errorText, { color: theme.error }]}>{error}</Text>
                  </View>
                )}
              </ScrollView>

              {/* Barra inferior */}
              <View style={[s.bottomBar, { backgroundColor: theme.background, borderTopColor: theme.border, paddingBottom: insets.bottom + Spacing.two }]}>
                <TouchableOpacity
                  disabled={!canConfirm}
                  onPress={confirmar}
                  activeOpacity={0.85}
                  style={[s.primaryBtn, { backgroundColor: theme.primary, opacity: canConfirm ? 1 : 0.45 }]}>
                  {phase === 'saving'
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={s.primaryBtnText}>{hour !== null ? `Confirmar · $${total.toFixed(2)}` : 'Selecciona una hora'}</Text>}
                </TouchableOpacity>
              </View>
            </>
          )
        )}
      </View>
    </Modal>
  );
}

function Row({ label, value, theme, bold }: { label: string; value: string; theme: any; bold?: boolean }) {
  return (
    <View style={s.row}>
      <Text style={[s.rowLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[bold ? s.rowValueBold : s.rowValue, { color: bold ? theme.primary : theme.text }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.three, paddingBottom: Spacing.two, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: { minWidth: 70 },
  headerBtnText: { ...Typography.body },
  headerTitle: { ...Typography.subheading, flex: 1, textAlign: 'center' },

  canchaName: { ...Typography.heading },
  canchaMeta: { ...Typography.body, marginTop: 2 },
  label: { ...Typography.subheading, marginTop: Spacing.four, marginBottom: Spacing.two },

  dateRow: { gap: Spacing.two, paddingRight: Spacing.three },
  dayChip: { alignItems: 'center', paddingVertical: Spacing.two, paddingHorizontal: Spacing.three, borderRadius: BorderRadius.md, borderWidth: 1.5, minWidth: 60 },
  dayName: { ...Typography.badge },
  dayNum: { fontSize: 20, fontWeight: '700', lineHeight: 26 },
  dayMonth: { ...Typography.badge },

  emptyDay: { ...Typography.body, padding: Spacing.three, borderRadius: BorderRadius.md, textAlign: 'center' },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  slot: { minWidth: 74, minHeight: 46, alignItems: 'center', justifyContent: 'center', borderRadius: BorderRadius.sm, borderWidth: 1.5 },
  slotText: { ...Typography.bodyBold },

  durRow: { flexDirection: 'row', gap: Spacing.two },
  durChip: { flex: 1, alignItems: 'center', paddingVertical: Spacing.two, borderRadius: BorderRadius.sm, borderWidth: 1.5, gap: 2 },
  durText: { ...Typography.bodyBold },
  durPrice: { ...Typography.caption },

  errorBox: { marginTop: Spacing.three, padding: Spacing.three, borderRadius: BorderRadius.sm, borderWidth: 1 },
  errorText: { ...Typography.body },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: Spacing.three, paddingTop: Spacing.two, borderTopWidth: StyleSheet.hairlineWidth },
  primaryBtn: { minHeight: 52, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.four },
  primaryBtnText: { ...Typography.bodyBold, color: '#fff', fontSize: 16 },

  // Success
  successWrap: { flex: 1, alignItems: 'center', paddingHorizontal: Spacing.three, gap: Spacing.two },
  successCircle: { width: 76, height: 76, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.two },
  successCheck: { color: '#fff', fontSize: 38, fontWeight: '700' },
  successTitle: { ...Typography.displayMd, color: undefined },
  successSub: { ...Typography.body },
  pendingNote: { ...Typography.caption, textAlign: 'center', marginTop: Spacing.two, marginBottom: Spacing.four },
  card: { width: '100%', borderRadius: BorderRadius.md, padding: Spacing.three, gap: Spacing.two, marginTop: Spacing.three },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  rowLabel: { ...Typography.caption },
  rowValue: { ...Typography.bodyBold, flex: 1, textAlign: 'right' },
  rowValueBold: { ...Typography.heading, flex: 1, textAlign: 'right' },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 2 },
});
