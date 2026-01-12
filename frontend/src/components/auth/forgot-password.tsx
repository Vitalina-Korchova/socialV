import { Mail, Shield, Lock, EyeOff, Eye } from "lucide-react";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

type ForgotPasswordPageProps = {
  setMode: (mode: "signup" | "signin") => void;
};

export default function ForgotPasswordPage({
  setMode,
}: ForgotPasswordPageProps) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  return (
    <>
      <div className="flex  flex-col gap-4">
        {step === 1 && (
          <>
            <div className="flex flex-col gap-2">
              <span className="text-base text-gray-400 font-light">
                Enter your email to reset password
              </span>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  className="pl-10 h-12"
                />
              </div>
            </div>
            <Button className="h-12 text-base font-semibold cursor-pointer">
              Send code
            </Button>
            <span
              onClick={() => setMode("signin")}
              className="cursor-pointer text-primary hover:underline text-sm text-center"
            >
              Back
            </span>
          </>
        )}
        {step === 2 && (
          <>
            <div className="flex flex-col gap-2">
              <span className="text-base text-gray-400 font-light">
                Enter verification code
              </span>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="000000"
                  className="pl-10 h-12"
                  maxLength={6}
                />
              </div>
            </div>
            <Button className="h-12 text-base font-semibold cursor-pointer">
              Verify code
            </Button>
            <span
              onClick={() => setStep(1)}
              className="cursor-pointer text-primary hover:underline text-sm text-center"
            >
              Back
            </span>
          </>
        )}
        {step === 3 && (
          <>
            <div className="flex flex-col gap-2">
              <span className="text-base text-gray-400 font-light">
                Enter new password
              </span>
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
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPasswordConfirm ? "text" : "password"}
                  placeholder="Confirm password"
                  className="pl-10 pr-10 h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-primary"
                >
                  {showPasswordConfirm ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>
            <Button className="h-12 text-base font-semibold cursor-pointer">
              Change password
            </Button>
            <span
              onClick={() => setStep(2)}
              className="cursor-pointer text-primary hover:underline text-sm text-center"
            >
              Back
            </span>
          </>
        )}
      </div>
    </>
  );
}
