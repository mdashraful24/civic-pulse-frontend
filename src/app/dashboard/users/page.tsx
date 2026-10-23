"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Camera,
  CheckCircle2,
  FilterX,
  Search,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { RoleGate } from "@/components/dashboard/auth-guard";
import { PageHeader } from "@/components/dashboard/page-header";
import { RoleBadge, UserStatusBadge } from "@/components/issues/issue-badges";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/feedback";
import { FormField, Input, Select } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { PhotoPreviewDialog } from "@/components/ui/photo-preview-dialog";
import { api, getApiErrorMessage } from "@/lib/api";
import {
  IMAGE_ACCEPT,
  ROLE_OPTIONS,
  USER_STATUS_OPTIONS,
} from "@/lib/constants";
import { formatDate, formatNumber, timeAgo } from "@/lib/format";
import { useDebouncedValue, useObjectUrl } from "@/lib/hooks";
import { cachePolicy, invalidateUserCaches } from "@/lib/query-cache";
import type { AdminUser, Role, UserStatus } from "@/lib/types";
import { validateImageFile } from "@/lib/validation";

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser, setUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoTargetRef = useRef<AdminUser | null>(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const [page, setPage] = useState(1);
  const [removing, setRemoving] = useState<AdminUser | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<{
    user: AdminUser;
    file: File;
  } | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const query = useQuery({
    queryKey: ["admin-users", { debouncedSearch, role, status, page }],
    queryFn: () =>
      api.admin.users({
        search: debouncedSearch || undefined,
        role: role || undefined,
        status: status || undefined,
        page,
        limit: PAGE_SIZE,
      }),
    placeholderData: keepPreviousData,
    ...cachePolicy.list,
  });

  const invalidate = () => {
    invalidateUserCaches(queryClient);
  };

  const imageMutation = useMutation({
    mutationFn: ({ user, file }: { user: AdminUser; file: File }) =>
      api.admin.updateUserImage(user.id, file),
    onSuccess: (response, variables) => {
      if (
        currentUser &&
        currentUser.id === variables.user.id &&
        response.data
      ) {
        setUser({ ...currentUser, imageUrl: response.data.imageUrl });
      }
      toast.success("User photo updated.");
      invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const removeMutation = useMutation({
    mutationFn: (user: AdminUser) => api.admin.removeUserImage(user.id),
    onSuccess: (_, user) => {
      if (currentUser && currentUser.id === user.id) {
        setUser({ ...currentUser, imageUrl: null });
      }
      toast.success("User photo removed.");
      setRemoving(null);
      invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const users = query.data?.items ?? [];
  const meta = query.data?.meta;
  const hasFilters = Boolean(search || role || status);
  const pendingPreview = useObjectUrl(pendingPhoto?.file ?? null);

  const openPhotoPicker = (user: AdminUser) => {
    photoTargetRef.current = user;
    if (fileInputRef.current) fileInputRef.current.value = "";
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (file: File | null) => {
    const user = photoTargetRef.current;
    if (!file || !user) return;
    const message = validateImageFile(file);
    if (message) {
      photoTargetRef.current = null;
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.error(message);
      return;
    }
    setPendingPhoto({ user, file });
    photoTargetRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadPhoto = () => {
    if (!pendingPhoto) return;
    imageMutation.mutate(
      { user: pendingPhoto.user, file: pendingPhoto.file },
      {
        onSuccess: () => setPendingPhoto(null),
        onSettled: () => {
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
      },
    );
  };

  const cancelPhoto = () => {
    if (imageMutation.isPending) return;
    setPendingPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetFilters = () => {
    setSearch("");
    setRole("");
    setStatus("");
    setPage(1);
  };

  return (
    <RoleGate allow={["ADMIN"]}>
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader
          eyebrow="People directory"
          title="The people behind the work."
          description="Search everyone in the workspace, check their activity and manage profile photos."
        />

        <div className="mb-5 rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-[1.6fr_1fr_1fr_auto] sm:items-end">
            <FormField label="Search people">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Name or email…"
                  className="pl-10"
                  maxLength={120}
                />
              </div>
            </FormField>
            <FormField label="Role">
              <Select
                value={role}
                onChange={(event) => {
                  setRole(event.target.value as Role | "");
                  setPage(1);
                }}
              >
                <option value="">Any role</option>
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Status">
              <Select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as UserStatus | "");
                  setPage(1);
                }}
              >
                <option value="">Any status</option>
                {USER_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <Button
              variant="outline"
              size="icon"
              disabled={!hasFilters}
              onClick={resetFilters}
              title="Reset filters"
              aria-label="Reset filters"
            >
              <FilterX className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {query.isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            <p className="font-semibold">
              The people directory could not load.
            </p>
            <p className="mt-1">{getApiErrorMessage(query.error)}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 bg-surface"
              onClick={() => query.refetch()}
            >
              Try again
            </Button>
          </div>
        ) : query.isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : users.length > 0 ? (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-line bg-surface shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-line bg-stone-50/80 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
                    <tr>
                      <th className="px-5 py-3">Person</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Activity</th>
                      <th className="px-4 py-3">Joined</th>
                      <th className="px-5 py-3 text-right">Photo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/70">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-stone-50/50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={user.name}
                              src={user.imageUrl}
                              size="sm"
                            />
                            <div className="min-w-0">
                              <p className="flex items-center gap-1.5 truncate font-semibold text-ink">
                                {user.name}
                                {user.emailVerified ? (
                                  <CheckCircle2
                                    className="h-3.5 w-3.5 shrink-0 text-brand"
                                    aria-label="Email verified"
                                  />
                                ) : null}
                              </p>
                              <p className="truncate text-[11px] text-stone-500">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="px-4 py-3">
                          <UserStatusBadge status={user.status} />
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-stone-600">
                            {formatNumber(user._count.reportedIssues)} reported
                          </p>
                          <p className="text-[11px] text-stone-400">
                            {formatNumber(user._count.assignedIssues)} assigned
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-stone-600">
                            {formatDate(user.createdAt)}
                          </p>
                          <p className="text-[11px] text-stone-400">
                            {user.lastLoginAt
                              ? `Last seen ${timeAgo(user.lastLoginAt)}`
                              : "Never signed in"}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              loading={
                                imageMutation.isPending &&
                                imageMutation.variables?.user.id === user.id
                              }
                              onClick={() => openPhotoPicker(user)}
                            >
                              <Camera className="h-3.5 w-3.5" />
                              {user.imageUrl ? "Replace" : "Add"}
                            </Button>
                            {user.imageUrl ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                onClick={() => setRemoving(user)}
                                aria-label={`Remove ${user.name}'s photo`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3 md:hidden">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="rounded-2xl border border-line bg-surface p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <Avatar name={user.name} src={user.imageUrl} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-stone-500">
                        {user.email}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <RoleBadge role={user.role} />
                        <UserStatusBadge status={user.status} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3 text-[11px] text-stone-500">
                    <span>
                      {formatNumber(user._count.reportedIssues)} reported ·{" "}
                      {formatNumber(user._count.assignedIssues)} assigned
                    </span>
                    <span>Joined {formatDate(user.createdAt)}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      loading={
                        imageMutation.isPending &&
                        imageMutation.variables?.user.id === user.id
                      }
                      onClick={() => openPhotoPicker(user)}
                    >
                      <Camera className="h-3.5 w-3.5" />
                      {user.imageUrl ? "Replace photo" : "Add photo"}
                    </Button>
                    {user.imageUrl ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        onClick={() => setRemoving(user)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-stone-500">
                {formatNumber(meta?.total ?? 0)} people
                {meta && meta.totalPages > 1
                  ? ` · page ${meta.page} of ${meta.totalPages}`
                  : ""}
              </p>
              {meta && meta.totalPages > 1 ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= meta.totalPages}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next
                  </Button>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <EmptyState
            icon={<Users className="h-5 w-5" />}
            title="No people match those filters"
            description="Try a different search or clear the role and status filters."
            action={
              hasFilters ? (
                <Button variant="outline" onClick={resetFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          className="hidden"
          onChange={(event) =>
            handlePhotoChange(event.target.files?.[0] ?? null)
          }
        />

        <Modal
          open={Boolean(removing)}
          onClose={() => setRemoving(null)}
          title="Remove this profile photo?"
          description="The person's initials will be shown instead. You can upload a new photo at any time."
          size="sm"
          footer={
            <>
              <Button variant="ghost" onClick={() => setRemoving(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={removeMutation.isPending}
                onClick={() => {
                  if (removing) removeMutation.mutate(removing);
                }}
              >
                Remove photo
              </Button>
            </>
          }
        >
          {removing ? (
            <div className="flex items-center gap-3 rounded-xl bg-stone-50 p-4">
              <Avatar name={removing.name} src={removing.imageUrl} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {removing.name}
                </p>
                <p className="truncate text-xs text-stone-500">
                  {removing.email}
                </p>
              </div>
            </div>
          ) : null}
        </Modal>

        <div className="mt-6 flex items-start gap-2 rounded-xl border border-line bg-surface/60 px-4 py-3 text-xs text-stone-500">
          <UserRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
          <p>
            Profile photos are public on issues a person reports or works on.
            Only an administrator can replace or remove them from this
            directory.
          </p>
        </div>
      </div>

      <PhotoPreviewDialog
        open={Boolean(pendingPhoto)}
        title="Update profile photo"
        description={
          pendingPhoto
            ? `Preview the new photo for ${pendingPhoto.user.name}.`
            : undefined
        }
        previewUrl={pendingPreview}
        fileName={pendingPhoto?.file.name}
        uploading={imageMutation.isPending}
        onCancel={cancelPhoto}
        onUpload={uploadPhoto}
      />
    </RoleGate>
  );
}
