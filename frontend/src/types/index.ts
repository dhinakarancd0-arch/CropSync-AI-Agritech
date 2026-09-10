// API Types for AgriDirect

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  role: 'FARMER' | 'FPO' | 'BUYER' | 'CONSUMER' | 'ADMIN';
  location?: string;
  is_verified: boolean;
  created_at?: string;
  profile?: Record<string, any>;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ProduceListing {
  id: number;
  farmer_id: number;
  crop: string;
  quantity: number;
  unit: string;
  quality_grade: string;
  expected_harvest?: string;
  location?: string;
  min_price: number;
  description?: string;
  image_url?: string;
  status: string;
  lat?: number;
  lng?: number;
  created_at?: string;
  farmer_name?: string;
  farmer_verified?: boolean;
}

export interface BuyerRequirement {
  id: number;
  buyer_id: number;
  crop: string;
  quantity: number;
  quality: string;
  max_price: number;
  location?: string;
  delivery_deadline?: string;
  description?: string;
  status: string;
  created_at?: string;
  buyer_name?: string;
}

export interface MatchResult {
  listing_id: number;
  farmer_id: number;
  farmer_name: string;
  farmer_verified: boolean;
  farm_name?: string;
  crop: string;
  quantity: number;
  unit: string;
  quality_grade: string;
  min_price: number;
  location?: string;
  expected_harvest?: string;
  lat?: number;
  lng?: number;
  match_score: number;
  score_breakdown: Record<string, number>;
  distance_km: number;
  trust_score?: number;
  completed_orders?: number;
  match_explanation: string;
}

export interface Offer {
  id: number;
  listing_id?: number;
  requirement_id?: number;
  buyer_id: number;
  farmer_id: number;
  quantity: number;
  price_per_kg: number;
  message?: string;
  status: string;
  counter_price?: number;
  counter_message?: string;
  created_at?: string;
  buyer_name?: string;
  farmer_name?: string;
  crop?: string;
}

export interface Order {
  id: number;
  offer_id?: number;
  farmer_id: number;
  buyer_id: number;
  consumer_id?: number;
  crop: string;
  quantity: number;
  price_per_kg: number;
  total: number;
  status: string;
  pickup_location?: string;
  delivery_location?: string;
  expected_delivery?: string;
  created_at?: string;
  farmer_name?: string;
  buyer_name?: string;
  payment_status?: string;
}

export interface MarketPrice {
  id: number;
  crop: string;
  location: string;
  price: number;
  demand_level: string;
  trend: string;
  volume_kg?: number;
  date?: string;
}

export interface Forecast {
  crop: string;
  location: string;
  current_demand: number;
  predicted_demand: number;
  trend: string;
  demand_level: string;
  confidence: number;
  historical: Array<{ date: string; demand: number; type: string }>;
  forecast: Array<{ date: string; demand: number; type: string }>;
  explanation: string;
}

export interface RouteResult {
  sequence: Array<{
    stop_number: number;
    type: string;
    farmer_id?: number;
    name: string;
    location: string;
    lat: number;
    lng: number;
    quantity_kg: number;
    distance_from_previous_km: number;
  }>;
  total_distance_km: number;
  estimated_time_minutes: number;
  capacity_used_kg: number;
  capacity_total_kg: number;
  utilization_percent: number;
  estimated_cost: number;
  route_polyline: number[][];
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message?: string;
  notification_type: string;
  is_read: boolean;
  link?: string;
  created_at?: string;
}

export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  status: string;
  payment_method: string;
  transaction_id?: string;
  created_at?: string;
}

export interface CartItem {
  listing: ProduceListing;
  quantity: number;
}

export interface AdminStats {
  total_farmers: number;
  verified_farmers: number;
  total_buyers: number;
  total_consumers: number;
  active_listings: number;
  total_orders: number;
  active_orders: number;
  transaction_volume: number;
  avg_farmer_price: number;
  avg_market_price: number;
  order_statuses: Record<string, number>;
  recent_orders: Array<{
    id: number;
    crop: string;
    quantity: number;
    total: number;
    status: string;
    created_at?: string;
  }>;
}
