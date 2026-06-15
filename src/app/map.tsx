import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { VENUES, type Venue } from './index';
import { BorderRadius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useBookings } from '@/context/bookings';
import { useTheme } from '@/hooks/use-theme';

// Geographic bounds that contain all venues — no API key needed
const BOUNDS = { latMin: 8.970, latMax: 9.020, lngMin: -79.600, lngMax: -79.440 };

function toMapPos(coord: { latitude: number; longitude: number }) {
  const x = ((coord.longitude - BOUNDS.lngMin) / (BOUNDS.lngMax - BOUNDS.lngMin)) * 100;
  const y = ((BOUNDS.latMax - coord.latitude) / (BOUNDS.latMax - BOUNDS.latMin)) * 100;
  return { left: `${x.toFixed(1)}%` as string, top: `${y.toFixed(1)}%` as string };
}

const SPORT_EMOJI: Record<string, string> = {
  Basketball: '🏀',
  Fútbol: '⚽',
  Tenis: '🎾',
  Voleibol: '🏐',
};

const SHEET_HEIGHT = 230;

// ─── Mock Map Background ──────────────────────────────────────────────────────
function MockMapBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Base land */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#EDE9E0' }]} />

      {/* Panama Canal water channel (far west) */}
      <View style={bg.canal} />

      {/* Parque Natural Metropolitano (NW green) */}
      <View style={bg.parkNatural} />

      {/* Albrook / Parque Omar area (center-W green) */}
      <View style={bg.parkAlbrook} />

      {/* Parque recreativo (center) */}
      <View style={bg.parkCenter} />

      {/* Pacific Ocean (south) */}
      <View style={bg.pacific} />

      {/* Panama Bay (SE) */}
      <View style={bg.bay} />

      {/* Major roads — horizontal */}
      <View style={[bg.road, { top: '35%', height: 3 }]} />
      <View style={[bg.road, { top: '50%', height: 3 }]} />
      <View style={[bg.road, { top: '62%' }]} />
      <View style={[bg.road, { top: '72%' }]} />

      {/* Major roads — vertical */}
      <View style={[bg.roadV, { left: '22%' }]} />
      <View style={[bg.roadV, { left: '37%' }]} />
      <View style={[bg.roadV, { left: '53%', width: 3 }]} />
      <View style={[bg.roadV, { left: '68%' }]} />
      <View style={[bg.roadV, { left: '82%' }]} />

      {/* Cinta Costera coastal road */}
      <View style={bg.cintaCostera} />

      {/* City label */}
      <View style={bg.labelContainer}>
        <Text style={bg.labelText}>Ciudad de Panamá</Text>
      </View>
    </View>
  );
}

const bg = StyleSheet.create({
  canal: {
    position: 'absolute', top: 0, left: 0, bottom: '18%',
    width: '5%',
    backgroundColor: '#AACCE4',
  },
  parkNatural: {
    position: 'absolute', top: '5%', left: '5%',
    width: '18%', height: '18%',
    backgroundColor: '#B5D4A8',
    borderRadius: 6,
  },
  parkAlbrook: {
    position: 'absolute', top: '28%', left: '8%',
    width: '13%', height: '16%',
    backgroundColor: '#B5D4A8',
    borderRadius: 4,
  },
  parkCenter: {
    position: 'absolute', top: '15%', left: '38%',
    width: '8%', height: '10%',
    backgroundColor: '#C4DDB8',
    borderRadius: 4,
  },
  pacific: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: '18%',
    backgroundColor: '#AACCE4',
  },
  bay: {
    position: 'absolute', bottom: 0, right: 0,
    width: '32%', height: '40%',
    backgroundColor: '#AACCE4',
    borderTopLeftRadius: 100,
  },
  road: {
    position: 'absolute', left: 0, right: 0,
    height: 2,
    backgroundColor: '#F5F2EC',
  },
  roadV: {
    position: 'absolute', top: 0, bottom: 0,
    width: 2,
    backgroundColor: '#F5F2EC',
  },
  cintaCostera: {
    position: 'absolute',
    bottom: '17%', left: '5%', right: '30%',
    height: 4,
    backgroundColor: '#DDD8CC',
    borderRadius: 2,
  },
  labelContainer: {
    position: 'absolute',
    top: '44%', left: '30%',
  },
  labelText: {
    fontSize: 10,
    color: '#9A9080',
    fontStyle: 'italic',
    letterSpacing: 0.8,
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function MapScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { openBooking, openDetail, likedIds, toggleLike } = useBookings();
  const [selected, setSelected] = useState<Venue | null>(null);
  const sheetAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  const openSheet = (venue: Venue) => {
    setSelected(venue);
    Animated.spring(sheetAnim, {
      toValue: 0,
      tension: 60,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(sheetAnim, {
      toValue: SHEET_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setSelected(null));
  };

  return (
    <View style={styles.screen}>
      {/* Mock map replaces MapView */}
      <MockMapBackground />

      {/* Venue markers positioned by lat/lng */}
      {VENUES.map(venue => {
        const pos = toMapPos(venue.coordinate);
        const isSelected = selected?.id === venue.id;
        return (
          <Pressable
            key={venue.id}
            style={[styles.markerAnchor, { left: pos.left as any, top: pos.top as any }]}
            onPress={() => openSheet(venue)}>
            <View style={[
              styles.markerBubble,
              { backgroundColor: venue.sportColor },
              isSelected && styles.markerSelected,
            ]}>
              <Text style={styles.markerEmoji}>{SPORT_EMOJI[venue.sport] ?? '📍'}</Text>
              {isSelected && (
                <Text style={styles.markerLabel} numberOfLines={1}>{venue.venueName}</Text>
              )}
            </View>
            <View style={[styles.markerTail, { borderTopColor: venue.sportColor }]} />
          </Pressable>
        );
      })}

      {/* Header overlay */}
      <View style={[styles.headerOverlay, { paddingTop: insets.top + Spacing.two }]}>
        <View style={[styles.headerCard, { backgroundColor: theme.background }, Shadows.card]}>
          <Text style={[styles.brandName, { color: theme.primary }]}>SportSpot</Text>
          <View style={[styles.countBadge, { backgroundColor: theme.backgroundSelected }]}>
            <Text style={[styles.countText, { color: theme.primary }]}>{VENUES.length} canchas</Text>
          </View>
        </View>
      </View>

      {/* Tap backdrop to dismiss sheet */}
      {selected && <Pressable style={styles.backdrop} onPress={closeSheet} />}

      {/* Bottom sheet modal */}
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: theme.background,
            paddingBottom: insets.bottom + Spacing.two,
            transform: [{ translateY: sheetAnim }],
          },
        ]}>
        {selected && (
          <>
            <View style={styles.sheetHandleRow}>
              <View style={[styles.sheetHandle, { backgroundColor: theme.border }]} />
            </View>

            <View style={styles.sheetContent}>
              <View style={styles.sheetImageWrapper}>
                <Image
                  source={{ uri: selected.imageUrl }}
                  style={styles.sheetImage}
                  contentFit="cover"
                  transition={200}
                />
                <View style={[styles.sheetSportBadge, { backgroundColor: selected.sportColor }]}>
                  <Text style={styles.sheetSportText}>{selected.sport}</Text>
                </View>
              </View>

              <View style={styles.sheetDetails}>
                <Text style={[styles.sheetTitle, { color: theme.text }]} numberOfLines={2}>
                  {selected.title}
                </Text>
                <Pressable onPress={() => { closeSheet(); setTimeout(() => openDetail(selected), 200); }}>
                  <Text style={[styles.sheetVenue, { color: theme.primary }]} numberOfLines={1}>
                    {selected.venueName} ›
                  </Text>
                </Pressable>
                <View style={styles.sheetRatingRow}>
                  <Text style={styles.star}>★</Text>
                  <Text style={[styles.sheetRating, { color: theme.textSecondary }]}>
                    {selected.rating}  📍 {selected.location}
                  </Text>
                </View>
                <View style={styles.sheetInfoRow}>
                  <View style={[
                    styles.availChip,
                    { backgroundColor: selected.availableToday ? theme.backgroundSelected : theme.backgroundElement },
                  ]}>
                    <Text style={[
                      styles.availChipText,
                      { color: selected.availableToday ? theme.primary : theme.textSecondary },
                    ]}>
                      {selected.availableToday ? '📅 Hoy' : '❌ No disponible'}
                    </Text>
                  </View>
                  <Text style={[styles.sheetPrice, { color: theme.text }]}>
                    <Text style={{ fontWeight: '700' }}>${selected.pricePerHour}</Text>/h
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.sheetActions}>
              <Pressable onPress={() => toggleLike(selected.id)} style={styles.likeBtn}>
                <Text style={[
                  styles.likeBtnText,
                  { color: likedIds[selected.id] ? '#E63946' : theme.textSecondary },
                ]}>
                  {likedIds[selected.id] ? '♥' : '♡'} {selected.likes + (likedIds[selected.id] ? 1 : 0)}
                </Text>
              </Pressable>

              <TouchableOpacity
                style={[styles.reserveBtn, { backgroundColor: theme.primary }]}
                activeOpacity={0.85}
                onPress={() => selected && openBooking(selected)}>
                <LinearGradient
                  colors={['#00CA4E', '#0066FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.reserveGradient}>
                  <Text style={styles.reserveText}>Reservar cancha</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  // Markers
  markerAnchor: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -20 }, { translateY: -40 }],
  },
  markerBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    gap: 4,
    maxWidth: 160,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  markerSelected: {
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: 7,
  },
  markerEmoji: { fontSize: 16 },
  markerLabel: { ...Typography.badge, color: '#fff', flexShrink: 1 },
  markerTail: {
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  // Header overlay
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.three,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  brandName: { ...Typography.displayMd },
  countBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  countText: { ...Typography.bodyBold },
  // Backdrop
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  // Bottom sheet
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    ...Shadows.modal,
  },
  sheetHandleRow: { alignItems: 'center', paddingTop: Spacing.two },
  sheetHandle: { width: 36, height: 4, borderRadius: BorderRadius.full },
  sheetContent: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  sheetImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  sheetImage: { width: '100%', height: '100%' },
  sheetSportBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  sheetSportText: { ...Typography.badge, color: '#fff' },
  sheetDetails: { flex: 1, gap: 4 },
  sheetTitle: { ...Typography.bodyBold, lineHeight: 20 },
  sheetVenue: { ...Typography.caption },
  sheetRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  star: { color: '#F5A623', fontSize: 13 },
  sheetRating: { ...Typography.caption },
  sheetInfoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: 2 },
  availChip: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: BorderRadius.sm },
  availChipText: { ...Typography.badge },
  sheetPrice: { ...Typography.caption },
  // Actions
  sheetActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },
  likeBtn: { paddingVertical: 4 },
  likeBtnText: { ...Typography.body },
  reserveBtn: { flex: 1, borderRadius: BorderRadius.sm, overflow: 'hidden' },
  reserveGradient: { height: 46, alignItems: 'center', justifyContent: 'center' },
  reserveText: { ...Typography.bodyBold, color: '#fff' },
});
