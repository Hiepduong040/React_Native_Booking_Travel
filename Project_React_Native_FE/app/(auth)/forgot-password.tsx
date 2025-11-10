import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
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
import { authService, ForgotPasswordRequest, ResetPasswordRequest } from "../../services/auth";
import { theme } from "../../constants/theme";

type Step = "method" | "email" | "otp" | "password";

interface ValidationErrors {
  email?: string;
  otp?: string;
  password?: string;
  confirmPassword?: string;
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("method");
  const [method, setMethod] = useState<"email" | "phone" | null>(null);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (step === "otp" && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  const handleMethodSelect = (selectedMethod: "email" | "phone") => {
    setMethod(selectedMethod);
    if (selectedMethod === "phone") {
      Alert.alert(
        "Chức năng chưa hỗ trợ",
        "Chức năng gửi OTP qua điện thoại đang được phát triển. Vui lòng sử dụng email.",
        [
          {
            text: "Quay lại",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      setStep("email");
    }
  };

  const validateEmail = (): boolean => {
    const newErrors: ValidationErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@gmail\.com$/i;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = "Only Gmail addresses are allowed (@gmail.com)";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateEmail()) {
      return;
    }

    setLoading(true);
    try {
      const requestData: ForgotPasswordRequest = {
        email: email.trim(),
      };

      const response = await authService.forgotPassword(requestData);

      if (response.success) {
        Alert.alert("Thành công", response.message || "Mã OTP đã được gửi đến email của bạn.");
        setStep("otp");
        setTimer(60);
        setCanResend(false);
      } else {
        Alert.alert("Lỗi", response.message || "Không thể gửi OTP. Vui lòng thử lại.");
      }
    } catch (error: any) {
      console.error("Forgot password error:", error);
      let errorMessage = "Không thể gửi OTP. Vui lòng thử lại.";
      
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

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split("");
      const newOtp = [...otp];
      pastedOtp.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + pastedOtp.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    await handleSendOtp();
  };

  const validateOtp = (): boolean => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setErrors({ otp: "Vui lòng nhập đầy đủ 6 chữ số OTP" });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleVerifyOtp = () => {
    if (validateOtp()) {
      setStep("password");
    }
  };

  const validatePassword = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!password) {
      newErrors.password = "Mật khẩu mới is required";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Xác nhận mật khẩu is required";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    try {
      const otpCode = otp.join("");
      const requestData: ResetPasswordRequest = {
        email: email.trim(),
        otpCode: otpCode,
        newPassword: password,
        confirmPassword: confirmPassword,
      };

      const response = await authService.resetPassword(requestData);

      if (response.success) {
        Alert.alert(
          "Thành công",
          response.message || "Đặt lại mật khẩu thành công. Vui lòng đăng nhập.",
          [
            {
              text: "Đăng nhập",
              onPress: () => router.replace("/(auth)/login"),
            },
          ]
        );
      } else {
        Alert.alert("Lỗi", response.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại.");
      }
    } catch (error: any) {
      console.error("Reset password error:", error);
      let errorMessage = "Không thể đặt lại mật khẩu. Vui lòng thử lại.";
      
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

  const renderMethodSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Chọn phương thức khôi phục</Text>
      <Text style={styles.stepSubtitle}>Chọn cách bạn muốn nhận mã OTP</Text>

      <TouchableOpacity
        style={styles.methodButton}
        onPress={() => handleMethodSelect("email")}
        activeOpacity={0.7}
      >
        <Ionicons name="mail-outline" size={24} color={theme.colors.primary} />
        <View style={styles.methodButtonContent}>
          <Text style={styles.methodButtonTitle}>Gửi qua Email</Text>
          <Text style={styles.methodButtonSubtitle}>Nhận mã OTP qua email đã đăng ký</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.methodButton}
        onPress={() => handleMethodSelect("phone")}
        activeOpacity={0.7}
      >
        <Ionicons name="call-outline" size={24} color={theme.colors.primary} />
        <View style={styles.methodButtonContent}>
          <Text style={styles.methodButtonTitle}>Gửi qua Điện thoại</Text>
          <Text style={styles.methodButtonSubtitle}>Nhận mã OTP qua SMS</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );

  const renderEmailStep = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setStep("method")}
      >
        <Ionicons name="arrow-back" size={24} color="#111827" />
      </TouchableOpacity>

      <Text style={styles.stepTitle}>Nhập Email</Text>
      <Text style={styles.stepSubtitle}>Nhập email đã đăng ký để nhận mã OTP</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="curtis.weaver@gmail.com"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) {
              setErrors({ ...errors, email: undefined });
            }
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          editable={!loading}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
        onPress={handleSendOtp}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Gửi mã OTP</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderOtpStep = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setStep("email")}
      >
        <Ionicons name="arrow-back" size={24} color="#111827" />
      </TouchableOpacity>

      <Text style={styles.stepTitle}>Xác thực OTP</Text>
      <Text style={styles.stepSubtitle}>
        Nhập mã OTP đã được gửi đến {email}
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
           ref={(ref) => { inputRefs.current[index] = ref; }}
            style={[styles.otpInput, errors.otp && styles.inputError]}
            value={digit}
            onChangeText={(value) => {
              handleOtpChange(value, index);
              if (errors.otp) {
                setErrors({ ...errors, otp: undefined });
              }
            }}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            editable={!loading}
          />
        ))}
      </View>
      {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}

      <View style={styles.timerContainer}>
        {timer > 0 ? (
          <Text style={styles.timerText}>
            Gửi lại mã sau {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
          </Text>
        ) : (
          <TouchableOpacity onPress={handleResendOtp} disabled={loading}>
            <Text style={styles.resendText}>Gửi lại mã OTP</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
        onPress={handleVerifyOtp}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>Xác thực</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPasswordStep = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setStep("otp")}
      >
        <Ionicons name="arrow-back" size={24} color="#111827" />
      </TouchableOpacity>

      <Text style={styles.stepTitle}>Đặt lại mật khẩu</Text>
      <Text style={styles.stepSubtitle}>Nhập mật khẩu mới của bạn</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mật khẩu mới</Text>
        <View style={[
          styles.inputWithIcon,
          errors.password && styles.inputError,
        ]}>
          <TextInput
            style={[styles.input, styles.inputWithIconText]}
            placeholder="Nhập mật khẩu mới"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) {
                setErrors({ ...errors, password: undefined });
              }
            }}
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
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Xác nhận mật khẩu</Text>
        <View style={[
          styles.inputWithIcon,
          errors.confirmPassword && styles.inputError,
        ]}>
          <TextInput
            style={[styles.input, styles.inputWithIconText]}
            placeholder="Nhập lại mật khẩu mới"
            placeholderTextColor="#9CA3AF"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) {
                setErrors({ ...errors, confirmPassword: undefined });
              }
            }}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.iconButton}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
        onPress={handleResetPassword}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Đặt lại mật khẩu</Text>
        )}
      </TouchableOpacity>
    </View>
  );

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

          {/* Step Content */}
          {step === "method" && renderMethodSelection()}
          {step === "email" && renderEmailStep()}
          {step === "otp" && renderOtpStep()}
          {step === "password" && renderPasswordStep()}
        </ScrollView>
      </KeyboardAvoidingView>
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
  stepContainer: {
    width: "100%",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 24,
    padding: 4,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "left",
  },
  stepSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 32,
    textAlign: "left",
  },
  methodButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  methodButtonContent: {
    flex: 1,
    marginLeft: 12,
  },
  methodButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  methodButtonSubtitle: {
    fontSize: 14,
    color: "#6B7280",
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
  inputError: {
    borderColor: "#EF4444",
    borderWidth: 2,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
  },
  inputWithIconText: {
    flex: 1,
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 14,
  },
  iconButton: {
    padding: 4,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  otpInput: {
    width: 50,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  timerText: {
    fontSize: 14,
    color: "#6B7280",
  },
  resendText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
