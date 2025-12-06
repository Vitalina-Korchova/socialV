import React from "react";
import Image from "next/image";

import { Bell, Search, User, X } from "lucide-react";
import { Input } from "../ui/input";
import { Card } from "../ui/card";

export default function Navbar() {
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
        <div className="flex gap-4">
          <Bell className="hover:text-[#8A3CFF] cursor-pointer" />
          <User className="hover:text-[#8A3CFF] cursor-pointer" />
        </div>
      </Card>
    </>
  );
}
