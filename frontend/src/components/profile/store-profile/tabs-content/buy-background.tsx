import React from "react";
import Image from "next/image";
import { Check, Plus } from "lucide-react";

export default function BuyBackgroundStore() {
  // Backgrounds store data
  const backgroundsStore = [
    { id: 1, src: "/back1.jpg", price: 150, isOwned: true },
    { id: 2, src: "/back2.jpg", price: 250, isOwned: false },
    { id: 3, src: "/back3.jpg", price: 350, isOwned: false },
    { id: 4, src: "/back4.jpg", price: 450, isOwned: false },
    { id: 5, src: "/back1.jpg", price: 550, isOwned: false },
    { id: 6, src: "/back2.jpg", price: 650, isOwned: false },
  ];
  return (
    <>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold">Buy Background</h2>
          <p className="text-muted-foreground">
            Buy background to show on your profile.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {backgroundsStore.map((bg) => (
            <div
              key={bg.id}
              className="cursor-pointer flex flex-col rounded-2xl border p-4
     transition-all hover:scale-[1.02]
     border-muted hover:border-primary/60 hover:ring-1 hover:ring-primary/20"
            >
              <div className="flex flex-col items-center gap-3">
                <Image
                  src={bg.src}
                  alt="Background"
                  width={350}
                  height={350}
                  className="h-36 w-full rounded-xl object-cover"
                />

                {!bg.isOwned && (
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
                    {bg.price}
                  </span>
                )}
              </div>

              <div className="mt-4 flex justify-center">
                {bg.isOwned ? (
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
