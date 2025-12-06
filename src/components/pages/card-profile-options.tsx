import React from "react";

import { User, Home, MessageCircle } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export default function CardProfileOptions() {
  return (
    <Card className="w-64 h-fit sticky top-26 py-0! overflow-hidden">
      <CardHeader className=" relative p-0! h-16 ">
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
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-base">Robert Fox</h3>
            <Badge variant="default" className="text-xs">
              Software Engineer
            </Badge>
          </div>
        </div>
        <div className="pt-16 pb-5">
          <Button className=" w-full justify-start  cursor-pointer">
            <Home className="w-4 h-4 mr-3" />
            Home
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start  cursor-pointer"
          >
            <User className="w-4 h-4 mr-3" />
            Profile
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start  cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 mr-3" />
            Messages
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
