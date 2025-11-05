import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

// Splash Screen Component
const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const fadeAnim = useState(new Animated.Value(1))[0]; // Start at 1 to show immediately
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.splashContainer}>
      <StatusBar barStyle="dark-content" />
      <Animated.View style={[styles.splashContent, { opacity: fadeAnim }]}>
        {imageError ? (
          <>
            <View style={styles.logoCircle}>
              <View style={styles.logoCircleInner} />
            </View>
            <Text style={styles.logoText}>Clive Green</Text>
          </>
        ) : (
          <ExpoImage
            source={require("../../assets/images/image-booking.png")}
            style={styles.splashImage}
            contentFit="cover"
            transition={200}
            onError={(error) => {
              console.log("Expo Image loading error:", error);
              setImageError(true);
            }}
            onLoad={() => {
              console.log("Expo Image loaded successfully");
            }}
          />
        )}
      </Animated.View>
    </View>
  );
};

const OnboardingApp = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  const flatListRef = useRef<any>(null);
  const router = useRouter();

  const slides = [
    {
      id: "1",
      title: "Easy way to book hotels with us",
      description:
        "It is a long established fact that a reader will be distracted by the readable content.",
      image:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
    },
    {
      id: "2",
      title: "Discover and find your perfect healing place",
      description:
        "It is a long established fact that a reader will be distracted by the readable content.",
      image:
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
    },
    {
      id: "3",
      title: "Giving the best deal just for you",
      description:
        "It is a long established fact that a reader will be distracted by the readable content.",
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    },
  ];

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    } else {
      router.replace("/(auth)/register");
    }
  };

  const handleSkip = () => {
    const lastIndex = slides.length - 1;
    flatListRef.current?.scrollToIndex({
      index: lastIndex,
      animated: true,
    });
    setCurrentIndex(lastIndex);
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderItem = ({ item, index }: any) => {
    const isLast = index === slides.length - 1;

    return (
      <View style={styles.slide}>
        <StatusBar barStyle="light-content" />
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.cardContainer}>
          {renderDots()}
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
          <View style={styles.buttonContainer}>
            {!isLast ? (
              <>
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleSkip}
                  activeOpacity={0.7}
                >
                  <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={handleNext}
                  activeOpacity={0.8}
                >
                  <Text style={styles.nextButtonText}>Next</Text>
                  <Text style={styles.arrow}>→</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.getStartedButton}
                onPress={handleNext}
                activeOpacity={0.8}
              >
                <Text style={styles.getStartedButtonText}>Get Started</Text>
                <Text style={styles.arrow}>→</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEnabled={true}
        bounces={false}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  splashContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  splashImage: {
    width: 250,
    height: 250,
    minWidth: 200,
    minHeight: 200,
  },
  logoCircle: {
    width: 80,
    height: 80,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircleInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 8,
    borderColor: "#A78BFA",
    borderTopColor: "transparent",
    borderRightColor: "transparent",
    transform: [{ rotate: "-45deg" }],
  },
  logoText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#A78BFA",
    letterSpacing: 1,
  },

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  slide: {
    width: width,
    height: height,
    backgroundColor: "#FFFFFF",
  },
  imageContainer: {
    width: width,
    height: height * 0.65,
    position: "relative",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  cardContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    minHeight: height * 0.35,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    gap: 8,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  activeDot: {
    width: 24,
    backgroundColor: "#4F46E5",
  },
  inactiveDot: {
    width: 4,
    backgroundColor: "#D1D5DB",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    lineHeight: 36,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
    marginBottom: 32,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  skipButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  nextButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "#4F46E5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    maxWidth: 150,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  getStartedButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "#4F46E5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  getStartedButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  arrow: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default OnboardingApp;