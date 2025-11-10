// services/product.ts
import { Product } from '../types';
import { getAllRooms, RoomResponse } from '../apis/roomApi';

export const productService = {
  getAll: async (): Promise<Product[]> => {
    try {
      // Sử dụng Room API thay vì Product API (backend không có Product API)
      const rooms = await getAllRooms();
      
      // Map Room thành Product format
      const products: Product[] = rooms.map((room: RoomResponse) => ({
        id: room.roomId.toString(),
        name: `${room.hotelName} - ${room.roomType}`,
        price: room.price,
        image: room.imageUrls && room.imageUrls.length > 0 
          ? room.imageUrls[0] 
          : 'https://via.placeholder.com/400',
        category: room.hotelCity || 'Hotels',
        ecoScore: room.rating ? Math.round(room.rating * 20) : 80, // Convert rating (0-5) to ecoScore (0-100)
      }));
      
      return products;
    } catch (error: any) {
      console.error('Error fetching products (rooms):', error);
      // Trả về mảng rỗng nếu có lỗi thay vì throw error
      return [];
    }
  },

  getById: async (id: string): Promise<Product> => {
    try {
      // Sử dụng Room API
      const roomId = parseInt(id, 10);
      if (isNaN(roomId)) {
        throw new Error('Invalid product ID');
      }

      const { getRoomById } = await import('../apis/roomApi');
      const room = await getRoomById(roomId);
      
      // Map RoomDetailResponse thành Product format
      const hotelName = room.hotel?.hotelName || 'Unknown Hotel';
      const hotelCity = room.hotel?.city || 'Hotels';
      const images = room.images || [];
      const firstImage = images.length > 0 ? images[0] : 'https://via.placeholder.com/400';
      
      const product: Product = {
        id: room.roomId.toString(),
        name: `${hotelName} - ${room.roomType}`,
        price: typeof room.price === 'number' ? room.price : parseFloat(room.price || '0'),
        image: firstImage,
        category: hotelCity,
        ecoScore: 80, // Default value
      };
      
      return product;
    } catch (error: any) {
      console.error('Error fetching product by ID:', error);
      throw new Error('Product not found');
    }
  },
};
