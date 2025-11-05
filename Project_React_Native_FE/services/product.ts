// services/product.ts
// import { api } from './api';
import { Product } from '../types';

// Giả lập API nếu chưa có backend
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Organic Cotton T-Shirt',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    category: 'Fashion',
    ecoScore: 95,
  },
  {
    id: '2',
    name: 'Bamboo Toothbrush Set',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1607613009820-8664000cb912?w=400',
    category: 'Beauty',
    ecoScore: 88,
  },
  {
    id: '3',
    name: 'Reusable Stainless Steel Bottle',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1605296867304-46d5469c4b9b?w=400',
    category: 'Home',
    ecoScore: 92,
  },
  {
    id: '4',
    name: 'Solar-Powered Phone Charger',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400',
    category: 'Tech',
    ecoScore: 90,
  },
  {
    id: '5',
    name: 'Recycled Paper Notebook',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400',
    category: 'Home',
    ecoScore: 85,
  },
  {
    id: '6',
    name: 'Eco-Friendly Yoga Mat',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68772?w=400',
    category: 'Fashion',
    ecoScore: 87,
  },
];

export const productService = {
  getAll: async (): Promise<Product[]> => {
    // Nếu có backend thật, dùng:
    // const { data } = await api.get('/products');
    // return data;

    // Giả lập delay như API thật
    await new Promise((resolve) => setTimeout(resolve, 800));
    return mockProducts;
  },

  getById: async (id: string): Promise<Product> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const product = mockProducts.find((p) => p.id === id);
    if (!product) throw new Error('Product not found');
    return product;
  },
};