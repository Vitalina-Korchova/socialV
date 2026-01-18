import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleUserRound, Sparkles, User, Wallpaper } from "lucide-react";

import ProfileSettings from "./tabs-content/profile-tab";
import MyAvatarsTabSettings from "./tabs-content/my-avatars-tab";
import MyBackgroundsTabSettings from "./tabs-content/my-backgrounds-tab";
import MyBordersTabSettings from "./tabs-content/my-borders-tab";

export default function SettingsProfile() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <Card className="w-full p-6">
      <div className="flex gap-6 h-full">
        {/* Sidebar */}
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
              My Avatars
            </Button>
            <Button
              variant={activeTab === "background" ? "secondary" : "ghost"}
              className="w-full justify-start text-base cursor-pointer h-12"
              onClick={() => setActiveTab("background")}
            >
              <Wallpaper className="w-5 h-5 " />
              My Backgrounds
            </Button>
            <Button
              variant={activeTab === "border" ? "secondary" : "ghost"}
              className="w-full justify-start  text-base cursor-pointer h-12"
              onClick={() => setActiveTab("border")}
            >
              <Sparkles className="w-5 h-5 " />
              My Borders
            </Button>
          </div>
        </div>

        {/* Контент справа */}
        <div className="flex-1 border-l pl-6 min-h-[400px]">
          {activeTab === "profile" && <ProfileSettings />}

          {activeTab === "avatar" && <MyAvatarsTabSettings />}

          {activeTab === "background" && <MyBackgroundsTabSettings />}

          {activeTab === "border" && <MyBordersTabSettings />}
        </div>
      </div>
    </Card>
  );
}
