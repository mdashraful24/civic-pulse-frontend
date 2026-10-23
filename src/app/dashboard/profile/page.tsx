"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Mail,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { RoleBadge, UserStatusBadge } from "@/components/issues/issue-badges";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/feedback";
import { FormField, Input } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { PhotoPreviewDialog } from "@/components/ui/photo-preview-dialog";
import { api, getApiErrorMessage } from "@/lib/api";
import { IMAGE_ACCEPT, roleLabels } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { useObjectUrl } from "@/lib/hooks";
import { changePasswordSchema, validateImageFile } from "@/lib/validation";

type PasswordErrors = {
  newPassword?: string;
  confirmPassword?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, setUser, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [removePhotoOpen, setRemovePhotoOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [formError, setFormError] = useState("");
  const [changing, setChanging] = useState(false);
  const photoPreview = useObjectUrl(pendingPhoto);

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-4xl py-12">
        <PageLoader label="Loading profile..." />
      </div>
    );
  }

  const invalidatePhotoCaches = () => {
    void queryClient.invalidateQueries({ queryKey: ["issue"] });
    void queryClient.invalidateQueries({ queryKey: ["public-issues"] });
    void queryClient.invalidateQueries({ queryKey: ["my-issues"] });
    void queryClient.invalidateQueries({ queryKey: ["assigned-issues"] });
  };

  const handlePhoto = (file: File | null) => {
    if (!file) return;
    const message = validateImageFile(file);
    if (message) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.error(message);
      return;
    }

    setPendingPhoto(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadPhoto = async () => {
    if (!pendingPhoto) return;

    setUploading(true);
    try {
      const response = await api.auth.updateProfileImage(pendingPhoto);
      if (response.data) setUser(response.data);
      invalidatePhotoCaches();
      setPendingPhoto(null);
      toast.success("Profile photo updated.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  const cancelPhoto = () => {
    if (uploading) return;
    setPendingPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = async () => {
    setRemovingPhoto(true);
    try {
      const response = await api.auth.removeProfileImage();
      if (response.data) setUser(response.data);
      invalidatePhotoCaches();
      setRemovePhotoOpen(false);
      toast.success("Profile photo removed.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setRemovingPhoto(false);
    }
  };

  const submitPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setFormError("");

    const parsed = changePasswordSchema.safeParse({ newPassword });
    if (!parsed.success) {
      const next: PasswordErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !next[key as keyof PasswordErrors]) {
          next[key as keyof PasswordErrors] = issue.message;
        }
      }
      setErrors(next);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match." });
      return;
    }

    setChanging(true);
    try {
      await api.auth.changePassword(parsed.data);
      setUser(null);
      toast.success("Password changed. Sign in again with your new password.");
      router.push("/login");
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    } finally {
      setChanging(false);
    }
  };

  const handleLogout = async () => {
    setLogoutPending(true);
    await logout();
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        eyebrow="Account"
        title="Profile & security."
        description="Keep your public profile current and protect the account connected to your reports."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div className="space-y-5">
          <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
            <div className="h-20 bg-[radial-gradient(circle_at_20%_20%,#d5e8dd,transparent_45%),radial-gradient(circle_at_85%_80%,#f5dfb4,transparent_50%)]" />
            <div className="px-5 pb-5">
              <div className="-mt-14 flex flex-wrap items-end justify-between gap-4">
                <Avatar
                  name={user.name}
                  src={user.imageUrl}
                  size="xl"
                  className="border-4 border-white shadow-md"
                />
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || removingPhoto}
                  >
                    <Camera className="h-3.5 w-3.5" />
                    {user.imageUrl ? "Change photo" : "Add photo"}
                  </Button>
                  {user.imageUrl ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      onClick={() => setRemovePhotoOpen(true)}
                      disabled={
                        uploading || removingPhoto || Boolean(pendingPhoto)
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </Button>
                  ) : null}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={IMAGE_ACCEPT}
                  className="hidden"
                  onChange={(event) =>
                    handlePhoto(event.target.files?.[0] ?? null)
                  }
                />
              </div>

              <div className="mt-3">
                <h2 className="text-xl font-bold tracking-tight text-ink">
                  {user.name}
                </h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-stone-500">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <RoleBadge role={user.role} />
                  <UserStatusBadge status={user.status} />
                  {user.emailVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-brand ring-1 ring-inset ring-brand/15">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-xs leading-5 text-stone-500">
                  Your photo and name appear on issues you report or work on.
                  Your email is never shown publicly.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-brand" />
              <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-stone-500">
                Account details
              </h2>
            </div>
            <dl className="mt-4 divide-y divide-line/70">
              <DetailRow label="Full name" value={user.name} />
              <DetailRow label="Email address" value={user.email} />
              <DetailRow label="Role" value={roleLabels[user.role]} />
              <DetailRow
                label="Member since"
                value={formatDateTime(user.createdAt)}
              />
              <DetailRow
                label="Last sign-in"
                value={
                  user.lastLoginAt
                    ? formatDateTime(user.lastLoginAt)
                    : "This is your first session"
                }
              />
            </dl>
          </section>

          {/* <section className="rounded-2xl border border-line bg-[#fbfaf6] p-5">
            <div className="flex items-center gap-2">
              <LogOut className="h-4 w-4 text-stone-500" />
              <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-stone-500">
                Session
              </h2>
            </div>
            <p className="mt-2 text-xs leading-5 text-stone-500">
              Signing out clears the secure cookie session on this device. Your
              reports stay exactly where they are.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 bg-white text-rose-600 hover:border-rose-200 hover:bg-rose-50"
              loading={logoutPending}
              onClick={() => void handleLogout()}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Button>
          </section> */}
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-brand" />
              <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-stone-500">
                Change password
              </h2>
            </div>
            <p className="mt-2 text-xs leading-5 text-stone-500">
              Use at least 8 characters with one letter and one number. Changing
              your password signs you out of all devices.
            </p>

            <form className="mt-4 grid gap-4" onSubmit={submitPassword}>
              <FormField
                label="New password"
                htmlFor="newPassword"
                hint="8+ characters, 1 letter, 1 number"
                error={errors.newPassword}
                required
              >
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords ? "text" : "password"}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Choose a new password"
                    className="pr-11"
                    maxLength={128}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((current) => !current)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-stone-400 transition hover:bg-stone-100 hover:text-ink"
                    aria-label={
                      showPasswords ? "Hide passwords" : "Show passwords"
                    }
                  >
                    {showPasswords ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormField>

              <FormField
                label="Confirm new password"
                htmlFor="confirmPassword"
                error={errors.confirmPassword}
                required
              >
                <Input
                  id="confirmPassword"
                  type={showPasswords ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat the new password"
                  maxLength={128}
                />
              </FormField>

              {formError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
                  {formError}
                </div>
              ) : null}

              <Button type="submit" loading={changing} className="w-full mt-3">
                <ShieldCheck className="h-4 w-4" />
                Update password
              </Button>
            </form>
          </section>

          <section className="rounded-2xl border border-brand/15 bg-brand-soft/60 p-5">
            <div className="flex items-center gap-2 text-brand">
              <ShieldCheck className="h-4 w-4" />
              <p className="text-sm font-bold">How your account stays safe</p>
            </div>
            <ul className="mt-3 space-y-2.5 text-xs leading-5 text-stone-600">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                Sessions use httpOnly cookies, never browser storage.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                Refreshing a session never exposes your tokens to page scripts.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                Changing your password revokes every existing session.
              </li>
            </ul>
          </section>
        </div>
      </div>

      <PhotoPreviewDialog
        open={Boolean(pendingPhoto)}
        title="Upload profile photo"
        description="Preview your new profile photo before uploading it."
        previewUrl={photoPreview}
        fileName={pendingPhoto?.name}
        uploading={uploading}
        onCancel={cancelPhoto}
        onUpload={() => void uploadPhoto()}
      />

      <Modal
        open={removePhotoOpen}
        onClose={() => {
          if (!removingPhoto) setRemovePhotoOpen(false);
        }}
        title="Remove profile photo?"
        description="Your initials will be shown instead. You can upload a new photo at any time."
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setRemovePhotoOpen(false)}
              disabled={removingPhoto}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={removingPhoto}
              onClick={() => void removePhoto()}
            >
              Remove photo
            </Button>
          </>
        }
      >
        <p className="text-sm leading-6 text-stone-600">
          This removes the photo from your profile and deletes the uploaded
          image.
        </p>
      </Modal>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <dt className="text-xs font-medium text-stone-500">{label}</dt>
      <dd className="max-w-[60%] text-right text-sm font-medium text-ink">
        {value}
      </dd>
    </div>
  );
}
