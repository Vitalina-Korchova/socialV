import { Mail, Lock, EyeOff, Eye } from "lucide-react";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { z } from "zod";
import { useLoginUserMutation } from "@/store/auth/auth.api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

type SignInPageProps = {
  setMode: (mode: "signup" | "forgot-password") => void;
};

const signInSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInPage({ setMode }: SignInPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loginUser, { error: loginError, isLoading: loginLoading }] =
    useLoginUserMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    await loginUser(data).unwrap();
    toast.success("Logged in successfully");
  };
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Email"
            className={`pl-10 h-12 `}
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive ">{errors.email.message}</p>
        )}

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className={`pl-10 pr-10 h-12 
            }`}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-primary"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive ">{errors.password.message}</p>
        )}

        <span
          className="text-xs text-muted-foreground text-right cursor-pointer hover:text-primary"
          onClick={() => setMode("forgot-password")}
        >
          Forgot password?
        </span>

        {loginError && (
          <p className="text-xs text-destructive">
            {"status" in loginError
              ? loginError.status === 404
                ? "Password or email is incorrect"
                : "Error occurred while logging in"
              : "Error occurred while logging in"}
          </p>
        )}

        <Button
          type="submit"
          className="h-12 text-base font-semibold cursor-pointer"
          disabled={loginLoading}
        >
          {loginLoading ? "Loading..." : "Sign In"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Do not have an account?{" "}
          <span
            onClick={() => setMode("signup")}
            className="cursor-pointer text-primary hover:underline"
          >
            Sign up
          </span>
        </p>
      </form>
    </>
  );
}
