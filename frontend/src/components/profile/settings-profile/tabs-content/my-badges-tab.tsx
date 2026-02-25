import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  useGetUserShopItemsQuery,
  useSetBadgesActiveMutation,
} from "@/store/shop_item/shop_item.api";
import { Loader } from "@/components/ui/loader";
import { ErrorState } from "@/components/ui/error";
import { parseBadgeName, cn } from "@/lib/utils";
import { toast } from "sonner";
import { Check } from "lucide-react";

export default function MyBadgesTabSettings() {
  const {
    data: badges,
    isLoading,
    isError,
  } = useGetUserShopItemsQuery("BADGE");
  const [setBadgesActive, { isLoading: isUpdating }] =
    useSetBadgesActiveMutation();
  const [selectedBadges, setSelectedBadges] = useState<number[]>([]);

  useEffect(() => {
    if (badges) {
      setSelectedBadges(badges.filter((b) => b.is_active).map((b) => b.id));
    }
  }, [badges]);

  if (isLoading) return <Loader />;
  if (isError) return <ErrorState message="Failed to load your badges" />;

  const toggleBadge = (id: number) => {
    setSelectedBadges((prev) => {
      if (prev.includes(id)) {
        return prev.filter((bid) => bid !== id);
      }
      if (prev.length >= 4) {
        toast.error("You can only equip up to 4 badges!");
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSave = async () => {
    try {
      await setBadgesActive(selectedBadges).unwrap();
      toast.success("Badges updated successfully!");
    } catch (err) {
      toast.error("Failed to update badges");
    }
  };

  const hasChanges = () => {
    if (!badges) return false;
    const currentActive = badges.filter((b) => b.is_active).map((b) => b.id);
    if (currentActive.length !== selectedBadges.length) return true;
    return !currentActive.every((id) => selectedBadges.includes(id));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Badges</h2>
          <p className="text-muted-foreground">
            Manage and equip your earned badges (max 4).
          </p>
        </div>
        {hasChanges() && (
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-primary/20"
          >
            {isUpdating ? "Saving..." : "Save Selection"}
          </button>
        )}
      </div>

      {!badges || badges.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-2xl border-muted/50">
          <p className="text-lg font-medium text-muted-foreground">
            You do not own any badges yet.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Level up to unlock badges!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4">
          {badges.map((badgeItem) => {
            const isSelected = selectedBadges.includes(badgeItem.id);
            const { name, color } = parseBadgeName(badgeItem.badge_name);

            return (
              <div
                key={badgeItem.id}
                onClick={() => toggleBadge(badgeItem.id)}
                className={cn(
                  "p-5 rounded-xl border cursor-pointer transition-all flex items-center justify-between group bg-zinc-900/50",
                  isSelected
                    ? "border-primary ring-1 ring-primary/20 bg-primary/5 shadow-2xl shadow-primary/10"
                    : "border-zinc-800 hover:border-primary/50 hover:scale-[1.02]"
                )}
              >
                <div className="flex items-center gap-4">
                  <Badge
                    className="text-[10px] px-3 py-1.5 h-auto font-black flex items-center gap-2 border shadow-lg uppercase tracking-wider transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: `${color}20`,
                      color: color,
                      borderColor: `${color}40`,
                    }}
                  >
                    {name}
                  </Badge>
                </div>

                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border transition-all",
                    isSelected
                      ? "bg-primary border-primary text-white shadow-lg"
                      : "bg-zinc-800 border-zinc-700 text-transparent group-hover:border-primary/50"
                  )}
                >
                  <Check size={14} strokeWidth={3} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
