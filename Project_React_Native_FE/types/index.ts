// types/index.ts
export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  ecoScore: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: 'male' | 'female';
};

export type CartItem = {
  productId: string;
  quantity: number;
};