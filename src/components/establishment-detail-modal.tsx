import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
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

import { BorderRadius, Gradients, Shadows, Spacing, Typography } from '@/constants/theme';
import { getEstablecimiento, type Cancha, type EstablecimientoDetalle } from '@/data/establecimientos';
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

  return (
    <Modal visible={!!id} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={[st.screen, { backgroundColor: theme.background }]}>
        {/* Botón cerrar fijo */}
        <Pressable style={[st.closeBtn, { top: insets.top + Spacing.two }]} onPress={onClose} hitSlop={8} accessibilityLabel="Cerrar">
          <View style={st.closeCircle}><Text style={st.closeArrow}>←</Text></View>
        </Pressable>

        {loading && (
          <View style={st.center}><ActivityIndicator size="large" color={theme.primary} /></View>
        )}

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
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}>
            {/* Encabezado con gradiente de marca */}
            <LinearGradient
              colors={Gradients.header.colors as [string, string, ...string[]]}
              start={Gradients.header.start}
              end={Gradients.header.end}
              style={[st.hero, { paddingTop: insets.top + Spacing.six }]}>
              <Text style={st.heroName}>{data.nombre}</Text>
              <Text style={st.heroAddress}>{data.direccion}</Text>
              <Text style={st.heroOwner}>por {data.dueno}</Text>
            </LinearGradient>

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
              <Section title={`Canchas (${data.canchas.length})`} theme={theme}>
                {data.canchas.length === 0 ? (
                  <Text style={[st.desc, { color: theme.textTertiary }]}>Aún no hay canchas registradas.</Text>
                ) : (
                  <View style={{ gap: Spacing.two }}>
                    {data.canchas.map((c) => (
                      <View key={c.id_cancha} style={[st.courtCard, { backgroundColor: theme.surface }, Shadows.card]}>
                        <View style={{ flex: 1 }}>
                          <Text style={[st.courtName, { color: theme.text }]}>{c.nombre}</Text>
                          <Text style={[st.courtMeta, { color: theme.textSecondary }]}>
                            {c.deporte} · ${c.precio_hora.toFixed(2)}/h
                          </Text>
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
          </ScrollView>
        )}

        {/* Flujo de reserva */}
        <ReservaModal
          cancha={reservaCancha}
          establecimiento={data?.nombre ?? ''}
          onClose={() => setReservaCancha(null)}
        />
      </View>
    </Modal>
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

  hero: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.four, gap: 2 },
  heroName: { ...Typography.displayMd, color: '#fff' },
  heroAddress: { ...Typography.body, color: 'rgba(255,255,255,0.9)' },
  heroOwner: { ...Typography.caption, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

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
  courtName: { ...Typography.bodyBold },
  courtMeta: { ...Typography.caption, marginTop: 2 },
  reserveBtn: { minHeight: 40, paddingHorizontal: Spacing.four, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  reserveText: { ...Typography.bodyBold, color: '#fff' },

  primaryBtn: { minHeight: 46, paddingHorizontal: Spacing.five, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.two },
  primaryBtnText: { ...Typography.bodyBold, color: '#fff' },
});
