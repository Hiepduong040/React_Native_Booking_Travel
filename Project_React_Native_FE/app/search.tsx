import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { HotelCard } from '@/components/booking/hotel-card'; // có thể đổi thành RoomCard nếu bạn tạo component riêng
import { BOOKING_COLORS, Hotel } from '@/constants/booking'; // Hotel type dùng tạm cho UI
import { getAllRooms, searchRooms, RoomResponse } from '@/apis/roomApi';

export default function SearchRoomScreen(): React.JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState<string>('');
  const [rooms, setRooms] = useState<Hotel[]>([]); // dùng lại kiểu Hotel cho UI
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchText.trim().length > 0) {
        handleSearch(searchText.trim());
      } else {
        loadRooms();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchText]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await getAllRooms();
      setRooms(mapRoomResponseToRoom(data));
    } catch (error) {
      console.error('Load rooms error:', error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (keyword: string) => {
    try {
      setLoading(true);
      const data = await searchRooms(keyword);
      setRooms(mapRoomResponseToRoom(data));
    } catch (error) {
      console.error('Search rooms error:', error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const mapRoomResponseToRoom = (data: RoomResponse[]): Hotel[] => {
    return data.map((item) => ({
      id: item.roomId.toString(),
      name: item.roomType,
      location: item.hotelName || '', // nếu RoomResponse có trường hotelName
      price: item.price || 0,
      rating: 0,
      reviewCount: 0,
      imageUrl: (item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : "") ||
        "",
      isFavorite: false,
    }));
  };

  const toggleFavorite = (roomId: string): void => {
    setRooms(
      rooms.map((room) =>
        room.id === roomId ? { ...room, isFavorite: !room.isFavorite } : room
      )
    );
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
            placeholder="Tìm kiếm phòng..."
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
        {/* Location Option */}
        <TouchableOpacity style={styles.locationOption}>
          <View style={styles.locationIconContainer}>
            <Ionicons name="locate-outline" size={24} color={BOOKING_COLORS.PRIMARY} />
          </View>
          <Text style={styles.locationText}>hoặc sử dụng vị trí hiện tại của tôi</Text>
        </TouchableOpacity>

        {/* Recent Search */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tìm kiếm gần đây</Text>
          {/* Recent search items sẽ đặt ở đây */}
        </View>

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
              {rooms.map((room) => (
                <HotelCard
                  key={room.id}
                  hotel={room}
                  variant="vertical"
                  onPress={() => router.push(`/room-detail/${room.id}`)}
                  onFavoritePress={() => toggleFavorite(room.id)}
                />
              ))}
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
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${BOOKING_COLORS.PRIMARY}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationText: {
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_PRIMARY,
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