import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React from "react";
import Image from "next/image";
import { Bookmark, FileText, Settings, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CardProfileOptions from "@/components/pages/card-profile-options";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfilePage() {
  return (
    <>
      <div className="flex flex-row gap-6 py-6 px-8">
        <CardProfileOptions />
        <div className="flex-1">
          <Card className="p-0! overflow-hidden">
            <CardHeader className=" relative p-0! h-24 ">
              <div className="abosulute top-0 right-0 left-0 ">
                <Image
                  src="/card-back.jpg"
                  alt="background"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </CardHeader>

            <CardContent className=" pb-5 px-12 flex justify-between items-center">
              <div className="flex flex-row items-center  gap-4">
                <div className="w-30 h-30 relative flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full overflow-hidden">
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
            <Tabs defaultValue="posts" className="w-full">
              <div className="border-t border-gray-800">
                <TabsList className="w-full justify-center h-auto p-1 bg-transparent">
                  <TabsTrigger
                    value="posts"
                    className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    <FileText className="w-4 h-4" />
                    My Posts
                  </TabsTrigger>
                  <TabsTrigger
                    value="saved"
                    className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    <Bookmark className="w-4 h-4" />
                    Saved Posts
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </TabsTrigger>
                </TabsList>
              </div>
            </Tabs>
          </Card>
        </div>
      </div>
    </>
  );
}
