/**
 * API service for Vietnam Administrative Units
 * Using public API from: https://provinces.open-api.vn/
 */

export interface Province {
  code: string;
  name: string;
  nameEn?: string;
}

export interface District {
  code: string;
  name: string;
  nameEn?: string;
  provinceCode: string;
}

export interface Ward {
  code: string;
  name: string;
  nameEn?: string;
  districtCode: string;
}

const API_BASE = 'https://provinces.open-api.vn/api';

/**
 * Get all provinces in Vietnam
 */
export const getProvinces = async (): Promise<Province[]> => {
  try {
    const response = await fetch(`${API_BASE}/p/`);
    if (!response.ok) {
      throw new Error('Failed to fetch provinces');
    }
    const data = await response.json();
    return data.map((item: any) => ({
      code: item.code,
      name: item.name,
      nameEn: item.name_en,
    }));
  } catch (error) {
    console.error('Error fetching provinces:', error);
    // Fallback to common provinces if API fails
    return [
      { code: '79', name: 'Thành phố Hồ Chí Minh' },
      { code: '01', name: 'Thành phố Hà Nội' },
      { code: '48', name: 'Thành phố Đà Nẵng' },
      { code: '92', name: 'Thành phố Cần Thơ' },
      { code: '31', name: 'Tỉnh Hải Phòng' },
      { code: '36', name: 'Tỉnh Thái Nguyên' },
      { code: '75', name: 'Tỉnh Đồng Nai' },
      { code: '77', name: 'Tỉnh Bà Rịa - Vũng Tàu' },
      { code: '56', name: 'Tỉnh Khánh Hòa' },
      { code: '34', name: 'Tỉnh Quảng Ninh' },
    ];
  }
};

/**
 * Get districts by province code
 */
export const getDistrictsByProvince = async (provinceCode: string): Promise<District[]> => {
  try {
    const response = await fetch(`${API_BASE}/p/${provinceCode}?depth=2`);
    if (!response.ok) {
      throw new Error('Failed to fetch districts');
    }
    const data = await response.json();
    if (data.districts && Array.isArray(data.districts)) {
      return data.districts.map((item: any) => ({
        code: item.code,
        name: item.name,
        nameEn: item.name_en,
        provinceCode: provinceCode,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching districts:', error);
    return [];
  }
};

/**
 * Get wards by district code
 */
export const getWardsByDistrict = async (districtCode: string): Promise<Ward[]> => {
  try {
    const response = await fetch(`${API_BASE}/d/${districtCode}?depth=2`);
    if (!response.ok) {
      throw new Error('Failed to fetch wards');
    }
    const data = await response.json();
    if (data.wards && Array.isArray(data.wards)) {
      return data.wards.map((item: any) => ({
        code: item.code,
        name: item.name,
        nameEn: item.name_en,
        districtCode: districtCode,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching wards:', error);
    return [];
  }
};

/**
 * Get unique cities from rooms data
 * This will be used to match with actual DB data
 */
export const getCitiesFromRooms = async (): Promise<string[]> => {
  try {
    const { getAllRooms } = await import('./roomApi');
    const rooms = await getAllRooms();
    const cities = new Set<string>();
    
    rooms.forEach(room => {
      if (room.hotel?.city) {
        cities.add(room.hotel.city);
      }
      if (room.hotelCity) {
        cities.add(room.hotelCity);
      }
    });
    
    return Array.from(cities).sort();
  } catch (error) {
    console.error('Error getting cities from rooms:', error);
    return [];
  }
};

/**
 * Match city name with province name
 * Returns the best matching province code
 */
export const matchCityWithProvince = (cityName: string, provinces: Province[]): string | null => {
  if (!cityName) return null;
  
  const normalizedCity = cityName.toLowerCase().trim();
  
  // Try exact match first
  for (const province of provinces) {
    const normalizedProvince = province.name.toLowerCase().trim();
    if (normalizedCity === normalizedProvince || 
        normalizedCity.includes(normalizedProvince) ||
        normalizedProvince.includes(normalizedCity)) {
      return province.code;
    }
  }
  
  // Try partial match (remove "Thành phố", "Tỉnh" prefix)
  const cityWithoutPrefix = normalizedCity
    .replace(/^(thành phố|tỉnh|tp\.?)\s*/i, '')
    .trim();
    
  for (const province of provinces) {
    const provinceWithoutPrefix = province.name
      .toLowerCase()
      .replace(/^(thành phố|tỉnh|tp\.?)\s*/i, '')
      .trim();
      
    if (cityWithoutPrefix === provinceWithoutPrefix ||
        cityWithoutPrefix.includes(provinceWithoutPrefix) ||
        provinceWithoutPrefix.includes(cityWithoutPrefix)) {
      return province.code;
    }
  }
  
  return null;
};

