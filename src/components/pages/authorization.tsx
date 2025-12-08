import React from "react";
import { Card } from "../ui/card";
import Image from "next/image";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export default function Authorization() {
  return (
    <>
      <div className="min-h-screen flex items-center justify-center">
        <Card className=" max-w-[600px] h-fit flex py-10 px-15 backdrop-blur-xs bg-white/5  ">
          <div className="flex flex-row gap-20 items-end">
            <div className="flex flex-col gap-3 items-center">
              <Image src="/logo.svg" alt="Logo" width={180} height={180} />
              <span className="font-extrabold text-2xl">SocialV</span>
              <span className="text-muted-foreground">
                Social media for gamers
              </span>
            </div>
            <div className="flex flex-col gap-3 items-center">
              <span className="font-extrabold text-xl">Sign in</span>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                autoComplete="off"
              ></Input>
              <Input
                id="email"
                type="password"
                placeholder="password"
                autoComplete="off"
              ></Input>
              <div className="w-full flex justify-end">
                <span className="text-muted-foreground text-xs cursor-pointer hover:underline hover:text-[#8e51ff]">
                  Forget password?
                </span>
              </div>
              <Button className="w-full cursor-pointer">Login</Button>
              <div className="flex flex-row items-center gap-1 text-xs">
                <span className="text-muted-foreground">
                  Do not have an account?
                </span>
                <span className="text-muted-foreground cursor-pointer hover:underline hover:text-[#8e51ff]">
                  Sign up
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
