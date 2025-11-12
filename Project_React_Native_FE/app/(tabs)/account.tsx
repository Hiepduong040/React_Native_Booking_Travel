import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState, useCallback } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BOOKING_COLORS } from '../../constants/booking';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUserInfo } from '../../apis/userApi';

const FAVORITES_STORAGE_KEY = '@favorites';

export default function AccountScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [favoriteCount, setFavoriteCount] = useState(0);

  const {
    data: userInfo,
    isLoading,
  } = useQuery({
    queryKey: ['userInfo'],
    queryFn: getCurrentUserInfo,
    enabled: true,
  });

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const load = async () => {
        try {
          const json = await AsyncStorage.getItem("userProfile");
          if (isActive && json) {
            setProfile(JSON.parse(json));
          }
          
          // Load favorites count
          const favoritesJson = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
          if (favoritesJson) {
            const favorites = JSON.parse(favoritesJson);
            setFavoriteCount(Array.isArray(favorites) ? favorites.length : 0);
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      };
      load();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleLogout = async () => {
    Alert.alert(
      "Xác nhận đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất không?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  const displayName = userInfo 
    ? `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() || profile?.fullName
    : (profile?.fullName || "Khách");
  const displayEmail = userInfo?.email || profile?.email || "Chưa đăng nhập";
  const avatarUrl = userInfo?.avatarUrl || profile?.avatarUrl || "https://aic.com.vn/wp-content/uploads/2024/10/avatar-fb-mac-dinh-1.jpg";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image
            source={{
              uri: avatarUrl,
            }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{displayEmail}</Text>
        </View>

        <View style={styles.menu}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/edit-profile')}
          >
            <Ionicons name="create-outline" size={24} color="#4A5568" />
            <Text style={styles.menuText}>Edit Profile</Text>
            <FontAwesome5 name="chevron-right" size={16} color="#A0AEC0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="lock-closed-outline" size={24} color="#4A5568" />
            <Text style={styles.menuText}>Change Password</Text>
            <FontAwesome5 name="chevron-right" size={16} color="#A0AEC0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="card-outline" size={24} color="#4A5568" />
            <Text style={styles.menuText}>Payment Method</Text>
            <FontAwesome5 name="chevron-right" size={16} color="#A0AEC0" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/my-bookings')}
          >
            <Ionicons name="calendar-outline" size={24} color="#4A5568" />
            <Text style={styles.menuText}>My Bookings</Text>
            <FontAwesome5 name="chevron-right" size={16} color="#A0AEC0" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push({
              pathname: '/favorites',
              params: {},
            })}
          >
            <Ionicons name="heart-outline" size={24} color="#4A5568" />
            <Text style={styles.menuText}>Favorites</Text>
            {favoriteCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{favoriteCount}</Text>
              </View>
            )}
            <FontAwesome5 name="chevron-right" size={16} color="#A0AEC0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="eye-outline" size={24} color="#4A5568" />
            <Text style={styles.menuText}>Dark Mode</Text>
            <FontAwesome5 name="chevron-right" size={16} color="#A0AEC0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#4A5568" />
            <Text style={styles.menuText}>Privacy Policy</Text>
            <FontAwesome5 name="chevron-right" size={16} color="#A0AEC0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="document-text-outline" size={24} color="#4A5568" />
            <Text style={styles.menuText}>Term & Conditions</Text>
            <FontAwesome5 name="chevron-right" size={16} color="#A0AEC0" />
          </TouchableOpacity>
        </View>

        {userInfo || profile ? (
          <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#E53E3E" />
            <Text
              style={[styles.menuText, { color: "#E53E3E", fontWeight: "bold" }]}
            >
              Đăng xuất
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={() => router.push("/(auth)/login")}>
            <Ionicons name="log-in-outline" size={24} color="#3182CE" />
            <Text
              style={[styles.menuText, { color: "#3182CE", fontWeight: "bold" }]}
            >
              Đăng nhập
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 15,
    color: "#2D3748",
  },
  userEmail: {
    fontSize: 16,
    color: "#718096",
    marginTop: 5,
  },
  menu: {
    marginTop: 20,
  },
  menuItem: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  menuText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 18,
    color: "#2D3748",
  },
  badge: {
    backgroundColor: BOOKING_COLORS.PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: "#EDF2F7",
  },
});
