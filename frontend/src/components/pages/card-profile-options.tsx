"use client";
import React from "react";

import { User, Home, MessageCircle } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useRouter } from "next/navigation";
import { useGetMeQuery } from "@/store/user/user.api";
import { TbUserStar } from "react-icons/tb";

export default function CardProfileOptions() {
  const { data: userData, isLoading: userLoading } = useGetMeQuery();
  const router = useRouter();

  const navItems = [
    { label: "Home", icon: Home, path: "/" },
    { label: "Profile", icon: User, path: "/profile?tab=my-posts" },
    { label: "Messages", icon: MessageCircle, path: "/messages" },
  ];

  return (
    <Card className="w-64 h-fit sticky top-26 py-0! overflow-hidden ">
      <CardHeader className=" relative p-0! h-20 ">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/card-back.jpg"
            alt="background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
        </div>
      </CardHeader>

      <CardContent className="space-y-1 relative">
        <div className="absolute top-[-45px] left-0 right-0 flex flex-col items-center">
          <div className="relative mb-2">
            <div className="w-16 h-16 relative flex items-center justify-center">
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src="/border.webp"
                  alt="animated border"
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                />
              </div>
              {userLoading ? (
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
              LV. 4
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <h3 className="font-bold text-base text-white">
              {userData?.username || "Username"}
            </h3>
            <Badge variant="secondary" className="text-[10px] h-5 bg-zinc-800 text-zinc-400 border-none">
              Software Engineer
            </Badge>
          </div>
        </div>
        <div className="pt-20 pb-5 space-y-1">
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
