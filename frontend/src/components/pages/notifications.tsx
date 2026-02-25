import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Check, Loader2 } from "lucide-react";
import { Card, CardTitle } from "../ui/card";
import { motion } from "framer-motion";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation
} from "@/store/notifications/notifications.api";
import { notificationsType, NotificationsDto } from "@/store/notifications/notification.type";
import { Button } from "../ui/button";

export default function Notifications() {
  const [page, setPage] = useState(1);
  const [isMd, setIsMd] = useState(false);
  const [allNotifications, setAllNotifications] = useState<NotificationsDto[]>([]);

  const { data, isLoading, isFetching } = useGetNotificationsQuery({
    page,
    page_size: 10,
  });

  const [markAsRead] = useMarkAsReadMutation();

  useEffect(() => {
    if (data?.data) {
      setAllNotifications((prev) => {
        const newNotifications = data.data.filter(
          (n) => !prev.find((p) => p.id === n.id)
        );
        return [...prev, ...newNotifications].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
    }
  }, [data]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    setIsMd(media.matches);

    const listener = (e: MediaQueryListEvent) => setIsMd(e.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id).unwrap();
    setAllNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const getNotificationText = (notification: NotificationsDto) => {
    const username = notification.user.username;
    switch (notification.notification_type) {
      case notificationsType.LIKE:
        return `${username} liked your post`;
      case notificationsType.REPOST:
        return `${username} reposted your post`;
      case notificationsType.COMMENT:
        return `${username} commented on your post`;
      case notificationsType.FOLLOW:
        return `${username} started following you`;
      case notificationsType.LVLUP:
        return `You leveled up! 🎉 A new badge-reward has been unlocked and new items are now available in the shop.`;
      default:
        return `${username} sent you a notification`;
    }
  };

  const newNotifications = allNotifications.filter((n) => !n.is_read);
  const historyNotifications = allNotifications.filter((n) => n.is_read);

  const handleLoadMore = () => {
    if (data?.has_next_page) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <motion.div
      initial={
        isMd
          ? { opacity: 0, y: -10, scale: 0.98 }
          : { opacity: 0, x: 40 }
      }
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={
        isMd
          ? { opacity: 0, y: -10, scale: 0.98 }
          : { opacity: 0, x: 40 }
      }
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="absolute right-[-20px] md:right-4 top-0 md:top-0.5"
    >
      <Card className=" w-[350px] p-4 space-y-3 shadow-xl border-[#8A3CFF]/20 rounded-none md:rounded-xl">
        <CardTitle className="text-lg font-bold">Notifications</CardTitle>

        <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar--post">
          {isLoading && page === 1 ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-[#8A3CFF]" />
            </div>
          ) : (
            <div className="space-y-6">
              {newNotifications.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-primary uppercase tracking-wider px-1">
                    New
                  </h3>
                  {newNotifications.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onMarkAsRead={() => handleMarkAsRead(n.id)}
                      text={getNotificationText(n)}
                    />
                  ))}
                </div>
              )}

              {historyNotifications.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                    History
                  </h3>
                  {historyNotifications.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      text={getNotificationText(n)}
                    />
                  ))}
                </div>
              )}

              {allNotifications.length === 0 && !isLoading && (
                <p className="text-center text-muted-foreground py-10 text-sm">
                  No notifications yet
                </p>
              )}

              {data?.has_next_page && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLoadMore}
                    disabled={isFetching}
                    className="text-xs hover:text-[#8A3CFF] w-full"
                  >
                    {isFetching ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-2" />
                    ) : null}
                    Load more
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

function NotificationItem({
  notification,
  onMarkAsRead,
  text
}: {
  notification: NotificationsDto;
  onMarkAsRead?: () => void;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 px-2 py-2.5  hover:bg-muted/50 transition-all border-b border-muted/30 last:border-0 relative group">
      <div className="relative h-10 w-10 flex-shrink-0 flex items-center justify-center">
        {notification.user.border_url && (
          <div className="absolute inset-0 z-10">
            <Image
              src={notification.user.border_url}
              alt="border"
              width={100}
              height={100}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="size-8 rounded-full bg-muted flex items-center justify-center relative overflow-hidden">
          <Image
            src={notification.user.avatar_url || "/default-avatar.png"}
            alt={notification.user.username}
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        </div>
        {!notification.is_read && (
          <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-primary rounded-full border-2 border-background z-20" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug font-normal text-foreground">
          {text}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {new Date(notification.created_at).toLocaleString()}
        </p>
      </div>

      {notification.post?.post_image_url && (
        <div className="relative h-12 w-12 flex-shrink-0 rounded-md overflow-hidden border border-muted/20">
          <Image
            src={notification.post.post_image_url}
            alt="Post preview"
            fill
            className="object-cover"
          />
        </div>
      )}

      {onMarkAsRead && (
        <button
          onClick={onMarkAsRead}
          className="text-muted-foreground hover:text-[#8A3CFF] transition-colors p-1.5 rounded-full hover:bg-[#8A3CFF]/10 opacity-0 group-hover:opacity-100 cursor-pointer"
          title="Mark as read"
        >
          <Check size={16} />
        </button>
      )}
    </div>
  );
}
