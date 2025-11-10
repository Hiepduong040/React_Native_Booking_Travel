import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_SIZE = (SCREEN_WIDTH - 48) / 2; // 2 columns with padding

export default function PhotosScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ images?: string; initialIndex?: string }>();
  
  // Parse images from params (comma-separated string)
  const images = params.images ? params.images.split(',') : [];
  const initialIndex = params.initialIndex ? parseInt(params.initialIndex, 10) : 0;
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(initialIndex);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [fullScreenIndex, setFullScreenIndex] = useState(0);

  const handleImagePress = (index: number) => {
    setFullScreenIndex(index);
    setShowFullScreen(true);
  };

  const handleCloseFullScreen = () => {
    setShowFullScreen(false);
  };

  const handlePrevious = () => {
    if (fullScreenIndex > 0) {
      setFullScreenIndex(fullScreenIndex - 1);
    }
  };

  const handleNext = () => {
    if (fullScreenIndex < images.length - 1) {
      setFullScreenIndex(fullScreenIndex + 1);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photos</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Image Grid */}
      <FlatList
        data={images}
        numColumns={2}
        keyExtractor={(item, index) => `photo-${index}`}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.row}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => handleImagePress(index)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: item }}
              style={styles.gridImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>No photos available</Text>
          </View>
        }
      />

      {/* Full Screen Image Modal */}
      <Modal
        visible={showFullScreen}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseFullScreen}
      >
        <View style={styles.fullScreenContainer}>
          <StatusBar barStyle="light-content" />
          
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCloseFullScreen}
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Image Counter */}
          <View style={styles.fullScreenCounter}>
            <Text style={styles.fullScreenCounterText}>
              {fullScreenIndex + 1} / {images.length}
            </Text>
          </View>

          {/* Scrollable Image View */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: fullScreenIndex * SCREEN_WIDTH, y: 0 }}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setFullScreenIndex(index);
            }}
            style={styles.fullScreenScrollView}
          >
            {images.map((image, index) => (
              <ScrollView
                key={`fullscreen-${index}`}
                maximumZoomScale={3}
                minimumZoomScale={1}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                style={styles.zoomableScrollView}
                contentContainerStyle={styles.zoomableContent}
              >
                <Image
                  source={{ uri: image }}
                  style={styles.fullScreenImage}
                  resizeMode="contain"
                />
              </ScrollView>
            ))}
          </ScrollView>

          {/* Navigation Arrows */}
          {fullScreenIndex > 0 && (
            <TouchableOpacity
              style={[styles.navButton, styles.prevButton]}
              onPress={handlePrevious}
            >
              <Ionicons name="chevron-back" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          {fullScreenIndex < images.length - 1 && (
            <TouchableOpacity
              style={[styles.navButton, styles.nextButton]}
              onPress={handleNext}
            >
              <Ionicons name="chevron-forward" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  gridContainer: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenCounter: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  fullScreenCounterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  fullScreenScrollView: {
    flex: 1,
  },
  zoomableScrollView: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  zoomableContent: {
    justifyContent: 'center',
    alignItems: 'center',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  fullScreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  prevButton: {
    left: 20,
  },
  nextButton: {
    right: 20,
  },
});


