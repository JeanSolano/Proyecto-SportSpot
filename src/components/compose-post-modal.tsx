import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BorderRadius, Shadows, Spacing, Typography } from '@/constants/theme';
import { getMisEstablecimientos } from '@/data/establecimientos';
import { crearPublicacion } from '@/data/publicaciones';
import { useTheme } from '@/hooks/use-theme';

type Tipo = 'publicacion' | 'evento' | 'promocion';
const TIPOS: { key: Tipo; label: string }[] = [
  { key: 'publicacion', label: 'Publicación' },
  { key: 'evento', label: 'Evento' },
  { key: 'promocion', label: 'Promoción' },
];

export default function ComposePostModal({
  visible,
  onClose,
  onPublished,
}: {
  visible: boolean;
  onClose: () => void;
  onPublished: () => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [ests, setEsts] = useState<{ id: string; nombre: string }[]>([]);
  const [loadingEsts, setLoadingEsts] = useState(true);
  const [estId, setEstId] = useState('');
  const [tipo, setTipo] = useState<Tipo>('publicacion');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    setLoadingEsts(true); setError('');
    setTipo('publicacion'); setTitulo(''); setDescripcion(''); setImagen(null);
    getMisEstablecimientos()
      .then((list) => { setEsts(list); setEstId(list[0]?.id || ''); })
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudieron cargar tus establecimientos.'))
      .finally(() => setLoadingEsts(false));
  }, [visible]);

  const elegirFoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { setError('Necesitamos permiso para acceder a tus fotos.'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.4,
      base64: true,
    });
    if (res.canceled || !res.assets?.[0]?.base64) return;
    setImagen(`data:image/jpeg;base64,${res.assets[0].base64}`);
  };

  const publicar = async () => {
    setError('');
    if (!estId) return setError('No tienes un establecimiento para publicar.');
    if (!titulo.trim()) return setError('Escribe un título.');
    setSaving(true);
    try {
      await crearPublicacion({ id_establecimiento: estId, tipo, titulo: titulo.trim(), descripcion: descripcion.trim(), imagen });
      onPublished();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo publicar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={[s.screen, { backgroundColor: theme.background }]}>
        <View style={[s.header, { paddingTop: insets.top + Spacing.two, borderBottomColor: theme.border }]}>
          <Pressable onPress={onClose} hitSlop={10} style={s.headerBtn}>
            <Text style={[s.headerBtnText, { color: theme.text }]}>Cancelar</Text>
          </Pressable>
          <Text style={[s.headerTitle, { color: theme.text }]}>Nueva publicación</Text>
          <View style={s.headerBtn} />
        </View>

        {loadingEsts ? (
          <View style={s.center}><ActivityIndicator size="large" color={theme.primary} /></View>
        ) : ests.length === 0 ? (
          <View style={s.center}>
            <Text style={[s.emptyTitle, { color: theme.text }]}>No tienes establecimientos</Text>
            <Text style={[s.emptyText, { color: theme.textSecondary }]}>
              Registra tu establecimiento desde el panel web para poder publicar.
            </Text>
          </View>
        ) : (
          <>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.three, paddingBottom: insets.bottom + 100 }}>
              {/* Establecimiento (si hay más de uno) */}
              {ests.length > 1 && (
                <>
                  <Text style={[s.label, { color: theme.text }]}>Establecimiento</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillRow}>
                    {ests.map((e) => {
                      const active = e.id === estId;
                      return (
                        <Pressable key={e.id} onPress={() => setEstId(e.id)}
                          style={[s.pill, { backgroundColor: active ? theme.primary : theme.backgroundElement }]}>
                          <Text style={[s.pillText, { color: active ? '#fff' : theme.textSecondary }]}>{e.nombre}</Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </>
              )}

              {/* Tipo */}
              <Text style={[s.label, { color: theme.text }]}>Tipo</Text>
              <View style={s.tipoRow}>
                {TIPOS.map((t) => {
                  const active = t.key === tipo;
                  return (
                    <Pressable key={t.key} onPress={() => setTipo(t.key)}
                      style={[s.tipoChip, { borderColor: active ? theme.primary : theme.border, backgroundColor: active ? theme.primary : theme.surface }]}>
                      <Text style={[s.tipoText, { color: active ? '#fff' : theme.text }]}>{t.label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Título */}
              <Text style={[s.label, { color: theme.text }]}>Título</Text>
              <TextInput
                style={[s.input, { color: theme.text, backgroundColor: theme.inputBackground, borderColor: theme.border }]}
                placeholder="Ej. Así se vivió el torneo del sábado"
                placeholderTextColor={theme.textTertiary}
                value={titulo} onChangeText={setTitulo} maxLength={150}
              />

              {/* Descripción */}
              <Text style={[s.label, { color: theme.text }]}>Descripción</Text>
              <TextInput
                style={[s.input, s.textarea, { color: theme.text, backgroundColor: theme.inputBackground, borderColor: theme.border }]}
                placeholder="Cuenta los detalles…"
                placeholderTextColor={theme.textTertiary}
                value={descripcion} onChangeText={setDescripcion} multiline
              />

              {/* Foto */}
              <Text style={[s.label, { color: theme.text }]}>Foto (opcional)</Text>
              {imagen ? (
                <View style={s.photoWrap}>
                  <Image source={{ uri: imagen }} style={s.photo} contentFit="cover" />
                  <Pressable onPress={() => setImagen(null)} style={s.photoDel} hitSlop={8}>
                    <Text style={s.photoDelText}>✕</Text>
                  </Pressable>
                </View>
              ) : (
                <TouchableOpacity onPress={elegirFoto} style={[s.photoBtn, { borderColor: theme.border }]} activeOpacity={0.7}>
                  <Text style={[s.photoBtnText, { color: theme.textSecondary }]}>＋ Agregar foto de la galería</Text>
                </TouchableOpacity>
              )}

              {error !== '' && (
                <View style={[s.errorBox, { backgroundColor: theme.error + '1A', borderColor: theme.error }]}>
                  <Text style={[s.errorText, { color: theme.error }]}>{error}</Text>
                </View>
              )}
            </ScrollView>

            <View style={[s.bottomBar, { backgroundColor: theme.background, borderTopColor: theme.border, paddingBottom: insets.bottom + Spacing.two }]}>
              <TouchableOpacity
                disabled={saving || !titulo.trim()}
                onPress={publicar}
                activeOpacity={0.85}
                style={[s.primaryBtn, { backgroundColor: theme.primary, opacity: saving || !titulo.trim() ? 0.5 : 1 }]}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryBtnText}>Publicar</Text>}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four, gap: Spacing.two },
  emptyTitle: { ...Typography.subheading },
  emptyText: { ...Typography.body, textAlign: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.three, paddingBottom: Spacing.two, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: { minWidth: 70 },
  headerBtnText: { ...Typography.body },
  headerTitle: { ...Typography.subheading, flex: 1, textAlign: 'center' },

  label: { ...Typography.subheading, marginTop: Spacing.three, marginBottom: Spacing.two },
  pillRow: { gap: Spacing.two, paddingBottom: Spacing.one },
  pill: { minHeight: 34, justifyContent: 'center', paddingHorizontal: Spacing.three, borderRadius: BorderRadius.full },
  pillText: { ...Typography.bodyBold },

  tipoRow: { flexDirection: 'row', gap: Spacing.two },
  tipoChip: { flex: 1, alignItems: 'center', paddingVertical: Spacing.two, borderRadius: BorderRadius.sm, borderWidth: 1.5 },
  tipoText: { ...Typography.bodyBold },

  input: { borderWidth: 1, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, minHeight: 46, ...Typography.body },
  textarea: { minHeight: 90, textAlignVertical: 'top', paddingTop: Spacing.two },

  photoBtn: { minHeight: 52, borderRadius: BorderRadius.sm, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  photoBtnText: { ...Typography.bodyBold },
  photoWrap: { borderRadius: BorderRadius.md, overflow: 'hidden' },
  photo: { width: '100%', height: 190 },
  photoDel: { position: 'absolute', top: Spacing.two, right: Spacing.two, width: 30, height: 30, borderRadius: BorderRadius.full, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  photoDelText: { color: '#fff', fontWeight: '700' },

  errorBox: { marginTop: Spacing.three, padding: Spacing.three, borderRadius: BorderRadius.sm, borderWidth: 1 },
  errorText: { ...Typography.body },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: Spacing.three, paddingTop: Spacing.two, borderTopWidth: StyleSheet.hairlineWidth },
  primaryBtn: { minHeight: 52, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { ...Typography.bodyBold, color: '#fff', fontSize: 16 },
});
