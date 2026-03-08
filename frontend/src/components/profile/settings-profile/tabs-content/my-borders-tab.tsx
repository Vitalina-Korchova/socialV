import React from "react";
import Image from "next/image";
import { Check, User } from "lucide-react";
import {
  useGetUserShopItemsQuery,
  useSetShopItemActiveMutation,
} from "@/store/shop_item/shop_item.api";
import { Loader } from "@/components/ui/loader";
import { ErrorState } from "@/components/ui/error";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function MyBordersTabSettings() {
  const {
    data: borders,
    isLoading,
    isError,
  } = useGetUserShopItemsQuery("BORDER");
  const [setActive, { isLoading: isUpdating }] = useSetShopItemActiveMutation();

  if (isLoading) return <Loader />;
  if (isError) return <ErrorState message="Failed to load your borders" />;

  const handleActivate = async (id: number) => {
    try {
      await setActive({ itemId: id, type: "BORDER" }).unwrap();
    } catch (err) {
      toast.error("Failed to update border");
    }
  };

  return (
    <div className="space-y-8 px-3 md:px-0">
      <div>
        <h2 className="text-xl md:text-2xl font-bold">Border</h2>
        <p className=" text-sm md:text-base text-muted-foreground ">
          Choose a border for your profile.
        </p>
      </div>

      {!borders || borders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-2xl border-muted/50">
          <p className="text-lg font-medium text-muted-foreground">
            You do not own any borders yet.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Visit the store to get more!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {borders.map((border) => {
            const isActive = border.is_active;

            return (
              <div
                key={border.id}
                onClick={() => !isActive && handleActivate(border.id)}
                className={cn(
                  "group relative flex flex-col items-center gap-3 rounded-xl border p-4 transition-all duration-300 bg-zinc-900/50",
                  isActive
                    ? "border-primary ring-1 ring-primary/20 bg-primary/5"
                    : "border-zinc-800 hover:border-primary/50 cursor-pointer hover:scale-[1.02]"
                )}
              >
                <div className="relative h-20 w-20 md:h-24 md:w-24">
                  <div
                    className={cn(
                      "absolute inset-0 z-10 transition-transform duration-500",
                      !isActive && "group-hover:scale-110"
                    )}
                  >
                    {border.image_url && (
                      <Image
                        src={border.image_url}
                        alt="Border"
                        fill
                        className="object-contain scale-125"
                      />
                    )}
                  </div>
                  <div className="absolute inset-2 rounded-full flex items-center justify-center border border-zinc-700 bg-zinc-800">
                    <User className="text-zinc-600 w-10 h-10" />
                  </div>
                  {isActive && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-full bg-primary/10 backdrop-blur-[1px]">
                      <div className="bg-primary text-white rounded-full p-1.5 shadow-lg scale-75">
                        <Check size={16} strokeWidth={4} />
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
