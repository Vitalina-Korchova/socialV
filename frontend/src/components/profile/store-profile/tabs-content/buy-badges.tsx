import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Check, Plus, Lock } from "lucide-react";
import {
  useGetShopItemsToBuyQuery,
  useBuyShopItemMutation,
} from "@/store/shop_item/shop_item.api";
import { useGetMeQuery } from "@/store/user/user.api";
import { Loader } from "@/components/ui/loader";
import { ErrorState } from "@/components/ui/error";
import { cn, parseBadgeName } from "@/lib/utils";
import { toast } from "sonner";

export default function BuyBadgesStore() {
  const { data: user } = useGetMeQuery();
  const {
    data: badges,
    isLoading,
    isError,
  } = useGetShopItemsToBuyQuery("BADGE");
  const [buyItem, { isLoading: isBuyingGlobal }] = useBuyShopItemMutation();
  const [buyingItemId, setBuyingItemId] = React.useState<number | null>(null);

  if (isLoading) return <Loader />;
  if (isError) return <ErrorState message="Failed to load available badges" />;

  const handleBuy = async (id: number) => {
    setBuyingItemId(id);
    try {
      await buyItem({ itemId: id, type: "BADGE" }).unwrap();
      toast.success("Badge purchased successfully!");
    } catch (err) {
      const error = err as { data?: { message?: string } };
      const errorMessage = error?.data?.message || "Failed to buy badge";
      toast.error(errorMessage);
    } finally {
      setBuyingItemId(null);
    }
  };

  return (
    <div className="space-y-8 px-3 md:px-0">
      <div>
        <h2 className="text-xl md:text-2xl  font-bold">Buy Badges</h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Purchase unique badges to highlight your profile.
        </p>
      </div>

      {!badges || badges.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-2xl border-muted/50">
          <p className="text-lg font-medium text-muted-foreground">
            No new badges available.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Check back later for new items!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-3 2xl:grid-cols-4 gap-6">
          {badges.map((badgeItem) => {
            const isLocked = user && user.level < badgeItem.required_level;
            const isThisItemBuying = buyingItemId === badgeItem.id;
            const { name, color } = parseBadgeName(badgeItem.badge_name);

            return (
              <div
                key={badgeItem.id}
                className={cn(
                  "group flex flex-col rounded-xl border p-4 transition-all border-zinc-800 bg-zinc-900/50",
                  !isLocked &&
                    "hover:scale-[1.02] hover:border-primary hover:ring-1 hover:ring-primary/20 cursor-pointer",
                  isLocked && "opacity-80 grayscale-[0.3]"
                )}
              >
                <div className="flex flex-col items-center gap-1 md:gap-3">
                  <div className="relative h-24 w-full flex items-center justify-center">
                    <div
                      className={cn(
                        "transition-transform duration-500",
                        !isLocked && "group-hover:scale-110",
                        isLocked && "opacity-20"
                      )}
                    >
                      <Badge
                        className="text-[10px] px-3 py-1.5 h-auto font-black flex items-center gap-2 border shadow-lg uppercase tracking-wider"
                        style={{
                          backgroundColor: `${color}20`,
                          color: color,
                          borderColor: `${color}40`,
                        }}
                      >
                        {name}
                      </Badge>
                    </div>

                    {isLocked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="bg-black/40 backdrop-blur-[2px] rounded-full p-2 flex flex-col items-center min-w-[60px]">
                          <Lock size={16} className="text-zinc-400 mb-0.5" />
                          <span className="text-[8px] font-bold text-white uppercase tracking-wider">
                            Lvl {badgeItem.required_level}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <span
                      className="flex items-center gap-1 rounded-full
                    px-3 py-1 text-sm font-bold
                    bg-zinc-800 text-amber-400 border border-zinc-700 shadow-sm"
                    >
                      <Image
                        src="/coins-icon.svg"
                        alt="coins"
                        width={16}
                        height={16}
                      />
                      {badgeItem.price_coins}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() =>
                      !isLocked && !isBuyingGlobal && handleBuy(badgeItem.id)
                    }
                    disabled={isBuyingGlobal || isLocked}
                    className={cn(
                      "w-full flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all shadow-lg",
                      isLocked
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700 shadow-none"
                        : "bg-primary text-white hover:bg-primary/90 cursor-pointer shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {isLocked ? (
                      <>
                        <Lock size={14} />
                        Locked
                      </>
                    ) : (
                      <>
                        <Plus size={14} />
                        {isThisItemBuying ? "Buying..." : "Purchase"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
