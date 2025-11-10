import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    View,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Modal,
    Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { BOOKING_COLORS } from "@/constants/booking";
import { useRoomDetails } from "@/hooks/useRoomDetails";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = (width - 24) / 2;

export default function PhotoGalleryScreen() {
    const { id, roomId } = useLocalSearchParams<{ id?: string; roomId?: string }>();
    const realId = id ?? roomId;
    const { room, loading } = useRoomDetails(realId || "0");

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // ✅ scale animation shared value (dùng chung)
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withTiming(0.95, { duration: 100 });
    };

    const handlePressOut = () => {
        scale.value = withTiming(1, { duration: 100 });
    };

    if (loading || !room) {
        return (
            <SafeAreaView style={styles.center}>
                <Text>Đang tải ảnh...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={BOOKING_COLORS.TEXT_PRIMARY} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tất cả hình ảnh</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Image Grid */}
            <ScrollView contentContainerStyle={styles.grid}>
                {room.imageUrls?.map((url, index) => (
                    <Animated.View key={index} style={[styles.imageWrapper, animatedStyle]}>
                        <TouchableOpacity
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            onPress={() => setSelectedImage(url)}
                            activeOpacity={0.9}
                        >
                            <ExpoImage
                                source={{ uri: url }}
                                style={styles.image}
                                contentFit="cover"
                                transition={200}
                            />
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </ScrollView>

            {/* Fullscreen Modal */}
            <Modal visible={!!selectedImage} transparent animationType="fade">
                <View style={styles.fullscreenContainer}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setSelectedImage(null)}
                    >
                        <Ionicons name="close" size={32} color="#fff" />
                    </TouchableOpacity>
                    {selectedImage && (
                        <ExpoImage
                            source={{ uri: selectedImage }}
                            style={styles.fullscreenImage}
                            contentFit="contain"
                        />
                    )}
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: BOOKING_COLORS.TEXT_PRIMARY,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        padding: 8,
    },
    imageWrapper: {
        marginBottom: 8,
    },
    image: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        borderRadius: 10,
    },
    fullscreenContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.95)",
        justifyContent: "center",
        alignItems: "center",
    },
    fullscreenImage: {
        width: "100%",
        height: "100%",
    },
    closeButton: {
        position: "absolute",
        top: 50,
        right: 20,
        zIndex: 101,
    },
});