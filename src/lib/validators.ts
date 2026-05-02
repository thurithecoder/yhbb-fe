import type { FavoriteEntityType } from "@/types";

const base64ImageRegex = /^data:image\/(png|jpe?g);base64,[a-z0-9+/=\r\n]+$/i;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const validFavoriteTypes: FavoriteEntityType[] = ["restaurant", "menu_item"];

type ValidationErrors = string[];

function isText(value: unknown) {
  return typeof value === "string";
}

function isNonEmptyTextArray(value: unknown) {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string" && entry.trim().length > 0);
}

function isEmail(value: unknown) {
  return emailRegex.test(String(value || "").trim());
}

function isUUID(value: unknown) {
  return uuidRegex.test(String(value || "").trim());
}

function isIsoDate(value: unknown) {
  const normalized = String(value || "").trim();
  return Boolean(normalized) && !Number.isNaN(Date.parse(normalized));
}

function isBase64Image(value: unknown) {
  return base64ImageRegex.test(String(value || "").trim());
}

function isFloatAtLeast(value: unknown, minimum = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= minimum;
}

function pushError(errors: ValidationErrors, condition: boolean, message: string) {
  if (condition) {
    errors.push(message);
  }
}

function validateCatalogItemFields(
  input: Record<string, any>,
  options: { requireId?: boolean; requireImage?: boolean }
) {
  const errors: ValidationErrors = [];

  if (options.requireId) {
    pushError(errors, !isUUID(input.id), "Valid id is required");
  }

  if (input.category_id !== undefined) {
    pushError(errors, !isUUID(input.category_id), options.requireId ? "category_id must be a valid UUID" : "Valid category_id is required");
  }

  if (!options.requireId) {
    pushError(errors, !String(input.name_en || "").trim(), "name_en is required");
    pushError(errors, !String(input.name_ar || "").trim(), "name_ar is required");
    pushError(errors, !String(input.name_ms || "").trim(), "name_ms is required");
  }

  if (input.price !== undefined) {
    pushError(errors, !isFloatAtLeast(input.price, 0), "price must be a valid number");
  }

  if (options.requireImage) {
    pushError(errors, !String(input.image_base64 || "").trim(), "image_base64 is required");
    pushError(errors, Boolean(input.image_base64) && !isBase64Image(input.image_base64), "Image must be a valid base64 data URL: data:image/png;base64,...");
  } else if (input.image_base64 !== undefined) {
    pushError(errors, Boolean(input.image_base64) && !isBase64Image(input.image_base64), "Image must be a valid base64 data URL: data:image/png;base64,...");
  }

  if (options.requireId) {
    const updatableKeys = [
      "category_id",
      "name_en",
      "name_ar",
      "name_ms",
      "description_en",
      "description_ar",
      "description_ms",
      "image_base64",
      "price",
    ];

    pushError(
      errors,
      !updatableKeys.some((key) => input[key] !== undefined),
      "No update fields were provided."
    );
  }

  return errors;
}

export function validateRegisterInput(input: Record<string, any>) {
  const errors: ValidationErrors = [];
  const accountType = String(input.account_type || "user").toLowerCase();
  pushError(errors, !["user", "restaurant"].includes(accountType), "account_type must be user or restaurant");

  if (accountType === "restaurant") {
    pushError(errors, !String(input.restaurant_name || "").trim(), "Restaurant name is required");
    pushError(errors, !String(input.location || "").trim(), "Location is required");
  } else {
    pushError(errors, !String(input.firstname || "").trim(), "First name is required");
    pushError(errors, !String(input.lastname || "").trim(), "Last name is required");
  }

  pushError(errors, !isEmail(input.email), "Valid email is required");
  pushError(errors, String(input.password || "").trim().length < 6, "Password must be at least 6 chars");
  if (input.confirmPassword !== undefined || input.confirm_password !== undefined) {
    const confirmPassword = String(input.confirmPassword ?? input.confirm_password ?? "");
    pushError(errors, String(input.password || "") !== confirmPassword, "Passwords do not match");
  }
  return errors;
}

export function validateLoginInput(input: Record<string, any>) {
  const errors: ValidationErrors = [];
  pushError(errors, !isEmail(input.email), "Valid email is required");
  pushError(errors, !String(input.password || "").trim(), "Password is required");
  return errors;
}

export function validateForgotPasswordInput(input: Record<string, any>) {
  const errors: ValidationErrors = [];
  pushError(errors, !isEmail(input.email), "Valid email is required");
  return errors;
}

export function validateResetPasswordInput(input: Record<string, any>) {
  const errors: ValidationErrors = [];
  pushError(errors, !isEmail(input.email), "Valid email is required");
  pushError(errors, !String(input.otp || "").trim(), "OTP is required");
  pushError(errors, String(input.newPassword || "").trim().length < 6, "Password must be at least 6 chars");
  return errors;
}

export function validateChangePasswordInput(input: Record<string, any>) {
  const errors: ValidationErrors = [];
  pushError(errors, !String(input.oldPassword || "").trim(), "oldPassword, newPassword, and confirmPassword are required.");
  pushError(errors, !String(input.newPassword || "").trim(), "oldPassword, newPassword, and confirmPassword are required.");
  pushError(errors, !String(input.confirmPassword || "").trim(), "oldPassword, newPassword, and confirmPassword are required.");
  if (String(input.newPassword || "").trim() && String(input.confirmPassword || "").trim()) {
    pushError(errors, input.newPassword !== input.confirmPassword, "New passwords do not match.");
  }
  return errors;
}

export function validateCategoryInput(input: Record<string, any>) {
  const errors: ValidationErrors = [];
  pushError(errors, !String(input.name_en || "").trim(), "name_en is required");
  pushError(errors, !String(input.name_ar || "").trim(), "name_ar is required");
  pushError(errors, !String(input.name_ms || "").trim(), "name_ms is required");
  if (input.image_base64 !== undefined) {
    pushError(errors, Boolean(input.image_base64) && !isBase64Image(input.image_base64), "Image must be a valid base64 data URL: data:image/png;base64,...");
  }
  return errors;
}

export function validateMealCreateInput(input: Record<string, any>) {
  return validateCatalogItemFields(input, { requireImage: true });
}

export function validateMealUpdateInput(input: Record<string, any>) {
  return validateCatalogItemFields(input, { requireId: true, requireImage: false });
}

export function validateDrinkCreateInput(input: Record<string, any>) {
  return validateCatalogItemFields(input, { requireImage: true });
}

export function validateDrinkUpdateInput(input: Record<string, any>) {
  return validateCatalogItemFields(input, { requireId: true, requireImage: false });
}

export function validateVerifyRequestInput(input: Record<string, any>) {
  const errors: ValidationErrors = [];
  const status = String(input.status || "").toLowerCase().trim();
  pushError(errors, !isUUID(input.request_id), "Valid request_id is required");
  pushError(errors, !["approved", "rejected"].includes(status), "status must be approved or rejected");
  if (status === "rejected") {
    pushError(errors, !String(input.review_note || "").trim(), "review_note is required when rejecting a menu request");
  }
  return errors;
}

export function validateFavoriteInput(input: Record<string, any>) {
  const errors: ValidationErrors = [];
  pushError(
    errors,
    !validFavoriteTypes.includes(String(input.entity_type || "").toLowerCase() as FavoriteEntityType),
    "entity_type must be restaurant or menu_item"
  );
  pushError(errors, !isUUID(input.entity_id), "Valid entity_id is required");
  return errors;
}

export function validateRestaurantProfileInput(input: Record<string, any>) {
  const errors: ValidationErrors = [];
  ["name", "address", "working_time_from", "working_time_from_period", "working_time_to", "working_time_to_period", "working_hours", "phone"].forEach((field) => {
    if (input[field] !== undefined) {
      pushError(errors, !isText(input[field]), `${field} must be text`);
    }
  });
  if (input.cuisine !== undefined) {
    pushError(errors, !Array.isArray(input.cuisine) || !input.cuisine.every((v: unknown) => typeof v === 'string'), 'cuisine must be an array of strings');
  }

  if (input.profilepic !== undefined) {
    pushError(errors, Boolean(input.profilepic) && !isBase64Image(input.profilepic), "profilepic must be a valid base64 data URL: data:image/png;base64,...");
  }

  pushError(
    errors,
    !["name", "address", "working_time_from", "working_time_from_period", "working_time_to", "working_time_to_period", "working_hours", "phone", "cuisine", "profilepic", "primary_category_id", "latitude", "longitude"].some((key) => input[key] !== undefined),
    "No update fields were provided."
  );

  return errors;
}

export function validatePromotionInput(input: Record<string, any>) {
  const errors: ValidationErrors = [];
  pushError(errors, !String(input.title || "").trim(), "title is required");
  if (input.description !== undefined) {
    pushError(errors, !isText(input.description), "description must be text");
  }
  if (input.start_date !== undefined) {
    pushError(errors, Boolean(input.start_date) && !isIsoDate(input.start_date), "start_date must be a valid date");
  }
  if (input.end_date !== undefined) {
    pushError(errors, Boolean(input.end_date) && !isIsoDate(input.end_date), "end_date must be a valid date");
  }
  if (input.discount_percent !== undefined && String(input.discount_percent).trim()) {
    const discount = Number(input.discount_percent);
    const isPercent = !input.discount_type || input.discount_type === 'percent';
    pushError(errors, !Number.isFinite(discount) || discount < 0 || (isPercent && discount > 100), isPercent ? "Discount must be between 0 and 100" : "Discount must be a positive number");
  }
  if (input.max_uses_total !== undefined && String(input.max_uses_total).trim()) {
    const v = Number(input.max_uses_total);
    pushError(errors, !Number.isInteger(v) || v < 1, "max_uses_total must be a positive integer");
  }
  if (input.max_uses_per_user !== undefined && String(input.max_uses_per_user).trim()) {
    const v = Number(input.max_uses_per_user);
    pushError(errors, !Number.isInteger(v) || v < 1, "max_uses_per_user must be a positive integer");
  }
  if (input.image_base64 !== undefined) {
    pushError(errors, Boolean(input.image_base64) && !isBase64Image(input.image_base64), "Image must be a valid base64 data URL: data:image/png;base64,...");
  }
  return errors;
}

export function validateMenuChangeRequestInput(input: Record<string, any>) {
  const errors: ValidationErrors = [];
  pushError(errors, !["meal", "drink", "menu_item"].includes(String(input.item_type || "").toLowerCase()), "item_type must be meal, drink, or menu_item");
  pushError(errors, !isUUID(input.item_id), "Valid item_id is required");
  pushError(errors, !isFloatAtLeast(input.requested_price, 0), "requested_price must be a valid number");
  ["requested_name_en", "requested_name_ar", "requested_name_ms", "note"].forEach((field) => {
    if (input[field] !== undefined) {
      pushError(errors, !isText(input[field]), `${field} must be text`);
    }
  });
  return errors;
}

export function validateCategoryUpdateInput(input: Record<string, any>) {
  const errors: ValidationErrors = [];
  pushError(errors, !isUUID(input.id), "Valid id is required");
  ["name_en", "name_ar", "name_ms"].forEach((field) => {
    if (input[field] !== undefined) {
      pushError(errors, !String(input[field] || "").trim(), `${field} cannot be empty`);
    }
  });
  if (input.image_base64 !== undefined) {
    pushError(errors, Boolean(input.image_base64) && !isBase64Image(input.image_base64), "Image must be a valid base64 data URL: data:image/png;base64,...");
  }
  pushError(
    errors,
    !["name_en", "name_ar", "name_ms", "image_base64"].some((key) => input[key] !== undefined),
    "No update fields were provided."
  );
  return errors;
}

export function validateCategoryDeleteInput(input: Record<string, any>) {
  const errors: ValidationErrors = [];
  pushError(errors, !isUUID(input.id), "Valid id is required");
  return errors;
}

function validateRestaurantMenuItemFields(
  input: Record<string, any>,
  options: { requireId?: boolean }
) {
  const errors: ValidationErrors = [];
  if (options.requireId) {
    pushError(errors, !isUUID(input.id), "Valid id is required");
  }

  if (!options.requireId || input.category_id !== undefined) {
    pushError(errors, !isUUID(input.category_id), "Valid category_id is required");
  }

  if (!options.requireId || input.name_en !== undefined) {
    pushError(errors, !String(input.name_en || "").trim(), "name_en is required");
  }
  if (!options.requireId || input.name_ar !== undefined) {
    pushError(errors, !String(input.name_ar || "").trim(), "name_ar is required");
  }
  if (!options.requireId || input.name_ms !== undefined) {
    pushError(errors, !String(input.name_ms || "").trim(), "name_ms is required");
  }

  if (input.price !== undefined || !options.requireId) {
    pushError(errors, !isFloatAtLeast(input.price, 0), "price must be a valid number");
  }

  if (input.taqs !== undefined) {
    pushError(errors, !isNonEmptyTextArray(input.taqs), "taqs must be an array of non-empty text");
  }

  if (!options.requireId || input.image_base64 !== undefined) {
    pushError(errors, !String(input.image_base64 || "").trim(), "image_base64 is required");
    pushError(errors, Boolean(input.image_base64) && !isBase64Image(input.image_base64), "Image must be a valid base64 data URL: data:image/png;base64,...");
  }

  if (options.requireId) {
    const updatableKeys = [
      "category_id",
      "name_en",
      "name_ar",
      "name_ms",
      "description_en",
      "description_ar",
      "description_ms",
      "price",
      "taqs",
      "image_base64",
      "is_available",
    ];

    pushError(
      errors,
      !updatableKeys.some((key) => input[key] !== undefined),
      "No update fields were provided."
    );
  }

  return errors;
}

export function validateRestaurantMenuItemCreateInput(input: Record<string, any>) {
  return validateRestaurantMenuItemFields(input, {});
}

export function validateRestaurantMenuItemUpdateInput(input: Record<string, any>) {
  return validateRestaurantMenuItemFields(input, { requireId: true });
}

export function validateMarketingCampaignRequestInput(input: Record<string, any>) {
  const errors: ValidationErrors = [];
  pushError(errors, !String(input.campaign_title || "").trim(), "campaign_title is required");
  pushError(errors, !String(input.objective || "").trim(), "objective is required");
  if (input.budget !== undefined && String(input.budget).trim()) {
    pushError(errors, !isFloatAtLeast(input.budget, 0), "budget must be a valid number");
  }
  if (input.start_date !== undefined) {
    pushError(errors, Boolean(input.start_date) && !isIsoDate(input.start_date), "start_date must be a valid date");
  }
  if (input.end_date !== undefined) {
    pushError(errors, Boolean(input.end_date) && !isIsoDate(input.end_date), "end_date must be a valid date");
  }
  if (input.message !== undefined) {
    pushError(errors, !isText(input.message), "message must be text");
  }
  return errors;
}

export function validateSupportIntakeInput(input: Record<string, any>) {
  const errors: ValidationErrors = [];
  pushError(errors, !String(input.fullName || "").trim(), "fullName, email and message are required.");
  pushError(errors, !isEmail(input.email), "fullName, email and message are required.");
  pushError(errors, !String(input.message || "").trim(), "fullName, email and message are required.");
  return errors;
}
