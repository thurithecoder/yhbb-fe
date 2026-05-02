import type { Role, User } from "@/types";
import { getDisplayName } from "@/utils";

interface DecodedAuthToken {
  userId?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  username?: string;
  role?: string;
  exp?: number;
  iat?: number;
}

const supportedRoles: Role[] = ["admin", "restaurant", "user"];

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return atob(padded);
}

export function normalizeRole(role?: string | null): Role {
  return supportedRoles.includes(role as Role) ? (role as Role) : "user";
}

export function decodeAuthToken(token: string) {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    return JSON.parse(decodeBase64Url(payload)) as DecodedAuthToken;
  } catch (error) {
    console.error("decodeAuthToken error:", error);
    return null;
  }
}

export function isTokenExpired(token: string) {
  const decoded = decodeAuthToken(token);
  if (!decoded?.exp) return false;
  return decoded.exp * 1000 <= Date.now();
}

export function buildUserFromToken(token: string): User | null {
  const decoded = decodeAuthToken(token);
  if (!decoded?.userId || !decoded.email) {
    return null;
  }

  const firstname = decoded.firstname || "";
  const lastname = decoded.lastname || "";

  return {
    id: decoded.userId,
    email: decoded.email,
    firstname,
    lastname,
    displayName: decoded.username || getDisplayName(firstname, lastname, decoded.email),
    role: normalizeRole(decoded.role),
  };
}

export function getHomeRouteForRole(role?: Role | null) {
  if (role === "admin") return "/admin";
  if (role === "restaurant") return "/restaurant-panel";
  return "/dashboard";
}
