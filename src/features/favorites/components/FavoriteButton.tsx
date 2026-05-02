import * as React from "react";
import { Heart } from "lucide-react";
import { cn } from "@/utils";
import type { FavoriteEntityType } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { addFavorite, removeFavorite, toggleFavorite } from "@/features/favorites/services";
import { confirmAction, showErrorAlert, showInfoAlert, showToast } from "@/lib/alerts";

interface FavoriteButtonProps {
  entityType: FavoriteEntityType;
  entityId: string;
  initiallyFavorited?: boolean;
  className?: string;
  iconClassName?: string;
  mode?: "toggle" | "explicit";
  requireRemoveConfirmation?: boolean;
  activeClassName?: string;
  inactiveClassName?: string;
  title?: string;
  onChanged?: (favorited: boolean) => void;
}

export default function FavoriteButton({
  entityType,
  entityId,
  initiallyFavorited = false,
  className,
  iconClassName,
  mode = "toggle",
  requireRemoveConfirmation = false,
  activeClassName,
  inactiveClassName,
  title,
  onChanged,
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = React.useState(initiallyFavorited);
  const [isBusy, setIsBusy] = React.useState(false);

  React.useEffect(() => {
    setIsFavorited(initiallyFavorited);
  }, [initiallyFavorited]);

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (isBusy) return;

    if (!user) {
      await showInfoAlert("Log in with a user account to manage favorites.", "Login required");
      return;
    }

    if (user.role !== "user") {
      await showInfoAlert("Favorites are available from the user dashboard.", "User account required");
      return;
    }

    if (isFavorited && requireRemoveConfirmation) {
      const confirmed = await confirmAction({
        title: "Remove favorite?",
        text: "This item will be removed from your favorites list.",
        confirmButtonText: "Remove",
      });

      if (!confirmed) {
        return;
      }
    }

    setIsBusy(true);

    try {
      const input = { entity_type: entityType, entity_id: entityId };
      const result = mode === "toggle"
        ? await toggleFavorite(input)
        : isFavorited
          ? await removeFavorite(input)
          : await addFavorite(input);

      setIsFavorited(result.is_favorited);
      onChanged?.(result.is_favorited);
      showToast(result.msg || (result.is_favorited ? "Added to favorites." : "Removed from favorites."));
    } catch (error) {
      await showErrorAlert(error);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <button
      type="button"
      title={title || (isFavorited ? "Remove favorite" : "Add favorite")}
      onClick={handleClick}
      disabled={isBusy}
      className={cn(
        "inline-flex items-center justify-center transition-all disabled:cursor-not-allowed disabled:opacity-60",
        isFavorited
          ? activeClassName || "bg-red-500 text-white"
          : inactiveClassName || "bg-white/10 text-white hover:bg-white/20",
        className
      )}
    >
      <Heart className={cn("w-4 h-4", isFavorited && "fill-current", iconClassName)} />
    </button>
  );
}
