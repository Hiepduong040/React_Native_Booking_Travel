import { getAllRooms, RoomResponse } from '../apis/roomApi';
import { HotelCard } from '../components/booking/hotel-card';
import { BOOKING_COLORS } from '../constants/booking';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_STORAGE_KEY = '@favorites';

export default function FavoritesScreen(): React.JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [favoriteRoomIds, setFavoriteRoomIds] = useState<Set<number>>(new Set());
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadFavorites = useCallback(async () => {
    try {
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (favoritesJson) {
        const favorites = JSON.parse(favoritesJson);
        setFavoriteRoomIds(new Set(Array.isArray(favorites) ? favorites : []));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, []);

  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      const allRooms = await getAllRooms();
      // Filter only favorite rooms
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (favoritesJson) {
        const favorites = JSON.parse(favoritesJson);
        const favoriteIds = new Set(Array.isArray(favorites) ? favorites : []);
        const favoriteRooms = allRooms.filter((room) => favoriteIds.has(room.roomId));
        setRooms(favoriteRooms);
        setFavoriteRoomIds(favoriteIds);
      } else {
        setRooms([]);
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload data mỗi khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
      loadRooms();
    }, [loadFavorites, loadRooms])
  );

  const toggleFavorite = async (roomId: number): Promise<void> => {
    try {
      const newSet = new Set(favoriteRoomIds);
      if (newSet.has(roomId)) {
        newSet.delete(roomId);
      } else {
        newSet.add(roomId);
      }
      setFavoriteRoomIds(newSet);
      
      // Update storage
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(newSet)));
      
      // Reload rooms to update the list
      loadRooms();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={BOOKING_COLORS.BACKGROUND} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={BOOKING_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
        <View style={styles.headerButton} />
      </View>

      {/* Rooms List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={BOOKING_COLORS.PRIMARY} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : rooms.length === 0 ? (
          <View style={styles.centerContent}>
            <Ionicons name="heart-outline" size={64} color={BOOKING_COLORS.TEXT_SECONDARY} />
            <Text style={styles.emptyText}>Chưa có phòng yêu thích</Text>
          </View>
        ) : (
          <View style={styles.hotelsList}>
            {rooms.map((room) => {
              const roomWithFavorite = {
                ...room,
                isFavorite: favoriteRoomIds.has(room.roomId),
              };
              return (
                <HotelCard
                  key={room.roomId}
                  hotel={roomWithFavorite}
                  variant="vertical"
                  onPress={() => router.push(`/(tabs)/(products)/${room.roomId}`)}
                  onFavoritePress={() => toggleFavorite(room.roomId)}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BOOKING_COLORS.BORDER,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  hotelsList: {
    gap: 16,
  },
});

