import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { 
  getProvinces, 
  getDistrictsByProvince, 
  getWardsByDistrict,
  getCitiesFromRooms,
  matchCityWithProvince,
  Province,
  District,
  Ward,
} from '../apis/locationApi';

export interface FilterOptions {
  city?: string;
  country?: string;
  province?: string;
  district?: string;
  ward?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  sortBy?: 'price' | 'rating' | 'name' | 'stars';
  sortOrder?: 'asc' | 'desc';
  minStars?: number;
  maxStars?: number;
  starSortOrder?: 'asc' | 'desc';
}

interface RoomFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

export default function RoomFilterModal({
  visible,
  onClose,
  onApply,
  initialFilters = {},
}: RoomFilterModalProps) {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [locationLevel, setLocationLevel] = useState<'province' | 'district' | 'ward'>('province');
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [priceSortOrder, setPriceSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [starSortOrder, setStarSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [showLocationList, setShowLocationList] = useState(false);
  
  // API data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [citiesFromDB, setCitiesFromDB] = useState<string[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Load provinces and cities when modal opens
  useEffect(() => {
    if (visible) {
      setFilters(initialFilters);
      setPriceSortOrder(initialFilters.sortBy === 'price' ? initialFilters.sortOrder : null);
      setStarSortOrder(initialFilters.starSortOrder || null);
      setLocationLevel('province');
      setShowLocationList(false);
      setSelectedProvince(null);
      setSelectedDistrict(null);
      
      // Load data from APIs
      loadLocationData();
    }
  }, [visible, initialFilters]);

  const loadLocationData = async () => {
    setLoadingLocations(true);
    try {
      // Load provinces and cities in parallel
      const [provincesData, citiesData] = await Promise.all([
        getProvinces(),
        getCitiesFromRooms(),
      ]);
      
      setProvinces(provincesData);
      setCitiesFromDB(citiesData);
      
      // If there's a selected province, load its districts
      if (selectedProvince) {
        const districtsData = await getDistrictsByProvince(selectedProvince);
        setDistricts(districtsData);
      }
      
      // If there's a selected district, load its wards
      if (selectedDistrict) {
        const wardsData = await getWardsByDistrict(selectedDistrict);
        setWards(wardsData);
      }
    } catch (error) {
      console.error('Error loading location data:', error);
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleApply = () => {
    // When applying filter, use city (from DB) instead of province/district/ward
    // because DB only has city field
    const finalFilters: FilterOptions = {
      ...filters,
      // Keep city for filtering (DB uses city)
      // Remove province/district/ward as they're only for UI
      city: filters.city || filters.province, // Use city if available, otherwise use province name
      province: undefined, // Don't send province to backend
      district: undefined, // Don't send district to backend
      ward: undefined, // Don't send ward to backend
      sortBy: priceSortOrder ? 'price' : filters.sortBy,
      sortOrder: priceSortOrder || filters.sortOrder,
      starSortOrder: starSortOrder || undefined,
    };
    onApply(finalFilters);
    onClose();
  };

  const handleClearAll = () => {
    const resetFilters: FilterOptions = {};
    setFilters(resetFilters);
    setPriceSortOrder(null);
    setStarSortOrder(null);
    setLocationLevel('province');
    setSelectedProvince(null);
    setSelectedDistrict(null);
    onApply(resetFilters);
    onClose();
  };

  const handleProvinceSelect = async (provinceCode: string) => {
    setSelectedProvince(provinceCode);
    setSelectedDistrict(null);
    setLocationLevel('district');
    setShowLocationList(true);
    
    const province = provinces.find(p => p.code === provinceCode);
    if (province) {
      // Find matching city from DB
      const matchedCity = citiesFromDB.find(city => {
        const matchedProvinceCode = matchCityWithProvince(city, provinces);
        return matchedProvinceCode === province.code;
      });
      
      setFilters({ 
        ...filters, 
        province: province.name,
        city: matchedCity || province.name, // Use matched city or province name
        district: undefined, 
        ward: undefined 
      });
      
      // Load districts for this province
      try {
        const districtsData = await getDistrictsByProvince(provinceCode);
        setDistricts(districtsData);
      } catch (error) {
        console.error('Error loading districts:', error);
      }
    }
  };

  const handleDistrictSelect = async (districtCode: string) => {
    setSelectedDistrict(districtCode);
    setLocationLevel('ward');
    setShowLocationList(true);
    
    const district = districts.find(d => d.code === districtCode);
    if (district) {
      setFilters({ ...filters, district: district.name, ward: undefined });
      
      // Load wards for this district
      try {
        const wardsData = await getWardsByDistrict(districtCode);
        setWards(wardsData);
      } catch (error) {
        console.error('Error loading wards:', error);
      }
    }
  };

  const handleWardSelect = (wardName: string) => {
    setFilters({ ...filters, ward: wardName });
    setLocationLevel('province');
    setShowLocationList(false);
  };

  const getCurrentLocationOptions = () => {
    if (locationLevel === 'province') {
      // Show provinces, but prioritize those that have matching cities in DB
      return provinces.map(p => ({ 
        id: p.code, 
        name: p.name,
        hasData: citiesFromDB.some(city => {
          const matchedCode = matchCityWithProvince(city, provinces);
          return matchedCode === p.code;
        }),
      }));
    }
    if (locationLevel === 'district' && selectedProvince) {
      return districts.map(d => ({ id: d.code, name: d.name }));
    }
    if (locationLevel === 'ward' && selectedDistrict) {
      return wards.map(w => ({ id: w.code, name: w.name }));
    }
    return [];
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          {/* Drag Indicator */}
          <View style={styles.dragIndicator} />
          
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {locationLevel === 'province' ? 'Locality' : 
               locationLevel === 'district' ? 'District' : 'Ward'}
            </Text>
            {locationLevel !== 'province' && (
              <TouchableOpacity onPress={() => {
                if (locationLevel === 'ward') {
                  setLocationLevel('district');
                } else {
                  setLocationLevel('province');
                  setSelectedProvince(null);
                  setSelectedDistrict(null);
                }
              }}>
                <Ionicons name="arrow-back" size={24} color="#111827" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Sort by Price */}
            {locationLevel === 'province' && (
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Sort by</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => {
                      const newOrder = priceSortOrder === 'asc' ? null : 'asc';
                      setPriceSortOrder(newOrder);
                    }}
                  >
                    <View style={styles.radioButton}>
                      {priceSortOrder === 'asc' && <View style={styles.radioButtonInner} />}
                    </View>
                    <Ionicons name="cash-outline" size={20} color="#6B7280" />
                    <Text style={styles.radioText}>Price - low to high</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => {
                      const newOrder = priceSortOrder === 'desc' ? null : 'desc';
                      setPriceSortOrder(newOrder);
                    }}
                  >
                    <View style={styles.radioButton}>
                      {priceSortOrder === 'desc' && <View style={styles.radioButtonInner} />}
                    </View>
                    <Ionicons name="cash-outline" size={20} color="#6B7280" />
                    <Text style={styles.radioText}>Price - high to low</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Location Selection */}
            {locationLevel === 'province' && (
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Locality</Text>
                {loadingLocations ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Đang tải danh sách địa điểm...</Text>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.locationButton}
                      onPress={() => {
                        setShowLocationList(!showLocationList);
                        setLocationLevel('province');
                      }}
                    >
                      <Text style={styles.locationButtonText}>
                        {filters.city || filters.province || filters.district || filters.ward || 'Select location'}
                      </Text>
                      <Ionicons 
                        name={showLocationList ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color="#9CA3AF" 
                      />
                    </TouchableOpacity>
                    {/* Show province list when clicked */}
                    {showLocationList && locationLevel === 'province' && (
                      <View style={styles.locationListContainer}>
                        {getCurrentLocationOptions().map((option) => (
                          <TouchableOpacity
                            key={option.id}
                            style={styles.locationOption}
                            onPress={() => {
                              handleProvinceSelect(option.id);
                              setShowLocationList(false);
                            }}
                          >
                            <View style={styles.checkbox}>
                              {(filters.province === option.name || filters.city === option.name) ? (
                                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                              ) : null}
                            </View>
                            <View style={styles.locationOptionContent}>
                              <Text style={styles.locationOptionText}>{option.name}</Text>
                              {option.hasData && (
                                <Text style={styles.hasDataBadge}>Có dữ liệu</Text>
                              )}
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </>
                )}
              </View>
            )}

            {/* Location Options List for District and Ward */}
            {locationLevel === 'district' && (
              <View style={styles.filterSection}>
                <View style={styles.locationListContainer}>
                  {getCurrentLocationOptions().map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.locationOption}
                      onPress={() => handleDistrictSelect(option.id)}
                    >
                      <View style={styles.checkbox}>
                        {filters.district === option.name ? (
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        ) : null}
                      </View>
                      <Text style={styles.locationOptionText}>{option.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {locationLevel === 'ward' && (
              <View style={styles.filterSection}>
                <View style={styles.locationListContainer}>
                  {getCurrentLocationOptions().map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.locationOption}
                      onPress={() => handleWardSelect(option.name)}
                    >
                      <View style={styles.checkbox}>
                        {filters.ward === option.name ? (
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        ) : null}
                      </View>
                      <Text style={styles.locationOptionText}>{option.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Price Range */}
            {locationLevel === 'province' && (
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Price Range</Text>
                <View style={styles.priceRangeContainer}>
                  <View style={styles.radioGroup}>
                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => {
                        // Toggle price range selection
                      }}
                    >
                      <View style={styles.radioButton}>
                        <View style={styles.radioButtonInner} />
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.priceInputRow}>
                    <Text style={styles.priceLabel}>From</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="Start price"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      value={filters.minPrice ? filters.minPrice.toString() : ''}
                      onChangeText={(text) =>
                        setFilters({ ...filters, minPrice: text ? parseFloat(text) : undefined })
                      }
                    />
                    <Text style={styles.priceLabel}>To</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="End price"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      value={filters.maxPrice ? filters.maxPrice.toString() : ''}
                      onChangeText={(text) =>
                        setFilters({ ...filters, maxPrice: text ? parseFloat(text) : undefined })
                      }
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Star Rating Filter */}
            {locationLevel === 'province' && (
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Star Rating</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => {
                      const newOrder = starSortOrder === 'asc' ? null : 'asc';
                      setStarSortOrder(newOrder);
                    }}
                  >
                    <View style={styles.radioButton}>
                      {starSortOrder === 'asc' && <View style={styles.radioButtonInner} />}
                    </View>
                    <Ionicons name="star-outline" size={20} color="#6B7280" />
                    <Text style={styles.radioText}>Stars - low to high</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => {
                      const newOrder = starSortOrder === 'desc' ? null : 'desc';
                      setStarSortOrder(newOrder);
                    }}
                  >
                    <View style={styles.radioButton}>
                      {starSortOrder === 'desc' && <View style={styles.radioButtonInner} />}
                    </View>
                    <Ionicons name="star-outline" size={20} color="#6B7280" />
                    <Text style={styles.radioText}>Stars - high to low</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Show More Link */}
            {locationLevel === 'province' && (
              <TouchableOpacity style={styles.showMoreButton}>
                <Text style={styles.showMoreText}>Show more</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalBody: {
    padding: 20,
    maxHeight: '70%',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  radioText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
  },
  locationButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  locationListContainer: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: 200,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationOptionText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  locationOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  hasDataBadge: {
    fontSize: 12,
    color: theme.colors.primary,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceRangeContainer: {
    gap: 12,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
    minWidth: 50,
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#111827',
  },
  showMoreButton: {
    paddingVertical: 12,
  },
  showMoreText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
