import { Image } from 'expo-image';
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

import { BorderRadius, Shadows, Spacing, Typography } from '@/constants/theme';
import type { FeedItem } from '@/data/mock-feed';
import { sportLabel } from '@/data/sports';
import { useTheme } from '@/hooks/use-theme';

export default function PostModal({
  post,
  onClose,
  onVerPerfil,
}: {
  post: FeedItem | null;
  onClose: () => void;
  onVerPerfil: (establecimientoId: string) => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={!!post} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Cerrar" />
        {post && (
          <View style={[s.sheet, { backgroundColor: theme.background, paddingBottom: insets.bottom + Spacing.three }]}>
            <View style={[s.grabber, { backgroundColor: theme.border }]} />

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              {/* Autor */}
              <View style={s.authorRow}>
                {post.autorLogo ? (
                  <Image source={{ uri: post.autorLogo }} style={s.avatar} contentFit="cover" />
                ) : (
                  <View style={[s.avatar, { backgroundColor: post.autorColor }]}>
                    <Text style={s.avatarText}>{post.autorInicial}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[s.author, { color: theme.text }]} numberOfLines={1}>{post.autor}</Text>
                  <Text style={[s.time, { color: theme.textTertiary }]}>
                    {post.tipoAutor === 'establecimiento' ? 'Establecimiento' : 'Deportista'} · {post.tiempo}
                  </Text>
                </View>
              </View>

              {/* Imagen */}
              <View style={s.imageWrap}>
                <Image source={{ uri: post.imagen }} style={s.image} contentFit="cover" transition={200} />
                {post.deporte && (
                  <View style={[s.sportBadge, { backgroundColor: post.deporteColor || theme.primary }]}>
                    <Text style={s.sportBadgeText}>{sportLabel(post.deporte)}</Text>
                  </View>
                )}
              </View>

              {/* Texto */}
              <View style={s.body}>
                {post.esEvento && post.fechaEvento && (
                  <View style={[s.eventChip, { backgroundColor: theme.backgroundSelected }]}>
                    <Text style={[s.eventChipText, { color: theme.primary }]}>📅 {post.fechaEvento}</Text>
                  </View>
                )}
                {post.titulo ? <Text style={[s.postTitle, { color: theme.text }]}>{post.titulo}</Text> : null}
                {post.texto ? <Text style={[s.text, { color: theme.textSecondary }]}>{post.texto}</Text> : null}

                <View style={s.stats}>
                  <Text style={[s.statText, { color: theme.textSecondary }]}>♥ {post.likes}</Text>
                  <Text style={[s.statText, { color: theme.textSecondary }]}>💬 {post.comentarios}</Text>
                </View>
              </View>
            </ScrollView>

            {/* Acciones */}
            {post.establecimientoId ? (
              <TouchableOpacity
                style={[s.primaryBtn, { backgroundColor: theme.primary }]}
                activeOpacity={0.85}
                onPress={() => onVerPerfil(post.establecimientoId!)}>
                <Text style={s.primaryBtnText}>Ver perfil del establecimiento</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[s.ghostBtn, { borderColor: theme.border }]} activeOpacity={0.7} onPress={onClose}>
                <Text style={[s.ghostBtnText, { color: theme.textSecondary }]}>Cerrar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    maxHeight: '88%',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    ...Shadows.modal,
  },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: BorderRadius.full, marginBottom: Spacing.three },

  authorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.three },
  avatar: { width: 44, height: 44, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...Typography.bodyBold, color: '#fff' },
  author: { ...Typography.subheading },
  time: { ...Typography.caption, marginTop: 1 },

  imageWrap: { height: 260, borderRadius: BorderRadius.md, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  sportBadge: { position: 'absolute', top: Spacing.two, left: Spacing.two, paddingHorizontal: Spacing.two, paddingVertical: 4, borderRadius: BorderRadius.sm },
  sportBadgeText: { ...Typography.badge, color: '#fff' },

  body: { paddingVertical: Spacing.three, gap: Spacing.two },
  eventChip: { alignSelf: 'flex-start', paddingHorizontal: Spacing.two, paddingVertical: 5, borderRadius: BorderRadius.full },
  eventChipText: { ...Typography.badge },
  postTitle: { ...Typography.heading },
  text: { ...Typography.body, lineHeight: 22 },
  stats: { flexDirection: 'row', gap: Spacing.four, marginTop: Spacing.one },
  statText: { ...Typography.body },

  primaryBtn: { minHeight: 52, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.two },
  primaryBtnText: { ...Typography.bodyBold, color: '#fff', fontSize: 16 },
  ghostBtn: { minHeight: 50, borderRadius: BorderRadius.sm, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.two },
  ghostBtnText: { ...Typography.bodyBold },
});
