"use client";

import { ImagePlus, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { ZodError } from "zod";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select, Textarea } from "@/components/ui/field";
import { api, getApiErrorMessage } from "@/lib/api";
import {
  CATEGORY_OPTIONS,
  IMAGE_ACCEPT,
  PRIORITY_OPTIONS,
} from "@/lib/constants";
import type {
  CreateIssuePayload,
  Issue,
  IssueCategory,
  IssuePriority,
  UpdateIssuePayload,
} from "@/lib/types";
import {
  createIssueSchema,
  updateIssueSchema,
  validateImageFile,
} from "@/lib/validation";

type Errors = Record<string, string | undefined>;

export function IssueForm({
  mode,
  initial,
  onSuccess,
  onCancel,
}: {
  mode: "create" | "edit";
  initial?: Issue;
  onSuccess: (issue: Issue) => void;
  onCancel?: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState<IssueCategory>(
    initial?.category ?? "ROADS",
  );
  const [location, setLocation] = useState(initial?.location ?? "");
  const [priority, setPriority] = useState<IssuePriority>(
    initial?.priority ?? "MEDIUM",
  );
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

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

    const base = { title, description, category, location };

    if (mode === "create") {
      const parsed = createIssueSchema.safeParse({ ...base, priority });
      if (!parsed.success) {
        setErrors(toFieldErrors(parsed.error));
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
        const response = await api.issues.create(
          parsed.data as CreateIssuePayload,
          image,
        );
        if (!response.data) throw new Error("The issue was not returned.");
        toast.success("Issue reported. Thank you for flagging it.");
        onSuccess(response.data);
      } catch (error) {
        setFormError(getApiErrorMessage(error));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!initial) return;
    const parsed = updateIssueSchema.safeParse(base);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }

    setLoading(true);
    try {
      const response = await api.issues.update(
        initial.id,
        parsed.data as UpdateIssuePayload,
      );
      if (!response.data) throw new Error("The issue was not returned.");
      toast.success("Issue updated.");
      onSuccess(response.data);
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Issue title"
          htmlFor="title"
          error={errors.title}
          hint={`${title.length}/150`}
          required
          className="sm:col-span-2"
        >
          <Input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Broken streetlight outside the library"
            maxLength={150}
          />
        </FormField>

        <FormField
          label="Category"
          htmlFor="category"
          error={errors.category}
          required
        >
          <Select
            id="category"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as IssueCategory)
            }
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Priority"
          htmlFor="priority"
          error={errors.priority}
          hint={mode === "edit" ? "Managed by an administrator" : undefined}
        >
          <Select
            id="priority"
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as IssuePriority)
            }
            disabled={mode === "edit"}
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Location"
          htmlFor="location"
          error={errors.location}
          required
          className="sm:col-span-2"
        >
          <Input
            id="location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Street, landmark or neighbourhood"
            maxLength={200}
          />
        </FormField>

        <FormField
          label="Description"
          htmlFor="description"
          error={errors.description}
          hint={`${description.length}/5000`}
          required
          className="sm:col-span-2"
        >
          <Textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What is wrong? When did you notice it? Any details that would help a field team find and fix it?"
            maxLength={5000}
          />
        </FormField>
      </div>

      {mode === "create" ? (
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink/80">
            Photo <span className="font-normal text-stone-400">(optional)</span>
          </p>
          <div className="flex items-center gap-4 rounded-2xl border border-dashed border-line bg-white/60 p-3.5">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-soft text-brand">
              {preview ? (
                <Image
                  src={preview}
                  alt="Issue preview"
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <ImagePlus className="h-6 w-6" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] leading-5 text-stone-500">
                A clear photo helps the field team find the problem. JPEG, PNG,
                WebP or GIF · max 5 MB.
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
                  {image ? "Replace photo" : "Add photo"}
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
            <p className="mt-1 text-[12px] font-medium text-rose-600">
              {errors.image}
            </p>
          ) : null}
        </div>
      ) : null}

      {formError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
          {formError}
        </div>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" loading={loading}>
          {mode === "create" ? "Submit report" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function toFieldErrors(error: ZodError): Errors {
  const result: Errors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !result[key]) result[key] = issue.message;
  }
  return result;
}
