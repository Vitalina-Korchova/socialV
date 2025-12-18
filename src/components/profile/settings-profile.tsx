import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleUserRound, Sparkles, User, Wallpaper } from "lucide-react";
import { Input } from "../ui/input";
import Image from "next/image";

export default function SettingsProfile() {
  const [activeTab, setActiveTab] = useState("profile");
  const avatars = [
    { id: 1, src: "/card-back.jpg" },
    { id: 2, src: "/card-back.jpg" },
    { id: 3, src: "/card-back.jpg" },
    { id: 4, src: "/card-back.jpg" },
  ];

  const activeAvatarId = 2;

  const backgrounds = [
    { id: 1, src: "/back1.jpg" },
    { id: 2, src: "/back2.jpg" },
    { id: 3, src: "/back3.jpg" },
    { id: 4, src: "/back4.jpg" },
  ];

  const activeBackgroundId = 1;

  const borders = [
    { id: 1, src: "/card-back.jpg" },
    { id: 2, src: "/card-back.jpg" },
    { id: 3, src: "/card-back.jpg" },
    { id: 4, src: "/card-back.jpg" },
  ];
  const activeBorderId = 2;

  return (
    <Card className="w-full p-6">
      <div className="flex gap-6 h-full">
        <div className="w-64 flex-shrink-0">
          <div className="space-y-1 sticky top-6">
            <Button
              variant={activeTab === "profile" ? "secondary" : "ghost"}
              className="w-full justify-start text-base cursor-pointer h-12"
              onClick={() => setActiveTab("profile")}
            >
              <User className="w-5 h-5 " />
              Profile
            </Button>
            <Button
              variant={activeTab === "avatar" ? "secondary" : "ghost"}
              className="w-full justify-start text-base cursor-pointer h-12"
              onClick={() => setActiveTab("avatar")}
            >
              <CircleUserRound className="w-5 h-5 " />
              Avatar
            </Button>
            <Button
              variant={activeTab === "background" ? "secondary" : "ghost"}
              className="w-full justify-start text-base cursor-pointer h-12"
              onClick={() => setActiveTab("background")}
            >
              <Wallpaper className="w-5 h-5 " />
              Background
            </Button>
            <Button
              variant={activeTab === "border" ? "secondary" : "ghost"}
              className="w-full justify-start  text-base cursor-pointer h-12"
              onClick={() => setActiveTab("border")}
            >
              <Sparkles className="w-5 h-5 " />
              Border
            </Button>
          </div>
        </div>

        {/* Контент справа */}
        <div className="flex-1 border-l pl-6 min-h-[400px]">
          {activeTab === "profile" && (
            <div className="space-y-3">
              <div>
                <h2 className="text-2xl font-bold">Profile Settings</h2>
                <p className="text-muted-foreground">
                  You can update your personal information and account details
                  here.
                </p>
              </div>

              <div className="max-w-xl space-y-6  p-6">
                <div className="flex flex-col  gap-2">
                  <label className="text-sm font-medium ">Username</label>
                  <Input
                    type="text"
                    placeholder="Enter your username"
                    className="w-full  "
                  />
                </div>

                <div className="flex flex-col  gap-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full  "
                  />
                </div>

                <div className="flex justify-end">
                  <Button className="cursor-pointer">Save changes</Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "avatar" && (
            <div className="space-y-8">
              {/* Header */}
              <div>
                <h2 className="text-2xl font-bold">Avatar</h2>
                <p className="text-muted-foreground">
                  Choose an avatar to represent your profile.
                </p>
              </div>

              {/* Avatars grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {avatars.map((avatar) => {
                  const isActive = avatar.id === activeAvatarId;

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
          )}

          {activeTab === "background" && (
            <div className="space-y-8">
              {/* Header */}
              <div>
                <h2 className="text-2xl font-bold">Background</h2>
                <p className="text-muted-foreground">
                  Choose a background for your profile. This will be visible on
                  your profile page.
                </p>
              </div>

              {/* Backgrounds grid */}
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
                      {/* Background image */}
                      <Image
                        src={bg.src}
                        alt="Background"
                        width={350}
                        height={350}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105 rounded-2xl"
                      />

                      {/* Badge like avatar */}
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

                      {/* Active check */}
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
          )}

          {activeTab === "border" && (
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
          )}
        </div>
      </div>
    </Card>
  );
}
