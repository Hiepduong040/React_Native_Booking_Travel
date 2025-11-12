import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
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

interface LocalityModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (city: string | null) => void;
  initialCity?: string;
}

export default function LocalityModal({
  visible,
  onClose,
  onApply,
  initialCity,
}: LocalityModalProps) {
  const [locationLevel, setLocationLevel] = useState<'province' | 'district' | 'ward'>('province');
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(initialCity || null);
  const [showAll, setShowAll] = useState(false);
  
  // API data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [citiesFromDB, setCitiesFromDB] = useState<string[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  useEffect(() => {
    if (visible) {
      setLocationLevel('province');
      setSelectedProvince(null);
      setSelectedDistrict(null);
      setSelectedCity(initialCity || null);
      setShowAll(false);
      loadLocationData();
    }
  }, [visible, initialCity]);

  const loadLocationData = async () => {
    setLoadingLocations(true);
    try {
      const [provincesData, citiesData] = await Promise.all([
        getProvinces(),
        getCitiesFromRooms(),
      ]);
      
      setProvinces(provincesData);
      setCitiesFromDB(citiesData);
      
      if (selectedProvince) {
        const districtsData = await getDistrictsByProvince(selectedProvince);
        setDistricts(districtsData);
      }
      
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

  const handleProvinceSelect = async (provinceCode: string) => {
    setSelectedProvince(provinceCode);
    setSelectedDistrict(null);
    setLocationLevel('district');
    
    const province = provinces.find(p => p.code === provinceCode);
    if (province) {
      // Find matching city from DB - improved matching
      const matchedCity = findBestMatchingCity(province.name, citiesFromDB);
      
      if (matchedCity) {
        setSelectedCity(matchedCity);
      } else {
        // If no exact match, try to find city that contains province name
        const partialMatch = citiesFromDB.find(city => 
          city.toLowerCase().includes(province.name.toLowerCase().replace(/^(thành phố|tỉnh|tp\.?)\s*/i, '')) ||
          province.name.toLowerCase().replace(/^(thành phố|tỉnh|tp\.?)\s*/i, '').includes(city.toLowerCase())
        );
        setSelectedCity(partialMatch || null);
      }
      
      // Load districts
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
    
    const district = districts.find(d => d.code === districtCode);
    if (district) {
      // Try to find city matching district name
      const matchedCity = citiesFromDB.find(city => 
        city.toLowerCase().includes(district.name.toLowerCase()) ||
        district.name.toLowerCase().includes(city.toLowerCase())
      );
      if (matchedCity) {
        setSelectedCity(matchedCity);
      }
      
      // Load wards
      try {
        const wardsData = await getWardsByDistrict(districtCode);
        setWards(wardsData);
      } catch (error) {
        console.error('Error loading wards:', error);
      }
    }
  };

  const handleWardSelect = (wardName: string) => {
    // For ward, we still use city from province/district
    setLocationLevel('province');
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
  };

  const handleApply = () => {
    onApply(selectedCity);
    onClose();
  };

  const handleClearAll = () => {
    setSelectedCity(null);
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setLocationLevel('province');
    onApply(null);
    onClose();
  };

  // Improved city matching function
  const findBestMatchingCity = (provinceName: string, cities: string[]): string | null => {
    const normalizedProvince = provinceName.toLowerCase().trim();
    const provinceWithoutPrefix = normalizedProvince.replace(/^(thành phố|tỉnh|tp\.?)\s*/i, '').trim();
    
    // Try exact match first
    for (const city of cities) {
      const normalizedCity = city.toLowerCase().trim();
      if (normalizedCity === normalizedProvince || normalizedCity === provinceWithoutPrefix) {
        return city;
      }
    }
    
    // Try partial match
    for (const city of cities) {
      const normalizedCity = city.toLowerCase().trim();
      if (normalizedCity.includes(provinceWithoutPrefix) || 
          provinceWithoutPrefix.includes(normalizedCity)) {
        return city;
      }
    }
    
    // Try matching common city names
    const commonMappings: { [key: string]: string[] } = {
      'hồ chí minh': ['ho chi minh', 'hcm', 'sài gòn', 'saigon'],
      'hà nội': ['hanoi', 'ha noi'],
      'đà nẵng': ['da nang', 'danang'],
    };
    
    for (const [key, variations] of Object.entries(commonMappings)) {
      if (provinceWithoutPrefix.includes(key)) {
        for (const city of cities) {
          const normalizedCity = city.toLowerCase().trim();
          if (variations.some(v => normalizedCity.includes(v))) {
            return city;
          }
        }
      }
    }
    
    return null;
  };

  const getCurrentLocationOptions = () => {
    if (locationLevel === 'province') {
      const options = provinces.map(p => {
        const matchedCity = findBestMatchingCity(p.name, citiesFromDB);
        return {
          id: p.code,
          name: p.name,
          hasData: !!matchedCity,
          matchedCity: matchedCity,
        };
      });
      
      // Show only provinces with data first, then "Show more" to show all
      if (!showAll) {
        return options.filter(o => o.hasData);
      }
      return options;
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
          <View style={styles.dragIndicator} />
          
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {locationLevel === 'province' ? 'Locality' : 
               locationLevel === 'district' ? 'District' : 'Ward'}
            </Text>
            {locationLevel !== 'province' ? (
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
            ) : (
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {loadingLocations ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Đang tải danh sách địa điểm...</Text>
              </View>
            ) : (
              <>
                {/* Show cities from DB directly if at province level */}
                {locationLevel === 'province' && citiesFromDB.length > 0 && (
                  <View style={styles.filterSection}>
                    <Text style={styles.filterLabel}>Cities branch locations</Text>
                    {citiesFromDB.map((city) => (
                      <TouchableOpacity
                        key={city}
                        style={styles.locationOption}
                        onPress={() => handleCitySelect(city)}
                      >
                        <View style={styles.checkbox}>
                          {selectedCity === city ? (
                            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                          ) : null}
                        </View>
                        <Text style={styles.locationOptionText}>{city}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Show provinces */}
                {/* Inprogress */}
                
                {/* {locationLevel === 'province' && (
                  <View style={styles.filterSection}>
                    <Text style={styles.filterLabel}>Provinces</Text>
                    {getCurrentLocationOptions().map((option) => (
                      <TouchableOpacity
                        key={option.id}
                        style={styles.locationOption}
                        onPress={() => handleProvinceSelect(option.id)}
                      >
                        <View style={styles.checkbox}>
                          {selectedCity === option.matchedCity ? (
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
                    
                    {!showAll && provinces.some(p => !findBestMatchingCity(p.name, citiesFromDB)) && (
                      <TouchableOpacity
                        style={styles.showMoreButton}
                        onPress={() => setShowAll(true)}
                      >
                        <Text style={styles.showMoreText}>Show more</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )} */}

                {/* Show districts */}
                {locationLevel === 'district' && (
                  <View style={styles.filterSection}>
                    {districts.map((district) => (
                      <TouchableOpacity
                        key={district.code}
                        style={styles.locationOption}
                        onPress={() => handleDistrictSelect(district.code)}
                      >
                        <View style={styles.checkbox}>
                          {selectedDistrict === district.code ? (
                            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                          ) : null}
                        </View>
                        <Text style={styles.locationOptionText}>{district.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Show wards */}
                {locationLevel === 'ward' && (
                  <View style={styles.filterSection}>
                    {wards.map((ward) => (
                      <TouchableOpacity
                        key={ward.code}
                        style={styles.locationOption}
                        onPress={() => handleWardSelect(ward.name)}
                      >
                        <View style={styles.checkbox}>
                          {selectedDistrict === ward.districtCode ? (
                            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                          ) : null}
                        </View>
                        <Text style={styles.locationOptionText}>{ward.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
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
  showMoreButton: {
    paddingVertical: 12,
    marginTop: 8,
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

