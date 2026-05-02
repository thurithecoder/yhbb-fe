import type {
  CatalogItem,
  Category,
  MarketingCampaignRequest,
  MenuChangeRequest,
  Promotion,
  PromotionClaim,
  Restaurant,
  RestaurantImage,
} from "@/types";
import { ApiError, apiRequest } from "@/lib/api";
import {
  validateCategoryDeleteInput,
  validateCategoryInput,
  validateCategoryUpdateInput,
  validateVerifyRequestInput,
} from "@/lib/validators";

function throwIfValidationFails(messages: string[]) {
  if (messages.length) {
    throw new ApiError(messages[0], { status: 200, messages });
  }
}

export async function getCategories() {
  const data = await apiRequest<{ categories: Category[] }>("/catalog/categories");
  return data.categories || [];
}

export async function getCatalogMenuItems(query?: { q?: string; category_id?: string; restaurant_id?: string }) {
  const data = await apiRequest<{ menuItems: CatalogItem[] }>("/catalog/menu-items", {
    query,
  });

  return data.menuItems || [];
}

export async function createCategory(input: Record<string, unknown>) {
  throwIfValidationFails(validateCategoryInput(input));

  return apiRequest<{ msg: string; newcategory: Category }, Record<string, unknown>>("/catalog/categories", {
    method: "POST",
    body: input,
    auth: true,
  });
}

export async function updateCategory(input: Record<string, unknown>) {
  throwIfValidationFails(validateCategoryUpdateInput(input));

  return apiRequest<{ msg: string; selectedcategory: Category }, Record<string, unknown>>("/catalog/categories", {
    method: "PUT",
    body: input,
    auth: true,
  });
}

export async function deleteCategory(input: Record<string, unknown>) {
  throwIfValidationFails(validateCategoryDeleteInput(input));

  return apiRequest<{ msg: string }, Record<string, unknown>>("/catalog/categories", {
    method: "DELETE",
    body: input,
    auth: true,
  });
}

export async function getAdminRestaurants() {
  const data = await apiRequest<{ restaurants: (Restaurant & { pending_menu_requests: number; pending_campaign_requests: number })[] }>("/catalog/restaurants", {
    auth: true,
  });
  return data.restaurants || [];
}

export interface AdminRestaurantDetailsResponse {
  restaurant: Restaurant & {
    owner?: {
      id: string;
      firstname: string;
      lastname: string;
      email: string;
      profilepic?: string | null;
    } | null;
    pending_menu_requests?: number;
    pending_campaign_requests?: number;
  };
  menuItems: CatalogItem[];
  images: RestaurantImage[];
  promotions: Promotion[];
}

export async function getAdminRestaurantDetails(restaurantId: string) {
  const data = await apiRequest<AdminRestaurantDetailsResponse>(`/catalog/restaurants/${restaurantId}`, {
    auth: true,
  });

  return data;
}

export async function getMenuChangeRequests(status?: string, restaurant_id?: string) {
  const data = await apiRequest<{ requests: MenuChangeRequest[] }>("/catalog/menu-change-requests", {
    auth: true,
    query: { status, restaurant_id },
  });

  return data.requests || [];
}

export async function verifyMenuChangeRequest(input: Record<string, unknown>) {
  throwIfValidationFails(validateVerifyRequestInput(input));

  return apiRequest<{ msg: string; selectedrequest: MenuChangeRequest }, Record<string, unknown>>(
    "/catalog/menu-change-requests/verify",
    {
      method: "POST",
      body: input,
      auth: true,
    }
  );
}

export async function getMarketingCampaignRequests(status?: string, restaurant_id?: string) {
  const data = await apiRequest<{ requests: MarketingCampaignRequest[] }>(
    "/catalog/marketing-campaign-requests",
    {
      auth: true,
      query: { status, restaurant_id },
    }
  );

  return data.requests || [];
}

export async function getAdminPromotionsByRestaurant(restaurant_id: string) {
  const data = await apiRequest<{ promotions: Promotion[]; claims: PromotionClaim[] }>("/catalog/promotions", {
    auth: true,
    query: { restaurant_id },
  });
  return {
    promotions: data.promotions || [],
    claims: data.claims || [],
  };
}

export async function verifyMarketingCampaignRequest(input: Record<string, unknown>) {
  throwIfValidationFails(validateVerifyRequestInput(input));

  return apiRequest<{ msg: string; selectedrequest: MarketingCampaignRequest }, Record<string, unknown>>(
    "/catalog/marketing-campaign-requests/verify",
    {
      method: "POST",
      body: input,
      auth: true,
    }
  );
}

export async function getAdminPromotions() {
  const data = await apiRequest<{ promotions: Promotion[]; claims: PromotionClaim[] }>("/catalog/promotions", {
    auth: true,
  });
  return {
    promotions: data.promotions || [],
    claims: data.claims || [],
  };
}

export async function getStats() {
  const [categories, menuItems, menuRequests, campaignRequests] = await Promise.all([
    getCategories(),
    getCatalogMenuItems(),
    getMenuChangeRequests(),
    getMarketingCampaignRequests(),
  ]);

  return {
    categories,
    menuItems,
    menuRequests,
    campaignRequests,
  };
}
