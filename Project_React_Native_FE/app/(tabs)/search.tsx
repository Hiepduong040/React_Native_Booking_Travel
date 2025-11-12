import { getAllRooms, RoomResponse, searchRooms } from '../../apis/roomApi';
import { HotelCard } from '../../components/booking/hotel-card';
import { BOOKING_COLORS } from '../../constants/booking';
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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SearchRoomScreen(): React.JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState<string>('');
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllRooms();
      setRooms(data);
    } catch (error) {
      console.error('Load rooms error:', error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async (keyword: string) => {
    try {
      setLoading(true);
      const data = await searchRooms({ keyword, page: 0, size: 50 });
      setRooms(data.rooms || []);
    } catch (error) {
      console.error('Search rooms error:', error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload data mỗi khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      if (searchText.trim().length === 0) {
        loadRooms();
      }
    }, [loadRooms, searchText])
  );

  // Debounce search khi searchText thay đổi
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchText.trim().length > 0) {
        handleSearch(searchText.trim());
      } else {
        loadRooms();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchText, handleSearch, loadRooms]);

  const toggleFavorite = (roomId: number): void => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(roomId)) {
        newSet.delete(roomId);
      } else {
        newSet.add(roomId);
      }
      return newSet;
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BOOKING_COLORS.BACKGROUND} />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={BOOKING_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a room..."
            placeholderTextColor={BOOKING_COLORS.TEXT_SECONDARY}
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
        </View>
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={BOOKING_COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
        )}
        {searchText.length === 0 && <View style={styles.headerButton} />}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Nearby Rooms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchText.trim().length > 0 ? 'Kết quả tìm kiếm' : 'Phòng gần vị trí của bạn'}
          </Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={BOOKING_COLORS.PRIMARY} />
            </View>
          ) : rooms.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchText.trim().length > 0 ? 'Không tìm thấy phòng phù hợp' : 'Chưa có phòng'}
              </Text>
            </View>
          ) : (
            <View style={styles.hotelsList}>
              {rooms.map((room) => {
                const roomWithFavorite = {
                  ...room,
                  isFavorite: favorites.has(room.roomId),
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
        </View>
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInputContainer: {
    flex: 1,
  },
  searchInput: {
    backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: BOOKING_COLORS.BORDER,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  hotelsList: {
    gap: 16,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
});
