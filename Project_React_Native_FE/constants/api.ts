// API Configuration
// Thay đổi IP này thành IP của máy tính bạn
// Để tìm IP trên Windows: mở CMD và chạy: ipconfig
// Tìm "IPv4 Address" trong phần "Wireless LAN adapter Wi-Fi" hoặc "Ethernet adapter"
export const API_CONFIG = {
  // IP của máy tính (thay đổi theo IP thực tế của bạn)
  // Ví dụ: '192.168.1.246' hoặc '192.168.0.100'
  BASE_URL: __DEV__ 
    ? 'http://192.168.1.246:9999' // Thay đổi IP này
    : 'https://your-production-api.com', // Production URL
};

