import React, { useEffect, useState } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { queryClient } from "../services/queryClient";

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  // Đợi auth và router sẵn sàng trước khi thực hiện navigation
  useEffect(() => {
    if (isLoading) {
      setIsNavigationReady(false);
      return;
    }

    // Đợi một chút để đảm bảo router đã được khởi tạo hoàn toàn
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 150);

    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    // Chỉ thực hiện navigation khi cả auth và router đều sẵn sàng
    if (isLoading || !isNavigationReady) return;

    const performNavigation = () => {
      try {
        const currentSegment = segments && segments.length > 0 ? segments[0] : null;
        const inAuthGroup = currentSegment === "(auth)";
        const inTabsGroup = currentSegment === "(tabs)";
        const lastSegment = segments && segments.length > 0 ? segments[segments.length - 1] : null;
        const isOnOnboarding = inTabsGroup && lastSegment === "onboarding";
        const isInAuthFlow = inAuthGroup;
        const isFilterScreen = currentSegment === "filter";

        // Định hướng dựa trên trạng thái authentication
        if (!isAuthenticated) {
          // Chưa đăng nhập: 
          // - Nếu đang ở onboarding hoặc auth flow -> KHÔNG redirect (để user tự điều hướng)
          // - Nếu không ở onboarding và không ở auth flow -> redirect về onboarding
          if (!isOnOnboarding && !isInAuthFlow) {
            // Chỉ redirect nếu không đang ở onboarding và không đang ở auth flow
            router.replace("/(tabs)/onboarding");
          }
        } else {
          // Đã đăng nhập: chuyển đến booking nếu:
          // - Đang ở auth group, hoặc
          // - Đang ở onboarding, hoặc
          // - Không ở tabs group (có thể đang ở root hoặc trang khác)
          if (inAuthGroup || isOnOnboarding || (!inTabsGroup && !isFilterScreen)) {
            router.replace("/(tabs)/booking");
          }
        }
      } catch (error: any) {
        // Router chưa sẵn sàng, sẽ thử lại ở lần render tiếp theo
        const errorMessage = error && error.message ? error.message : String(error);
        console.log("Router chưa sẵn sàng, sẽ thử lại ở lần render tiếp theo...", errorMessage);
      }
    };

    performNavigation();
  }, [isAuthenticated, isLoading, segments, isNavigationReady, router]);

  // Hiển thị loading nếu auth đang load hoặc navigation chưa sẵn sàng
  if (isLoading || !isNavigationReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});
