import { Mail, Lock, EyeOff, Eye } from "lucide-react";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";

type SignInPageProps = {
  setMode: (mode: "signup" | "forgot-password") => void;
};

export default function SignInPage({ setMode }: SignInPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <>
      <div className="flex flex-col gap-4">
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-primary"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <span
          className="text-xs text-muted-foreground text-right cursor-pointer hover:text-primary"
          onClick={() => setMode("forgot-password")}
        >
          Forgot password?
        </span>

        <Button className="h-12 text-base font-semibold cursor-pointer">
          Sign In
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Don’t have an account?{" "}
          <span
            onClick={() => setMode("signup")}
            className="cursor-pointer text-primary hover:underline"
          >
            Sign up
          </span>
        </p>
      </div>
    </>
  );
}
