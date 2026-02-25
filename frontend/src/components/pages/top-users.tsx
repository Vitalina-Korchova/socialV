import React from "react";
import { Check, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { useGetMeQuery } from "@/store/user/user.api";
import { useFollowUserMutation, useGetTopUsersQuery } from "@/store/following/following.api";
import Image from "next/image";
import { TbUserStar } from "react-icons/tb";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Badge } from "../ui/badge";
import { parseBadgeName } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function TopUsers() {
  const router = useRouter();
  const { data: topUsers, isLoading } = useGetTopUsersQuery();
  const { data: me } = useGetMeQuery();
  const [followUser] = useFollowUserMutation();

  const handleFollow = async (userId: number) => {
    try {
      await followUser({ userId }).unwrap();
    } catch (error) {
      toast.error("Failed to follow user");
    }
  };

  if (isLoading) {
    return (
      <Card className="w-64 h-fit sticky top-26 hidden xl:block">
        <CardHeader>
          <h3 className="font-bold text-lg">Top Users</h3>
        </CardHeader>
        <CardContent className="flex justify-center py-10 text-muted-foreground italic text-sm">
          Loading users...
        </CardContent>
      </Card>
    );
  }

  if (!topUsers || topUsers.length === 0) {
    return null;
  }

  return (
    <Card className="w-64 h-fit sticky top-26 hidden xl:block">
      <CardHeader >
        <h3 className="font-bold text-lg leading-none pb-3">Top Users</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {topUsers.map((user) => {
          const isOwn = user.id === me?.id;
          const { name: badgeName, color: badgeColor } = parseBadgeName(user.first_badge);

          return (
            <div key={user.id} className="flex items-center justify-between group">
              <div
                className="flex items-center space-x-3 min-w-0 cursor-pointer"
                onClick={() => router.push(`/user/${user.id}`)}
              >
                <div className="relative shrink-0 flex items-center justify-center size-9">
                  {user.border_url && (
                    <div className="absolute inset-0 overflow-hidden z-10 scale-110 pointer-events-none">
                      <Image
                        src={user.border_url}
                        alt="border"
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="size-7 rounded-full bg-muted flex items-center justify-center relative overflow-hidden">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.username}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <TbUserStar className="text-primary size-4" />
                    )}
                  </div>
                  <span
                    className="absolute -bottom-1 -right-1 text-[7px] px-1 py-0 rounded-full
                   bg-purple-600 text-white font-bold border border-zinc-900 shadow-lg z-20"
                  >
                    LV. {user.level}
                  </span>
                </div>
                <div className="min-w-0 flex flex-col gap-1">
                  <p className="font-bold text-xs truncate max-w-[90px]">
                    {user.username}
                  </p>
                  {user.first_badge && (
                    <Badge
                      className="text-[8px] px-1.5 py-0 h-auto font-black flex items-center gap-1 border shadow-sm uppercase tracking-wider w-fit"
                      style={{
                        backgroundColor: `${badgeColor}20`,
                        color: badgeColor,
                        borderColor: `${badgeColor}40`,
                      }}
                    >
                      {badgeName}
                    </Badge>
                  )}
                </div>
              </div>

              {!isOwn && (
                <div className="flex items-center justify-center size-8">
                  {user.is_following ? (
                    <div className="text-primary bg-primary/10 rounded-full p-1.5">
                      <Check className="size-3.5" />
                    </div>
                  ) : (
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 cursor-pointer border-primary/20 hover:border-primary/50 hover:bg-primary/5 rounded-full"
                        onClick={() => handleFollow(user.id)}
                      >
                        <Plus className="w-4 h-4 text-primary" />
                      </Button>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
