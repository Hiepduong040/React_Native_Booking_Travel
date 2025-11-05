import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function BookingScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const popularHotels = [
    {
      id: 1,
      name: 'Grand Hotel',
      location: 'New York, USA',
      price: 120,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    },
    {
      id: 2,
      name: 'Beach Resort',
      location: 'Miami, USA',
      price: 200,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    },
    {
      id: 3,
      name: 'Mountain View',
      location: 'Switzerland',
      price: 150,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    },
  ];

  const categories = ['All', 'Hotels', 'Resorts', 'Villas', 'Apartments'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Hello,</Text>
              <Text style={styles.userName}>Welcome Back!</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
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
            <TouchableOpacity style={styles.filterButton}>
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

        {/* Popular Hotels Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Hotels</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hotelsScroll}
          >
            {popularHotels.map((hotel) => (
              <TouchableOpacity key={hotel.id} style={styles.hotelCard}>
                <Image
                  source={{ uri: hotel.image }}
                  style={styles.hotelImage}
                  resizeMode="cover"
                />
                <View style={styles.hotelInfo}>
                  <View style={styles.hotelHeader}>
                    <Text style={styles.hotelName} numberOfLines={1}>
                      {hotel.name}
                    </Text>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.ratingText}>{hotel.rating}</Text>
                    </View>
                  </View>
                  <View style={styles.locationContainer}>
                    <Ionicons name="location-outline" size={14} color="#9CA3AF" />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {hotel.location}
                    </Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>${hotel.price}</Text>
                    <Text style={styles.priceUnit}>/night</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recommended Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recommendedList}>
            {popularHotels.map((hotel) => (
              <TouchableOpacity key={hotel.id} style={styles.recommendedCard}>
                <Image
                  source={{ uri: hotel.image }}
                  style={styles.recommendedImage}
                  resizeMode="cover"
                />
                <View style={styles.recommendedInfo}>
                  <Text style={styles.recommendedName} numberOfLines={1}>
                    {hotel.name}
                  </Text>
                  <View style={styles.locationContainer}>
                    <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                    <Text style={styles.recommendedLocation} numberOfLines={1}>
                      {hotel.location}
                    </Text>
                  </View>
                  <View style={styles.recommendedFooter}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={12} color="#FFD700" />
                      <Text style={styles.recommendedRating}>{hotel.rating}</Text>
                    </View>
                    <View style={styles.recommendedPrice}>
                      <Text style={styles.recommendedPriceText}>${hotel.price}</Text>
                      <Text style={styles.recommendedPriceUnit}>/night</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
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

