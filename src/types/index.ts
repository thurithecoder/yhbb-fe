export type Role = 'admin' | 'restaurant' | 'user';
export type FavoriteEntityType = 'restaurant' | 'menu_item';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  displayName: string;
  role: Role;
  photoURL?: string;
}

export interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  name_ms: string;
  image_base64?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CatalogItem {
  id: string;
  restaurant_id?: string | null;
  category_id: string;
  name_en: string;
  name_ar: string;
  name_ms: string;
  description_en?: string | null;
  description_ar?: string | null;
  description_ms?: string | null;
  taqs?: string[] | null;
  image_base64?: string | null;
  price: number | string;
  is_available?: boolean;
  item_type?: 'menu_item' | 'meal' | 'drink';
  item_id?: string | null;
  verification_status?: ReviewStatus | 'not_required';
  rejection_reason?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
  tblcategory?: Category | null;
  tblrestaurant?: {
    id: string;
    name: string;
    profilepic?: string | null;
    verificationStatus?: string | null;
    is_verified?: boolean;
  } | null;
}

export interface Restaurant {
  longitude: number | undefined;
  latitude: number | undefined;
  popularity: number;
  rating: number;
  id: string;
  owner_user_id: string;
  name: string;
  address?: string | null;
  working_time_from?: string | null;
  working_time_from_period?: 'AM' | 'PM' | string | null;
  working_time_to?: string | null;
  working_time_to_period?: 'AM' | 'PM' | string | null;
  working_hours?: string | null;
  phone?: string | null;
  cuisine?: string[] | null;
  profilepic?: string | null;
  is_verified: boolean;
  is_active?: boolean;
  primary_category?: string | null;
  verificationStatus?: string | null;
  verificationStep?: number | null;
  menu_items?: CatalogItem[];
  menu_item_count?: number;
  promotion_count?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type RestaurantMenuItem = CatalogItem;

export interface Promotion {
  id: string;
  restaurant_id: string;
  title: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  discount_type?: 'percent' | 'cash' | null;
  discount_percent?: number | string | null;
  min_spend?: number | string | null;
  max_uses_total?: number | null;
  max_uses_per_user?: number | null;
  current_uses?: number;
  image_base64?: string | null;
  createdAt?: string;
  updatedAt?: string;
  tblrestaurant?: { id: string; name: string; profilepic?: string | null } | null;
  claim_stats?: { total: number; valid: number; used: number; expired: number };
}

export interface PromotionClaim {
  id: string;
  promotion_id: string;
  user_id: string;
  claim_token: string;
  voucher_code: string;
  claimed_by_name?: string | null;
  status: 'valid' | 'used' | 'expired';
  used_at?: string | null;
  scanned_by_restaurant_id?: string | null;
  createdAt?: string;
  updatedAt?: string;
  tblpromotion?: Promotion | null;
  tbllogin?: { id: string; firstname: string; lastname: string; username: string } | null;
}

export interface MenuChangeRequest {
  id: string;
  restaurant_id: string;
  item_type: 'menu_item' | 'meal' | 'drink';
  item_id: string;
  requested_price: number | string;
  requested_name_en?: string | null;
  requested_name_ar?: string | null;
  requested_name_ms?: string | null;
  note?: string | null;
  status: ReviewStatus;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  review_note?: string | null;
  menu_item_details?: CatalogItem | null;
  createdAt?: string;
  updatedAt?: string;
  tblrestaurant?: {
    id: string;
    name: string;
    phone?: string | null;
  };
}

export interface MarketingCampaignRequest {
  id: string;
  restaurant_id: string;
  campaign_title: string;
  objective: string;
  budget?: number | string | null;
  start_date?: string | null;
  end_date?: string | null;
  message?: string | null;
  status: ReviewStatus;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  review_note?: string | null;
  createdAt?: string;
  updatedAt?: string;
  tblrestaurant?: {
    id: string;
    name: string;
    phone?: string | null;
  };
}

export interface FavoriteRecord<TEntity = Restaurant | CatalogItem> {
  id: string;
  entity_type: FavoriteEntityType;
  entity_id: string;
  createdAt?: string;
  updatedAt?: string;
  is_available: boolean;
  entity: TEntity | null;
}

export interface FavoritesPayload {
  favorites: FavoriteRecord[];
  restaurants: Restaurant[];
  menuItems: CatalogItem[];
  meals: CatalogItem[];
  drinks: CatalogItem[];
}

export interface RestaurantPublicDetails {
  restaurant: Restaurant;
  menuItems: CatalogItem[];
  promotions: Promotion[];
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  stockCount: number;
  itemType?: 'menu_item';
  categoryName?: string;
}

export interface Review {
  id: string;
  restaurantId: string;
  customerId: string;
  customerName: string;
  customerPhoto?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface RestaurantImage {
  id: string;
  image_base64: string;
  order_index: number;
  createdAt: string;
}

