import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ComposePostModal from '@/components/compose-post-modal';
import EstablishmentDetailModal from '@/components/establishment-detail-modal';
import ExploreModal from '@/components/explore-modal';
import PostModal from '@/components/post-modal';
import { BorderRadius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { mezclarFeed, USER_POSTS, type FeedItem } from '@/data/mock-feed';
import { getFeedPublicaciones } from '@/data/publicaciones';
import { sportLabel } from '@/data/sports';
import { useTheme } from '@/hooks/use-theme';

// ─── Tarjeta del feed ─────────────────────────────────────────────────────────
function FeedCard({
  item,
  liked,
  onLike,
  onPress,
}: {
  item: FeedItem;
  liked: boolean;
  onLike: () => void;
  onPress: () => void;
}) {
  const theme = useTheme();
  const esEstablecimiento = item.tipoAutor === 'establecimiento';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { backgroundColor: theme.surface, opacity: pressed ? 0.96 : 1 }, Shadows.card]}
      accessibilityRole="button"
      accessibilityLabel={`Abrir publicación de ${item.autor}`}>
      {/* Autor */}
      <View style={styles.authorRow}>
        {item.autorLogo ? (
          <Image source={{ uri: item.autorLogo }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={[styles.avatar, { backgroundColor: item.autorColor }]}>
            <Text style={styles.avatarText}>{item.autorInicial}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[styles.author, { color: theme.text }]} numberOfLines={1}>{item.autor}</Text>
          <Text style={[styles.time, { color: theme.textTertiary }]}>
            {esEstablecimiento ? 'Establecimiento' : 'Deportista'} · {item.tiempo}
          </Text>
        </View>
        {item.etiqueta && (
          <View style={[styles.typeBadge, { backgroundColor: theme.backgroundSelected }]}>
            <Text style={[styles.typeBadgeText, { color: theme.primary }]}>{item.etiqueta}</Text>
          </View>
        )}
      </View>

      {/* Imagen */}
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.imagen }} style={styles.image} contentFit="cover" transition={250} />
        {item.deporte && (
          <View style={[styles.sportBadge, { backgroundColor: item.deporteColor || theme.primary }]}>
            <Text style={styles.sportBadgeText}>{sportLabel(item.deporte)}</Text>
          </View>
        )}
        {item.esEvento && item.fechaEvento && (
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.dateOverlay}>
            <Text style={styles.dateText}>📅 {item.fechaEvento}</Text>
          </LinearGradient>
        )}
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        {item.titulo ? <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>{item.titulo}</Text> : null}
        {item.texto ? (
          <Text style={[styles.text, { color: item.titulo ? theme.textSecondary : theme.text }]} numberOfLines={2}>{item.texto}</Text>
        ) : null}

        <View style={styles.footer}>
          <Pressable onPress={onLike} hitSlop={8} style={styles.footerBtn} accessibilityRole="button" accessibilityLabel="Me gusta">
            <Text style={[styles.footerIcon, { color: liked ? '#E63946' : theme.textSecondary }]}>{liked ? '♥' : '♡'}</Text>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>{item.likes + (liked ? 1 : 0)}</Text>
          </Pressable>
          <View style={styles.footerBtn}>
            <Text style={[styles.footerIcon, { color: theme.textSecondary }]}>💬</Text>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>{item.comentarios}</Text>
          </View>
          {esEstablecimiento && (
            <Text style={[styles.verMas, { color: theme.primary }]}>Ver perfil ›</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// ─── Pantalla Inicio (feed) ───────────────────────────────────────────────────
export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const { usuario } = useAuth();
  const esDueno = usuario?.rol === 'Dueno';

  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [explore, setExplore] = useState(false);
  const [compose, setCompose] = useState(false);
  const [post, setPost] = useState<FeedItem | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [estPosts, setEstPosts] = useState<FeedItem[]>([]);

  // Publicaciones reales (promociones y eventos) de los establecimientos.
  const cargarFeed = () => { getFeedPublicaciones().then(setEstPosts).catch(() => {}); };
  useEffect(() => { cargarFeed(); }, []);

  const feed = useMemo(() => (estPosts.length ? mezclarFeed(estPosts) : USER_POSTS), [estPosts]);

  const toggleLike = (id: string) => setLikes((p) => ({ ...p, [id]: !p[id] }));
  const verPerfil = (id: string) => { setPost(null); setDetailId(id); };

  const header = (
    <View>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
        <View style={styles.brandRow}>
          <Image source={require('@/assets/images/logo-official.png')} style={styles.brandLogo} contentFit="contain" />
          <Text style={[styles.brandName, { color: theme.navy }]}>SportSpot</Text>
        </View>
        {esDueno && (
          <Pressable
            onPress={() => setCompose(true)}
            style={[styles.publishBtn, { backgroundColor: theme.primary }]}
            accessibilityRole="button"
            accessibilityLabel="Crear publicación">
            <Text style={styles.publishBtnText}>＋ Publicar</Text>
          </Pressable>
        )}
      </View>

      {/* Botón de buscar -> establecimientos reales */}
      <Pressable
        onPress={() => setExplore(true)}
        style={[styles.searchBar, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}
        accessibilityRole="button"
        accessibilityLabel="Buscar establecimientos y canchas">
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={[styles.searchPlaceholder, { color: theme.textTertiary }]}>Buscar establecimientos y canchas</Text>
      </Pressable>

      <Text style={[styles.feedTitle, { color: theme.text }]}>Feed deportivo</Text>
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <FlatList
        data={feed}
        keyExtractor={(f) => f.id}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <FeedCard
            item={item}
            liked={!!likes[item.id]}
            onLike={() => toggleLike(item.id)}
            onPress={() => setPost(item)}
          />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + Spacing.six }]}
        showsVerticalScrollIndicator={false}
      />

      <PostModal post={post} onClose={() => setPost(null)} onVerPerfil={verPerfil} />
      <EstablishmentDetailModal id={detailId} onClose={() => setDetailId(null)} />
      <ExploreModal visible={explore} onClose={() => setExplore(false)} />
      <ComposePostModal visible={compose} onClose={() => setCompose(false)} onPublished={cargarFeed} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.three, paddingBottom: Spacing.two,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  brandLogo: { width: 34, height: 34 },
  brandName: { ...Typography.displayMd },
  publishBtn: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.one, borderRadius: BorderRadius.full },
  publishBtnText: { ...Typography.bodyBold, color: '#fff' },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.two,
    marginHorizontal: Spacing.three, paddingHorizontal: Spacing.three, height: 46,
    borderWidth: 1, borderRadius: BorderRadius.full,
  },
  searchIcon: { fontSize: 16 },
  searchPlaceholder: { ...Typography.body },

  feedTitle: { ...Typography.heading, paddingHorizontal: Spacing.three, paddingTop: Spacing.three, paddingBottom: Spacing.one },
  list: { paddingTop: Spacing.two, gap: Spacing.three, paddingHorizontal: Spacing.three },

  // Card
  card: { borderRadius: BorderRadius.md, overflow: 'hidden' },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, padding: Spacing.three, paddingBottom: Spacing.two },
  avatar: { width: 40, height: 40, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...Typography.bodyBold, color: '#fff' },
  author: { ...Typography.bodyBold },
  time: { ...Typography.caption, marginTop: 1 },
  typeBadge: { paddingHorizontal: Spacing.two, paddingVertical: 4, borderRadius: BorderRadius.full },
  typeBadgeText: { ...Typography.badge },

  imageWrap: { height: 200 },
  image: { width: '100%', height: '100%' },
  sportBadge: { position: 'absolute', top: Spacing.two, left: Spacing.two, paddingHorizontal: Spacing.two, paddingVertical: 4, borderRadius: BorderRadius.sm },
  sportBadgeText: { ...Typography.badge, color: '#fff' },
  dateOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: Spacing.three, paddingTop: Spacing.five, paddingBottom: Spacing.two },
  dateText: { ...Typography.bodyBold, color: '#fff' },

  content: { padding: Spacing.three, gap: Spacing.two },
  title: { ...Typography.subheading },
  text: { ...Typography.body, lineHeight: 21 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.four, marginTop: Spacing.one },
  footerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerIcon: { fontSize: 18 },
  footerText: { ...Typography.caption },
  verMas: { ...Typography.bodyBold, marginLeft: 'auto' },
});
