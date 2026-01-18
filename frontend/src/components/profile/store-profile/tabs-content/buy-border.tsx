import React from "react";
import Image from "next/image";
import { Check, Plus } from "lucide-react";

export default function BuyBorderStore() {
  // Borders store data
  const bordersStore = [
    { id: 1, src: "/card-back.jpg", price: 80, isOwned: true },
    { id: 2, src: "/card-back.jpg", price: 120, isOwned: false },
    { id: 3, src: "/card-back.jpg", price: 180, isOwned: false },
    { id: 4, src: "/card-back.jpg", price: 220, isOwned: false },
  ];

  return (
    <>
      {" "}
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold">Buy Border</h2>
          <p className="text-muted-foreground">
            Buy border to show on your profile.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {bordersStore.map((border) => (
            <div
              key={border.id}
              className="cursor-pointer flex flex-col rounded-xl border p-4
     transition-all hover:scale-[1.02]
     border-muted hover:border-primary hover:ring-1 hover:ring-primary/20"
            >
              <div className="flex flex-col items-center gap-3">
                <Image
                  src={border.src}
                  alt="Border"
                  width={100}
                  height={100}
                  className="h-24 w-24 rounded-full border object-cover"
                />

                {!border.isOwned && (
                  <span
                    className="flex items-center gap-1 rounded-full
               px-3 py-1 text-sm font-medium
               bg-primary/10 text-primary"
                  >
                    <Image
                      src="/coins-icon.svg"
                      alt="coins"
                      width={16}
                      height={16}
                    />
                    {border.price}
                  </span>
                )}
              </div>

              <div className="mt-4 flex justify-center">
                {border.isOwned ? (
                  <button
                    disabled
                    className="flex items-center gap-1 rounded-md
           px-3 py-1 text-xs font-medium
           bg-muted text-muted-foreground
           cursor-not-allowed"
                  >
                    <Check size={14} />
                    Owned
                  </button>
                ) : (
                  <button
                    className="flex items-center gap-1 rounded-md
           px-3 py-1 text-xs font-medium
           border border-primary/40 text-primary
           hover:bg-primary hover:text-white
           transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    Buy
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
