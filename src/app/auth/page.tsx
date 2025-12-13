"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Authorization() {
  const backendUrl = "http://localhost:4000";

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-[500px] w-full p-10 flex flex-col gap-4 items-center bg-white/5">
        <Image src="/logo.svg" alt="Logo" width={160} height={160} />

        <h1 className="text-3xl font-extrabold">SocialV</h1>
        <p className="text-muted-foreground">Social media for gamers</p>

        <Button
          className="w-full h-12 text-base flex gap-3 cursor-pointer"
          variant="outline"
          onClick={() => {
            window.location.href = `${backendUrl}/auth/google`;
          }}
        >
          <Image src="/google-icon.svg" alt="Google" width={20} height={20} />
          Continue with Google
        </Button>

        <Button
          className="w-full h-12 text-base flex gap-3 cursor-pointer"
          variant="outline"
          onClick={() => {
            window.location.href = `${backendUrl}/auth/discord`;
          }}
        >
          <Image src="/discord-icon.svg" alt="Discord" width={20} height={20} />
          Continue with Discord
        </Button>
        <Button
          className="w-full h-12 text-base flex gap-3 cursor-pointer"
          variant="outline"
          onClick={() => {
            window.location.href = `${backendUrl}/auth/twitch`;
          }}
        >
          <Image src="/twitch-icon.svg" alt="Discord" width={20} height={20} />
          Continue with Twitch
        </Button>
      </Card>
    </div>
  );
}
