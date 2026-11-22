import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminUserControls } from "@/components/dashboard/admin-user-controls";
import type { AdminUser } from "@/lib/types";

const mocks = vi.hoisted(() => ({
  changeUserRole: vi.fn(),
  changeUserStatus: vi.fn(),
  deleteUser: vi.fn(),
  resetUserPassword: vi.fn(),
  terminateUserSessions: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock("@/components/auth-provider", () => ({
  useAuth: () => ({ user: { id: "admin-1" } }),
}));

vi.mock("sonner", () => ({
  toast: { success: mocks.success, error: mocks.error },
}));

vi.mock("@/lib/api", () => ({
  api: {
    admin: {
      changeUserRole: mocks.changeUserRole,
      changeUserStatus: mocks.changeUserStatus,
      deleteUser: mocks.deleteUser,
      resetUserPassword: mocks.resetUserPassword,
      terminateUserSessions: mocks.terminateUserSessions,
    },
  },
  getApiErrorMessage: (error: unknown) =>
    error instanceof Error ? error.message : "Something went wrong",
}));

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { mutations: { retry: false } } })
      }
    >
      {children}
    </QueryClientProvider>
  );
}

const user: AdminUser = {
  id: "user-1",
  name: "Maya Patel",
  email: "maya@example.com",
  imageUrl: null,
  role: "CITIZEN",
  status: "ACTIVE",
  emailVerified: true,
  lastLoginAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  _count: { reportedIssues: 2, assignedIssues: 0 },
};

describe("AdminUserControls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.changeUserStatus.mockResolvedValue({ success: true, message: "ok" });
    mocks.resetUserPassword.mockResolvedValue({
      success: true,
      message: "ok",
      temporaryPassword: "Temp-123",
    });
  });

  it("does not offer controls for the signed-in admin", () => {
    render(<AdminUserControls user={{ ...user, id: "admin-1" }} />, {
      wrapper,
    });

    expect(screen.getByText("You")).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Account controls for Maya Patel"),
    ).not.toBeInTheDocument();
  });

  it("blocks another account", async () => {
    render(<AdminUserControls user={user} />, { wrapper });

    fireEvent.click(screen.getByLabelText("Account controls for Maya Patel"));
    fireEvent.click(screen.getByRole("button", { name: "Block account" }));

    await waitFor(() => {
      expect(mocks.changeUserStatus).toHaveBeenCalledWith("user-1", "BLOCKED");
    });
  });

  it("shows a generated temporary password", async () => {
    render(<AdminUserControls user={user} />, { wrapper });

    fireEvent.click(screen.getByLabelText("Account controls for Maya Patel"));
    fireEvent.click(screen.getByRole("button", { name: "Reset password" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    expect(await screen.findByText("Temp-123")).toBeInTheDocument();
    expect(mocks.resetUserPassword).toHaveBeenCalledWith("user-1");
  });
});
