import type { FavoriteEntityType, FavoritesPayload } from "@/types";
import { ApiError, apiRequest } from "@/lib/api";
import { validateFavoriteInput } from "@/lib/validators";

interface FavoriteInput {
  entity_type: FavoriteEntityType;
  entity_id: string;
}

function throwIfValidationFails(messages: string[]) {
  if (messages.length) {
    throw new ApiError(messages[0], { status: 200, messages });
  }
}

export async function getFavorites(entityType?: FavoriteEntityType) {
  const data = await apiRequest<FavoritesPayload>("/favorites", {
    auth: true,
    query: { entity_type: entityType },
  });

  return data;
}

export async function addFavorite(input: FavoriteInput) {
  throwIfValidationFails(validateFavoriteInput(input));

  return apiRequest<{ msg: string; is_favorited: boolean }, FavoriteInput>("/favorites", {
    method: "POST",
    body: input,
    auth: true,
  });
}

export async function removeFavorite(input: FavoriteInput) {
  throwIfValidationFails(validateFavoriteInput(input));

  return apiRequest<{ msg: string; is_favorited: boolean }, FavoriteInput>("/favorites", {
    method: "DELETE",
    body: input,
    auth: true,
  });
}

export async function toggleFavorite(input: FavoriteInput) {
  throwIfValidationFails(validateFavoriteInput(input));

  return apiRequest<{ msg: string; is_favorited: boolean }, FavoriteInput>("/favorites/toggle", {
    method: "POST",
    body: input,
    auth: true,
  });
}
