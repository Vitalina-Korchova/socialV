"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { Bell, Search, X } from "lucide-react";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import Notifications from "./notifications";
import { AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const closeNotificationsOutside = (event: MouseEvent) => {
    if (!notificationsRef.current) return;
    const target = event.target as Node;
    if (!notificationsRef.current.contains(target)) setShowNotifications(false);
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
        <div className="flex flex-row gap-2 items-center">
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
        <div
          className="flex gap-4"
          onClick={() => setShowNotifications((prev) => !prev)}
        >
          <Bell
            className={`hover:text-[#8A3CFF] cursor-pointer ${
              showNotifications ? "text-[#8A3CFF]" : ""
            }`}
          />
          <div ref={notificationsRef}>
            <AnimatePresence>
              {showNotifications && <Notifications />}
            </AnimatePresence>
          </div>
        </div>
      </Card>
    </>
  );
}
