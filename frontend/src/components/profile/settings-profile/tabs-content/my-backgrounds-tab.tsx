import React from "react";
import Image from "next/image";

export default function MyBackgroundsTabSettings() {
  const backgrounds = [
    { id: 1, src: "/back1.jpg" },
    { id: 2, src: "/back2.jpg" },
    { id: 3, src: "/back3.jpg" },
    { id: 4, src: "/back4.jpg" },
  ];

  const activeBackgroundId = 1;
  return (
    <>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold">Background</h2>
          <p className="text-muted-foreground">
            Choose a background for your profile. This will be visible on your
            profile page.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {backgrounds.map((bg) => {
            const isActive = bg.id === activeBackgroundId;

            return (
              <button
                key={bg.id}
                className={`cursor-pointer relative h-40 overflow-hidden rounded-2xl border transition-all
              ${
                isActive
                  ? "border-primary ring-2 ring-primary/40"
                  : "border-muted hover:border-primary/60"
              }`}
              >
                <Image
                  src={bg.src}
                  alt="Background"
                  width={350}
                  height={350}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105 rounded-2xl"
                />

                <div className="absolute bottom-3 left-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium
                        ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }
                      `}
                  >
                    {isActive ? "Current" : "Choose"}
                  </span>
                </div>

                {isActive && (
                  <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-sm">
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
