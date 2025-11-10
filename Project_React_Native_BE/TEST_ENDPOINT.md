# Hướng dẫn Test API

## Vấn đề: Timeout khi đăng ký

### Các bước debug:

1. **Kiểm tra backend có đang chạy:**
   - Mở browser: `http://localhost:9999/swagger-ui.html`
   - Nếu không mở được → Backend chưa chạy

2. **Test với Swagger:**
   - Vào Swagger UI
   - Test endpoint `/api/auth/register`
   - Xem có timeout không

3. **Test với curl (từ terminal):**
```bash
curl -X POST http://192.168.1.246:9999/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"firstName\":\"Test\",\"lastName\":\"User\",\"email\":\"test@example.com\",\"phoneNumber\":\"0123456789\",\"password\":\"password123\",\"dateOfBirth\":\"1990-01-01\",\"gender\":\"MALE\"}"
```

4. **Kiểm tra log backend:**
   - Xem console của backend
   - Tìm log: "Starting registration for email:"
   - Tìm log: "User registered successfully:"
   - Tìm log: "OTP email queued for sending"

5. **Nếu vẫn timeout:**
   - Có thể do database connection chậm
   - Có thể do network issue
   - Kiểm tra MySQL có đang chạy không

### Giải pháp tạm thời:

Nếu vẫn timeout, có thể tạm thời comment email sending hoàn toàn:

```java
// Tạm thời comment để test
// emailService.sendOtpEmail(request.getEmail(), otpCode);
```

Sau đó test lại xem có còn timeout không.





