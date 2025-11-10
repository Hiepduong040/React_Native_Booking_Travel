// API Configuration
// Thay đổi IP này thành IP của máy tính bạn
// Để tìm IP trên Windows: mở CMD và chạy: ipconfig
// Tìm "IPv4 Address" trong phần "Wireless LAN adapter Wi-Fi" hoặc "Ethernet adapter"

const getBaseUrl = () => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    return 'http://192.168.0.178:9999'; // Thay đổi IP này
  }
  return 'https://your-production-api.com'; // Production URL
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
};
