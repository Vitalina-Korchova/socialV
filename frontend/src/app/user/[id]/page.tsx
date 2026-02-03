"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGetUserByIdQuery } from "@/store/user/user.api";
import { Loader } from "@/components/ui/loader";
import { ErrorState } from "@/components/ui/error";
import { useParams } from "next/navigation";
import UserPostsPage from "@/components/posts/user-posts-page";

export default function UserProfile() {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);
  const {
    data: UserData,
    error: userError,
    isLoading: userLoading,
  } = useGetUserByIdQuery(userId);
  const currentXP = 450;
  const totalXP = 500;
  const percentage = (currentXP / totalXP) * 100;

  if (userLoading) {
    return <Loader />;
  }

  if (userError) {
    return <ErrorState />;
  }
  return (
    <>
      <div className="flex flex-col gap-6 py-6 px-8">
        <div className="flex-1">
          <Card className="p-0! overflow-hidden pb-4!">
            <CardHeader className="relative p-0! h-24">
              <div className="abosulute top-0 right-0 left-0">
                <Image
                  src="/back2.jpg"
                  alt="background"
                  height={750}
                  width={750}
                  className="object-cover w-full h-28"
                />
                <div className="absolute bottom-[-18px] left-0 right-0 h-16 bg-gradient-to-t from-[#18181B] to-transparent" />
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
                  <div className="font-bold text-xl"> {UserData?.username}</div>
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
                </div>
              </div>
              <div className="flex flex-row gap-5">
                <div className="flex flex-col gap-1 items-center">
                  <span className="font-bold text-4xl">
                    {UserData?.posts_count}
                  </span>
                  <span className="text-muted-foreground text-sm">Posts</span>
                </div>
                <div className="flex flex-col gap-1 items-center">
                  <span className="font-bold text-4xl">
                    {UserData?.followers_count}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    Followers
                  </span>
                </div>
                <div className="flex flex-col gap-1 items-center">
                  <span className="font-bold text-4xl">
                    {UserData?.followings_count}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    Following
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <UserPostsPage id={userId} />
      </div>
    </>
  );
}
