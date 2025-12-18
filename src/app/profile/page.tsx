"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React, { useState } from "react";
import Image from "next/image";
import { Bookmark, FileText, Settings, Store, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserPosts from "@/components/profile/user-posts";
import SettingsProfile from "@/components/profile/settings-profile";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("posts");
  const currentXP = 450;
  const totalXP = 500;
  const percentage = (currentXP / totalXP) * 100;

  return (
    <>
      <div className="flex flex-row gap-6 py-6 px-8">
        <div className="flex-1">
          <Card className="p-0! overflow-hidden">
            <CardHeader className="relative p-0! h-24">
              <div className="abosulute top-0 right-0 left-0">
                <Image
                  src="/card-back.jpg"
                  alt="background"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </CardHeader>

            <CardContent className="pb-5 px-16 flex justify-between items-center">
              <div className="flex flex-row items-center gap-4">
                <div className="w-30 h-30 relative flex items-center justify-center">
                  <div className="absolute inset-0 overflow-hidden">
                    <Image
                      src="/border.webp"
                      alt="animated border"
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-22 h-22 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-25 h-25 text-blue-600" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="font-bold text-xl">Vitalina Korchova</div>
                  <Badge variant="default" className="text-xs">
                    Software Engineer
                  </Badge>
                  <div className="space-y-2">
                    <div className="flex justify-between items-end text-xs">
                      <span className="text-muted-foreground">
                        Earned:{" "}
                        <span className="font-medium text-foreground">
                          {currentXP}/{totalXP} XP
                        </span>
                      </span>

                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">
                        Lv. 4
                      </span>
                    </div>

                    <div className="border border-purple-600 rounded-full h-4 overflow-hidden bg-gray-100">
                      <div
                        className="h-full transition-all duration-500
                 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-800"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* ПРИХОВУВАТИ ДЛЯ ІНШИХ ЛЮДЕЙ */}
                  <div className="flex flex-row gap-2 items-center">
                    <span className="text-muted-foreground text-xs">
                      Coins:
                    </span>
                    <div className="flex flex-row gap-3 items-center">
                      <Image
                        src="/coins-icon.svg"
                        alt="location"
                        width={20}
                        height={20}
                      />
                      <span className="text-sm">234</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-row gap-5">
                <div className="flex flex-col gap-1 items-center">
                  <span className="font-bold text-4xl">12</span>
                  <span className="text-muted-foreground text-sm">Posts</span>
                </div>
                <div className="flex flex-col gap-1 items-center">
                  <span className="font-bold text-4xl">207</span>
                  <span className="text-muted-foreground text-sm">
                    Followers
                  </span>
                </div>
                <div className="flex flex-col gap-1 items-center">
                  <span className="font-bold text-4xl">64</span>
                  <span className="text-muted-foreground text-sm">
                    Following
                  </span>
                </div>
              </div>
            </CardContent>

            <div className="border-t border-gray-800">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full justify-center h-auto p-1 bg-transparent">
                  <TabsTrigger
                    value="posts"
                    className="flex cursor-pointer items-center gap-2 px-6 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    <FileText className="w-4 h-4" />
                    My Posts
                  </TabsTrigger>
                  <TabsTrigger
                    value="saved"
                    className="flex cursor-pointer items-center gap-2 px-6 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    <Bookmark className="w-4 h-4" />
                    Saved Posts
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="flex cursor-pointer items-center gap-2 px-6 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </TabsTrigger>
                  <TabsTrigger
                    value="store"
                    className="flex cursor-pointer items-center gap-2 px-6 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    <Store className="w-4 h-4" />
                    Store
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="posts" className="mt-6">
              <UserPosts />
            </TabsContent>

            <TabsContent value="saved" className="mt-6">
              <div className="p-6">
                <h3 className="text-xl font-bold">Saved Posts</h3>
                <p className="mt-2 text-gray-600">
                  This tab is under development
                </p>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <SettingsProfile />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
