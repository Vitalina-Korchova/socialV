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

export default function BuyAvatarStore() {
  const { data: user } = useGetMeQuery();
  const { data: avatars, isLoading, isError } = useGetShopItemsToBuyQuery("AVATAR");
  const [buyItem, { isLoading: isBuyingGlobal }] = useBuyShopItemMutation();
  const [buyingItemId, setBuyingItemId] = React.useState<number | null>(null);

  if (isLoading) return <Loader />;
  if (isError) return <ErrorState message="Failed to load available avatars" />;

  const handleBuy = async (id: number) => {
    setBuyingItemId(id);
    try {
      await buyItem({ itemId: id, type: "AVATAR" }).unwrap();
      toast.success("Avatar purchased successfully!");
    } catch (err: any) {
      const errorMessage = err?.data?.message || "Failed to buy avatar";
      toast.error(errorMessage);
    } finally {
      setBuyingItemId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Buy Avatar</h2>
        <p className="text-muted-foreground">
          Purchase unique avatars to personalize your profile.
        </p>
      </div>

      {!avatars || avatars.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-2xl border-muted/50">
          <p className="text-lg font-medium text-muted-foreground">No new avatars available.</p>
          <p className="text-sm text-muted-foreground mt-1">Check back later for new items!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {avatars.map((avatar) => {
            const isLocked = user && user.level < avatar.required_level;
            const isThisItemBuying = buyingItemId === avatar.id;

            return (
              <div
                key={avatar.id}
                className={cn(
                  "group flex flex-col rounded-xl border p-4 transition-all border-zinc-800 bg-zinc-900/50",
                  !isLocked && "hover:scale-[1.02] hover:border-primary hover:ring-1 hover:ring-primary/20 cursor-pointer",
                  isLocked && "opacity-80 grayscale-[0.3]"
                )}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={cn(
                    "relative h-24 w-24 overflow-hidden rounded-full border border-zinc-700 transition-colors",
                    !isLocked && "group-hover:border-primary/50"
                  )}>
                    <Image
                      src={avatar.image_url || "/card-back.jpg"}
                      alt="Avatar"
                      fill
                      className={cn(
                        "object-cover transition-transform duration-500",
                        !isLocked && "group-hover:scale-110",
                        isLocked && "opacity-40"
                      )}
                    />
                    {isLocked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]">
                        <Lock size={18} className="text-zinc-400 mb-0.5" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Lvl {avatar.required_level}</span>
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
                      {avatar.price_coins}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => !isLocked && !isBuyingGlobal && handleBuy(avatar.id)}
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
