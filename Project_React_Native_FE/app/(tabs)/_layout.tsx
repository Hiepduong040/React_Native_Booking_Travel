import { Tabs, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { BOOKING_COLORS } from '../../constants/booking';

export default function TabLayout() {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1];
  const isOnboarding = currentRoute === 'onboarding';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: BOOKING_COLORS.PRIMARY,
        tabBarInactiveTintColor: BOOKING_COLORS.TEXT_SECONDARY,
        tabBarStyle: isOnboarding || !isAuthenticated ? { display: 'none' } : {
          backgroundColor: BOOKING_COLORS.BACKGROUND,
          borderTopWidth: 0,
          borderTopColor: 'transparent',
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          marginBottom: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="booking"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="onboarding"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="(products)"
        options={{
          href: null, 
        }}
      />
      <Tabs.Screen
        name="booking-details"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="payment"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="booking-success"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
