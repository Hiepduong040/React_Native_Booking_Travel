# Hướng dẫn Restart Backend

## QUAN TRỌNG: Phải restart backend sau khi thay đổi code!

### Các bước:

1. **Dừng backend hiện tại:**
   - Nhấn `Ctrl+C` trong terminal đang chạy backend
   - Hoặc đóng terminal

2. **Rebuild và chạy lại:**
```bash
cd Project_React_Native_BE
./gradlew clean build
./gradlew bootRun
```

Hoặc nếu dùng IDE (IntelliJ/Eclipse):
- Stop application
- Rebuild project
- Run lại `ProjectReactNativeBeApplication`

3. **Kiểm tra backend đã chạy:**
   - Mở browser: `http://localhost:9999/swagger-ui.html`
   - Test endpoint `/api/auth/test` (GET)
   - Nếu trả về "Backend đang hoạt động!" → OK

4. **Kiểm tra log:**
   - Xem console có log: "Starting registration for email:"
   - Xem có lỗi gì không

### Nếu vẫn timeout sau khi restart:

1. **Test với Swagger trước:**
   - Vào Swagger UI
   - Test `/api/auth/register`
   - Xem có timeout không

2. **Kiểm tra database:**
   - MySQL có đang chạy không?
   - Connection string đúng chưa?

3. **Kiểm tra network:**
   - IP address trong frontend đúng chưa?
   - Device và máy tính cùng WiFi chưa?

4. **Tạm thời comment email:**
   - Trong `AuthService.java`, comment dòng:
   ```java
   // emailService.sendOtpEmail(request.getEmail(), otpCode);
   ```
   - Restart backend
   - Test lại
   - Nếu không timeout → vấn đề ở email service
   - Nếu vẫn timeout → vấn đề ở chỗ khác (database, network)





