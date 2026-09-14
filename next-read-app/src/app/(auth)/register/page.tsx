"use client";

import Link from "next/link";
import { submitAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthFormField } from "@/components/shared/auth/auth-form-field";
import { AuthPageShell } from "@/components/shared/auth/auth-page-shell";
import { useToast } from "@/components/providers/app-feedback-provider";
import { Button } from "@/components/ui/button";
import type { RegisterFormValues } from "@/types/auth";

const initialFormValues: RegisterFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    defaultValues: initialFormValues,
    reValidateMode: "onChange",
  });

  const onSubmit = async (values: RegisterFormValues) => {
    clearErrors("root");
    try {
      await submitAuth("register", {
        fullName: values.name,
        email: values.email,
        password: values.password,
      });
      toast({
        title: "Akun berhasil dibuat",
        description: "Anda sudah masuk ke NexRead.",
      });
      router.push("/");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create account.";
      setError("root", {
        type: "server",
        message,
      });
      toast({
        title: "Gagal membuat akun",
        description: message,
        variant: "error",
      });
    }
  };

  const onInvalid = () => {
    toast({
      title: "Form belum lengkap",
      description: "Periksa kembali seluruh data registrasi Anda.",
      variant: "error",
    });
  };

  return (
    <AuthPageShell
      title="Create account"
      description="Join NexRead and start managing your reading journey."
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        noValidate
      >
        <AuthFormField
          id="name"
          label="Name"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name", {
            required: "Name is required.",
          })}
        />
        <AuthFormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required.",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Please enter a valid email address.",
            },
          })}
        />
        <AuthFormField
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword((current) => !current)}
          {...register("password", {
            required: "Password is required.",
            minLength: { value: 8, message: "Use at least 8 characters." },
          })}
        />
        <AuthFormField
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          showPassword={showConfirmPassword}
          onTogglePassword={() => setShowConfirmPassword((current) => !current)}
          {...register("confirmPassword", {
            required: "Confirm password is required.",
            validate: (value) =>
              value === getValues("password") || "Passwords do not match.",
          })}
        />

        {errors.root?.message && (
          <p role="alert" className="text-sm text-red-500">
            {errors.root.message}
          </p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-num-30504000 text-base font-extrabold shadow-[0px_10px_15px_-3px_rgba(0,_211,_243,_0.25),_0px_4px_6px_-4px_rgba(0,_211,_243,_0.25)]"
        >
          {isSubmitting ? "Creating account..." : "Submit"}
        </Button>

        <p className="text-center text-base font-semibold text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-extrabold text-primary">
            Log In
          </Link>
        </p>
      </form>
    </AuthPageShell>
  );
}
