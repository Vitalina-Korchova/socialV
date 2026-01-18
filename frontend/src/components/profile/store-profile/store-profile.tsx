import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleUserRound, Sparkles, Wallpaper } from "lucide-react";

import BuyAvatarStore from "./tabs-content/buy-avatar";
import BuyBackgroundStore from "./tabs-content/buy-background";
import BuyBorderStore from "./tabs-content/buy-border";

export default function StoreProfile() {
  const [activeTab, setActiveTab] = useState("buy-avatar");

  return (
    <Card className="w-full p-6">
      <div className="flex gap-6 h-full">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="space-y-1 sticky top-6">
            <Button
              variant={activeTab === "buy-avatar" ? "secondary" : "ghost"}
              className="w-full justify-start  text-base cursor-pointer 
              h-12 text-purple-400 hover:text-purple-500"
              onClick={() => setActiveTab("buy-avatar")}
            >
              <CircleUserRound className="w-5 h-5 " />
              Buy Avatars
            </Button>
            <Button
              variant={activeTab === "buy-background" ? "secondary" : "ghost"}
              className="w-full justify-start  text-base cursor-pointer 
              h-12 text-purple-400 hover:text-purple-500"
              onClick={() => setActiveTab("buy-background")}
            >
              <Wallpaper className="w-5 h-5 " />
              Buy Backgrounds
            </Button>
            <Button
              variant={activeTab === "buy-border" ? "secondary" : "ghost"}
              className="w-full justify-start  text-base cursor-pointer 
              h-12 text-purple-400 hover:text-purple-500"
              onClick={() => setActiveTab("buy-border")}
            >
              <Sparkles className="w-5 h-5 " />
              Buy Borders
            </Button>
          </div>
        </div>

        {/* Контент справа */}
        <div className="flex-1 border-l pl-6 min-h-[400px]">
          {activeTab === "buy-avatar" && <BuyAvatarStore />}

          {activeTab === "buy-background" && <BuyBackgroundStore />}

          {activeTab === "buy-border" && <BuyBorderStore />}
        </div>
      </div>
    </Card>
  );
}
