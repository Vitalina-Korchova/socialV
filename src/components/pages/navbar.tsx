"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { Bell, MessageCircle, Search, User, X } from "lucide-react";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import Notifications from "./notifications";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
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

  return (
    <>
      <Card
        className="sticky top-0 z-99 flex flex-row justify-between py-5 items-center border-b-[1px]
        px-20 shadow-sm rounded-none"
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
        <div className="flex justify-between items-center gap-6">
          <div onClick={() => router.push("/profile")}>
            <User className="hover:text-[#8A3CFF] cursor-pointer" />
          </div>
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
          <div onClick={() => router.push("/messanger")}>
            <MessageCircle className="hover:text-[#8A3CFF] cursor-pointer" />
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
