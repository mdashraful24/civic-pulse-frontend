import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminUserForm } from "@/components/dashboard/admin-user-form";
import type { AdminUser } from "@/lib/types";

const mocks = vi.hoisted(() => ({
  createUser: vi.fn(),
  updateUser: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  onClose: vi.fn(),
  onSaved: vi.fn(),
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
      createUser: mocks.createUser,
      updateUser: mocks.updateUser,
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

describe("AdminUserForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createUser.mockResolvedValue(user);
    mocks.updateUser.mockResolvedValue(user);
  });

  it("creates a user with validated values", async () => {
    render(
      <AdminUserForm open onClose={mocks.onClose} onSaved={mocks.onSaved} />,
      { wrapper },
    );

    fireEvent.change(screen.getByLabelText(/Full name/), {
      target: { value: "Avery Stone" },
    });
    fireEvent.change(screen.getByLabelText(/Email address/), {
      target: { value: "avery@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/), {
      target: { value: "Secure-1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create person" }));

    await waitFor(() =>
      expect(mocks.createUser).toHaveBeenCalledWith({
        name: "Avery Stone",
        email: "avery@example.com",
        password: "Secure-1234",
        role: "CITIZEN",
        status: "ACTIVE",
      }),
    );
    expect(mocks.onSaved).toHaveBeenCalled();
  });

  it("sends only changed fields when editing", async () => {
    render(
      <AdminUserForm
        open
        user={user}
        onClose={mocks.onClose}
        onSaved={mocks.onSaved}
      />,
      { wrapper },
    );

    fireEvent.change(screen.getByLabelText(/Full name/), {
      target: { value: "Maya Updated" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() =>
      expect(mocks.updateUser).toHaveBeenCalledWith("user-1", {
        name: "Maya Updated",
      }),
    );
  });
});
