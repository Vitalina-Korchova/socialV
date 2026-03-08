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
import { toast } from "sonner";

export default function MyAvatarsTabSettings() {
  const {
    data: avatars,
    isLoading,
    isError,
  } = useGetUserShopItemsQuery("AVATAR");
  const [setActive, { isLoading: isUpdating }] = useSetShopItemActiveMutation();

  if (isLoading) return <Loader />;
  if (isError) return <ErrorState message="Failed to load your avatars" />;

  const handleActivate = async (id: number) => {
    try {
      await setActive({ itemId: id, type: "AVATAR" }).unwrap();
    } catch (err) {
      toast.error("Failed to update avatar");
    }
  };

  return (
    <div className="space-y-8 px-3 md:px-0">
      <div>
        <h2 className="text-xl md:text-2xl font-bold">Avatar</h2>
        <p className=" text-sm md:text-base text-muted-foreground ">
          Choose an avatar to represent your profile.
        </p>
      </div>

      {!avatars || avatars.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-2xl border-muted/50">
          <p className="text-lg font-medium text-muted-foreground">
            You do not own any avatars yet.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Visit the store to get more!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {avatars.map((avatar) => {
            const isActive = avatar.is_active;

            return (
              <div
                key={avatar.id}
                onClick={() => !isActive && handleActivate(avatar.id)}
                className={cn(
                  "group relative flex flex-col items-center gap-3 rounded-xl border p-4 transition-all duration-300 bg-zinc-900/50",
                  isActive
                    ? "border-primary ring-1 ring-primary/20 bg-primary/5"
                    : "border-zinc-800 hover:border-primary/50 cursor-pointer hover:scale-[1.02]"
                )}
              >
                <div
                  className={cn(
                    "relative h-20 w-20 md:h-24 md:w-24 overflow-hidden rounded-full border transition-colors",
                    isActive
                      ? "border-primary"
                      : "border-zinc-700 group-hover:border-primary/50"
                  )}
                >
                  <Image
                    src={avatar.image_url || "/card-back.jpg"}
                    alt="Avatar"
                    fill
                    className={cn(
                      "object-cover transition-transform duration-500",
                      !isActive && "group-hover:scale-110"
                    )}
                  />
                  {isActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/10 backdrop-blur-[1px]">
                      <div className="bg-primary text-white rounded-full p-1.5 shadow-lg">
                        <Check size={16} strokeWidth={3} />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  disabled={isActive || isUpdating}
                  className={cn(
                    "w-full rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all",
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white cursor-pointer"
                  )}
                >
                  {isActive
                    ? "Equipped"
                    : isUpdating
                    ? "Equipping..."
                    : "Equip"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
