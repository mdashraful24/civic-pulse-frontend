"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { Modal } from "@/components/ui/modal";
import { api, getApiErrorMessage } from "@/lib/api";
import { ROLE_OPTIONS } from "@/lib/constants";
import type { AdminUser, Role } from "@/lib/types";

type PendingAction = "delete" | "reset" | "sessions";

export function AdminUserControls({ user }: { user: AdminUser }) {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [role, setRole] = useState<Role>(user.role);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );
  const [temporaryPassword, setTemporaryPassword] = useState("");

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-activity"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
  };

  const roleMutation = useMutation({
    mutationFn: (nextRole: Role) => api.admin.changeUserRole(user.id, nextRole),
    onSuccess: () => {
      toast.success(`${user.name} is now ${role.toLowerCase()}.`);
      invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const statusMutation = useMutation({
    mutationFn: (status: "ACTIVE" | "BLOCKED") =>
      api.admin.changeUserStatus(user.id, status),
    onSuccess: (_data, status) => {
      toast.success(
        status === "BLOCKED"
          ? `${user.name} was blocked.`
          : `${user.name} was unblocked.`,
      );
      invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.admin.deleteUser(user.id),
    onSuccess: () => {
      toast.success(`${user.name} was deleted.`);
      setPendingAction(null);
      invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const resetMutation = useMutation({
    mutationFn: () => api.admin.resetUserPassword(user.id),
    onSuccess: (result) => {
      setTemporaryPassword(result.temporaryPassword);
      toast.success("Temporary password generated.");
      invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const sessionsMutation = useMutation({
    mutationFn: () => api.admin.terminateUserSessions(user.id),
    onSuccess: () => {
      toast.success(`${user.name}'s sessions were terminated.`);
      setPendingAction(null);
      invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  if (currentUser?.id === user.id) {
    return <span className="text-[11px] text-stone-400">You</span>;
  }

  const busy =
    roleMutation.isPending ||
    statusMutation.isPending ||
    deleteMutation.isPending ||
    resetMutation.isPending ||
    sessionsMutation.isPending;

  return (
    <>
      <details className="relative">
        <summary
          className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100 hover:text-ink [&::-webkit-details-marker]:hidden"
          aria-label={`Account controls for ${user.name}`}
        >
          <MoreHorizontal className="h-4 w-4" />
        </summary>
        <div className="absolute right-0 z-20 mt-2 w-60 space-y-3 rounded-xl border border-line bg-surface p-3 shadow-xl">
          <CustomSelect
            ariaLabel={`Role for ${user.name}`}
            value={role}
            onChange={(value) => setRole(value as Role)}
            options={ROLE_OPTIONS}
            disabled={busy}
          />
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            loading={roleMutation.isPending}
            disabled={role === user.role || busy}
            onClick={() => roleMutation.mutate(role)}
          >
            Save role
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            loading={statusMutation.isPending}
            disabled={busy}
            onClick={() =>
              statusMutation.mutate(
                user.status === "BLOCKED" ? "ACTIVE" : "BLOCKED",
              )
            }
          >
            {user.status === "BLOCKED" ? "Unblock account" : "Block account"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            disabled={busy}
            onClick={() => {
              setTemporaryPassword("");
              setPendingAction("reset");
            }}
          >
            Reset password
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            disabled={busy}
            onClick={() => setPendingAction("sessions")}
          >
            Terminate sessions
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            disabled={busy}
            onClick={() => setPendingAction("delete")}
          >
            Delete account
          </Button>
        </div>
      </details>

      <Modal
        open={pendingAction !== null}
        onClose={() => setPendingAction(null)}
        title={
          pendingAction === "delete"
            ? "Delete account"
            : pendingAction === "reset"
              ? "Reset password"
              : "Terminate sessions"
        }
        description={`This action applies to ${user.name}.`}
        size="sm"
        footer={
          pendingAction === "reset" && temporaryPassword ? (
            <Button onClick={() => setPendingAction(null)}>Done</Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => setPendingAction(null)}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button
                variant={pendingAction === "delete" ? "danger" : "primary"}
                loading={
                  pendingAction === "delete"
                    ? deleteMutation.isPending
                    : pendingAction === "reset"
                      ? resetMutation.isPending
                      : sessionsMutation.isPending
                }
                onClick={() => {
                  if (pendingAction === "delete") deleteMutation.mutate();
                  if (pendingAction === "reset") resetMutation.mutate();
                  if (pendingAction === "sessions") sessionsMutation.mutate();
                }}
              >
                Confirm
              </Button>
            </>
          )
        }
      >
        {pendingAction === "delete" ? (
          <p className="text-sm leading-6 text-stone-600">
            The account will be marked deleted and all active sessions revoked.
            This cannot be undone from this screen.
          </p>
        ) : null}
        {pendingAction === "sessions" ? (
          <p className="text-sm leading-6 text-stone-600">
            The user will be signed out on every device and asked to sign in
            again.
          </p>
        ) : null}
        {pendingAction === "reset" ? (
          temporaryPassword ? (
            <div className="space-y-2">
              <p className="text-sm text-stone-600">
                Copy this temporary password now. It will not be shown again.
              </p>
              <code className="block break-all rounded-xl bg-stone-100 p-3 text-sm font-semibold text-ink">
                {temporaryPassword}
              </code>
            </div>
          ) : (
            <p className="text-sm leading-6 text-stone-600">
              A temporary password will replace the current one and sign the
              user out everywhere.
            </p>
          )
        ) : null}
      </Modal>
    </>
  );
}
