export type Restaurant = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  created_at: string;
};

export type Order = {
  id: number;
  shop_id: string;
  order_number: number;
  status: 'preparing' | 'ready';
  created_at: string;
};