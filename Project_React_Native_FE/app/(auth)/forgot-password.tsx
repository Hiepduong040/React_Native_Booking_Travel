import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";

type ContactMethod = "sms" | "email" | null;

export default function ForgotPasswordScreen() {
  const [selectedMethod, setSelectedMethod] = useState<ContactMethod>(null);
  const router = useRouter();

  const handleContinue = () => {
    if (selectedMethod) {
      router.push({
        pathname: "/(auth)/otp-verification",
        params: { method: selectedMethod },
      } as any);
    }
  };

  return (
    <RNSafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Select which contact details should we use to reset your password
            </Text>
          </View>

          {/* Illustration Placeholder */}
          <View style={styles.illustrationContainer}>
            <View style={styles.illustration}>
              <Ionicons name="lock-closed-outline" size={80} color={theme.colors.primary} />
            </View>
          </View>

          {/* Contact Method Options */}
          <View style={styles.optionsContainer}>
            {/* SMS Option */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                selectedMethod === "sms" && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedMethod("sms")}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    selectedMethod === "sms"
                      ? styles.iconContainerActive
                      : styles.iconContainerInactive,
                  ]}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={24}
                    color={selectedMethod === "sms" ? "#FFFFFF" : "#6B7280"}
                  />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Send OTP via SMS</Text>
                  <Text
                    style={[
                      styles.optionValue,
                      selectedMethod === "sms"
                        ? styles.optionValueActive
                        : styles.optionValueInactive,
                    ]}
                  >
                    (209) 555-0104
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.radioButton,
                  selectedMethod === "sms" && styles.radioButtonSelected,
                ]}
              >
                {selectedMethod === "sms" && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>

            {/* Email Option */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                selectedMethod === "email" && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedMethod("email")}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    selectedMethod === "email"
                      ? styles.iconContainerActive
                      : styles.iconContainerInactive,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={24}
                    color={selectedMethod === "email" ? "#FFFFFF" : "#6B7280"}
                  />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Send OTP via Email</Text>
                  <Text
                    style={[
                      styles.optionValue,
                      selectedMethod === "email"
                        ? styles.optionValueActive
                        : styles.optionValueInactive,
                    ]}
                  >
                    curtis.weaver@example.com
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.radioButton,
                  selectedMethod === "email" && styles.radioButtonSelected,
                ]}
              >
                {selectedMethod === "email" && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedMethod && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selectedMethod}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </RNSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
  },
  illustrationContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    height: 200,
  },
  illustration: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  optionsContainer: {
    marginBottom: 32,
    gap: 16,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
    minHeight: 80,
  },
  optionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: "#F5F3FF",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  iconContainerActive: {
    backgroundColor: theme.colors.primary,
  },
  iconContainerInactive: {
    backgroundColor: "#F3F4F6",
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  optionValue: {
    fontSize: 14,
  },
  optionValueActive: {
    color: theme.colors.primary,
    fontWeight: "500",
  },
  optionValueInactive: {
    color: "#6B7280",
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: theme.colors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  continueButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
  },
  continueButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

