import React from "react";
import Image from "next/image";
import { Plus, Lock } from "lucide-react";
import {
  useGetShopItemsToBuyQuery,
  useBuyShopItemMutation
} from "@/store/shop_item/shop_item.api";
import { useGetMeQuery } from "@/store/user/user.api";
import { Loader } from "@/components/ui/loader";
import { ErrorState } from "@/components/ui/error";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function BuyBackgroundStore() {
  const { data: user } = useGetMeQuery();
  const { data: backgrounds, isLoading, isError } = useGetShopItemsToBuyQuery("BACKGROUND");
  const [buyItem, { isLoading: isBuyingGlobal }] = useBuyShopItemMutation();
  const [buyingItemId, setBuyingItemId] = React.useState<number | null>(null);

  if (isLoading) return <Loader />;
  if (isError) return <ErrorState message="Failed to load available backgrounds" />;

  const handleBuy = async (id: number) => {
    setBuyingItemId(id);
    try {
      await buyItem({ itemId: id, type: "BACKGROUND" }).unwrap();
      toast.success("Background purchased successfully!");
    } catch (err) {
      const error = err as { data?: { message?: string } };
      const errorMessage = error?.data?.message || "Failed to buy background";
      toast.error(errorMessage);
    } finally {
      setBuyingItemId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Buy Background</h2>
        <p className="text-muted-foreground">
          Transform your profile page with custom backgrounds.
        </p>
      </div>

      {!backgrounds || backgrounds.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-2xl border-muted/50">
          <p className="text-lg font-medium text-muted-foreground">No new backgrounds available.</p>
          <p className="text-sm text-muted-foreground mt-1">Check back later for new items!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {backgrounds.map((bg) => {
            const isLocked = user && user.level < bg.required_level;
            const isThisItemBuying = buyingItemId === bg.id;

            return (
              <div
                key={bg.id}
                className={cn(
                  "group flex flex-col rounded-2xl border overflow-hidden transition-all border-zinc-800 bg-zinc-900/50",
                  !isLocked && "hover:scale-[1.02] hover:border-primary/50 cursor-pointer",
                  isLocked && "opacity-80 grayscale-[0.3]"
                )}
              >
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={bg.image_url || "/back1.jpg"}
                    alt="Background"
                    fill
                    className={cn(
                      "object-cover transition-transform duration-500",
                      !isLocked && "group-hover:scale-110",
                      isLocked && "opacity-40"
                    )}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {isLocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                      <Lock size={24} className="text-zinc-400 mb-1" />
                      <span className="text-xs font-bold text-white uppercase tracking-[0.2em]">Required Level {bg.required_level}</span>
                    </div>
                  )}

                  {!isLocked && (
                    <div className="absolute bottom-3 left-3 flex flex-col gap-1">
                      <span
                        className="flex items-center gap-1 rounded-full
                        px-3 py-1 text-sm font-bold
                        bg-black/60 backdrop-blur-md text-amber-400 border border-white/10 shadow-lg"
                      >
                        <Image
                          src="/coins-icon.svg"
                          alt="coins"
                          width={16}
                          height={16}
                        />
                        {bg.price_coins}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex items-center justify-end bg-zinc-900/80 backdrop-blur-sm border-t border-zinc-800">
                  <button
                    onClick={() => !isLocked && !isBuyingGlobal && handleBuy(bg.id)}
                    disabled={isBuyingGlobal || isLocked}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all shadow-lg",
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
