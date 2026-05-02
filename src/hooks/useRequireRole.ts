import * as React from "react";
import { useNavigate } from "react-router-dom";
import type { Role } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { getHomeRouteForRole } from "@/lib/auth";
import { showInfoAlert } from "@/lib/alerts";

export function useRequireRole(allowedRoles?: Role[]) {
  const navigate = useNavigate();
  const { user, isHydrated } = useAuth();
  const hasHandledRedirect = React.useRef(false);

  const canAccess =
    isHydrated &&
    Boolean(user) &&
    (!allowedRoles?.length || (user && allowedRoles.includes(user.role)));

  React.useEffect(() => {
    if (!isHydrated || canAccess || hasHandledRedirect.current) {
      return;
    }

    hasHandledRedirect.current = true;

    if (!user) {
      showInfoAlert("Please log in to continue.", "Authentication required").then(() => {
        navigate("/", { replace: true });
      });
      return;
    }

    showInfoAlert("You do not have access to that panel.", "Access restricted").then(() => {
      navigate(getHomeRouteForRole(user.role), { replace: true });
    });
  }, [canAccess, isHydrated, navigate, user]);

  return {
    canAccess,
    isReady: isHydrated,
    user,
  };
}
