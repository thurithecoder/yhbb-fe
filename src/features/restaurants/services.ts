import type {
  CatalogItem,
  Category,
  MarketingCampaignRequest,
  MenuChangeRequest,
  Promotion,
  PromotionClaim,
  Restaurant,
  RestaurantPublicDetails,
  RestaurantImage,
} from "@/types";
import { ApiError, apiRequest } from "@/lib/api";
import {
  validateMarketingCampaignRequestInput,
  validateMenuChangeRequestInput,
  validatePromotionInput,
  validateRestaurantMenuItemCreateInput,
  validateRestaurantMenuItemUpdateInput,
  validateRestaurantProfileInput,
} from "@/lib/validators";

function throwIfValidationFails(messages: string[]) {
  if (messages.length) {
    throw new ApiError(messages[0], { status: 200, messages });
  }
}

export async function setRestaurantActiveStatus(is_active: boolean) {
  const data = await apiRequest<{ msg: string }>("/restaurants/set-active-status", {
    method: "POST",
    body: { is_active },
    auth: true,
  });
  return data;
}

export async function getRestaurants(query?: { q?: string }) {
  const data = await apiRequest<{ restaurants: Restaurant[] }>("/restaurants/public", {
    query,
  });

  return data.restaurants || [];
}

export async function getRestaurantById(id: string) {
  const data = await apiRequest<RestaurantPublicDetails>(`/restaurants/public/${id}`);
  return data;
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

export async function searchCatalog(q: string) {
  const data = await apiRequest<{ menuItems: CatalogItem[] }>("/catalog/search", {
    query: { q },
  });

  return {
    menuItems: data.menuItems || [],
  };
}

export async function getRestaurantProfile() {
  const data = await apiRequest<{ selectedrestaurant: Restaurant }>("/restaurants/profile", {
    auth: true,
  });
  return data.selectedrestaurant;
}

export async function updateRestaurantProfile(input: Record<string, unknown>) {
  throwIfValidationFails(validateRestaurantProfileInput(input));

  const data = await apiRequest<{ msg: string; selectedrestaurant: Restaurant }, Record<string, unknown>>(
    "/restaurants/profile",
    {
      method: "PUT",
      body: input,
      auth: true,
    }
  );

  return data;
}

export async function getRestaurantPromotions() {
  const data = await apiRequest<{ promotions: Promotion[] }>("/restaurants/promotions", {
    auth: true,
  });
  return data.promotions || [];
}

export async function createRestaurantPromotion(input: Record<string, unknown>) {
  throwIfValidationFails(validatePromotionInput(input));

  return apiRequest<{ msg: string; newpromotion: Promotion }, Record<string, unknown>>("/restaurants/promotions", {
    method: "POST",
    body: input,
    auth: true,
  });
}

export async function deleteRestaurantPromotion(id: string) {
  return apiRequest<{ msg: string }, Record<string, unknown>>("/restaurants/promotions", {
    method: "DELETE",
    body: { id },
    auth: true,
  });
}

export async function claimPromotion(promotionId: string) {
  return apiRequest<{ msg: string; claim: PromotionClaim }>(`/restaurants/promotions/${promotionId}/claim`, {
    method: "POST",
    auth: true,
  });
}

export async function getMyPromotionClaims(promotionId: string) {
  const data = await apiRequest<{ claims: PromotionClaim[] }>(`/restaurants/promotions/${promotionId}/my-claims`, {
    auth: true,
  });
  return data.claims || [];
}

export async function getAllMyPromotionClaims() {
  const data = await apiRequest<{ claims: PromotionClaim[] }>("/restaurants/promotions/my-claims", {
    auth: true,
  });
  return data.claims || [];
}

export async function scanPromotionCoupon(voucherCode: string) {
  return apiRequest<{ msg: string; claim: { id: string; voucher_code: string; status: string; used_at: string; promotion_title: string; discount_type: 'percent' | 'cash' | null; discount_percent: string | number | null; user: { id: string; name: string; email: string } | null } }, Record<string, unknown>>("/restaurants/promotions/scan", {
    method: "POST",
    body: { voucher_code: voucherCode },
    auth: true,
  });
}

export async function getPromotionScanHistory(promotionId?: string) {
  const data = await apiRequest<{ history: PromotionClaim[]; promotions: Promotion[] }>("/restaurants/promotions/scan-history", {
    auth: true,
    query: promotionId ? { promotion_id: promotionId } : undefined,
  });
  return data;
}

export async function getRestaurantMenuItems() {
  const data = await apiRequest<{ menuItems: CatalogItem[] }>("/restaurants/menu-items", {
    auth: true,
  });

  return data.menuItems || [];
}

export async function createRestaurantMenuItem(input: Record<string, unknown>) {
  throwIfValidationFails(validateRestaurantMenuItemCreateInput(input));

  return apiRequest<{ msg: string; newmenuitem: CatalogItem }, Record<string, unknown>>(
    "/restaurants/menu-items",
    {
      method: "POST",
      body: input,
      auth: true,
    }
  );
}

export async function updateRestaurantMenuItem(input: Record<string, unknown>) {
  throwIfValidationFails(validateRestaurantMenuItemUpdateInput(input));

  return apiRequest<{ msg: string; selectedmenuitem: CatalogItem }, Record<string, unknown>>(
    "/restaurants/menu-items",
    {
      method: "PUT",
      body: input,
      auth: true,
    }
  );
}

export async function deleteRestaurantMenuItem(id: string) {
  return apiRequest<{ msg: string }, Record<string, unknown>>(
    "/restaurants/menu-items",
    {
      method: "DELETE",
      body: { id },
      auth: true,
    }
  );
}

// Legacy endpoints kept for compatibility with existing admin queue pages.
export async function getRestaurantMenuRequests(status?: string) {
  const data = await apiRequest<{ requests: MenuChangeRequest[] }>("/restaurants/menu-change-requests", {
    auth: true,
    query: { status },
  });
  return data.requests || [];
}

// Legacy endpoint kept for compatibility.
export async function createRestaurantMenuRequest(input: Record<string, unknown>) {
  throwIfValidationFails(validateMenuChangeRequestInput(input));

  return apiRequest<{ msg: string; newrequest: MenuChangeRequest }, Record<string, unknown>>(
    "/restaurants/menu-change-requests",
    {
      method: "POST",
      body: input,
      auth: true,
    }
  );
}

export async function getRestaurantMarketingRequests(status?: string) {
  const data = await apiRequest<{ requests: MarketingCampaignRequest[] }>(
    "/restaurants/marketing-campaign-requests",
    {
      auth: true,
      query: { status },
    }
  );
  return data.requests || [];
}

export async function createRestaurantMarketingRequest(input: Record<string, unknown>) {
  throwIfValidationFails(validateMarketingCampaignRequestInput(input));

  return apiRequest<{ msg: string; newrequest: MarketingCampaignRequest }, Record<string, unknown>>(
    "/restaurants/marketing-campaign-requests",
    {
      method: "POST",
      body: input,
      auth: true,
    }
  );
}

export async function getRestaurantImages(restaurantId: string) {
  const data = await apiRequest<{ images: RestaurantImage[] }>(`/restaurants/public/${restaurantId}/images`);
  return data.images || [];
}

export async function getMyRestaurantImages() {
  const data = await apiRequest<{ images: RestaurantImage[] }>("/restaurants/images", {
    auth: true,
  });
  return data.images || [];
}

export async function uploadRestaurantImages(images: string[]) {
  // images: array of base64 data URLs (e.g., "data:image/jpeg;base64,...")
  const data = await apiRequest<{ msg: string; images: RestaurantImage[] }, { images: string[] }>(
    "/restaurants/images",
    {
      method: "POST",
      body: { images },
      auth: true,
    }
  );
  return data.images || [];
}

export async function deleteRestaurantImage(imageId: string) {
  const data = await apiRequest<{ msg: string }>(`/restaurants/images/${imageId}`, {
    method: "DELETE",
    auth: true,
  });
  return data;
}