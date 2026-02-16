"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useGetUserByIdQuery } from "@/store/user/user.api";
import { Loader } from "@/components/ui/loader";
import { ErrorState } from "@/components/ui/error";
import { useParams } from "next/navigation";
import UserPostsPage from "@/components/posts/user-posts-page";
import { Button } from "@/components/ui/button";
import {
  useFollowUserMutation,
  useGetFollowingQuery,
} from "@/store/following/following.api";
import { toast } from "sonner";

export default function UserProfile() {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);
  const {
    data: UserData,
    error: userError,
    isLoading: userLoading,
    refetch: refetchUser,
  } = useGetUserByIdQuery(userId);

  const { data: isFollowing } = useGetFollowingQuery({ userId: userId });

  const [follow] = useFollowUserMutation();
  const currentXP = 450;
  const totalXP = 500;
  const percentage = (currentXP / totalXP) * 100;

  const handleFollowUnfollow = async () => {
    try {
      await follow({ userId: userId }).unwrap();
      refetchUser();
    } catch (error) {
      toast.error("Error occurred while following user");
    }
  };

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
                  <div className="w-22 h-22  rounded-full flex items-center justify-center">
                    {UserData?.avatar_url && (
                      <Image
                        src={UserData.avatar_url}
                        alt="avatar"
                        width={300}
                        height={300}
                        className="rounded-full object-cover"
                      />
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 items-start">
                  <h2 className="font-bold text-2xl tracking-tight">{UserData?.username}</h2>
                  <Badge variant="secondary" className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-primary/10 text-primary font-bold border border-primary/20">
                    Software Engineer
                  </Badge>

                  <div className="w-52 space-y-1 mt-1">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Level 4</span>
                      <span className="text-[10px] font-medium text-muted-foreground"> {currentXP} <span className="text-zinc-300">/ {totalXP} XP</span></span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.6)] transition-all duration-500 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20">
                      <Image
                        src="/coins-icon.svg"
                        alt="coins"
                        width={12}
                        height={12}
                      />
                      <span className="text-[11px] font-bold text-yellow-500">234 Coins</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-5">
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

                <Button
                  variant={`${isFollowing ? "outline" : "default"}`}
                  className="cursor-pointer"
                  onClick={handleFollowUnfollow}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <UserPostsPage id={userId} />
      </div>
    </>
  );
}
