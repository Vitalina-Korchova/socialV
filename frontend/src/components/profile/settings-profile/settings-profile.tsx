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
    <Card className="w-full p-6">
      <div className="flex gap-6 h-full min-h-[500px]">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="space-y-1.5 sticky top-6">
            <h4 className="px-4 mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Account Settings
            </h4>
            {[
              { id: "profile", label: "Profile", icon: User, color: "text-blue-400" },
              { id: "avatar", label: "My Avatars", icon: CircleUserRound, color: "text-purple-400" },
              { id: "background", label: "My Backgrounds", icon: Wallpaper, color: "text-cyan-400" },
              { id: "border", label: "My Borders", icon: Sparkles, color: "text-amber-400" },
              { id: "badge", label: "My Badges", icon: Star, color: "text-rose-400" },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-sm font-medium cursor-pointer h-11 px-4 transition-all duration-300 relative group rounded-xl",
                  activeTab === tab.id
                    ? "bg-zinc-800/10 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/20"
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className={cn("w-4.5 h-4.5 mr-3 transition-transform duration-300 group-hover:scale-110", tab.color)} />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 border-l border-zinc-800/50 pl-6 h-full">
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
