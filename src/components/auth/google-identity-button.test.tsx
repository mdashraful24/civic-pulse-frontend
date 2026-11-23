import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleIdentityButton } from "@/components/auth/google-identity-button";

const mocks = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  renderOptions: vi.fn(),
}));

vi.mock("@react-oauth/google", () => ({
  GoogleLogin: ({
    onSuccess,
    onError,
    theme,
    shape,
    logo_alignment,
    width,
  }: {
    onSuccess: (response: { credential?: string }) => void;
    onError: () => void;
    theme: string;
    shape: string;
    logo_alignment: string;
    width: number;
  }) => {
    mocks.renderOptions({ theme, shape, logo_alignment, width });
    return (
      <>
        <button
          type="button"
          onClick={() => onSuccess({ credential: "id-token" })}
        >
          Google success
        </button>
        <button type="button" onClick={() => onSuccess({})}>
          Google missing credential
        </button>
        <button type="button" onClick={onError}>
          Google error
        </button>
      </>
    );
  },
}));

describe("GoogleIdentityButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.success.mockResolvedValue(undefined);
  });

  it("uses approved rectangular Google styling", () => {
    render(
      <GoogleIdentityButton onSuccess={mocks.success} onError={mocks.error} />,
    );

    expect(mocks.renderOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: "outline",
        shape: "rectangular",
        logo_alignment: "left",
        width: 320,
      }),
    );
  });

  it("sends the Google credential to the success handler", async () => {
    render(
      <GoogleIdentityButton onSuccess={mocks.success} onError={mocks.error} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Google success" }));

    await waitFor(() => expect(mocks.success).toHaveBeenCalledWith("id-token"));
  });

  it("reports a missing credential", () => {
    render(
      <GoogleIdentityButton onSuccess={mocks.success} onError={mocks.error} />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Google missing credential" }),
    );

    expect(mocks.error).toHaveBeenCalled();
    expect(mocks.success).not.toHaveBeenCalled();
  });

  it("reports Google SDK failures", () => {
    render(
      <GoogleIdentityButton onSuccess={mocks.success} onError={mocks.error} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Google error" }));

    expect(mocks.error).toHaveBeenCalled();
  });
});
