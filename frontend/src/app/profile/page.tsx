"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React, { useState } from "react";
import Image from "next/image";
import { Bookmark, FileText, Settings, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserBadgesList } from "@/components/ui/user-badge";
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
          <Card className="p-0! overflow-hidden relative">
            <CardHeader className="relative p-0! h-24">
              <div className="abosulute top-0 right-0 left-0">
                {userData?.background_url && (
                  <Image
                    src={userData?.background_url}
                    alt="background"
                    height={750}
                    width={750}
                    className="object-cover w-full h-44"
                  />
                )}
                <div className="absolute bottom-[-80px] left-0 right-0 h-6 bg-gradient-to-t from-[#18181B] to-transparent" />
              </div>
            </CardHeader>

            <CardContent className="pb-5 pt-3 px-16 flex justify-between items-center z-10">
              <div className="flex flex-row items-center gap-4">
                <div className="w-30 h-30 relative flex items-center justify-center">
                  {userData?.border_url && (
                    <div className="absolute inset-0 overflow-hidden">
                      <Image
                        src={userData?.border_url}
                        alt="animated border"
                        width={100}
                        height={100}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

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
                <div className="flex flex-col gap-1.5 items-start">
                  <h2 className="font-extrabold text-3xl tracking-tight bg-gradient-to-r from-white via-purple-100 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_1px_rgba(168,85,247,0.8)] drop-shadow-[0_0_8px_rgba(168,85,247,0.4)] hover:scale-[1.02] transition-all duration-300 cursor-default select-none">
                    {userData?.username}
                  </h2>
                  <UserBadgesList badges={userData?.badges} itemClassName="text-[10px] mt-2" />

                  <div className="w-52 space-y-1 mt-1">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Level {userData?.level}
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {userData?.amount_xp}{" "}
                        <span className="text-zinc-300">/ {userData?.total_xp_required_level} XP</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.6)] transition-all duration-500 ease-out"
                        style={{
                          width: `${((userData?.amount_xp ?? 0) / (userData?.total_xp_required_level ?? 1)) * 100}%`
                        }}
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
                      <span className="text-[11px] font-bold text-yellow-500">
                        {userData?.amount_coins} Coins
                      </span>
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
                <TabsList className="w-full justify-center h-12 p-0 bg-transparent gap-6">
                  <TabsTrigger
                    value="my-posts"
                    className="flex cursor-pointer items-center gap-2 px-4 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-muted-foreground hover:text-primary transition-colors font-medium text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    My Posts
                  </TabsTrigger>

                  <TabsTrigger
                    value="saved"
                    className="flex cursor-pointer items-center gap-2 px-4 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-muted-foreground hover:text-primary transition-colors font-medium text-sm"
                  >
                    <Bookmark className="w-4 h-4" />
                    Saved
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="flex cursor-pointer items-center gap-2 px-4 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-muted-foreground hover:text-primary transition-colors font-medium text-sm"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </TabsTrigger>
                  <TabsTrigger
                    value="store"
                    className="flex cursor-pointer items-center gap-2 px-4 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-muted-foreground hover:text-primary transition-colors font-medium text-sm"
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
        <div className="relative w-12 h-12 flex items-center justify-center">
          {user.border_url && (
            <div className="absolute inset-x-0 inset-y-0 z-10">
              <Image
                src={user.border_url}
                alt="border"
                width={100}
                height={100}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="size-10 rounded-full bg-muted flex items-center justify-center relative overflow-hidden">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.username}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-black flex items-center justify-center">
                <span className="text-xs font-bold text-primary">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
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
