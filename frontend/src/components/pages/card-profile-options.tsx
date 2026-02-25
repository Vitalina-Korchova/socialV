"use client";
import React from "react";

import { User, Home, MessageCircle } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useGetMeQuery } from "@/store/user/user.api";
import { TbUserStar } from "react-icons/tb";
import { UserBadgesList } from "../ui/user-badge";

export default function CardProfileOptions() {
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = useGetMeQuery();
  const router = useRouter();

  const navItems = [
    { label: "Home", icon: Home, path: "/" },
    { label: "Profile", icon: User, path: "/profile?tab=my-posts" },
    { label: "Messages", icon: MessageCircle, path: "/messages" },
  ];

  return (
    <Card className="w-64 h-fit sticky top-26 py-0! overflow-hidden hidden md:block">
      <CardHeader className=" relative p-0! h-20 ">
        <div className="absolute inset-0 overflow-hidden">
          {userData?.background_url && (
            <Image
              src={userData.background_url}
              alt="background"
              fill
              className="object-cover"
              priority
            />
          )}
          <div
            className="absolute inset-x-0 bottom-0 h-full
  bg-[linear-gradient(360deg,_rgba(24,24,27,1)_6%,_rgba(24,24,27,0.38)_25%,_rgba(24,24,27,0.26)_37%,_rgba(0,0,0,0)_58%)]"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative flex flex-col items-center z-10 -mt-10">
          <div className="relative mb-2">
            <div className="w-15 h-15 relative flex items-center justify-center">
              {userData?.border_url && (
                <div className="absolute inset-0 overflow-hidden">
                  <Image
                    src={userData.border_url}
                    alt=" border"
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {userLoading || userError ? (
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                  <TbUserStar className="w-6 h-6 text-primary" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden">
                  {userData?.avatar_url && (
                    <Image
                      src={userData.avatar_url}
                      alt="avatar"
                      width={100}
                      height={100}
                      className="rounded-full object-cover"
                    />
                  )}
                </div>
              )}
            </div>
            <span
              className="absolute -bottom-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full
             bg-purple-600 text-white font-bold border-2 border-zinc-900 shadow-lg"
            >
              LV. {userData?.level}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <h3 className="font-bold text-base text-white">
              {userData?.username || "Username"}
            </h3>
            <div className="flex flex-wrap justify-center gap-1 px-4">
              <UserBadgesList badges={userData?.badges} className="justify-center" />
            </div>
          </div>
        </div>

        <div className="space-y-1 pb-4">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="cursor-pointer w-full justify-start gap-4 h-11 px-4 text-zinc-400 hover:text-white hover:bg-zinc-800/30 group transition-all duration-300 rounded-xl relative overflow-hidden"
              onClick={() => router.push(item.path)}
            >
              <item.icon className="w-[18px] h-[18px] transition-all duration-300 group-hover:scale-110 group-hover:text-purple-500" />
              <span className="text-sm font-medium tracking-wide">
                {item.label}
              </span>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-0 bg-purple-500 group-hover:h-1/2 transition-all duration-300 rounded-r-full" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
