// Cloudinary upload service
// TODO: Thay thế các giá trị sau bằng thông tin Cloudinary của bạn
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'your_upload_preset';
const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your_cloud_name';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export interface UploadResult {
  secure_url: string;
  public_id: string;
}

export const uploadImageToCloudinary = async (imageUri: string): Promise<UploadResult> => {
  try {
    // Kiểm tra cấu hình
    if (CLOUDINARY_UPLOAD_PRESET === 'your_upload_preset' || CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
      throw new Error('Vui lòng cấu hình Cloudinary trong file .env hoặc services/cloudinary.ts');
    }

    // Tạo FormData
    const formData = new FormData();
    
    // Lấy phần mở rộng file từ URI
    const fileExtension = imageUri.split('.').pop() || 'jpg';
    const fileName = `avatar_${Date.now()}.${fileExtension}`;
    
    formData.append('file', {
      uri: imageUri,
      type: `image/${fileExtension === 'jpg' || fileExtension === 'jpeg' ? 'jpeg' : fileExtension}`,
      name: fileName,
    } as any);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'user_avatars'); // Tùy chọn: tổ chức ảnh vào folder

    // Upload lên Cloudinary
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary upload error:', errorText);
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return {
      secure_url: data.secure_url,
      public_id: data.public_id,
    };
  } catch (error: any) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error(error.message || 'Không thể upload ảnh lên Cloudinary');
  }
};

