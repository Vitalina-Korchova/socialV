import { Mail, User, Lock, EyeOff, Eye } from "lucide-react";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { z } from "zod";
import { useRegisterUserMutation } from "@/store/auth/auth.api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type SignUpPageProps = {
  setMode: (mode: "signup" | "signin") => void;
};

const signUpSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage({ setMode }: SignUpPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [registerUser, { error: registerError, isLoading: registerLoading }] =
    useRegisterUserMutation();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    await registerUser(data).unwrap();
    toast.success("Registered successfully");
    router.push("/profile?tab=settings");
  };
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Username"
            className="pl-10 h-12"
            {...register("username")}
          />
        </div>
        {errors.username && (
          <p className="text-xs text-destructive ">{errors.username.message}</p>
        )}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Email"
            className="pl-10 h-12"
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
            className="pl-10 pr-10 h-12"
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

        {registerError && (
          <p className="text-xs text-destructive">
            {"status" in registerError
              ? registerError.status === 409
                ? "User already exists with such email"
                : "Error occurred while registration"
              : "Error occurred while registration"}
          </p>
        )}

        <Button
          className="h-12 text-base font-semibold cursor-pointer"
          disabled={registerLoading}
        >
          {registerLoading ? "Loading..." : "Create Account"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <span
            onClick={() => setMode("signin")}
            className="cursor-pointer text-primary hover:underline"
          >
            Sign in
          </span>
        </p>
      </form>
    </>
  );
}
