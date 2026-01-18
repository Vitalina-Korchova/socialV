import React from "react";
import Image from "next/image";

export default function MyBordersTabSettings() {
  const borders = [
    { id: 1, src: "/card-back.jpg" },
    { id: 2, src: "/card-back.jpg" },
    { id: 3, src: "/card-back.jpg" },
    { id: 4, src: "/card-back.jpg" },
  ];
  const activeBorderId = 2;
  return (
    <>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold">Border</h2>
          <p className="text-muted-foreground">
            Choose a border for your profile.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {borders.map((avatar) => {
            const isActive = avatar.id === activeBorderId;

            return (
              <button
                key={avatar.id}
                className={`cursor-pointer relative rounded-xl border p-4 transition-all hover:scale-[1.02]
                    ${
                      isActive
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-muted hover:border-primary/50"
                    }`}
              >
                {isActive && (
                  <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs">
                    ✓
                  </div>
                )}

                <div className="flex flex-col items-center gap-3">
                  <Image
                    src={avatar.src}
                    alt="Avatar"
                    width={100}
                    height={100}
                    className="h-30 w-30 rounded-full border object-cover"
                  />

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium
                            ${
                              isActive
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                  >
                    {isActive ? "Current" : "Choose"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
