"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React, { useState } from "react";
import Image from "next/image";
import { Bookmark, FileText, Settings, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SettingsProfile from "@/components/profile/settings-profile/settings-profile";
import { useGetMeQuery } from "@/store/user/user.api";
import { Loader } from "@/components/ui/loader";
import { ErrorState } from "@/components/ui/error";
import StoreProfile from "@/components/profile/store-profile/store-profile";
import { useRouter, useSearchParams } from "next/navigation";
import PostsPage from "@/components/posts/posts-page";
import {
  useGetMyFollowersQuery,
  useGetMyFollowingsQuery,
  useFollowUserMutation,
} from "@/store/following/following.api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FollowingUser } from "@/store/following/following.type";
import Link from "next/link";
import { toast } from "sonner";

type ProfileTab = "my-posts" | "saved" | "settings" | "store";

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab") as ProfileTab | null;
  const [activeTab, setActiveTab] = useState<ProfileTab>(
    tabParam ?? "my-posts"
  );
  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
    refetch: refetchMe,
  } = useGetMeQuery();

  const currentXP = 450;
  const totalXP = 500;
  const percentage = (currentXP / totalXP) * 100;

  const handleTabChange = (value: string) => {
    const tab = value as ProfileTab;
    setActiveTab(tab);

    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("tab", tab);
    router.replace(`/profile?${params.toString()}`);
  };

  if (userLoading) {
    return <Loader />;
  }

  if (userError) {
    return <ErrorState />;
  }

  return (
    <>
      <div className="flex flex-row gap-6 py-6 px-8">
        <div className="flex-1">
          <Card className="p-0! overflow-hidden">
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
                    {userData?.avatar_url && (
                      <Image
                        src={userData.avatar_url}
                        alt="avatar"
                        width={300}
                        height={300}
                        className="rounded-full object-cover"
                      />
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="font-bold text-xl">{userData?.username}</div>
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
                  <span className="font-bold text-4xl">
                    {userData?.posts_count}
                  </span>
                  <span className="text-muted-foreground text-sm">Posts</span>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <div className="flex flex-col gap-1 items-center cursor-pointer hover:opacity-80 transition-opacity">
                      <span className="font-bold text-4xl">
                        {userData?.followers_count}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        Followers
                      </span>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Followers</DialogTitle>
                    </DialogHeader>
                    <FollowersList refetchMe={refetchMe} />
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <div className="flex flex-col gap-1 items-center cursor-pointer hover:opacity-80 transition-opacity">
                      <span className="font-bold text-4xl">
                        {userData?.followings_count}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        Following
                      </span>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Following</DialogTitle>
                    </DialogHeader>
                    <FollowingList refetchMe={refetchMe} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>

            <div className="border-t border-gray-800">
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
              >
                <TabsList className="w-full justify-center h-auto p-1 bg-transparent">
                  <TabsTrigger
                    value="my-posts"
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

          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsContent value="my-posts" className="mt-6">
              <PostsPage type="mine" />
            </TabsContent>

            <TabsContent value="saved" className="mt-6">
              <PostsPage type="saved" />
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <SettingsProfile />
            </TabsContent>
            <TabsContent value="store" className="mt-6">
              <StoreProfile />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

function FollowersList({ refetchMe }: { refetchMe: () => void }) {
  const { data, isLoading, error } = useGetMyFollowersQuery();
  const [followUser] = useFollowUserMutation();

  const handleUnfollow = async (userId: number) => {
    try {
      await followUser({ userId }).unwrap();
      refetchMe();
    } catch (error) {
      toast.error("Error occurred while unfollowing user");
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <div className="text-primary">Error loading followers</div>;

  return (
    <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto">
      {data?.users.map((user) => (
        <UserItem
          key={user.id}
          user={user}
          onUnfollow={() => handleUnfollow(user.id)}
          isFollowerList
        />
      ))}
      {data?.users.length === 0 && (
        <div className="text-center text-muted-foreground py-4">
          No followers yet.
        </div>
      )}
    </div>
  );
}

function FollowingList({ refetchMe }: { refetchMe: () => void }) {
  const { data, isLoading, error } = useGetMyFollowingsQuery();
  const [followUser] = useFollowUserMutation();

  const handleUnfollow = async (userId: number) => {
    try {
      await followUser({ userId }).unwrap();
      refetchMe();
    } catch (error) {
      toast.error("Error occurred while unfollowing user");
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <div className="text-primary">Error loading following</div>;

  return (
    <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto">
      {data?.users.map((user) => (
        <UserItem
          key={user.id}
          user={user}
          onUnfollow={() => handleUnfollow(user.id)}
        />
      ))}
      {data?.users.length === 0 && (
        <div className="text-center text-muted-foreground py-4">
          Not following anyone yet.
        </div>
      )}
    </div>
  );
}

function UserItem({
  user,
  onUnfollow,
  isFollowerList,
}: {
  user: FollowingUser;
  onUnfollow: () => void;
  isFollowerList?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
      <Link href={`/user/${user.id}`} className="flex items-center gap-3">
        <div className="relative w-10 h-10 overflow-hidden rounded-full">
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.username}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <span className="text-xs font-bold">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <span className="font-medium">{user.username}</span>
      </Link>

      {!isFollowerList && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onUnfollow}
          className="text-primary hover:text-primary/80 hover:bg-primary/10 cursor-pointer"
        >
          Unfollow
        </Button>
      )}
    </div>
  );
}
