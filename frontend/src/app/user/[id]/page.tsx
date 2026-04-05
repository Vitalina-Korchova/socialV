"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React from "react";
import Image from "next/image";
import { UserBadgesList } from "@/components/ui/user-badge";
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
                {UserData?.background_url && (
                  <Image
                    src={UserData.background_url}
                    alt="background"
                    height={750}
                    width={750}
                    className="object-cover w-full h-44"
                  />
                )}
                <div className="absolute bottom-[-80px] left-0 right-0 h-6 bg-gradient-to-t from-[#18181B] to-transparent" />
              </div>
            </CardHeader>

            <CardContent className="pb-5 pt-3  px-16 flex justify-between items-center z-10">
              <div className="flex flex-row items-center gap-4">
                <div className="w-30 h-30 relative flex items-center justify-center">
                  {UserData?.border_url && (
                    <div className="absolute inset-0 overflow-hidden">
                      <Image
                        src={UserData.border_url}
                        alt="animated border"
                        width={100}
                        height={100}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
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
                  <h2 className="font-extrabold text-3xl tracking-tight bg-gradient-to-r from-white via-purple-100 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_1px_rgba(168,85,247,0.8)] drop-shadow-[0_0_8px_rgba(168,85,247,0.4)] hover:scale-[1.02] transition-all duration-300 cursor-default select-none">
                    {UserData?.username}
                  </h2>
                  <UserBadgesList
                    badges={UserData?.badges}
                    itemClassName="text-[10px]"
                  />

                  <div className="w-52 space-y-1 mt-1">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Level {UserData?.level}
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {" "}
                        {UserData?.amount_xp}{" "}
                        <span className="text-zinc-300">
                          / {UserData?.total_xp_required_level} XP
                        </span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.6)] transition-all duration-500 ease-out"
                        style={{
                          width: `${
                            ((UserData?.amount_xp ?? 0) /
                              (UserData?.total_xp_required_level ?? 1)) *
                            100
                          }%`,
                        }}
                      />
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
