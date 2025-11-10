# Hướng dẫn Debug API Connection

## Các bước kiểm tra khi API không hoạt động trên app

### 1. Kiểm tra IP Address

**Trên Windows:**
```bash
ipconfig
```
Tìm "IPv4 Address" trong phần:
- "Wireless LAN adapter Wi-Fi" (nếu dùng WiFi)
- "Ethernet adapter" (nếu dùng dây)

**Cập nhật IP trong file:**
`Project_React_Native_FE/constants/api.ts`

```typescript
BASE_URL: __DEV__ 
  ? 'http://YOUR_IP_HERE:9999' // Thay YOUR_IP_HERE bằng IP thực tế
  : 'https://your-production-api.com',
```

### 2. Kiểm tra Backend đang chạy

- Backend phải đang chạy trên port 9999
- Kiểm tra trong console của backend xem có lỗi gì không
- Test trên Swagger: `http://localhost:9999/swagger-ui.html`

### 3. Kiểm tra Network

**Quan trọng:**
- ✅ Device (điện thoại/emulator) và máy tính phải cùng mạng WiFi
- ✅ Không dùng localhost hoặc 127.0.0.1 (chỉ hoạt động trên máy tính)
- ✅ Phải dùng IP thực tế của máy tính

**Test kết nối:**
- Mở browser trên điện thoại
- Truy cập: `http://YOUR_IP:9999/swagger-ui.html`
- Nếu không mở được → vấn đề network

### 4. Kiểm tra Firewall

**Windows Firewall:**
- Cho phép port 9999 trong Windows Firewall
- Hoặc tạm thời tắt firewall để test

### 5. Xem Log trong Console

Sau khi thêm logging, bạn sẽ thấy trong console:
- `API Request:` - Request được gửi đi
- `API Response:` - Response nhận được
- `Response Data:` - Dữ liệu trả về
- `API Error:` - Lỗi nếu có

**Cách xem log:**
- React Native: `npx react-native log-android` hoặc `npx react-native log-ios`
- Expo: Xem trong terminal chạy `expo start`

### 6. Các lỗi thường gặp

**"Network request failed" hoặc "Failed to fetch":**
- ❌ IP address sai
- ❌ Backend không chạy
- ❌ Không cùng mạng WiFi
- ❌ Firewall chặn

**"Request timeout":**
- ⏱️ Backend xử lý quá lâu
- ⏱️ Network chậm
- ⏱️ Backend bị treo

**"Email đã được sử dụng":**
- ✅ API hoạt động bình thường
- ✅ Chỉ là validation error

**"Mã OTP không hợp lệ":**
- ✅ API hoạt động bình thường
- ✅ Kiểm tra email có nhận được OTP không

### 7. Test thủ công với curl

```bash
curl -X POST http://YOUR_IP:9999/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phoneNumber": "0123456789",
    "password": "password123",
    "dateOfBirth": "1990-01-01",
    "gender": "MALE"
  }'
```

Nếu curl hoạt động nhưng app không → vấn đề ở frontend
Nếu curl không hoạt động → vấn đề ở backend/network

### 8. Kiểm tra Response Format

Backend trả về:
```json
{
  "message": "Đăng ký thành công...",
  "success": true,
  "data": null
}
```

Frontend expect:
```typescript
{
  success: boolean,
  message: string,
  data?: any
}
```

Đã được map tự động trong `services/auth.ts`

### 9. Debug Steps

1. ✅ Kiểm tra IP address đúng chưa
2. ✅ Backend đang chạy trên port 9999
3. ✅ Device và máy tính cùng WiFi
4. ✅ Test trên Swagger thành công
5. ✅ Xem log trong console để biết lỗi cụ thể
6. ✅ Kiểm tra firewall
7. ✅ Test với curl

### 10. Lưu ý cho Android Emulator

**Android Emulator:**
- Dùng `10.0.2.2` thay vì localhost để trỏ về máy host
- Hoặc dùng IP thực tế của máy tính

**iOS Simulator:**
- Dùng `localhost` hoặc IP thực tế

**Physical Device:**
- Phải dùng IP thực tế của máy tính
- Không dùng localhost





