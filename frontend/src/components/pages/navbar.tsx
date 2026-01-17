"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

import {
  Bell,
  CircleUser,
  LogOut,
  MessageCircle,
  Search,
  User,
  X,
} from "lucide-react";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import Notifications from "./notifications";
import { AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useLogoutUserMutation } from "@/store/auth/auth.api";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const bellRef = useRef<HTMLDivElement | null>(null);

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

  const [logout, { error: logoutError }] = useLogoutUserMutation();

  const handleLogout = async () => {
    await logout().unwrap();
    router.push("/auth");
  };

  return (
    <>
      <Card
        className={`sticky top-0 z-99 flex flex-row justify-between py-5 items-center border-b-[1px]
        px-20 shadow-sm rounded-none ${isAuthPage ? "hidden" : ""}`}
      >
        <div
          className="flex flex-row gap-2 items-center cursor-pointer "
          onClick={() => router.push("/")}
        >
          <Image src="/logo.svg" alt="Logo" width={40} height={40} />
          <span className="font-extrabold text-xl ">SocialV</span>
        </div>
        <div className="flex-1 mx-20 relative">
          <Search className="absolute left-2.5 top-2 text-gray-300 h-5 w-5" />
          <Input
            className="pl-10 w-full min-w-[200px] focus-visible:ring-[#8A3CFF]/30 focus-visible:ring-2"
            placeholder="Search"
          />
          {/* прибрати якшо нічого немає в інпуті */}
          <X className="absolute right-2.5 top-2 text-gray-400 h-5 w-5" />
        </div>
        <div className="flex justify-between items-center gap-5">
          <div onClick={() => router.push("/profile")}></div>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <User className="hover:text-[#8A3CFF] cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-99 mt-6 ">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push("/profile")}
              >
                <CircleUser />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push("/messenger")}
              >
                <MessageCircle />
                Messanger
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-primary hover:!text-primary"
                onClick={handleLogout}
              >
                <LogOut className="text-primary" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div
            ref={bellRef}
            onClick={() => setShowNotifications((prev) => !prev)}
          >
            <Bell
              className={`hover:text-[#8A3CFF] cursor-pointer ${
                showNotifications ? "text-[#8A3CFF]" : ""
              }`}
            />
          </div>
        </div>
      </Card>

      <div ref={notificationsRef} className="fixed  right-4 z-[100] w-[500px]">
        <AnimatePresence>
          {showNotifications && <Notifications />}
        </AnimatePresence>
      </div>
    </>
  );
}
