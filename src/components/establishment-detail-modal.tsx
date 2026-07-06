import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
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
import { getEstablecimiento, type Cancha, type EstablecimientoDetalle } from '@/data/establecimientos';
import { sportColor } from '@/data/sports';
import { useTheme } from '@/hooks/use-theme';
import ReservaModal from './reserva-modal';

const DAYS_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const hm = (t: string) => String(t).slice(0, 5);

// wa.me necesita el numero en formato internacional sin '+'. Panama = 507.
function whatsappUrl(telefono: string, nombre: string): string {
  const digits = telefono.replace(/\D/g, '');
  const full = digits.length <= 8 ? `507${digits}` : digits;
  const texto = `Hola, vi ${nombre} en SportSpot y quiero información para reservar.`;
  return `https://wa.me/${full}?text=${encodeURIComponent(texto)}`;
}

function initials(nombre: string): string {
  return nombre.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

export default function EstablishmentDetailModal({
  id,
  onClose,
}: {
  id: string | null;
  onClose: () => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [data, setData] = useState<EstablecimientoDetalle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reservaCancha, setReservaCancha] = useState<Cancha | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const canchasY = useRef(0);

  useEffect(() => {
    if (!id) { setData(null); return; }
    let cancelado = false;
    setLoading(true); setError(''); setData(null);
    getEstablecimiento(id)
      .then((d) => { if (!cancelado) setData(d); })
      .catch((err) => { if (!cancelado) setError(err instanceof Error ? err.message : 'No se pudo cargar.'); })
      .finally(() => { if (!cancelado) setLoading(false); });
    return () => { cancelado = true; };
  }, [id]);

  const abrir = (url: string) => Linking.openURL(url).catch(() => {});

  // Datos derivados (reales).
  const mainSport = data?.canchas[0]?.deporte;
  const accent = mainSport ? sportColor(mainSport) : theme.primary;
  const precioDesde = useMemo(() => {
    if (!data || data.canchas.length === 0) return null;
    return Math.min(...data.canchas.map((c) => c.precio_hora));
  }, [data]);
  const deportesUnicos = useMemo(() => {
    if (!data) return [] as string[];
    return [...new Set(data.canchas.map((c) => c.deporte))];
  }, [data]);
  const abiertoHoy = useMemo(() => {
    if (!data) return false;
    const dow = new Date().getDay();
    return data.canchas.some((c) => c.horarios.some((h) => h.dia_semana === dow && !h.bloqueado));
  }, [data]);

  const onReservar = () => {
    if (!data) return;
    if (data.canchas.length === 1) setReservaCancha(data.canchas[0]);
    else scrollRef.current?.scrollTo({ y: Math.max(0, canchasY.current - 12), animated: true });
  };

  return (
    <Modal visible={!!id} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={[st.screen, { backgroundColor: theme.background }]}>
        {/* Botón cerrar fijo */}
        <Pressable style={[st.closeBtn, { top: insets.top + Spacing.two }]} onPress={onClose} hitSlop={8} accessibilityLabel="Cerrar">
          <View style={st.closeCircle}><Text style={st.closeArrow}>←</Text></View>
        </Pressable>

        {loading && <View style={st.center}><ActivityIndicator size="large" color={theme.primary} /></View>}

        {!loading && error !== '' && (
          <View style={st.center}>
            <Text style={[st.stateTitle, { color: theme.text }]}>No se pudo cargar</Text>
            <Text style={[st.stateText, { color: theme.textSecondary }]}>{error}</Text>
            <TouchableOpacity onPress={onClose} style={[st.primaryBtn, { backgroundColor: theme.primary }]}>
              <Text style={st.primaryBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && data && (
          <>
            <ScrollView
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}>
              {/* Encabezado con gradiente de marca por deporte */}
              <LinearGradient
                colors={[accent, '#1B2880']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[st.hero, { paddingTop: insets.top + Spacing.six }]}>
                <Text style={st.heroWatermark} numberOfLines={1}>{initials(data.nombre)}</Text>
                <View style={st.heroBadges}>
                  {mainSport && <View style={st.sportBadge}><Text style={st.sportBadgeText}>{mainSport}</Text></View>}
                  {abiertoHoy && <View style={st.availBadge}><Text style={st.availText}>Disponible hoy</Text></View>}
                </View>
                <Text style={st.heroName}>{data.nombre}</Text>
                <Text style={st.heroAddress}>{data.direccion}</Text>
                <Text style={st.heroOwner}>por {data.dueno}</Text>
              </LinearGradient>

              {/* Tira de stats reales */}
              <View style={st.statsRow}>
                <Stat value={String(data.canchas.length)} label={data.canchas.length === 1 ? 'Cancha' : 'Canchas'} theme={theme} />
                <Stat value={precioDesde != null ? `$${precioDesde.toFixed(0)}` : '—'} label="Desde /h" theme={theme} accent />
                <Stat value={String(deportesUnicos.length)} label={deportesUnicos.length === 1 ? 'Deporte' : 'Deportes'} theme={theme} />
              </View>

              <View style={st.body}>
                {/* Contacto */}
                {data.telefono ? (
                  <View style={st.contactRow}>
                    <TouchableOpacity
                      style={[st.contactBtn, { backgroundColor: '#25D366' }]}
                      activeOpacity={0.85}
                      onPress={() => abrir(whatsappUrl(data.telefono!, data.nombre))}
                      accessibilityLabel="Contactar por WhatsApp">
                      <Text style={st.contactBtnText}>WhatsApp</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[st.contactBtn, { backgroundColor: theme.backgroundElement }]}
                      activeOpacity={0.85}
                      onPress={() => abrir(`tel:${data.telefono!.replace(/\s/g, '')}`)}
                      accessibilityLabel="Llamar">
                      <Text style={[st.contactBtnText, { color: theme.text }]}>Llamar {data.telefono}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={[st.noPhone, { color: theme.textTertiary }]}>Este establecimiento no registró teléfono de contacto.</Text>
                )}

                {/* Descripción */}
                {data.descripcion ? (
                  <Section title="Descripción" theme={theme}>
                    <Text style={[st.desc, { color: theme.textSecondary }]}>{data.descripcion}</Text>
                  </Section>
                ) : null}

                {/* Horario de operación */}
                {data.horario_operacion.length > 0 && (
                  <Section title="Horario" theme={theme}>
                    <View style={[st.card, { backgroundColor: theme.surface }, Shadows.card]}>
                      {data.horario_operacion.map((h) => (
                        <View key={h.dia_semana} style={st.scheduleRow}>
                          <Text style={[st.scheduleDay, { color: theme.text }]}>{DAYS_FULL[h.dia_semana]}</Text>
                          <Text style={[st.scheduleHours, { color: theme.textSecondary }]}>{hm(h.hora_apertura)} – {hm(h.hora_cierre)}</Text>
                        </View>
                      ))}
                    </View>
                  </Section>
                )}

                {/* Amenidades */}
                {data.amenidades.length > 0 && (
                  <Section title="Amenidades" theme={theme}>
                    <View style={st.chipWrap}>
                      {data.amenidades.map((a) => (
                        <View key={a.id_amenidad} style={[st.amenityChip, { backgroundColor: theme.backgroundElement }]}>
                          <Text style={[st.amenityText, { color: theme.text }]}>{a.nombre}</Text>
                        </View>
                      ))}
                    </View>
                  </Section>
                )}

                {/* Canchas */}
                <View onLayout={(e) => { canchasY.current = e.nativeEvent.layout.y; }}>
                  <Section title={`Canchas (${data.canchas.length})`} theme={theme}>
                    {data.canchas.length === 0 ? (
                      <Text style={[st.desc, { color: theme.textTertiary }]}>Aún no hay canchas registradas.</Text>
                    ) : (
                      <View style={{ gap: Spacing.two }}>
                        {data.canchas.map((c) => (
                          <View key={c.id_cancha} style={[st.courtCard, { backgroundColor: theme.surface }, Shadows.card]}>
                            <View style={[st.courtDot, { backgroundColor: sportColor(c.deporte) }]} />
                            <View style={{ flex: 1 }}>
                              <Text style={[st.courtName, { color: theme.text }]}>{c.nombre}</Text>
                              <Text style={[st.courtMeta, { color: theme.textSecondary }]}>{c.deporte} · ${c.precio_hora.toFixed(2)}/h</Text>
                            </View>
                            <TouchableOpacity
                              style={[st.reserveBtn, { backgroundColor: theme.primary }]}
                              activeOpacity={0.85}
                              onPress={() => setReservaCancha(c)}
                              accessibilityLabel={`Reservar ${c.nombre}`}>
                              <Text style={st.reserveText}>Reservar</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                  </Section>
                </View>
              </View>
            </ScrollView>

            {/* Barra inferior fija */}
            {data.canchas.length > 0 && (
              <View style={[st.bottomBar, { backgroundColor: theme.background, borderTopColor: theme.border, paddingBottom: insets.bottom + Spacing.two }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[st.barLabel, { color: theme.textSecondary }]}>Desde</Text>
                  <Text style={[st.barPrice, { color: theme.text }]}>${(precioDesde ?? 0).toFixed(2)}<Text style={st.barPer}>/h</Text></Text>
                </View>
                <TouchableOpacity style={[st.barBtn, { backgroundColor: theme.primary }]} activeOpacity={0.85} onPress={onReservar}>
                  <Text style={st.barBtnText}>Reservar cancha</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Flujo de reserva */}
        <ReservaModal cancha={reservaCancha} establecimiento={data?.nombre ?? ''} onClose={() => setReservaCancha(null)} />
      </View>
    </Modal>
  );
}

function Stat({ value, label, theme, accent }: { value: string; label: string; theme: any; accent?: boolean }) {
  return (
    <View style={[st.statCard, { backgroundColor: theme.surface }, Shadows.card]}>
      <Text style={[st.statValue, { color: accent ? theme.primary : theme.text }]}>{value}</Text>
      <Text style={[st.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

function Section({ title, theme, children }: { title: string; theme: any; children: React.ReactNode }) {
  return (
    <View style={st.section}>
      <Text style={[st.sectionTitle, { color: theme.text }]}>{title}</Text>
      {children}
    </View>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four, gap: Spacing.two },
  stateTitle: { ...Typography.subheading },
  stateText: { ...Typography.body, textAlign: 'center' },

  closeBtn: { position: 'absolute', left: Spacing.three, zIndex: 10 },
  closeCircle: {
    width: 38, height: 38, borderRadius: BorderRadius.full, backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4,
  },
  closeArrow: { fontSize: 20, color: '#333', lineHeight: 24 },

  hero: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.five, gap: 2 },
  heroWatermark: { position: 'absolute', right: Spacing.three, bottom: Spacing.three, fontSize: 120, fontWeight: '800', color: 'rgba(255,255,255,0.10)' },
  heroBadges: { flexDirection: 'row', gap: Spacing.two, marginBottom: Spacing.two },
  sportBadge: { backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: Spacing.two, paddingVertical: 5, borderRadius: BorderRadius.sm },
  sportBadgeText: { ...Typography.badge, color: '#fff' },
  availBadge: { backgroundColor: 'rgba(255,255,255,0.92)', paddingHorizontal: Spacing.two, paddingVertical: 5, borderRadius: BorderRadius.full },
  availText: { ...Typography.badge, color: '#0A7B34' },
  heroName: { ...Typography.displayMd, color: '#fff' },
  heroAddress: { ...Typography.body, color: 'rgba(255,255,255,0.92)' },
  heroOwner: { ...Typography.caption, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: Spacing.two, paddingHorizontal: Spacing.three, marginTop: -Spacing.four },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing.three, borderRadius: BorderRadius.md, gap: 2 },
  statValue: { ...Typography.heading, fontVariant: ['tabular-nums'] },
  statLabel: { ...Typography.badge },

  body: { padding: Spacing.three, gap: Spacing.one },
  contactRow: { flexDirection: 'row', gap: Spacing.two },
  contactBtn: { flex: 1, minHeight: 46, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.two },
  contactBtnText: { ...Typography.bodyBold, color: '#fff' },
  noPhone: { ...Typography.caption, marginBottom: Spacing.two },

  section: { marginTop: Spacing.four, gap: Spacing.two },
  sectionTitle: { ...Typography.subheading },
  desc: { ...Typography.body, lineHeight: 22 },

  card: { borderRadius: BorderRadius.md, padding: Spacing.three, gap: Spacing.two },
  scheduleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scheduleDay: { ...Typography.body },
  scheduleHours: { ...Typography.body, fontVariant: ['tabular-nums'] },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  amenityChip: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: BorderRadius.sm },
  amenityText: { ...Typography.caption },

  courtCard: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.md, padding: Spacing.three, gap: Spacing.two },
  courtDot: { width: 10, height: 10, borderRadius: BorderRadius.full },
  courtName: { ...Typography.bodyBold },
  courtMeta: { ...Typography.caption, marginTop: 2 },
  reserveBtn: { minHeight: 40, paddingHorizontal: Spacing.four, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  reserveText: { ...Typography.bodyBold, color: '#fff' },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.three,
    paddingHorizontal: Spacing.three, paddingTop: Spacing.two, borderTopWidth: StyleSheet.hairlineWidth,
  },
  barLabel: { ...Typography.badge },
  barPrice: { ...Typography.heading, fontVariant: ['tabular-nums'] },
  barPer: { ...Typography.caption, fontWeight: '400' },
  barBtn: { minHeight: 50, paddingHorizontal: Spacing.five, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  barBtnText: { ...Typography.bodyBold, color: '#fff', fontSize: 16 },

  primaryBtn: { minHeight: 46, paddingHorizontal: Spacing.five, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.two },
  primaryBtnText: { ...Typography.bodyBold, color: '#fff' },
});
