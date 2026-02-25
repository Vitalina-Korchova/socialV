"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

import {
  Bell,
  CircleUser,
  LogOut,
  MessageCircle,
  Plus,
  Search,
  X,
} from "lucide-react";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import Notifications from "./notifications";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useLogoutUserMutation } from "@/store/auth/auth.api";
import { useDispatch } from "react-redux";
import { setSearch, clearSearch } from "@/store/post/search.slice";
import { useDebouncedCallback } from "use-debounce";
import { useGetUnreadCountQuery } from "@/store/notifications/notifications.api";
import { useGetUnreadEachQuery } from "@/store/chat/chat.api";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const bellRef = useRef<HTMLDivElement | null>(null);
  const [inputSearch, setInputSearch] = useState("");
  const dispatch = useDispatch();

  const { data: unreadData } = useGetUnreadCountQuery(undefined, {
    skip: isAuthPage,
  });

  const { data: unreadChats } = useGetUnreadEachQuery(undefined, {
    skip: isAuthPage,
  });

  const unreadChatsCount = unreadChats?.filter(c => c.unread_count > 0).length || 0;

  const debouncedSearch = useDebouncedCallback((value: string) => {
    if (value.trim()) {
      dispatch(setSearch(value.trim()));
    } else {
      dispatch(clearSearch());
    }
  }, 500);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputSearch(value);
    debouncedSearch(value);
    if (pathname !== "/") {
      router.push("/");
    }
  };

  const handleClearSearch = () => {
    setInputSearch("");
    dispatch(clearSearch());
    debouncedSearch.cancel();
  };

  const closeNotificationsOutside = (event: MouseEvent) => {
    if (!notificationsRef.current || !bellRef.current) return;

    const target = event.target as Node;
    const isClickInsideNotifications =
      notificationsRef.current.contains(target);
    const isClickOnBell = bellRef.current.contains(target);

    if (!isClickInsideNotifications && !isClickOnBell) {
      setShowNotifications(false);
    }
  };

  useEffect(() => {
    if (!showNotifications) return;
    document.addEventListener("mousedown", closeNotificationsOutside);

    return () => {
      document.removeEventListener("mousedown", closeNotificationsOutside);
    };
  }, [showNotifications]);

  const [logout] = useLogoutUserMutation();

  const handleLogout = async () => {
    await logout().unwrap();
    router.push("/auth");
  };

  return (
    <>
      <Card
        className={`sticky top-0 z-[99] flex flex-row justify-between py-5 items-center border-b-[1px]
        px-8 md:px-20 shadow-sm rounded-none gap-2 sm:gap-6 ${isAuthPage ? "hidden" : ""}`}
      >
        <div
          className="flex flex-row gap-2 items-center cursor-pointer "
          onClick={() => router.push("/")}
        >
          <Image src="/logo.svg" alt="Logo" width={40} height={40} />
          <span className="font-extrabold text-xl hidden sm:block ">SocialV</span>
        </div>
        <div className="flex-1 mx-4 md:mx-20 relative">
          <Search className="absolute left-2.5 top-2 text-gray-300 h-5 w-5" />
          <Input
            value={inputSearch}
            onChange={handleInputChange}
            className="pl-10 w-full min-w-[200px] focus-visible:ring-[#8A3CFF]/30 focus-visible:ring-2"
            placeholder="Search posts..."
          />
          {/* прибрати якшо нічого немає в інпуті */}
          {inputSearch && (
            <X
              className="absolute right-2.5 top-2 text-gray-400 h-5 w-5 cursor-pointer hover:text-gray-600"
              onClick={handleClearSearch}
            />
          )}
        </div>
        <div className="hidden md:flex items-center gap-4">
          {/* Profile Icon */}
          <div
            onClick={() => router.push("/profile?tab=my-posts")}
            className="relative group cursor-pointer"
            title="Profile"
          >
            <CircleUser className="w-5 h-5 text-muted-foreground hover:text-[#8A3CFF] transition-colors" />
          </div>

          {/* Messages Icon */}
          <div
            onClick={() => router.push("/messages")}
            className="relative group cursor-pointer"
            title="Messages"
          >
            <MessageCircle className="w-5 h-5 text-muted-foreground hover:text-[#8A3CFF] transition-colors" />
            {unreadChatsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-bold px-1 py-px rounded-full flex items-center justify-center min-w-[16px] h-[16px]">
                {unreadChatsCount}
              </span>
            )}
          </div>

          {/* Notifications Icon */}
          <div
            ref={bellRef}
            className="relative group cursor-pointer"
            onClick={() => setShowNotifications((prev) => !prev)}
            title="Notifications"
          >
            <Bell
              className={`w-5.5 h-5.5 transition-colors ${showNotifications
                ? "text-[#8A3CFF]"
                : "text-muted-foreground hover:text-[#8A3CFF]"
                }`}
            />
            {unreadData && unreadData.count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-bold px-1 py-px rounded-full flex items-center justify-center min-w-[16px] h-[16px]">
                {unreadData.count}
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-muted-foreground/20" />

          {/* Logout Icon */}
          <div
            onClick={handleLogout}
            className="relative group cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-muted-foreground hover:text-red-500 transition-colors" />
          </div>
        </div>
      </Card>

      <div ref={notificationsRef} className="fixed right-4 z-[100] w-[90%] max-w-[500px] md:w-[500px]">
        <AnimatePresence>
          {showNotifications && <Notifications />}
        </AnimatePresence>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      {!isAuthPage && (
        <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden p-3">
          <Card className="flex flex-row justify-around items-center py-3 shadow-lg border-t h-16 rounded-2xl bg-background/60 backdrop-blur-md gap-3 sm:gap-6">
            {/* Profile */}
            <div
              id="mobile-nav-profile"
              onClick={() => router.push("/profile?tab=my-posts")}
              className="flex flex-col gap-2 items-center cursor-pointer"
            >
              <CircleUser className="w-6 h-6 text-muted-foreground" />
              <span className=" text-muted-foreground uppercase tracking-[0.2em] text-[6px] sm:text-[8px]">profile</span>
            </div>

            {/* Messages */}
            <div
              id="mobile-nav-messages"
              onClick={() => router.push("/messages")}
              className="relative flex flex-col gap-2 items-center cursor-pointer"
            >
              <MessageCircle className="w-6 h-6 text-muted-foreground" />
              {unreadChatsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-bold px-1 py-px rounded-full flex items-center justify-center min-w-[16px] h-[16px]">
                  {unreadChatsCount}
                </span>
              )}
              <span className=" text-muted-foreground uppercase tracking-[0.2em] text-[6px] sm:text-[8px]">messages</span>
            </div>

            {/* Add Post Icon + */}
            <motion.div
              id="mobile-nav-add-post"
              className="relative -top-3 sm:-top-2 "
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              initial={{ y: 0 }}
            >
              <div className="size-10 sm:size-14 flex items-center justify-center bg-gradient-to-tr from-[#8A3CFF] to-[#A855F7] text-white shadow-xl shadow-primary/40 cursor-pointer rounded-full ring-4 ring-background overflow-hidden relative group">
                <motion.div
                  className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={false}
                />
                <Plus className="w-8 h-8 relative z-10" strokeWidth={2} />
              </div>
            </motion.div>

            {/* Notifications */}
            <div
              id="mobile-nav-notifications"
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative flex flex-col gap-2 items-center cursor-pointer"
            >
              <Bell
                className={`w-6 h-6 transition-colors ${showNotifications
                  ? "text-[#8A3CFF]"
                  : "text-muted-foreground hover:text-[#8A3CFF]"
                  }`}
              />
              {unreadData && unreadData.count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-bold px-1 py-px rounded-full flex items-center justify-center min-w-[16px] h-[16px]">
                  {unreadData.count}
                </span>
              )}
              <span className=" text-muted-foreground uppercase tracking-[0.2em] text-[6px] sm:text-[8px]">notifications</span>
            </div>

            {/* Logout */}
            <div
              id="mobile-nav-logout"
              onClick={handleLogout}
              className="flex flex-col gap-2 items-center cursor-pointer"
            >
              <LogOut className="w-6 h-6 text-muted-foreground" />
              <span className=" text-muted-foreground uppercase tracking-[0.2em] text-[6px] sm:text-[8px]">logout</span>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
