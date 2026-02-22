import React from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import {
  useGetUserShopItemsQuery,
  useSetShopItemActiveMutation,
} from "@/store/shop_item/shop_item.api";
import { Loader } from "@/components/ui/loader";
import { ErrorState } from "@/components/ui/error";
import { cn } from "@/lib/utils";

export default function MyBackgroundsTabSettings() {
  const {
    data: backgrounds,
    isLoading,
    isError,
  } = useGetUserShopItemsQuery("BACKGROUND");
  const [setActive, { isLoading: isUpdating }] = useSetShopItemActiveMutation();

  if (isLoading) return <Loader />;
  if (isError) return <ErrorState message="Failed to load your backgrounds" />;

  const handleActivate = async (id: number) => {
    try {
      await setActive({ itemId: id, type: "BACKGROUND" }).unwrap();
    } catch (err) {
      console.error("Failed to activate background", err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Background</h2>
        <p className="text-muted-foreground">
          Choose a background for your profile page.
        </p>
      </div>

      {!backgrounds || backgrounds.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-2xl border-muted/50">
          <p className="text-lg font-medium text-muted-foreground">
            You do not own any backgrounds yet.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Visit the store to get more!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {backgrounds.map((bg) => {
            const isActive = bg.is_active;

            return (
              <div
                key={bg.id}
                onClick={() => !isActive && handleActivate(bg.id)}
                className={cn(
                  "group relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 border-zinc-800 bg-zinc-900/50",
                  isActive
                    ? "border-primary ring-1 ring-primary/20 bg-primary/5 shadow-2xl shadow-primary/10"
                    : "hover:border-primary/50 cursor-pointer hover:scale-[1.01]"
                )}
              >
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={bg.image_url || "/back1.jpg"}
                    alt="Background"
                    fill
                    className={cn(
                      "object-cover transition-transform duration-700",
                      !isActive && "group-hover:scale-110"
                    )}
                  />
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity",
                    isActive ? "opacity-40" : "opacity-60 group-hover:opacity-40"
                  )} />

                  {isActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/10 backdrop-blur-[1px]">
                      <div className="flex flex-col items-center gap-2">
                        <div className="bg-primary text-white rounded-full p-2.5 shadow-xl">
                          <Check size={20} strokeWidth={3} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white drop-shadow-md">Active</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 flex items-center justify-end bg-zinc-900/80 backdrop-blur-sm border-t border-zinc-800">
                  <button
                    disabled={isActive || isUpdating}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all shadow-lg",
                      isActive
                        ? "bg-primary text-white shadow-primary/20"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white cursor-pointer"
                    )}
                  >
                    {isActive ? "Equipped" : isUpdating ? "Equipping..." : "Equip"}
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
