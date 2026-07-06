import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ExploreModal from '@/components/explore-modal';
import { BorderRadius, Shadows, Spacing, Typography } from '@/constants/theme';
import { FEED, type FeedItem } from '@/data/mock-feed';
import { useTheme } from '@/hooks/use-theme';

// ─── Tarjeta del feed (publicación / evento) ──────────────────────────────────
function FeedCard({ item, liked, onLike }: { item: FeedItem; liked: boolean; onLike: () => void }) {
  const theme = useTheme();
  const esEvento = item.tipo === 'evento';

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }, Shadows.card]}>
      {/* Autor */}
      <View style={styles.authorRow}>
        <View style={[styles.avatar, { backgroundColor: item.autorColor }]}>
          <Text style={styles.avatarText}>{item.autorInicial}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.author, { color: theme.text }]} numberOfLines={1}>{item.autor}</Text>
          <Text style={[styles.time, { color: theme.textTertiary }]}>{item.tiempo}</Text>
        </View>
        {esEvento && (
          <View style={[styles.typeBadge, { backgroundColor: theme.backgroundSelected }]}>
            <Text style={[styles.typeBadgeText, { color: theme.primary }]}>Evento</Text>
          </View>
        )}
      </View>

      {/* Imagen */}
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.imagen }} style={styles.image} contentFit="cover" transition={250} />
        <View style={[styles.sportBadge, { backgroundColor: item.deporteColor }]}>
          <Text style={styles.sportBadgeText}>{item.deporte}</Text>
        </View>
        {esEvento && item.fechaEvento && (
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.dateOverlay}>
            <Text style={styles.dateText}>📅 {item.fechaEvento}</Text>
          </LinearGradient>
        )}
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{item.titulo}</Text>
        <Text style={[styles.desc, { color: theme.textSecondary }]}>{item.descripcion}</Text>

        <View style={styles.footer}>
          <Pressable onPress={onLike} hitSlop={8} style={styles.footerBtn} accessibilityRole="button" accessibilityLabel="Me gusta">
            <Text style={[styles.footerIcon, { color: liked ? '#E63946' : theme.textSecondary }]}>{liked ? '♥' : '♡'}</Text>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>{item.likes + (liked ? 1 : 0)}</Text>
          </Pressable>
          <View style={styles.footerBtn}>
            <Text style={[styles.footerIcon, { color: theme.textSecondary }]}>💬</Text>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>{item.comentarios}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Pantalla Inicio (feed) ───────────────────────────────────────────────────
export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [explore, setExplore] = useState(false);

  const toggleLike = (id: string) => setLikes((p) => ({ ...p, [id]: !p[id] }));

  const header = (
    <View>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
        <View style={styles.brandRow}>
          <Image source={require('@/assets/images/logo-official.png')} style={styles.brandLogo} contentFit="contain" />
          <Text style={[styles.brandName, { color: theme.navy }]}>SportSpot</Text>
        </View>
      </View>

      {/* Botón de buscar -> pantalla de establecimientos reales */}
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
        data={FEED}
        keyExtractor={(f) => f.id}
        ListHeaderComponent={header}
        renderItem={({ item }) => <FeedCard item={item} liked={!!likes[item.id]} onLike={() => toggleLike(item.id)} />}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + Spacing.six }]}
        showsVerticalScrollIndicator={false}
      />

      <ExploreModal visible={explore} onClose={() => setExplore(false)} />
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
  desc: { ...Typography.body, lineHeight: 21 },
  footer: { flexDirection: 'row', gap: Spacing.four, marginTop: Spacing.one },
  footerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerIcon: { fontSize: 18 },
  footerText: { ...Typography.caption },
});
