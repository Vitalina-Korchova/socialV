"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";

export default function Authorization() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);

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

        <div className="flex flex-col gap-4">
          {mode === "signup" && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Username" className="pl-10 h-12" />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="email" placeholder="Email" className="pl-10 h-12" />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="pl-10 pr-10 h-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {mode === "signin" && (
            <span className="text-xs text-muted-foreground text-right cursor-pointer hover:text-primary">
              Forgot password?
            </span>
          )}

          <Button className="h-12 text-base font-semibold cursor-pointer">
            {mode === "signin" ? "Sign In" : "Create Account"}
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {mode === "signin" ? (
            <>
              Don’t have an account?{" "}
              <span
                onClick={() => setMode("signup")}
                className="cursor-pointer text-primary hover:underline"
              >
                Sign up
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                onClick={() => setMode("signin")}
                className="cursor-pointer text-primary hover:underline"
              >
                Sign in
              </span>
            </>
          )}
        </p>
      </Card>
    </div>
  );
}
