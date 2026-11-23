"use client";

import { useMutation } from "@tanstack/react-query";
import { type FormEvent, useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { FormField, Input } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { api, getApiErrorMessage } from "@/lib/api";
import { ROLE_OPTIONS, USER_STATUS_OPTIONS } from "@/lib/constants";
import type {
  AdminUser,
  CreateAdminUserPayload,
  Role,
  UpdateAdminUserPayload,
} from "@/lib/types";
import { createAdminUserSchema, updateAdminUserSchema } from "@/lib/validation";

type FormValues = {
  name: string;
  email: string;
  password: string;
  role: Role;
  status: "ACTIVE" | "BLOCKED";
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const statusOptions = USER_STATUS_OPTIONS.filter(
  (option) => option.value !== "DELETED",
);

const emptyValues: FormValues = {
  name: "",
  email: "",
  password: "",
  role: "CITIZEN",
  status: "ACTIVE",
};

export function AdminUserForm({
  open,
  user,
  onClose,
  onSaved,
}: {
  open: boolean;
  user?: AdminUser | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const formId = useId();
  const { user: currentUser } = useAuth();
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const isEditing = Boolean(user);
  const isSelf = Boolean(user && currentUser?.id === user.id);

  useEffect(() => {
    if (!open) return;

    setErrors({});
    setValues(
      user
        ? {
            name: user.name,
            email: user.email,
            password: "",
            role: user.role,
            status: user.status === "BLOCKED" ? "BLOCKED" : "ACTIVE",
          }
        : emptyValues,
    );
  }, [open, user]);

  const mutation = useMutation({
    mutationFn: (payload: CreateAdminUserPayload | UpdateAdminUserPayload) =>
      user
        ? api.admin.updateUser(user.id, payload)
        : api.admin.createUser(payload as CreateAdminUserPayload),
    onSuccess: () => {
      toast.success(isEditing ? "User updated." : "User created.");
      onSaved();
      onClose();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const updateValue = <K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (user) {
      const payload: UpdateAdminUserPayload = {};
      if (values.name !== user.name) payload.name = values.name;
      if (values.email !== user.email) payload.email = values.email;
      if (values.password) payload.password = values.password;
      if (!isSelf && values.role !== user.role) payload.role = values.role;
      if (!isSelf && values.status !== user.status)
        payload.status = values.status;

      const parsed = updateAdminUserSchema.safeParse(payload);
      if (!parsed.success) {
        const nextErrors: FormErrors = {};
        for (const issue of parsed.error.issues) {
          const field = String(issue.path[0] ?? "") as keyof FormValues;
          if (field && !nextErrors[field]) nextErrors[field] = issue.message;
        }
        setErrors(
          Object.keys(nextErrors).length
            ? nextErrors
            : { name: "Change at least one field." },
        );
        return;
      }

      mutation.mutate(parsed.data);
      return;
    }

    const parsed = createAdminUserSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] ?? "") as keyof FormValues;
        if (field && !nextErrors[field]) nextErrors[field] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }

    mutation.mutate(parsed.data);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit person" : "Add a person"}
      description={
        isEditing
          ? "Update account details. Leave the password blank to keep the current one."
          : "Create a real account directly in the workspace."
      }
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={mutation.isPending}>
            {isEditing ? "Save changes" : "Create person"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} className="space-y-4">
        <FormField label="Full name" error={errors.name} required>
          <Input
            value={values.name}
            onChange={(event) => updateValue("name", event.target.value)}
            maxLength={80}
            autoComplete="name"
            placeholder="Jamie Rivera"
          />
        </FormField>
        <FormField label="Email address" error={errors.email} required>
          <Input
            type="email"
            value={values.email}
            onChange={(event) => updateValue("email", event.target.value)}
            maxLength={254}
            autoComplete="email"
            placeholder="jamie@example.com"
          />
        </FormField>
        <FormField
          label={isEditing ? "New password" : "Password"}
          error={errors.password}
          hint={isEditing ? "Optional" : "At least 8 characters"}
          required={!isEditing}
        >
          <Input
            type="password"
            value={values.password}
            onChange={(event) => updateValue("password", event.target.value)}
            maxLength={128}
            autoComplete="new-password"
            placeholder={
              isEditing ? "Leave blank to keep current" : "Secure-1234"
            }
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Role" error={errors.role}>
            <CustomSelect
              value={values.role}
              onChange={(value) => updateValue("role", value as Role)}
              options={ROLE_OPTIONS}
              disabled={isSelf}
            />
          </FormField>
          <FormField label="Status" error={errors.status}>
            <CustomSelect
              value={values.status}
              onChange={(value) =>
                updateValue("status", value as FormValues["status"])
              }
              options={statusOptions}
              disabled={isSelf}
            />
          </FormField>
        </div>
        {isSelf ? (
          <p className="rounded-xl bg-stone-50 p-3 text-xs text-stone-500">
            Your own role and status are managed by another administrator.
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
