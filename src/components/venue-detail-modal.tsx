import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
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

import { useBookings } from '@/context/bookings';
import { BorderRadius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// ─── Mock data ────────────────────────────────────────────────────────────────
const AMENITIES: Record<string, { icon: string; label: string }[]> = {
  Basketball: [
    { icon: '🏀', label: 'Piso profesional' },
    { icon: '💡', label: 'Iluminación nocturna' },
    { icon: '🚿', label: 'Vestuarios' },
    { icon: '🚗', label: 'Estacionamiento' },
  ],
  Fútbol: [
    { icon: '⚽', label: 'Grama sintética' },
    { icon: '🚿', label: 'Vestuarios' },
    { icon: '🚗', label: 'Estacionamiento' },
    { icon: '☕', label: 'Cafetería' },
  ],
  Tenis: [
    { icon: '🎾', label: 'Cancha dura' },
    { icon: '💡', label: 'Iluminación' },
    { icon: '🏪', label: 'Pro shop' },
    { icon: '📚', label: 'Clases disponibles' },
  ],
  Voleibol: [
    { icon: '🏖️', label: 'Arena de playa' },
    { icon: '🚿', label: 'Duchas' },
    { icon: '🛋️', label: 'Área de descanso' },
    { icon: '🍔', label: 'Snack bar' },
  ],
};

const REVIEWS: Record<string, { author: string; initials: string; rating: number; text: string }[]> = {
  '1': [
    { author: 'Miguel R.', initials: 'MR', rating: 5, text: 'Excelente cancha. El piso profesional hace una diferencia enorme. La iluminación es perfecta para los juegos nocturnos.' },
    { author: 'Ana G.', initials: 'AG', rating: 5, text: 'La mejor cancha de basketball en Albrook. Personal muy amable y las instalaciones siempre limpias.' },
  ],
  '2': [
    { author: 'Luis M.', initials: 'LM', rating: 5, text: 'Canchas de primer nivel. Grama sintética en perfectas condiciones. Muy recomendado.' },
    { author: 'Carlos T.', initials: 'CT', rating: 4, text: 'Buena cancha con buen ambiente. El estacionamiento puede ponerse lleno los fines de semana.' },
  ],
  '3': [
    { author: 'Sofía P.', initials: 'SP', rating: 5, text: 'Las mejores canchas de tenis en Paitilla, sin duda. Perfectas para torneos y práctica.' },
    { author: 'Roberto K.', initials: 'RK', rating: 5, text: 'Iluminación excepcional, superficie impecable. Vale cada centavo.' },
  ],
  '4': [
    { author: 'María V.', initials: 'MV', rating: 5, text: 'La mejor cancha de voleibol playa en Ciudad de Panamá. La arena está siempre bien mantenida.' },
    { author: 'Diego F.', initials: 'DF', rating: 4, text: 'Muy divertido jugar aquí. El ambiente es genial y el snack bar es un plus enorme.' },
  ],
};

const HERO_HEIGHT = 280;

// ─── Component ────────────────────────────────────────────────────────────────
export default function VenueDetailModal() {
  const { detailVenue, closeDetail, openBooking, likedIds, toggleLike } = useBookings();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const venue = detailVenue;

  function handleReserve() {
    closeDetail();
    setTimeout(() => openBooking(venue!), 180);
  }

  const liked = venue ? !!likedIds[venue.id] : false;
  const amenities = venue ? (AMENITIES[venue.sport] ?? []) : [];
  const reviews = venue ? (REVIEWS[venue.id] ?? []) : [];

  return (
    <Modal
      visible={!!venue}
      animationType="slide"
      onRequestClose={closeDetail}
      statusBarTranslucent>
      {venue && (
        <View style={[s.screen, { backgroundColor: theme.background }]}>

          {/* Fixed back button — stays visible while scrolling */}
          <Pressable
            style={[s.backBtn, { top: insets.top + Spacing.two }]}
            onPress={closeDetail}
            hitSlop={8}>
            <View style={s.backBtnCircle}>
              <Text style={s.backBtnArrow}>←</Text>
            </View>
          </Pressable>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>

            {/* Hero image */}
            <View style={s.heroContainer}>
              <Image
                source={{ uri: venue.imageUrl }}
                style={s.heroImage}
                contentFit="cover"
                transition={200}
              />
              <LinearGradient
                colors={['rgba(0,0,0,0.18)', 'transparent', 'rgba(0,0,0,0.55)']}
                style={StyleSheet.absoluteFill}
              />
              {/* Badges overlaid on image */}
              <View style={s.heroBadges}>
                <View style={[s.sportBadge, { backgroundColor: venue.sportColor }]}>
                  <Text style={s.sportBadgeText}>{venue.sport}</Text>
                </View>
                <View style={[
                  s.availBadge,
                  { backgroundColor: venue.availableToday ? 'rgba(0,202,78,0.9)' : 'rgba(0,0,0,0.5)' },
                ]}>
                  <Text style={s.availBadgeText}>
                    {venue.availableToday ? '📅 Disponible hoy' : '❌ No disponible hoy'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Main content */}
            <View style={s.content}>

              {/* Name + rating */}
              <Text style={[s.venueName, { color: theme.text }]}>{venue.venueName}</Text>
              <View style={s.metaRow}>
                <Text style={s.star}>★</Text>
                <Text style={[s.rating, { color: theme.text }]}>{venue.rating}</Text>
                <Text style={[s.metaDot, { color: theme.textTertiary }]}>·</Text>
                <Text style={[s.reviews, { color: theme.textSecondary }]}>
                  {reviews.length * 12} reseñas
                </Text>
                <Text style={[s.metaDot, { color: theme.textTertiary }]}>·</Text>
                <Text style={[s.location, { color: theme.textSecondary }]}>📍 {venue.location}</Text>
              </View>

              {/* Price */}
              <View style={[s.priceRow, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                <Text style={[s.priceLabel, { color: theme.textSecondary }]}>Precio por hora</Text>
                <Text style={[s.priceValue, { color: theme.primary }]}>${venue.pricePerHour}.00</Text>
              </View>

              <View style={[s.divider, { backgroundColor: theme.border }]} />

              {/* Description */}
              <View style={s.section}>
                <Text style={[s.sectionTitle, { color: theme.text }]}>Descripción</Text>
                <Text style={[s.description, { color: theme.textSecondary }]}>
                  {venue.description}{'\n\n'}
                  Instalaciones de primer nivel ubicadas en {venue.location}. Contamos con horarios flexibles y personal capacitado para garantizar la mejor experiencia deportiva de Ciudad de Panamá.
                </Text>
              </View>

              <View style={[s.divider, { backgroundColor: theme.border }]} />

              {/* Amenities */}
              <View style={s.section}>
                <Text style={[s.sectionTitle, { color: theme.text }]}>Amenidades</Text>
                <View style={s.amenitiesGrid}>
                  {amenities.map(a => (
                    <View key={a.label} style={[s.amenityCard, { backgroundColor: theme.backgroundElement }]}>
                      <Text style={s.amenityIcon}>{a.icon}</Text>
                      <Text style={[s.amenityLabel, { color: theme.text }]}>{a.label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={[s.divider, { backgroundColor: theme.border }]} />

              {/* Reviews */}
              <View style={s.section}>
                <View style={s.reviewsHeader}>
                  <Text style={[s.sectionTitle, { color: theme.text }]}>Reseñas</Text>
                  <View style={s.ratingBadge}>
                    <Text style={s.ratingBadgeStar}>★</Text>
                    <Text style={[s.ratingBadgeValue, { color: theme.text }]}>{venue.rating}</Text>
                  </View>
                </View>
                <View style={s.reviewsList}>
                  {reviews.map(r => (
                    <View key={r.author} style={[s.reviewCard, { backgroundColor: theme.surface }, Shadows.card]}>
                      <View style={s.reviewHeader}>
                        <View style={[s.reviewAvatar, { backgroundColor: venue.sportColor }]}>
                          <Text style={s.reviewInitials}>{r.initials}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[s.reviewAuthor, { color: theme.text }]}>{r.author}</Text>
                          <Text style={s.reviewStars}>{'★'.repeat(r.rating)}</Text>
                        </View>
                      </View>
                      <Text style={[s.reviewText, { color: theme.textSecondary }]}>{r.text}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Sticky bottom bar */}
          <View style={[
            s.bottomBar,
            {
              paddingBottom: insets.bottom + Spacing.two,
              backgroundColor: theme.background,
              borderTopColor: theme.border,
            },
          ]}>
            <Pressable onPress={() => toggleLike(venue.id)} style={s.likeBtn}>
              <Text style={[s.likeText, { color: liked ? '#E63946' : theme.textSecondary }]}>
                {liked ? '♥' : '♡'}
              </Text>
              <Text style={[s.likeCount, { color: liked ? '#E63946' : theme.textSecondary }]}>
                {venue.likes + (liked ? 1 : 0)}
              </Text>
            </Pressable>

            <TouchableOpacity
              onPress={handleReserve}
              activeOpacity={0.85}
              style={s.reserveBtn}>
              <LinearGradient
                colors={['#00CA4E', '#0066FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.reserveGradient}>
                <Text style={s.reserveText}>Reservar Cancha · ${venue.pricePerHour}/h</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1 },

  // Back button (fixed overlay)
  backBtn: {
    position: 'absolute',
    left: Spacing.three,
    zIndex: 10,
  },
  backBtnCircle: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  backBtnArrow: { fontSize: 20, color: '#333', lineHeight: 24 },

  // Hero
  heroContainer: { height: HERO_HEIGHT },
  heroImage: { width: '100%', height: '100%' },
  heroBadges: {
    position: 'absolute',
    bottom: Spacing.three,
    left: Spacing.three,
    flexDirection: 'row',
    gap: Spacing.two,
  },
  sportBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
  },
  sportBadgeText: { ...Typography.badge, color: '#fff' },
  availBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
  },
  availBadgeText: { ...Typography.badge, color: '#fff' },

  // Main content
  content: { padding: Spacing.three, gap: Spacing.three },
  venueName: { ...Typography.displayMd },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
  star: { color: '#F5A623', fontSize: 15 },
  rating: { ...Typography.bodyBold },
  metaDot: { ...Typography.body },
  reviews: { ...Typography.caption },
  location: { ...Typography.caption },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  priceLabel: { ...Typography.body },
  priceValue: { ...Typography.heading },

  divider: { height: StyleSheet.hairlineWidth },

  // Sections
  section: { gap: Spacing.two },
  sectionTitle: { ...Typography.subheading },
  description: { ...Typography.body, lineHeight: 24 },

  // Amenities
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  amenityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.sm,
    minWidth: '45%',
    flex: 1,
  },
  amenityIcon: { fontSize: 18 },
  amenityLabel: { ...Typography.caption, flex: 1 },

  // Reviews
  reviewsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingBadgeStar: { color: '#F5A623', fontSize: 16 },
  ratingBadgeValue: { ...Typography.bodyBold },
  reviewsList: { gap: Spacing.two },
  reviewCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  reviewAvatar: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewInitials: { ...Typography.badge, color: '#fff' },
  reviewAuthor: { ...Typography.bodyBold },
  reviewStars: { color: '#F5A623', fontSize: 12, letterSpacing: 1 },
  reviewText: { ...Typography.body, lineHeight: 22 },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    gap: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  likeBtn: { alignItems: 'center', gap: 2 },
  likeText: { fontSize: 24 },
  likeCount: { ...Typography.caption },
  reserveBtn: { flex: 1, borderRadius: BorderRadius.sm, overflow: 'hidden' },
  reserveGradient: { height: 52, alignItems: 'center', justifyContent: 'center' },
  reserveText: { ...Typography.bodyBold, color: '#fff' },
});
