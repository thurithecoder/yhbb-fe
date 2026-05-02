import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { CatalogItem } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCurrency(
  value: number | string | null | undefined,
  locale = "ms-MY",
  currency = "MYR"
) {
  const amount = toNumber(value);
  const formattedAmount = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  if (formattedAmount.startsWith("RM")) {
    return formattedAmount;
  }

  const normalized = formattedAmount.replace(/^MYR\s*/i, "").trim();
  return `RM ${normalized}`;
}

export function formatPromotionDiscount(
  discountType: "percent" | "cash" | null | undefined,
  discountValue: number | string | null | undefined,
  options: { includeOff?: boolean } = {}
) {
  if (discountValue === null || discountValue === undefined || String(discountValue).trim() === "") {
    return null;
  }

  const amount = toNumber(discountValue);
  const formattedAmount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  const label = discountType === "cash" ? `RM ${formattedAmount}` : `${formattedAmount}%`;

  return options.includeOff === false ? label : `${label} off`;
}

export function formatDate(value: string | number | Date | null | undefined) {
  if (!value) return "Not set";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatShortDate(value: string | number | Date | null | undefined) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: string | number | Date | null | undefined) {
  if (!value) return "Not set";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function getDisplayName(firstname?: string | null, lastname?: string | null, fallback = "Guest") {
  const fullName = [firstname, lastname].filter(Boolean).join(" ").trim();
  return fullName || fallback;
}

export function getCatalogItemName(item: Pick<CatalogItem, "name_en" | "name_ms" | "name_ar">) {
  return item.name_en || item.name_ms || item.name_ar || "Unnamed Item";
}

export function getCatalogItemDescription(
  item: Pick<CatalogItem, "description_en" | "description_ms" | "description_ar">
) {
  return item.description_en || item.description_ms || item.description_ar || "No description provided yet.";
}

export function getCategoryName(item?: CatalogItem | null) {
  if (!item?.tblcategory) return "Uncategorized";
  return item.tblcategory.name_en || item.tblcategory.name_ms || item.tblcategory.name_ar;
}

export function truncateText(value: string | null | undefined, limit = 120) {
  if (!value) return "";
  return value.length > limit ? `${value.slice(0, limit).trim()}...` : value;
}

/** Normalises the cuisine field — handles plain strings from old backend data and arrays from new data. */
export function parseCuisines(value: string | string[] | null | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read the selected file."));
    reader.readAsDataURL(file);
  });
}
