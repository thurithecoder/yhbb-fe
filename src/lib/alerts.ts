import Swal from "sweetalert2";
import { extractErrorMessages } from "@/lib/api";

const brandColor = "#6EA15C";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Success alert that auto-closes after 2 seconds
export function showSuccessAlert(message: string, title = "Success") {
  return Swal.fire({
    icon: "success",
    title,
    text: message,
    confirmButtonColor: brandColor,
    timer: 2000,
    timerProgressBar: true,
    showConfirmButton: false,
    willClose: () => {
      // Optional: any cleanup if needed
    },
  });
}

// Info alert that auto-closes after 2 seconds
export function showInfoAlert(message: string, title = "Heads up") {
  return Swal.fire({
    icon: "info",
    title,
    text: message,
    confirmButtonColor: brandColor,
    timer: 2000,
    timerProgressBar: true,
    showConfirmButton: false,
  });
}

// Error alert - stays until user clicks OK (needs user attention)
export function showErrorAlert(error: unknown, title = "Please check this") {
  // إذا كان error من نوع string (رسالة نصية مباشرة)
  if (typeof error === 'string') {
    return Swal.fire({
      icon: "error",
      title,
      text: error,
      confirmButtonColor: "#dc2626",
    });
  }

  // إذا كان error كائن به رسائل متعددة (مصفوفة أو استثناء)
  const messages = extractErrorMessages(error);
  const html = messages.length > 1
    ? `<div style="text-align:left"><ul style="margin:0;padding-left:18px;">${messages
      .map((message) => `<li>${escapeHtml(message)}</li>`)
      .join("")}</ul></div>`
    : undefined;

  return Swal.fire({
    icon: "error",
    title,
    text: messages.length === 1 ? messages[0] : undefined,
    html,
    confirmButtonColor: "#dc2626",
  });
}

// Confirmation dialog - needs user action
export async function confirmAction(options: {
  title: string;
  text: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  icon?: "warning" | "question" | "info";
}) {
  const result = await Swal.fire({
    icon: options.icon || "warning",
    title: options.title,
    text: options.text,
    showCancelButton: true,
    confirmButtonColor: brandColor,
    cancelButtonColor: "#111827",
    confirmButtonText: options.confirmButtonText || "Confirm",
    cancelButtonText: options.cancelButtonText || "Cancel",
    showConfirmButton: true,
  });

  return result.isConfirmed;
}

// Toast notification (small, auto-closes)
export function showToast(message: string, icon: "success" | "error" | "info" = "success") {
  return Swal.fire({
    toast: true,
    position: "top-end",
    icon,
    title: message,
    showConfirmButton: false,
    timer: 2400,
    timerProgressBar: true,
  });
}