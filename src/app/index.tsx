import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BorderRadius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useBookings } from '@/context/bookings';
import { useTheme } from '@/hooks/use-theme';

const SPORTS = ['Todos', 'Fútbol', 'Basketball', 'Tenis', 'Voleibol', 'Natación'];

export const VENUES = [
  {
    id: '1',
    sport: 'Basketball',
    sportColor: '#0066FF',
    title: 'Canchas Premium Renovadas',
    description: '¡Canchas de basketball recién renovadas con piso profesional!',
    venueName: 'Club Deportivo Albrook',
    venueInitials: 'CA',
    venueAvatarColor: '#00CA4E',
    rating: 4.8,
    location: 'Albrook, Panamá',
    availableToday: true,
    pricePerHour: 15,
    likes: 234,
    comments: 18,
    timeAgo: 'Hace 2h',
    imageUrl: 'https://images.unsplash.com/photo-1546519638405-a9f64a6f4cae?w=800&q=80',
    coordinate: { latitude: 8.9936, longitude: -79.5498 },
  },
  {
    id: '2',
    sport: 'Fútbol',
    sportColor: '#00CA4E',
    title: 'Partidazo de Fútbol 5',
    description: '¿Quién se apunta? Buscamos 4 jugadores más para completar equipos',
    venueName: 'Complejo Deportivo Miraflores',
    venueInitials: 'CM',
    venueAvatarColor: '#FF7F00',
    rating: 4.6,
    location: 'Miraflores, Panamá',
    availableToday: true,
    pricePerHour: 20,
    likes: 189,
    comments: 32,
    timeAgo: 'Hace 5h',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    coordinate: { latitude: 8.9907, longitude: -79.5765 },
  },
  {
    id: '3',
    sport: 'Tenis',
    sportColor: '#FF7F00',
    title: 'Torneo Amateur de Tenis',
    description: 'Inscripciones abiertas para el torneo mensual de tenis',
    venueName: 'Club de Tenis Paitilla',
    venueInitials: 'CT',
    venueAvatarColor: '#0066FF',
    rating: 4.9,
    location: 'Paitilla, Panamá',
    availableToday: false,
    pricePerHour: 25,
    likes: 156,
    comments: 24,
    timeAgo: 'Hace 1d',
    imageUrl: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=800&q=80',
    coordinate: { latitude: 8.9872, longitude: -79.5139 },
  },
  {
    id: '4',
    sport: 'Voleibol',
    sportColor: '#9C27B0',
    title: 'Cancha de Voleibol Playa',
    description: 'La mejor cancha de voleibol playa en Ciudad de Panamá',
    venueName: 'Club Costa Verde',
    venueInitials: 'CV',
    venueAvatarColor: '#9C27B0',
    rating: 4.7,
    location: 'Costa del Este, Panamá',
    availableToday: true,
    pricePerHour: 18,
    likes: 312,
    comments: 45,
    timeAgo: 'Hace 3h',
    imageUrl: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80',
    coordinate: { latitude: 9.0089, longitude: -79.4639 },
  },
];

export type Venue = (typeof VENUES)[number];

function VenueCard({ venue }: { venue: Venue }) {
  const theme = useTheme();
  const { openBooking, openDetail, likedIds, toggleLike } = useBookings();
  const liked = !!likedIds[venue.id];

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }, Shadows.card]}>
      {/* Hero image — tap to open venue detail */}
      <Pressable onPress={() => openDetail(venue)} style={styles.hero}>
        <Image
          source={{ uri: venue.imageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
        />
        <View style={[styles.sportBadge, { backgroundColor: venue.sportColor }]}>
          <Text style={styles.sportBadgeText}>{venue.sport}</Text>
        </View>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.65)']}
          style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>{venue.title}</Text>
          <Text style={styles.heroDesc} numberOfLines={1}>{venue.description}</Text>
        </LinearGradient>
      </Pressable>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.venueRow}>
          <View style={[styles.avatar, { backgroundColor: venue.venueAvatarColor }]}>
            <Text style={styles.avatarText}>{venue.venueInitials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.venueName, { color: theme.text }]}>{venue.venueName}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.star}>★</Text>
              <Text style={[styles.ratingText, { color: theme.textSecondary }]}>{venue.rating}</Text>
              <Text style={[styles.locationText, { color: theme.textSecondary }]}>  📍 {venue.location}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={[
            styles.availBadge,
            { backgroundColor: venue.availableToday ? theme.backgroundSelected : theme.backgroundElement },
          ]}>
            <Text style={[
              styles.availText,
              { color: venue.availableToday ? theme.primary : theme.textSecondary },
            ]}>
              {venue.availableToday ? '📅 Disponible hoy' : '📅 No disponible'}
            </Text>
          </View>
          <Text style={[styles.price, { color: theme.text }]}>
            <Text style={{ fontWeight: '700' }}>${venue.pricePerHour}</Text>/hora
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <View style={styles.stats}>
            <Pressable onPress={() => toggleLike(venue.id)} style={styles.statBtn}>
              <Text style={[styles.statText, { color: liked ? '#E63946' : theme.textSecondary }]}>
                {liked ? '♥' : '♡'} {venue.likes + (liked ? 1 : 0)}
              </Text>
            </Pressable>
            <Text style={[styles.statText, { color: theme.textSecondary }]}>💬 {venue.comments}</Text>
          </View>
          <TouchableOpacity
            style={[styles.reserveBtn, { backgroundColor: theme.primary }]}
            activeOpacity={0.8}
            onPress={() => openBooking(venue)}>
            <Text style={styles.reserveText}>Reservar</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.timeAgo, { color: theme.textTertiary }]}>{venue.timeAgo}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedSport, setSelectedSport] = useState('Todos');

  const filtered = selectedSport === 'Todos'
    ? VENUES
    : VENUES.filter(v => v.sport === selectedSport);

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.two, backgroundColor: theme.background }]}>
        <Text style={[styles.brandName, { color: theme.primary }]}>SportSpot</Text>
        <View style={[styles.popularPill, { backgroundColor: theme.backgroundElement }]}>
          <Text style={[styles.popularText, { color: theme.text }]}>↗ Popular</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.discoverRow}>
          <Text style={[styles.discoverTitle, { color: theme.text }]}>Descubre</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillRow}>
          {SPORTS.map(sport => {
            const active = sport === selectedSport;
            return (
              <Pressable
                key={sport}
                onPress={() => setSelectedSport(sport)}
                style={[
                  styles.filterPill,
                  { backgroundColor: active ? theme.primary : theme.backgroundElement },
                ]}>
                <Text style={[styles.filterText, { color: active ? '#fff' : theme.textSecondary }]}>
                  {sport}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={[styles.feed, { paddingBottom: insets.bottom + Spacing.six }]}>
          {filtered.map(venue => <VenueCard key={venue.id} venue={venue} />)}
          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No hay canchas de {selectedSport} disponibles
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  brandName: { ...Typography.displayMd },
  popularPill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: BorderRadius.full,
  },
  popularText: { ...Typography.caption },
  discoverRow: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.two },
  discoverTitle: { ...Typography.heading },
  pillRow: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  filterPill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  filterText: { ...Typography.bodyBold },
  feed: { paddingHorizontal: Spacing.three, gap: Spacing.three },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.six },
  emptyText: { ...Typography.body },
  // Card
  card: { borderRadius: BorderRadius.md, overflow: 'hidden' },
  hero: { height: 190 },
  sportBadge: {
    position: 'absolute',
    top: Spacing.two,
    left: Spacing.two,
    zIndex: 1,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  sportBadgeText: { ...Typography.badge, color: '#fff' },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.three,
    paddingTop: Spacing.five,
  },
  heroTitle: { ...Typography.subheading, color: '#fff' },
  heroDesc: { ...Typography.caption, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  content: { padding: Spacing.three, gap: Spacing.two },
  venueRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...Typography.bodyBold, color: '#fff' },
  venueName: { ...Typography.bodyBold },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  star: { color: '#F5A623', fontSize: 13 },
  ratingText: { ...Typography.caption, marginLeft: 2 },
  locationText: { ...Typography.caption },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  availBadge: { paddingHorizontal: Spacing.two, paddingVertical: 4, borderRadius: BorderRadius.sm },
  availText: { ...Typography.caption },
  price: { ...Typography.body },
  actionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stats: { flexDirection: 'row', gap: Spacing.three },
  statBtn: {},
  statText: { ...Typography.caption },
  reserveBtn: { paddingHorizontal: Spacing.four, paddingVertical: 8, borderRadius: BorderRadius.full },
  reserveText: { ...Typography.bodyBold, color: '#fff' },
  timeAgo: { ...Typography.caption },
});
