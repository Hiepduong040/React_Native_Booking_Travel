import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import { getAllRooms, searchRooms, filterRooms, RoomResponse, RoomListResponse } from '../../apis/roomApi';
import RoomFilterModal, { FilterOptions } from '../../components/RoomFilterModal';

const { width } = Dimensions.get('window');

export default function BookingScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({});
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const loadRooms = async (filters?: FilterOptions, searchKeyword?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      let data: RoomListResponse;
      
      // If there are filters or search keyword, use search/filter API
      if (filters && Object.keys(filters).length > 0) {
        // Use filter API
        const filterRequest: any = {
          city: filters.city,
          country: filters.country,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          capacity: filters.capacity,
          sortBy: filters.sortBy || 'price',
          sortOrder: filters.sortOrder || 'asc',
        };
        data = await filterRooms(filterRequest);
      } else if (searchKeyword && searchKeyword.trim()) {
        // Use search API
        const searchRequest = {
          keyword: searchKeyword.trim(),
          page: 0,
          size: 50,
        };
        data = await searchRooms(searchRequest);
      } else {
        // Use getAllRooms
        const allRooms = await getAllRooms();
        data = {
          rooms: allRooms,
          page: 0,
          totalPages: 1,
          totalElements: allRooms.length,
          size: allRooms.length,
          first: true,
          last: true,
        };
      }
      
      setRooms(data.rooms || []);
    } catch (err: any) {
      console.error('Error loading rooms:', err);
      setError(err.message || 'Không thể tải danh sách phòng');
      setRooms([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // Handle search with debounce
  useEffect(() => {
    if (searchQuery.trim() || Object.keys(currentFilters).length > 0) {
      const timeoutId = setTimeout(() => {
        setIsSearching(true);
        loadRooms(currentFilters, searchQuery);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      loadRooms();
    }
  }, [searchQuery]);

  const handleFilterApply = (filters: FilterOptions) => {
    setCurrentFilters(filters);
    loadRooms(filters, searchQuery);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRooms();
  };

  const handleRoomPress = (roomId: number) => {
    // Navigate with explicit params and key to ensure correct room is loaded
    router.push({
      pathname: `/(tabs)/(products)/${roomId}`,
      params: { 
        id: roomId.toString(),
        _key: Date.now().toString(), // Force re-render
      },
    });
  };

  // Use rooms directly from API (already filtered/searched)
  const popularRooms = rooms.slice(0, 10);
  const recommendedRooms = rooms.slice(0, 5);

  const categories = ['All', 'Hotels', 'Resorts', 'Villas', 'Apartments'];

  // Hiển thị loading khi đang fetch data
  if (isLoading && rooms.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách phòng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Hiển thị error nếu có lỗi và không có data
  if (error && rooms.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadRooms}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Hello,</Text>
              <Text style={styles.userName}>Welcome Back!</Text>
            </View>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => router.push('/(tabs)/account')}
            >
              <Ionicons name="person-circle-outline" size={32} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search hotels, places..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Ionicons name="options-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryChip,
                  index === 0 && styles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    index === 0 && styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Popular Rooms Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Hotels</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/products')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {isLoading || isSearching ? (
            <View style={styles.loadingSection}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : popularRooms.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>Không tìm thấy phòng nào</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hotelsScroll}
            >
              {popularRooms.map((room) => (
                <TouchableOpacity 
                  key={room.roomId} 
                  style={styles.hotelCard}
                  onPress={() => handleRoomPress(room.roomId)}
                >
                  <Image
                    source={{ 
                      uri: (room.images && room.images.length > 0) || (room.imageUrls && room.imageUrls.length > 0)
                        ? (room.images?.[0] || room.imageUrls?.[0] || room.thumbnailImage)
                        : 'https://via.placeholder.com/400'
                    }}
                    style={styles.hotelImage}
                    resizeMode="cover"
                  />
                  <View style={styles.hotelInfo}>
                    <View style={styles.hotelHeader}>
                      <Text style={styles.hotelName} numberOfLines={1}>
                        {room.hotelName}
                      </Text>
                      {room.rating && (
                        <View style={styles.ratingContainer}>
                          <Ionicons name="star" size={14} color="#FFD700" />
                          <Text style={styles.ratingText}>{room.rating.toFixed(1)}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.locationContainer}>
                      <Ionicons name="location-outline" size={14} color="#9CA3AF" />
                      <Text style={styles.locationText} numberOfLines={1}>
                        {room.hotelLocation || room.hotelCity || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.priceContainer}>
                      <Text style={styles.price}>
                        {typeof room.price === 'number' 
                          ? room.price.toLocaleString('vi-VN') 
                          : room.price}
                      </Text>
                      <Text style={styles.priceUnit}> VND/đêm</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Recommended Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/products')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {isLoading || isSearching ? (
            <View style={styles.loadingSection}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : recommendedRooms.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>Không tìm thấy phòng nào</Text>
            </View>
          ) : (
            <View style={styles.recommendedList}>
              {recommendedRooms.map((room) => (
                <TouchableOpacity 
                  key={room.roomId} 
                  style={styles.recommendedCard}
                  onPress={() => handleRoomPress(room.roomId)}
                >
                  <Image
                    source={{ 
                      uri: (room.images && room.images.length > 0) || (room.imageUrls && room.imageUrls.length > 0)
                        ? (room.images?.[0] || room.imageUrls?.[0] || room.thumbnailImage)
                        : 'https://via.placeholder.com/400'
                    }}
                    style={styles.recommendedImage}
                    resizeMode="cover"
                  />
                  <View style={styles.recommendedInfo}>
                    <Text style={styles.recommendedName} numberOfLines={1}>
                      {room.hotelName}
                    </Text>
                    <View style={styles.locationContainer}>
                      <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                      <Text style={styles.recommendedLocation} numberOfLines={1}>
                        {room.hotelLocation || room.hotelCity || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.recommendedFooter}>
                      {room.rating && (
                        <View style={styles.ratingContainer}>
                          <Ionicons name="star" size={12} color="#FFD700" />
                          <Text style={styles.recommendedRating}>{room.rating.toFixed(1)}</Text>
                        </View>
                      )}
                      <View style={styles.recommendedPrice}>
                        <Text style={styles.recommendedPriceText}>
                          {typeof room.price === 'number' 
                            ? room.price.toLocaleString('vi-VN') 
                            : room.price}
                        </Text>
                        <Text style={styles.recommendedPriceUnit}> VND/đêm</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Filter Modal */}
      <RoomFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleFilterApply}
        initialFilters={currentFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  loadingSection: {
    padding: 20,
    alignItems: 'center',
  },
  emptySection: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  hotelsScroll: {
    paddingLeft: 20,
    gap: 16,
  },
  hotelCard: {
    width: width * 0.75,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  hotelImage: {
    width: '100%',
    height: 200,
  },
  hotelInfo: {
    padding: 16,
  },
  hotelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#9CA3AF',
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  priceUnit: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  recommendedList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  recommendedCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendedImage: {
    width: 120,
    height: 120,
  },
  recommendedInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  recommendedName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  recommendedLocation: {
    fontSize: 12,
    color: '#9CA3AF',
    flex: 1,
  },
  recommendedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  recommendedRating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  recommendedPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  recommendedPriceText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  recommendedPriceUnit: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 2,
  },
});
