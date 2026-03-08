import { Mail, Shield, Lock, EyeOff, Eye } from "lucide-react";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  useResetPasswordMutation,
  useSendCodeEmailMutation,
  useVerifyCodeMutation,
} from "@/store/auth/auth.api";
import { toast } from "sonner";

type ForgotPasswordPageProps = {
  setMode: (mode: "signup" | "signin") => void;
};

export default function ForgotPasswordPage({
  setMode,
}: ForgotPasswordPageProps) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorValidationPassword, setErrorValidationPassword] = useState(false);

  const [
    sendCodeEmail,
    { error: sendCodeEmailError, isLoading: sendCodeEmailLoading },
  ] = useSendCodeEmailMutation();
  const [verifyCode, { error: verifyCodeError, isLoading: verifyCodeLoading }] =
    useVerifyCodeMutation();
  const [
    resetPassword,
    { error: resetPasswordError, isLoading: resetPasswordLoading },
  ] = useResetPasswordMutation();
  const handleSendCodeEmail = async (email: string) => {
    await sendCodeEmail({ email }).unwrap();
    toast.success("Code sent successfully");
    setStep(2);
  };
  const handleVeriifyCode = async (email: string, code: string) => {
    await verifyCode({ email, code }).unwrap();
    toast.success("Code verified successfully");
    setStep(3);
  };
  const handleResetPassword = async (
    email: string,
    code: string,
    password: string
  ) => {
    if (password === passwordConfirm && password.length >= 6) {
      await resetPassword({ email, code, password }).unwrap();
      toast.success("Password reset successfully");
      setMode("signin");
    } else {
      setErrorValidationPassword(true);
    }
  };
  return (
    <>
      <div className="flex  flex-col gap-4">
        {step === 1 && (
          <>
            <div className="flex flex-col gap-2">
              <span className="text-sm sm:text-base text-gray-400 font-light">
                Enter your email to reset password
              </span>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Email"
                  className="pl-10 h-10 sm:h-12 text-sm sm:text-base"
                />
              </div>
            </div>
            {sendCodeEmailError && (
              <p className="text-xs text-destructive">
                {"status" in sendCodeEmailError
                  ? sendCodeEmailError.status === 404
                    ? "Email is incorrect or does not exist"
                    : "Error occurred while sending code"
                  : "Error occurred while sending code"}
              </p>
            )}

            <Button
              className="h-10 text-sm sm:h-12 sm:text-base font-semibold cursor-pointer"
              onClick={() => handleSendCodeEmail(email)}
              disabled={sendCodeEmailLoading}
            >
              {sendCodeEmailLoading ? "Sending..." : "Send code"}
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
              <span className="text-sm sm:text-base text-gray-400 font-light">
                Enter verification code
              </span>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  type="number"
                  placeholder="000000"
                  className="pl-10 h-10 sm:h-12 text-sm sm:text-base"
                  maxLength={6}
                />
              </div>
            </div>
            {verifyCodeError && (
              <p className="text-xs text-destructive">
                {"status" in verifyCodeError
                  ? verifyCodeError.status === 404 ||
                    verifyCodeError.status === 400
                    ? "Code is incorrect"
                    : "Error occurred while verifying code"
                  : "Error occurred while verifying code"}
              </p>
            )}
            <Button
              className="h-10 text-sm sm:h-12 sm:text-base font-semibold cursor-pointer"
              onClick={() => handleVeriifyCode(email, code)}
              disabled={verifyCodeLoading}
            >
              {verifyCodeLoading ? "Verifying..." : "Verify code"}
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
              <span className="text-sm sm:text-base text-gray-400 font-light">
                Enter new password
              </span>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="pl-10 pr-10 h-10 sm:h-12 text-sm sm:text-base"
                  min={6}
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
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  type={showPasswordConfirm ? "text" : "password"}
                  placeholder="Confirm password"
                  className="pl-10 pr-10 h-10 sm:h-12 text-sm sm:text-base"
                  min={6}
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

            {resetPasswordError && (
              <p className="text-xs text-destructive">
                Error occurred while resetting password
              </p>
            )}
            {errorValidationPassword && (
              <p className="text-xs text-destructive ">
                Password must be at least 6 characters
              </p>
            )}
            {password !== passwordConfirm && (
              <p className="text-xs text-destructive ">
                Passwords do not match
              </p>
            )}
            <Button
              className="h-10 text-sm sm:h-12 sm:text-base font-semibold cursor-pointer"
              onClick={() => handleResetPassword(email, code, password)}
              disabled={resetPasswordLoading}
            >
              {resetPasswordLoading ? "Resetting..." : "Reset password"}
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
