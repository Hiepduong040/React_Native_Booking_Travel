import { Ionicons } from "@expo/vector-icons";
import { useRouter, Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { authService, RegisterRequest } from "../../services/auth";
import { theme } from "../../constants/theme";

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [showPassword, setShowPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const formatDate = (date: Date): string => {
    const month = date.toLocaleDateString("en-US", { month: "long" });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleRegister = async () => {
    // Validate
    if (!firstName || !lastName || !email || !phoneNumber || !password || !dateOfBirth) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    // Validate phone number (only digits, 10-20 digits)
    const phoneRegex = /^[0-9]{10,20}$/;
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      Alert.alert("Lỗi", "Số điện thoại phải có 10-20 chữ số");
      return;
    }

    setLoading(true);
    try {
      const registerData: RegisterRequest = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: cleanPhone,
        password: password,
        dateOfBirth: formatDateForAPI(dateOfBirth!),
        gender: gender,
      };

      const response = await authService.register(registerData);

      if (response.success) {
        Alert.alert("Thành công", response.message || "Đăng ký thành công! Vui lòng kiểm tra email để xác minh OTP.", [
          {
            text: "OK",
            onPress: () => {
              router.push({
                pathname: "/(auth)/otp-verification",
                params: { email: email.trim().toLowerCase() },
              });
            },
          },
        ]);
      } else {
        Alert.alert("Lỗi", response.message || "Đăng ký thất bại");
      }
    } catch (error: any) {
      console.error('Register error:', error);
      let errorMessage = "Đăng ký thất bại. Vui lòng thử lại.";
      
      if (error.isNetworkError) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      }
      
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDateConfirm = (date: Date) => {
    setDateOfBirth(date);
    setShowDatePicker(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <View style={styles.logoCircleInner} />
            </View>
            <Text style={styles.logoText}>Live Green</Text>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Register Now!</Text>
            <Text style={styles.subtitle}>Enter your information below</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* First Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Nguyen"
                placeholderTextColor="#9CA3AF"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>

            {/* Last Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Van A"
                placeholderTextColor="#9CA3AF"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>

            {/* Email Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="user@example.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
            </View>

            {/* Mobile Number Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                placeholder="0123456789"
                placeholderTextColor="#9CA3AF"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>

            {/* Date of Birth Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date of Birth</Text>
              <TouchableOpacity
                style={styles.inputWithIcon}
                onPress={() => {
                  if (!loading) {
                    setShowDatePicker(true);
                  }
                }}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.inputWithIconText,
                    !dateOfBirth && styles.placeholderText,
                  ]}
                >
                  {dateOfBirth ? formatDate(dateOfBirth) : "Select your date of birth"}
                </Text>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={loading ? "#D1D5DB" : "#6B7280"}
                  style={styles.inputIcon}
                />
              </TouchableOpacity>
            </View>

            {/* Password Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={[styles.input, styles.inputWithIconText]}
                  placeholder="**********"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.iconButton}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Gender Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    gender === "MALE" && styles.genderOptionActive,
                  ]}
                  onPress={() => setGender("MALE")}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.radioButton,
                      gender === "MALE" && styles.radioButtonActive,
                    ]}
                  >
                    {gender === "MALE" && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.genderText,
                      gender === "MALE" && styles.genderTextActive,
                    ]}
                  >
                    Male
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    gender === "FEMALE" && styles.genderOptionActive,
                  ]}
                  onPress={() => setGender("FEMALE")}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.radioButton,
                      gender === "FEMALE" && styles.radioButtonActive,
                    ]}
                  >
                    {gender === "FEMALE" && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.genderText,
                      gender === "FEMALE" && styles.genderTextActive,
                    ]}
                  >
                    Female
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    gender === "OTHER" && styles.genderOptionActive,
                  ]}
                  onPress={() => setGender("OTHER")}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.radioButton,
                      gender === "OTHER" && styles.radioButtonActive,
                    ]}
                  >
                    {gender === "OTHER" && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.genderText,
                      gender === "OTHER" && styles.genderTextActive,
                    ]}
                  >
                    Other
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.authButton, loading && styles.authButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.authButtonText}>Register</Text>
              )}
            </TouchableOpacity>

            {/* Switch to Login */}
            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>Already a member? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.switchLink}>Login</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        date={dateOfBirth || new Date(2000, 0, 1)}
        maximumDate={new Date()}
        minimumDate={new Date(1900, 0, 1)}
        onConfirm={handleDateConfirm}
        onCancel={() => setShowDatePicker(false)}
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        locale="en_GB"
        cancelTextIOS="Cancel"
        confirmTextIOS="Confirm"
        textColor={Platform.OS === 'android' ? '#000000' : undefined}
        themeVariant="light"
      />
    </SafeAreaView>
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
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 10,
  },
  logoCircle: {
    width: 60,
    height: 60,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircleInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 6,
    borderColor: theme.colors.primary,
    borderTopColor: "transparent",
    borderRightColor: "transparent",
    transform: [{ rotate: "-45deg" }],
  },
  logoText: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "left",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "left",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputWithIconText: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  inputIcon: {
    marginLeft: 8,
  },
  iconButton: {
    padding: 4,
  },
  genderContainer: {
    flexDirection: "row",
    gap: 12,
  },
  genderOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  genderOptionActive: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonActive: {
    borderColor: theme.colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  genderText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  genderTextActive: {
    color: "#111827",
    fontWeight: "600",
  },
  authButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  switchText: {
    fontSize: 14,
    color: "#6B7280",
  },
  switchLink: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "600",
  },
});

