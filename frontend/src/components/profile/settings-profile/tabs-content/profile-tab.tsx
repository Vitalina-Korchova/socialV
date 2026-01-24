"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetMeQuery, useUpdateUserMutation } from "@/store/user/user.api";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const profileSchema = z.object({
  email: z.email("Invalid email"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters"),
});

type profileSchemaFormData = z.infer<typeof profileSchema>;

export default function ProfileSettings() {
  const { data: userData } = useGetMeQuery();
  const [updateUserData, { isLoading: updateLoading, error: updateError }] =
    useUpdateUserMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<profileSchemaFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: "",
      username: "",
    },
  });

  useEffect(() => {
    if (userData) {
      reset({
        email: userData.email || "",
        username: userData.username || "",
      });
    }
  }, [userData, reset]);

  const onSubmit = async (data: profileSchemaFormData) => {
    if (!userData?.id) return;
    await updateUserData(data).unwrap();
    toast.success("Profile updated successfully");
  };
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <h2 className="text-2xl font-bold">Profile Settings</h2>
          <p className="text-muted-foreground">
            You can update your personal information here.
          </p>
        </div>

        <div className="max-w-xl space-y-6  p-6">
          <div className="flex flex-col  gap-2">
            <label className="text-sm font-medium ">Username</label>
            <Input
              type="text"
              placeholder="Enter your username"
              className="w-full  "
              {...register("username")}
            />
          </div>
          {errors.username && (
            <p className="text-xs text-destructive ">
              {errors.username.message}
            </p>
          )}

          <div className="flex flex-col  gap-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="Enter your email"
              className="w-full  "
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive ">{errors.email.message}</p>
          )}

          {updateError && (
            <p className="text-xs text-destructive">
              {"status" in updateError
                ? updateError.status === 404
                  ? "User not found"
                  : updateError.status === 409
                  ? "Email already in use"
                  : "Error occurred while updating"
                : "Error occurred while updating"}
            </p>
          )}
          <div className="flex justify-end">
            <Button className="cursor-pointer" disabled={updateLoading}>
              {updateLoading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
