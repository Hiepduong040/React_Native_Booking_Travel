import { getAllRooms, RoomResponse } from '../../apis/roomApi';
import { CityButton } from '../../components/booking/city-button';
import { HotelCard } from '../../components/booking/hotel-card';
import { SearchBar } from '../../components/booking/search-bar';
import { BOOKING_COLORS, City, Hotel } from '../../constants/booking';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_STORAGE_KEY = '@favoriteRooms';

const DEFAULT_CITY_ITEMS: City[] = [
  // {
  //   id: 'preset-danang',
  //   name: 'Da Nang',
  //   imageUrl: 'https://images.unsplash.com/photo-1549693578-d683be217e58?w=400',
  // },
  {
    id: 'preset-nhatrang',
    name: 'Nha Trang',
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400',
  },
];

export default function HomeScreen(): React.JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [bestRooms, setBestRooms] = useState<RoomResponse[]>([]);
  const [nearbyRooms, setNearbyRooms] = useState<RoomResponse[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllRooms();
      
      // Lấy 2 phòng đầu tiên làm nổi bật (có thể sắp xếp theo rating sau)
      setBestRooms(data.slice(0, 2));
      // Các phòng còn lại
      setNearbyRooms(data.slice(2));

      // Lấy city từ danh sách phòng - ưu tiên hotelCity
      const citySet = new Set<string>();
      data.forEach((room) => {
        const city = room.hotelCity || room.hotel?.city || room.hotelLocation;
        if (city) {
          citySet.add(city);
        }
      });
      const dynamicCities = Array.from(citySet)
        .filter((cityName) => !DEFAULT_CITY_ITEMS.some((preset) => preset.name.toLowerCase() === cityName.toLowerCase()))
        .map((cityName) => cityName.trim())
        .filter((cityName) => cityName.length > 0)
        .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
        .slice(0, Math.max(0, 5 - DEFAULT_CITY_ITEMS.length))
        .map((cityName, index) => ({
          id: `auto-${index}`,
          name: cityName,
          imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=200',
        }));

      setCities([...DEFAULT_CITY_ITEMS, ...dynamicCities]);
    } catch (error) {
      console.error('Load rooms error:', error);
      setBestRooms([]);
      setNearbyRooms([]);
      setCities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload data mỗi khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      loadRooms();
    }, [loadRooms])
  );

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

  const renderSectionHeader = (title: string, onSeeAll?: () => void): React.JSX.Element => {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BOOKING_COLORS.PRIMARY} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="grid-outline" size={22} color={BOOKING_COLORS.BACKGROUND} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Green</Text>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => router.push('/(tabs)/account')}
        >
          <Ionicons name="person-outline" size={22} color={BOOKING_COLORS.BACKGROUND} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Search Bar */}
        <SearchBar onPress={() => router.push('/(tabs)/search')} />

        {/* City Categories */}
        {cities.length > 0 && (
          <View style={styles.citiesSection}>
            <FlatList
              data={cities}
              renderItem={({ item }) => (
                <CityButton
                  city={item}
                  onPress={() =>
                    router.push({
                      pathname: '/filter',
                      params: { city: item.name },
                    })
                  }
                />
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.citiesList}
            />
          </View>
        )}

        {/* Featured Rooms */}
        {renderSectionHeader('Best Rooms', () => router.push('/filter'))}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BOOKING_COLORS.PRIMARY} />
          </View>
        ) : (
          <FlatList
            data={bestRooms}
            renderItem={({ item }) => {
              const hotelWithFavorite = {
                ...item,
                isFavorite: favorites.has(item.roomId),
              };
              return (
                <HotelCard 
                  hotel={hotelWithFavorite}
                  variant="horizontal"
                  onPress={() => router.push(`/(tabs)/(products)/${item.roomId}`)}
                  onFavoritePress={() => toggleFavorite(item.roomId)}
                />
              );
            }}
            keyExtractor={(item) => item.roomId.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hotelsList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Chưa có phòng nổi bật</Text>
              </View>
            }
          />
        )}

        {/* Nearby Rooms */}
        {renderSectionHeader('Nearby your location', () => router.push('/filter'))}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BOOKING_COLORS.PRIMARY} />
          </View>
        ) : (
          <View style={styles.nearbyHotels}>
            {nearbyRooms.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Chưa có phòng gần đây</Text>
              </View>
            ) : (
              nearbyRooms.map((room) => {
                const hotelWithFavorite = {
                  ...room,
                  isFavorite: favorites.has(room.roomId),
                };
                return (
                  <HotelCard
                    key={room.roomId}
                    hotel={hotelWithFavorite}
                    variant="vertical"
                    onPress={() => router.push(`/(tabs)/(products)/${room.roomId}`)}
                    onFavoritePress={() => toggleFavorite(room.roomId)}
                  />
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BOOKING_COLORS.BACKGROUND },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: BOOKING_COLORS.PRIMARY,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  headerIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: BOOKING_COLORS.BACKGROUND,
    letterSpacing: 0.5,
  },
  scrollView: { flex: 1 },
  citiesSection: { marginTop: 8, marginBottom: 32 },
  citiesList: { paddingHorizontal: 20, paddingRight: 4 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 8,
  },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: BOOKING_COLORS.TEXT_PRIMARY, letterSpacing: -0.5 },
  seeAllText: { fontSize: 15, fontWeight: '600', color: BOOKING_COLORS.PRIMARY },
  hotelsList: { paddingHorizontal: 20, paddingBottom: 12 },
  nearbyHotels: { paddingHorizontal: 20, paddingBottom: 32 },
  loadingContainer: { paddingVertical: 40, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { paddingVertical: 40, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, color: BOOKING_COLORS.TEXT_SECONDARY },
});
