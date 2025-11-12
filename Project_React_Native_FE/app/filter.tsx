import {
  getAllRooms,
  RoomResponse
} from '../apis/roomApi';
import { HotelCard } from '../components/booking/hotel-card';
import { BOOKING_COLORS } from '../constants/booking';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import SortModal, { SortOrder } from '../components/SortModal';
import LocalityModal from '../components/LocalityModal';
import PriceModal from '../components/PriceModal';
import { filterRooms } from '../apis/roomApi';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onApply?: () => void;
  onClearAll?: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  title,
  children,
  onApply,
  onClearAll,
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={BOOKING_COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalBody}>{children}</ScrollView>
        {(onApply || onClearAll) && (
          <View style={styles.modalFooter}>
            {onClearAll && (
              <TouchableOpacity style={styles.clearButton} onPress={onClearAll}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            )}
            {onApply && (
              <TouchableOpacity style={styles.applyButton} onPress={onApply}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  </Modal>
);

export default function FilterRoomScreen(): React.JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{ city?: string; minPrice?: string; maxPrice?: string; sort?: string }>();

  const [allRooms, setAllRooms] = useState<RoomResponse[]>([]);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [localityModalVisible, setLocalityModalVisible] = useState(false);
  const [priceModalVisible, setPriceModalVisible] = useState(false);

  const [selectedSort, setSelectedSort] = useState<SortOrder | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  // --- Load toàn bộ phòng ---
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllRooms();
      setAllRooms(data);
      setRooms(data);
    } catch (err) {
      console.error('Load rooms error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload data mỗi khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      fetchRooms();
    }, [fetchRooms])
  );

  // sync params -> filters
  useEffect(() => {
    if (params.city && typeof params.city === 'string') {
      setSelectedCity(params.city);
    }
    if (params.minPrice && !Number.isNaN(Number(params.minPrice))) {
      setMinPrice(Number(params.minPrice));
    }
    if (params.maxPrice && !Number.isNaN(Number(params.maxPrice))) {
      setMaxPrice(Number(params.maxPrice));
    }
    if (params.sort && ['price_asc', 'price_desc', 'rating_asc', 'rating_desc'].includes(params.sort)) {
      setSelectedSort(params.sort as SortOrder);
    }
  }, [params.city, params.minPrice, params.maxPrice, params.sort]);

  const hasPriceFilter = useMemo(() => minPrice !== null || maxPrice !== null, [minPrice, maxPrice]);
  const hasLocalityFilter = useMemo(() => Boolean(selectedCity && selectedCity.trim().length > 0), [selectedCity]);
  const hasSortFilter = useMemo(() => selectedSort !== null, [selectedSort]);

  const getSortLabel = useCallback((order: SortOrder | null) => {
    switch (order) {
      case 'price_asc':
        return 'Price • Low to High';
      case 'price_desc':
        return 'Price • High to Low';
      case 'rating_asc':
        return 'Rating • Low to High';
      case 'rating_desc':
        return 'Rating • High to Low';
      default:
        return 'Sort';
    }
  }, []);

  const getPriceLabel = useCallback(
    (min: number | null, max: number | null) => {
      if (min !== null && max !== null) {
        return `Price • ${min.toLocaleString('vi-VN')} - ${max.toLocaleString('vi-VN')}`;
      }
      if (min !== null) {
        return `Price • From ${min.toLocaleString('vi-VN')}`;
      }
      if (max !== null) {
        return `Price • To ${max.toLocaleString('vi-VN')}`;
      }
      return 'Price';
    },
    []
  );

  // --- Apply filters ---
  const applyFilters = useCallback(async () => {
    setLoading(true);
    try {
      const filterRequest: any = {
        city: selectedCity || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sortBy: selectedSort ? (selectedSort === 'price_asc' || selectedSort === 'price_desc' ? 'price' : 'rating') : 'price',
        sortOrder: selectedSort 
          ? (selectedSort === 'price_asc' || selectedSort === 'rating_asc' ? 'ASC' : 'DESC')
          : 'ASC',
      };

      // Remove undefined values
      Object.keys(filterRequest).forEach(key => {
        if (filterRequest[key] === undefined) {
          delete filterRequest[key];
        }
      });

      const hasFilters = selectedCity || minPrice !== null || maxPrice !== null || selectedSort !== null;

      if (hasFilters) {
        try {
          const data = await filterRooms(filterRequest);
          setRooms(data.rooms || []);
        } catch (filterError: any) {
          console.error('Error applying filters:', filterError);
          // If filter fails, fall back to local filtering
          let filteredRooms = [...allRooms];
          
          // Filter by city
          if (selectedCity) {
            filteredRooms = filteredRooms.filter(room => 
              room.hotelCity?.toLowerCase().includes(selectedCity.toLowerCase()) ||
              room.hotelLocation?.toLowerCase().includes(selectedCity.toLowerCase()) ||
              room.hotelName?.toLowerCase().includes(selectedCity.toLowerCase())
            );
          }
          
          // Filter by price
          if (minPrice !== null) {
            filteredRooms = filteredRooms.filter(room => room.price >= minPrice);
          }
          if (maxPrice !== null) {
            filteredRooms = filteredRooms.filter(room => room.price <= maxPrice);
          }
          
          // Sort
          if (selectedSort) {
            filteredRooms.sort((a, b) => {
              if (selectedSort === 'price_asc') return a.price - b.price;
              if (selectedSort === 'price_desc') return b.price - a.price;
              if (selectedSort === 'rating_asc') return (a.rating || 0) - (b.rating || 0);
              if (selectedSort === 'rating_desc') return (b.rating || 0) - (a.rating || 0);
              return 0;
            });
          }
          
          setRooms(filteredRooms);
        }
      } else {
        setRooms(allRooms);
      }
    } catch (error) {
      console.error('Error applying filters:', error);
      setRooms(allRooms);
    } finally {
      setLoading(false);
    }
  }, [allRooms, selectedCity, minPrice, maxPrice, selectedSort]);

  // Apply filters when they change
  React.useEffect(() => {
    applyFilters();
  }, [selectedCity, minPrice, maxPrice, selectedSort, allRooms, applyFilters]);

  const handleClearFilters = () => {
    setSelectedCity(null);
    setMinPrice(null);
    setMaxPrice(null);
    setSelectedSort(null);
    setRooms(allRooms);
  };

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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={BOOKING_COLORS.BACKGROUND} />
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={22} color={BOOKING_COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitleText}>{selectedCity || 'All Locations'}</Text>
            <Text style={styles.headerSubtitle}>
              {rooms.length} {rooms.length === 1 ? 'stay' : 'stays'} available
            </Text>
          </View>
          <TouchableOpacity onPress={handleClearFilters} style={styles.headerButton}>
            <Ionicons name="refresh" size={20} color={BOOKING_COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <TouchableOpacity
            style={[styles.filterButton, hasSortFilter && styles.filterButtonActive]}
            onPress={() => setSortModalVisible(true)}
          >
            <Ionicons
              name="swap-vertical-outline"
              size={18}
              color={hasSortFilter ? BOOKING_COLORS.BACKGROUND : BOOKING_COLORS.PRIMARY}
            />
            <Text
              style={[
                styles.filterButtonText,
                hasSortFilter && styles.filterButtonTextActive,
              ]}
              numberOfLines={1}
            >
              {getSortLabel(selectedSort)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, hasLocalityFilter && styles.filterButtonActive]}
            onPress={() => setLocalityModalVisible(true)}
          >
            <Text
              style={[
                styles.filterButtonText,
                hasLocalityFilter && styles.filterButtonTextActive,
              ]}
              numberOfLines={1}
            >
              {hasLocalityFilter ? selectedCity : 'Locality'}
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={hasLocalityFilter ? BOOKING_COLORS.BACKGROUND : BOOKING_COLORS.PRIMARY}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, hasPriceFilter && styles.filterButtonActive]}
            onPress={() => setPriceModalVisible(true)}
          >
            <Text
              style={[
                styles.filterButtonText,
                hasPriceFilter && styles.filterButtonTextActive,
              ]}
              numberOfLines={1}
            >
              {getPriceLabel(minPrice, maxPrice)}
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={hasPriceFilter ? BOOKING_COLORS.BACKGROUND : BOOKING_COLORS.PRIMARY}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.resultsRow}>
          <Text style={styles.resultsText}>
            {loading ? 'Loading rooms...' : `${rooms.length} room${rooms.length !== 1 ? 's' : ''} found`}
          </Text>
          {(hasSortFilter || hasLocalityFilter || hasPriceFilter) && (
            <TouchableOpacity onPress={handleClearFilters}>
              <Text style={styles.clearAllText}>Clear filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Rooms List */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={BOOKING_COLORS.PRIMARY} />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : rooms.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No room found</Text>
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
        </ScrollView>

        {/* Sort Modal */}
        <SortModal
          visible={sortModalVisible}
          onClose={() => setSortModalVisible(false)}
          onApply={(order) => {
            setSelectedSort(order);
            setSortModalVisible(false);
          }}
          initialSortOrder={selectedSort || undefined}
        />

        {/* Locality Modal */}
        <LocalityModal
          visible={localityModalVisible}
          onClose={() => setLocalityModalVisible(false)}
          onApply={(city) => {
            setSelectedCity(city);
            setLocalityModalVisible(false);
          }}
          initialCity={selectedCity || undefined}
        />

        {/* Price Modal */}
        <PriceModal
          visible={priceModalVisible}
          onClose={() => setPriceModalVisible(false)}
          onApply={(min, max) => {
            setMinPrice(min);
            setMaxPrice(max);
            setPriceModalVisible(false);
          }}
          initialMinPrice={minPrice || undefined}
          initialMaxPrice={maxPrice || undefined}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
  },
  container: {
    flex: 1,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    letterSpacing: -0.2,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BOOKING_COLORS.BORDER,
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
    flex: 1,
  },
  filterButtonActive: {
    backgroundColor: BOOKING_COLORS.PRIMARY,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: BOOKING_COLORS.PRIMARY,
    flexShrink: 1,
  },
  filterButtonTextActive: {
    color: BOOKING_COLORS.BACKGROUND,
  },
  scrollView: {
    flex: 1,
  },
  hotelsList: {
    padding: 16,
    gap: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    ...Platform.select({
      android: {
        elevation: 8,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: BOOKING_COLORS.BORDER,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  modalBody: {
    padding: 16,
    maxHeight: 400,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: BOOKING_COLORS.BORDER,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: BOOKING_COLORS.PRIMARY,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.PRIMARY,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: BOOKING_COLORS.PRIMARY,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.BACKGROUND,
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: BOOKING_COLORS.PRIMARY,
  },
});
