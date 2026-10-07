import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// TypeScript Interfaces
export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: number;
  category_detail?: Category;
  price: string | number;
  stock_quantity: number;
  image: string | null;
  created_at: string;
}

export interface DashboardSummary {
  total_products: number;
  total_stock: number;
  total_sales_count: number;
  total_revenue: number;
  low_stock_products: Product[];
}

export interface SaleLog {
  id: number;
  product: number;
  product_title: string;
  quantity_sold: number;
  total_amount: string | number;
  sale_date: string;
}