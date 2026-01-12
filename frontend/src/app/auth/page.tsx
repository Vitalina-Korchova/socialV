"use client";

import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";

import SignInPage from "@/components/auth/signin-page";
import SignUpPage from "@/components/auth/signup-page";
import ForgotPasswordPage from "@/components/auth/forgot-password";

export default function Authorization() {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot-password">(
    "signin"
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-[420px] w-full px-10 py-6 flex flex-col gap-6 bg-white/5 backdrop-blur-md">
        <div className="flex flex-col items-center gap-2">
          <Image src="/logo.svg" alt="Logo" width={160} height={160} />
          <h1 className="text-3xl font-extrabold">SocialV</h1>
          <p className="text-muted-foreground text-sm">
            Social media for gamers
          </p>
        </div>

        {mode === "signin" && <SignInPage setMode={setMode} />}
        {mode === "signup" && <SignUpPage setMode={setMode} />}
        {mode === "forgot-password" && <ForgotPasswordPage setMode={setMode} />}
      </Card>
    </div>
  );
}
