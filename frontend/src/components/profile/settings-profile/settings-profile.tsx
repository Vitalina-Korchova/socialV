import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleUserRound, Sparkles, User, Wallpaper, Star } from "lucide-react";
import { cn } from "@/lib/utils";

import ProfileSettings from "./tabs-content/profile-tab";
import MyAvatarsTabSettings from "./tabs-content/my-avatars-tab";
import MyBackgroundsTabSettings from "./tabs-content/my-backgrounds-tab";
import MyBordersTabSettings from "./tabs-content/my-borders-tab";
import MyBadgesTabSettings from "./tabs-content/my-badges-tab";

export default function SettingsProfile() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <Card className="w-full p-4 md:p-6">
      <div className="flex flex-col md:flex-row gap-6 h-full min-h-[500px]">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="space-y-1.5 md:sticky md:top-6">
            <h4 className="px-4 mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 hidden md:block">
              Account Settings
            </h4>
            <div className="flex justify-between flex-row md:flex-col space-x-1.5 md:space-x-0 md:space-y-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {[
                {
                  id: "profile",
                  label: "Profile",
                  icon: User,
                  color: "text-blue-400",
                },
                {
                  id: "avatar",
                  label: "My Avatars",
                  icon: CircleUserRound,
                  color: "text-purple-400",
                },
                {
                  id: "background",
                  label: "My Backgrounds",
                  icon: Wallpaper,
                  color: "text-cyan-400",
                },
                {
                  id: "border",
                  label: "My Borders",
                  icon: Sparkles,
                  color: "text-amber-400",
                },
                {
                  id: "badge",
                  label: "My Badges",
                  icon: Star,
                  color: "text-rose-400",
                },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant="ghost"
                  className={cn(
                    "whitespace-nowrap md:w-full  justify-center md:justify-start text-sm font-medium cursor-pointer h-11 px-4 transition-all duration-300 relative group rounded-xl shrink-0",
                    activeTab === tab.id
                      ? "bg-zinc-800/10 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/20"
                  )}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon
                    className={cn(
                      "w-4.5 h-4.5 md:mr-3 transition-transform duration-300 group-hover:scale-110",
                      tab.color
                    )}
                  />
                  <span className="hidden md:block">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="absolute left-0 bottom-0 md:left-0 md:top-1/2 md:-translate-y-1/2 w-full h-[2px] md:w-[3px] md:h-5 bg-primary rounded-t-full md:rounded-r-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 border-t md:border-t-0 md:border-l border-zinc-800/50 pt-6 md:pt-0 md:pl-6 h-full">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {activeTab === "profile" && <ProfileSettings />}
            {activeTab === "avatar" && <MyAvatarsTabSettings />}
            {activeTab === "background" && <MyBackgroundsTabSettings />}
            {activeTab === "border" && <MyBordersTabSettings />}
            {activeTab === "badge" && <MyBadgesTabSettings />}
          </div>
        </div>
      </div>
    </Card>
  );
}
