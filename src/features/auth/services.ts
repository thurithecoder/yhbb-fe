import { useAppStore } from "@/app/store";
import { apiRequest } from "@/lib/api";
import { buildUserFromToken, normalizeRole } from "@/lib/auth";
import {
  validateChangePasswordInput,
  validateForgotPasswordInput,
  validateLoginInput,
  validateRegisterInput,
  validateResetPasswordInput,
  validateSupportIntakeInput,
} from "@/lib/validators";
import { ApiError } from "@/lib/api";
import type { User } from "@/types";

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  account_type?: "user" | "restaurant";
  firstname?: string;
  lastname?: string;
  restaurant_name?: string;
  location?: string;
  working_time_from?: string;
  working_time_from_period?: "AM" | "PM";
  working_time_to?: string;
  working_time_to_period?: "AM" | "PM";
  phone?: string;
  cuisine?: string;
  profilepic?: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

interface ForgotPasswordInput {
  email: string;
}

interface ResetPasswordInput {
  email: string;
  otp: string;
  newPassword: string;
}

interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SupportIntakeInput {
  fullName: string;
  email: string;
  inquiryType?: string;
  message: string;
  formattedSummary?: string;
}

interface AuthUserPayload {
  id?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  displayName?: string;
  role?: string;
  photoURL?: string | null;
  profilepic?: string | null;
}

const base64ImageRegex = /^data:image\/(png|jpe?g);base64,[a-z0-9+/=\r\n]+$/i;

function throwIfValidationFails(messages: string[]) {
  if (messages.length) {
    throw new ApiError(messages[0], { status: 200, messages });
  }
}

function normalizeAuthUser(payload?: AuthUserPayload | null): User | null {
  if (!payload?.id || !payload.email) {
    return null;
  }

  const firstname = String(payload.firstname || "");
  const lastname = String(payload.lastname || "");
  const displayName = String(payload.displayName || "").trim() || `${firstname} ${lastname}`.trim() || payload.email;
  const profilepic = payload.photoURL || payload.profilepic || undefined;

  return {
    id: payload.id,
    email: payload.email,
    firstname,
    lastname,
    displayName,
    role: normalizeRole(payload.role),
    photoURL: profilepic,
  };
}

export async function login(input: LoginInput) {
  throwIfValidationFails(validateLoginInput(input));

  const data = await apiRequest<{ msg: string; authtoken: string; user?: AuthUserPayload }, LoginInput>("/api/auth/login", {
    method: "POST",
    body: input,
  });

  const tokenUser = buildUserFromToken(data.authtoken);
  const responseUser = normalizeAuthUser(data.user);
  const user = responseUser || tokenUser;
  if (!user) {
    throw new ApiError("Login succeeded, but the session token could not be read.");
  }

  useAppStore.getState().setSession({ user, token: data.authtoken });
  return { ...data, user };
}

export async function getMyProfile() {
  const data = await apiRequest<{ user?: AuthUserPayload }>("/api/auth/me", {
    auth: true,
  });

  const user = normalizeAuthUser(data.user);
  if (!user) {
    throw new ApiError("Unable to load user profile.");
  }

  return user;
}

export async function updateMyProfileImage(profilepic: string | null) {
  const normalizedProfilepic = profilepic === null ? null : String(profilepic || "").trim();

  if (normalizedProfilepic && !base64ImageRegex.test(normalizedProfilepic)) {
    throw new ApiError("profilepic must be a valid base64 data URL: data:image/png;base64,...", {
      status: 200,
      messages: ["profilepic must be a valid base64 data URL: data:image/png;base64,..."],
    });
  }

  const data = await apiRequest<{ msg?: string; user?: AuthUserPayload }, { profilepic: string | null }>(
    "/api/auth/profile-image",
    {
      method: "PUT",
      body: { profilepic: normalizedProfilepic || null },
      auth: true,
    }
  );

  const user = normalizeAuthUser(data.user);
  if (!user) {
    throw new ApiError("Profile image updated, but user data could not be read.");
  }

  return {
    msg: data.msg || "Profile image updated successfully.",
    user,
  };
}

export async function register(input: RegisterInput) {
  throwIfValidationFails(validateRegisterInput(input));

  const { confirmPassword: _unusedConfirmPassword, ...payload } = input;

  return apiRequest<{ msg: string; newuser: unknown }, Omit<RegisterInput, "confirmPassword">>("/api/auth/register", {
    method: "POST",
    body: payload,
  });
}

export async function logout() {
  try {
    return await apiRequest<{ msg: string }>("/api/auth/logout", {
      method: "GET",
      auth: true,
    });
  } finally {
    useAppStore.getState().clearSession();
  }
}

export async function forgotPassword(input: ForgotPasswordInput) {
  throwIfValidationFails(validateForgotPasswordInput(input));

  return apiRequest<{ msg: string }, ForgotPasswordInput>("/api/auth/forgot-password", {
    method: "POST",
    body: input,
  });
}

export async function verifyResetPassword(input: ResetPasswordInput) {
  throwIfValidationFails(validateResetPasswordInput(input));

  return apiRequest<{ msg: string }, ResetPasswordInput>("/api/auth/verify-reset-password", {
    method: "POST",
    body: input,
  });
}

export async function changePassword(input: ChangePasswordInput) {
  throwIfValidationFails(validateChangePasswordInput(input));

  return apiRequest<{ msg: string }, ChangePasswordInput>("/api/auth/change-password", {
    method: "POST",
    body: input,
    auth: true,
  });
}

export async function submitSupportIntake(input: SupportIntakeInput) {
  throwIfValidationFails(validateSupportIntakeInput(input));

  return apiRequest<{ msg: string }, SupportIntakeInput>("/api/auth/support-intake", {
    method: "POST",
    body: input,
  });
}
