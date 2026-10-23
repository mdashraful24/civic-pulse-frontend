"use client";

import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  ImagePlus,
  UploadCloud,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/field";
import { api, getApiErrorMessage } from "@/lib/api";
import { IMAGE_ACCEPT } from "@/lib/constants";
import { registerSchema, validateImageFile } from "@/lib/validation";

type Errors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  image?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) router.replace("/dashboard");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const handleFile = (file: File | null) => {
    if (!file) {
      setImage(null);
      setErrors((current) => ({ ...current, image: undefined }));
      return;
    }
    const message = validateImageFile(file);
    if (message) {
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setErrors((current) => ({ ...current, image: message }));
      return;
    }
    setErrors((current) => ({ ...current, image: undefined }));
    setImage(file);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setFormError("");

    const parsed = registerSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match." });
      return;
    }

    if (image) {
      const imageError = validateImageFile(image);
      if (imageError) {
        setErrors({ image: imageError });
        return;
      }
    }

    setLoading(true);

    try {
      const response = await api.auth.register({
        ...parsed.data,
        image,
      });
      sessionStorage.setItem("civicpulse:pending-email", parsed.data.email);
      if (response.data?.expiresAt) {
        sessionStorage.setItem(
          "civicpulse:pending-expiry",
          response.data.expiresAt,
        );
      }
      toast.success("Check your inbox for the 6-digit code.");
      router.push("/verify-email");
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account."
      description="A verified CivicPulse account lets you report issues and follow their progress."
      footer={
        <p className="text-center text-sm text-stone-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand hover:text-brand-dark"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form className="grid gap-4" onSubmit={submit}>
        <div className="flex items-center gap-4 rounded-2xl border border-dashed border-line bg-white/70 p-3.5">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-soft text-brand">
            {preview ? (
              <Image
                src={preview}
                alt="Profile preview"
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <ImagePlus className="h-6 w-6" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-ink">
              Profile photo{" "}
              <span className="font-normal text-stone-400">(optional)</span>
            </p>
            <p className="mt-0.5 text-[11px] leading-5 text-stone-500">
              JPEG, PNG, WebP or GIF · max 5 MB
            </p>
            <div className="mt-2 flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={IMAGE_ACCEPT}
                className="hidden"
                onChange={(event) =>
                  handleFile(event.target.files?.[0] ?? null)
                }
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className="h-3.5 w-3.5" />
                {image ? "Replace" : "Upload"}
              </Button>
              {image ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFile(null)}
                >
                  <X className="h-3.5 w-3.5" />
                  Remove
                </Button>
              ) : null}
            </div>
          </div>
        </div>
        {errors.image ? (
          <p className="text-[12px] font-medium text-rose-600">
            {errors.image}
          </p>
        ) : null}

        <FormField
          label="Full name"
          htmlFor="name"
          error={errors.name}
          required
        >
          <Input
            id="name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ayesha Rahman"
            maxLength={80}
          />
        </FormField>

        <FormField
          label="Email address"
          htmlFor="email"
          error={errors.email}
          required
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            maxLength={254}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          hint="8+ characters, 1 letter, 1 number"
          error={errors.password}
          required
        >
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a strong password"
              className="pr-11"
              maxLength={128}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-stone-400 transition hover:bg-stone-100 hover:text-ink"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </FormField>

        <FormField
          label="Confirm password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword}
          required
        >
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat your password"
            maxLength={128}
          />
        </FormField>

        {formError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
            {formError}
          </div>
        ) : null}

        <Button
          type="submit"
          size="lg"
          loading={loading}
          className="mt-1 w-full"
        >
          Create account
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <div className="mt-5 flex items-start gap-2 rounded-xl bg-brand-soft/60 px-3.5 py-3">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        <p className="text-[11px] leading-5 text-stone-600">
          Registration is completed with a 6-digit code sent to your email. No
          account is created until that code is verified.
        </p>
      </div>
    </AuthShell>
  );
}
