import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BOOKING_COLORS } from '../../constants/booking';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'cancel' | 'review' | 'payment';
  timestamp: Date;
  isRead: boolean;
}

const NOTIFICATION_STORAGE_KEY = '@notifications';

export default function MessagesScreen(): React.JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load notifications from storage
  React.useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const notificationsWithDates = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
        setNotifications(notificationsWithDates);
      } else {
        // Sample notifications for demo
        const sampleNotifications: Notification[] = [
          {
            id: '1',
            title: 'Đặt phòng thành công',
            message: 'Bạn đã đặt phòng thành công tại Hotel ABC từ 15/12/2024 đến 18/12/2024',
            type: 'booking',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            isRead: false,
          },
          {
            id: '2',
            title: 'Hủy đặt phòng',
            message: 'Bạn đã hủy đặt phòng tại Hotel XYZ thành công',
            type: 'cancel',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
            isRead: false,
          },
          {
            id: '3',
            title: 'Đánh giá đã được gửi',
            message: 'Cảm ơn bạn đã đánh giá phòng. Đánh giá của bạn đã được ghi nhận.',
            type: 'review',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            isRead: true,
          },
        ];
        setNotifications(sampleNotifications);
        await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(sampleNotifications));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    setNotifications(updated);
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated));
  };

  const markAllAsRead = async () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteNotification = async (id: string) => {
    Alert.alert('Xóa thông báo', 'Bạn có chắc chắn muốn xóa thông báo này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          const updated = notifications.filter((n) => n.id !== id);
          setNotifications(updated);
          await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated));
        },
      },
    ]);
  };

  const deleteAllNotifications = async () => {
    Alert.alert('Xóa tất cả', 'Bạn có chắc chắn muốn xóa tất cả thông báo?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa tất cả',
        style: 'destructive',
        onPress: async () => {
          setNotifications([]);
          await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify([]));
        },
      },
    ]);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return 'calendar-outline';
      case 'cancel':
        return 'close-circle-outline';
      case 'review':
        return 'star-outline';
      case 'payment':
        return 'card-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking':
        return '#10B981';
      case 'cancel':
        return '#EF4444';
      case 'review':
        return '#F59E0B';
      case 'payment':
        return '#3B82F6';
      default:
        return BOOKING_COLORS.PRIMARY;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={BOOKING_COLORS.BACKGROUND} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.length > 0 && (
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={markAllAsRead} style={styles.headerButton}>
                <Ionicons name="checkmark-done-outline" size={24} color={BOOKING_COLORS.PRIMARY} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={deleteAllNotifications} style={styles.headerButton}>
              <Ionicons name="trash-outline" size={24} color={BOOKING_COLORS.TEXT_SECONDARY} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Notifications List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.centerContent}>
            <Text style={styles.loadingText}>Đang tải thông báo...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.centerContent}>
            <Ionicons name="notifications-off-outline" size={64} color={BOOKING_COLORS.TEXT_SECONDARY} />
            <Text style={styles.emptyText}>Không có thông báo nào</Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.isRead && styles.unreadCard,
              ]}
              onPress={() => markAsRead(notification.id)}
              activeOpacity={0.7}>
              <View style={styles.notificationContent}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: getNotificationColor(notification.type) + '20' },
                  ]}>
                  <Ionicons
                    name={getNotificationIcon(notification.type) as any}
                    size={24}
                    color={getNotificationColor(notification.type)}
                  />
                </View>
                <View style={styles.notificationText}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    {!notification.isRead && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.notificationTime}>
                    {formatTimestamp(notification.timestamp)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => deleteNotification(notification.id)}
                style={styles.deleteButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={20} color={BOOKING_COLORS.TEXT_SECONDARY} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BOOKING_COLORS.BORDER,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  notificationCard: {
    backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unreadCard: {
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    borderLeftWidth: 4,
    borderLeftColor: BOOKING_COLORS.PRIMARY,
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BOOKING_COLORS.PRIMARY,
  },
  notificationMessage: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  deleteButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

