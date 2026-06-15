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
import MapView, { Marker, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { VENUES, type Venue } from './index';
import { BorderRadius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const PANAMA_CITY: Region = {
  latitude: 8.9936,
  longitude: -79.5197,
  latitudeDelta: 0.09,
  longitudeDelta: 0.09,
};

const SPORT_EMOJI: Record<string, string> = {
  Basketball: '🏀',
  Fútbol: '⚽',
  Tenis: '🎾',
  Voleibol: '🏐',
};

const SHEET_HEIGHT = 230;

export default function MapScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<Venue | null>(null);
  const sheetAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const [liked, setLiked] = useState<Record<string, boolean>>({});

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

  const toggleLike = (id: string) => setLiked(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <View style={styles.screen}>
      {/* Map full screen */}
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={PANAMA_CITY}
        showsUserLocation
        showsMyLocationButton={false}>
        {VENUES.map(venue => (
          <Marker
            key={venue.id}
            coordinate={venue.coordinate}
            onPress={() => openSheet(venue)}>
            <View style={[
              styles.markerBubble,
              { backgroundColor: venue.sportColor },
              selected?.id === venue.id && styles.markerSelected,
            ]}>
              <Text style={styles.markerEmoji}>{SPORT_EMOJI[venue.sport] ?? '📍'}</Text>
              {selected?.id === venue.id && (
                <Text style={styles.markerLabel} numberOfLines={1}>{venue.venueName}</Text>
              )}
            </View>
            <View style={[styles.markerTail, { borderTopColor: venue.sportColor }]} />
          </Marker>
        ))}
      </MapView>

      {/* Header overlay */}
      <View style={[styles.headerOverlay, { paddingTop: insets.top + Spacing.two }]}>
        <View style={[styles.headerCard, { backgroundColor: theme.background }, Shadows.card]}>
          <Text style={[styles.brandName, { color: theme.primary }]}>SportSpot</Text>
          <View style={[styles.countBadge, { backgroundColor: theme.backgroundSelected }]}>
            <Text style={[styles.countText, { color: theme.primary }]}>{VENUES.length} canchas</Text>
          </View>
        </View>
      </View>

      {/* Tap backdrop to dismiss */}
      {selected && (
        <Pressable style={styles.backdrop} onPress={closeSheet} />
      )}

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
            {/* Handle */}
            <View style={styles.sheetHandleRow}>
              <View style={[styles.sheetHandle, { backgroundColor: theme.border }]} />
            </View>

            {/* Content */}
            <View style={styles.sheetContent}>
              {/* Left: image */}
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

              {/* Right: details */}
              <View style={styles.sheetDetails}>
                <Text style={[styles.sheetTitle, { color: theme.text }]} numberOfLines={2}>
                  {selected.title}
                </Text>
                <Text style={[styles.sheetVenue, { color: theme.textSecondary }]} numberOfLines={1}>
                  {selected.venueName}
                </Text>
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

            {/* Actions row */}
            <View style={styles.sheetActions}>
              <Pressable onPress={() => toggleLike(selected.id)} style={styles.likeBtn}>
                <Text style={[
                  styles.likeBtnText,
                  { color: liked[selected.id] ? '#E63946' : theme.textSecondary },
                ]}>
                  {liked[selected.id] ? '♥' : '♡'} {selected.likes + (liked[selected.id] ? 1 : 0)}
                </Text>
              </Pressable>

              <TouchableOpacity
                style={[styles.reserveBtn, { backgroundColor: theme.primary }]}
                activeOpacity={0.85}>
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
  markerBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    gap: 4,
    maxWidth: 160,
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
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: BorderRadius.full,
  },
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
  availChip: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
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
  reserveGradient: {
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reserveText: { ...Typography.bodyBold, color: '#fff' },
});
