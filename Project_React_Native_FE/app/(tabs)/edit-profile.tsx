import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../constants/theme';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUserInfo, updateUserInfo, UpdateUserRequest } from '../../apis/userApi';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { uploadImageToCloudinary } from '../../services/cloudinary';

export default function EditProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    data: userInfo,
    isLoading,
  } = useQuery({
    queryKey: ['userInfo'],
    queryFn: getCurrentUserInfo,
  });

  const [formData, setFormData] = useState<UpdateUserRequest>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: undefined,
    gender: undefined,
    avatarUrl: '',
  });
  const [validationErrors, setValidationErrors] = useState<{
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: string;
  }>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (userInfo) {
      setFormData({
        firstName: userInfo.firstName || '',
        lastName: userInfo.lastName || '',
        phoneNumber: userInfo.phoneNumber || '',
        dateOfBirth: userInfo.dateOfBirth || undefined,
        gender: userInfo.gender || undefined,
        avatarUrl: userInfo.avatarUrl || '',
      });
      if (userInfo.avatarUrl) {
        setLocalImageUri(userInfo.avatarUrl);
      }
    }
  }, [userInfo]);

  // Request permissions for image picker
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Cần quyền truy cập',
            'Ứng dụng cần quyền truy cập thư viện ảnh để upload ảnh đại diện.',
          );
        }
      }
    })();
  }, []);

  const updateMutation = useMutation({
    mutationFn: updateUserInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userInfo'] });
      Alert.alert('Thành công', 'Cập nhật thông tin thành công', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật thông tin');
    },
  });

  const handleDateConfirm = (selectedDate: Date) => {
    const dateString = selectedDate.toISOString().split('T')[0];
    setFormData({ ...formData, dateOfBirth: dateString });
    if (validationErrors.dateOfBirth) {
      setValidationErrors({ ...validationErrors, dateOfBirth: undefined });
    }
    setShowDatePicker(false);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 20) {
      setFormData({ ...formData, phoneNumber: cleaned });
      // Clear error khi người dùng nhập
      if (validationErrors.phoneNumber) {
        setValidationErrors({ ...validationErrors, phoneNumber: undefined });
      }
    }
  };

  const validateForm = (): boolean => {
    const errors: {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      dateOfBirth?: string;
      gender?: string;
    } = {};

    // Validate firstName
    if (!formData.firstName || !formData.firstName.trim()) {
      errors.firstName = 'Họ không được để trống';
    } else if (/[0-9]/.test(formData.firstName)) {
      errors.firstName = 'Họ không được chứa số';
    }

    // Validate lastName
    if (!formData.lastName || !formData.lastName.trim()) {
      errors.lastName = 'Tên không được để trống';
    } else if (/[0-9]/.test(formData.lastName)) {
      errors.lastName = 'Tên không được chứa số';
    }

    // Validate phoneNumber
    if (!formData.phoneNumber || !formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Số điện thoại không được để trống';
    } else {
      const cleanPhone = formData.phoneNumber.replace(/\D/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 20) {
        errors.phoneNumber = 'Số điện thoại phải có từ 10 đến 20 chữ số';
      } else if (!/^[0-9]{10,20}$/.test(cleanPhone)) {
        errors.phoneNumber = 'Số điện thoại không hợp lệ';
      }
    }

    // Validate dateOfBirth
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Ngày sinh không được để trống';
    }

    // Validate gender
    if (!formData.gender) {
      errors.gender = 'Giới tính không được để trống';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [ImagePicker.MediaType.Images],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setLocalImageUri(imageUri);
        
        // Upload image to Cloudinary
        setUploadingImage(true);
        try {
          const uploadResult = await uploadImageToCloudinary(imageUri);
          setFormData({ ...formData, avatarUrl: uploadResult.secure_url });
          Alert.alert('Thành công', 'Ảnh đã được upload thành công');
        } catch (error: any) {
          console.error('Error uploading image:', error);
          Alert.alert('Lỗi', error.message || 'Không thể upload ảnh. Vui lòng thử lại.');
          setLocalImageUri(null);
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };

  const handleUpdate = () => {
    if (!validateForm()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin và kiểm tra lại các trường bị lỗi');
      return;
    }
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Picture */}
        <View style={styles.profilePictureContainer}>
          <View style={styles.profilePictureWrapper}>
            {uploadingImage ? (
              <View style={styles.profilePicturePlaceholder}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : localImageUri ? (
              <Image source={{ uri: localImageUri }} style={styles.profilePicture} />
            ) : userInfo?.avatarUrl ? (
              <Image source={{ uri: userInfo.avatarUrl }} style={styles.profilePicture} />
            ) : (
              <View style={styles.profilePicturePlaceholder}>
                <Ionicons name="person" size={60} color="#9CA3AF" />
              </View>
            )}
            <TouchableOpacity
              style={[styles.editPictureButton, uploadingImage && styles.editPictureButtonDisabled]}
              onPress={handlePickImage}
              disabled={uploadingImage}>
              {uploadingImage ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="create" size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          {/* First Name */}
          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>First Name</Text>
            <View style={[styles.inputBox, validationErrors.firstName && styles.inputBoxError]}>
              <TextInput
                style={styles.inputText}
                value={formData.firstName || ''}
                onChangeText={(text) => {
                  setFormData({ ...formData, firstName: text });
                  if (validationErrors.firstName) {
                    setValidationErrors({ ...validationErrors, firstName: undefined });
                  }
                }}
                placeholder="Enter your first name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            {validationErrors.firstName && (
              <Text style={styles.errorText}>{validationErrors.firstName}</Text>
            )}
          </View>

          {/* Last Name */}
          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <View style={[styles.inputBox, validationErrors.lastName && styles.inputBoxError]}>
              <TextInput
                style={styles.inputText}
                value={formData.lastName || ''}
                onChangeText={(text) => {
                  setFormData({ ...formData, lastName: text });
                  if (validationErrors.lastName) {
                    setValidationErrors({ ...validationErrors, lastName: undefined });
                  }
                }}
                placeholder="Enter your last name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            {validationErrors.lastName && (
              <Text style={styles.errorText}>{validationErrors.lastName}</Text>
            )}
          </View>

          {/* Email Address (Read-only) */}
          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={[styles.inputBox, styles.inputBoxDisabled]}>
              <Text style={styles.inputText}>{userInfo?.email || ''}</Text>
            </View>
          </View>

          {/* Mobile Number */}
          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            <View style={[styles.inputBox, validationErrors.phoneNumber && styles.inputBoxError]}>
              <TextInput
                style={styles.inputText}
                value={formData.phoneNumber || ''}
                onChangeText={handlePhoneChange}
                placeholder="Nhập số điện thoại (10-20 chữ số)"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={20}
              />
            </View>
            {validationErrors.phoneNumber && (
              <Text style={styles.errorText}>{validationErrors.phoneNumber}</Text>
            )}
          </View>

          {/* Date of Birth */}
          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Date of Birth</Text>
            <TouchableOpacity
              style={[styles.inputBox, validationErrors.dateOfBirth && styles.inputBoxError]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.inputText, !formData.dateOfBirth && styles.inputTextPlaceholder]}>
                {formData.dateOfBirth ? formatDate(formData.dateOfBirth) : 'Select date'}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            {validationErrors.dateOfBirth && (
              <Text style={styles.errorText}>{validationErrors.dateOfBirth}</Text>
            )}
          </View>
        </View>

        {/* Gender Selection */}
        <View style={styles.genderContainer}>
          <Text style={styles.genderTitle}>Gender</Text>
          {validationErrors.gender && (
            <Text style={styles.errorText}>{validationErrors.gender}</Text>
          )}
          <View style={styles.genderOptions}>
            <TouchableOpacity
              style={styles.genderOption}
              onPress={() => {
                setFormData({ ...formData, gender: 'MALE' });
                if (validationErrors.gender) {
                  setValidationErrors({ ...validationErrors, gender: undefined });
                }
              }}
            >
              <View style={styles.radioButton}>
                {formData.gender === 'MALE' && <View style={styles.radioButtonInner} />}
              </View>
              <Text style={styles.genderOptionText}>Male</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.genderOption}
              onPress={() => {
                setFormData({ ...formData, gender: 'FEMALE' });
                if (validationErrors.gender) {
                  setValidationErrors({ ...validationErrors, gender: undefined });
                }
              }}
            >
              <View style={styles.radioButton}>
                {formData.gender === 'FEMALE' && <View style={styles.radioButtonInner} />}
              </View>
              <Text style={styles.genderOptionText}>Female</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={[styles.updateButton, updateMutation.isPending && styles.updateButtonDisabled]}
          onPress={handleUpdate}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.updateButtonText}>Update</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        date={formData.dateOfBirth ? new Date(formData.dateOfBirth) : new Date()}
        maximumDate={new Date()}
        onConfirm={handleDateConfirm}
        onCancel={() => setShowDatePicker(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  scrollView: {
    flex: 1,
  },
  profilePictureContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  profilePictureWrapper: {
    position: 'relative',
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 16,
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editPictureButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  inputContainer: {
    paddingHorizontal: 20,
    gap: 20,
  },
  inputField: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
  },
  inputBoxDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  inputTextPlaceholder: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  genderContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  genderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  genderOptions: {
    gap: 16,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  genderOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  updateButton: {
    backgroundColor: theme.colors.primary,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  inputBoxError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
  editPictureButtonDisabled: {
    opacity: 0.6,
  },
});

