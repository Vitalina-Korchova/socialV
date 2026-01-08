"use client";
import React from "react";

import { User, Home, MessageCircle } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useRouter } from "next/navigation";

export default function CardProfileOptions() {
  const router = useRouter();
  return (
    <Card className="w-64 h-fit sticky top-26 py-0! overflow-hidden ">
      <CardHeader className=" relative p-0! h-20 ">
        <div className="abosulute top-0 right-0 left-0">
          <Image
            src="/card-back.jpg"
            alt="background"
            fill
            className="object-cover"
            priority
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-1 relative">
        <div className="absolute top-[-45px]">
          <div className="flex flex-row gap-3 ">
            <div className="w-14 h-14 relative flex items-center justify-center">
              <div className="absolute inset-0  overflow-hidden">
                <Image
                  src="/border.webp"
                  alt="animated border"
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <span
              className="w-fit h-fit text-xs px-2 py-0.5 rounded-full
             bg-purple-100 text-purple-700 font-semibold absolute top-7 left-15"
            >
              Lv. 4
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-base">Robert Fox</h3>
            <Badge variant="default" className="text-xs">
              Software Engineer
            </Badge>
          </div>
        </div>
        <div className="pt-20 pb-5">
          <Button className=" w-full justify-start  cursor-pointer">
            <Home className="w-4 h-4 mr-3" />
            Home
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start  cursor-pointer"
            onClick={() => router.push("/profile")}
          >
            <User className="w-4 h-4 mr-3" />
            Profile
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start  cursor-pointer"
            onClick={() => router.push("/messanger")}
          >
            <MessageCircle className="w-4 h-4 mr-3" />
            Messages
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
