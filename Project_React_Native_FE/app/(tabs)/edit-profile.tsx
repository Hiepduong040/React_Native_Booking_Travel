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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUserInfo, updateUserInfo, UpdateUserRequest } from '../../apis/userApi';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

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
    }
  }, [userInfo]);

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

  const formatPhoneNumber = (phone: string): string => {
    // Format: (XXX) XXX-XXXX
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return `(${cleaned}`;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      setFormData({ ...formData, phoneNumber: cleaned });
    }
  };

  const handleUpdate = () => {
    if (!formData.firstName || !formData.lastName) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ họ và tên');
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

  const fullName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim();

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
            {userInfo?.avatarUrl ? (
              <Image source={{ uri: userInfo.avatarUrl }} style={styles.profilePicture} />
            ) : (
              <View style={styles.profilePicturePlaceholder}>
                <Ionicons name="person" size={60} color="#9CA3AF" />
              </View>
            )}
            <TouchableOpacity style={styles.editPictureButton}>
              <Ionicons name="create" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          {/* Name */}
          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Name</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.inputText}
                value={fullName}
                onChangeText={(text) => {
                  const parts = text.split(' ');
                  const lastName = parts.pop() || '';
                  const firstName = parts.join(' ') || '';
                  setFormData({ ...formData, firstName, lastName });
                }}
                placeholder="Enter your name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
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
            <View style={styles.inputBox}>
              <TextInput
                style={styles.inputText}
                value={formatPhoneNumber(formData.phoneNumber || '')}
                onChangeText={handlePhoneChange}
                placeholder="(XXX) XXX-XXXX"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={14}
              />
            </View>
          </View>

          {/* Date of Birth */}
          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Date of Birth</Text>
            <TouchableOpacity
              style={styles.inputBox}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.inputText, !formData.dateOfBirth && styles.inputTextPlaceholder]}>
                {formData.dateOfBirth ? formatDate(formData.dateOfBirth) : 'Select date'}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Gender Selection */}
        <View style={styles.genderContainer}>
          <Text style={styles.genderTitle}>Gender</Text>
          <View style={styles.genderOptions}>
            <TouchableOpacity
              style={styles.genderOption}
              onPress={() => setFormData({ ...formData, gender: 'MALE' })}
            >
              <View style={styles.radioButton}>
                {formData.gender === 'MALE' && <View style={styles.radioButtonInner} />}
              </View>
              <Text style={styles.genderOptionText}>Male</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.genderOption}
              onPress={() => setFormData({ ...formData, gender: 'FEMALE' })}
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
});

