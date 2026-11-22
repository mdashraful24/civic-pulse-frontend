import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AIAttributionLine } from "@/components/ai/ai-attribution";
import { SemanticSearch } from "@/components/ai/semantic-search";
import type { AIAttribution } from "@/lib/types";

const { searchMock } = vi.hoisted(() => ({ searchMock: vi.fn() }));

vi.mock("@/lib/api", () => ({
  api: { ai: { search: searchMock } },
  getApiErrorMessage: (error: unknown) =>
    error instanceof Error ? error.message : "Something went wrong",
}));

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

const attribution: AIAttribution = {
  provider: "local",
  degraded: false,
  cached: false,
  usage: { usedToday: 2, limit: 100, remaining: 98 },
};

describe("AIAttributionLine", () => {
  it("shows provider and remaining usage", () => {
    render(<AIAttributionLine attribution={attribution} />);

    expect(screen.getByText("local")).toBeInTheDocument();
    expect(
      screen.getByText(/98\/100 AI requests left today/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Fallback used/)).not.toBeInTheDocument();
  });

  it("shows fallback and cached indicators when present", () => {
    render(
      <AIAttributionLine
        attribution={{
          ...attribution,
          provider: "local-fallback",
          degraded: true,
          reason: "timeout",
          cached: true,
        }}
      />,
    );

    expect(screen.getByText(/Fallback used: timeout/)).toBeInTheDocument();
    expect(screen.getByText("Cached result")).toBeInTheDocument();
  });
});

describe("SemanticSearch", () => {
  beforeEach(() => {
    searchMock.mockReset();
  });

  it("submits a trimmed query and renders matching reports", async () => {
    searchMock.mockResolvedValue({
      query: "broken lamp",
      attribution,
      results: [
        {
          id: "issue-1",
          title: "Streetlight is flickering",
          category: "STREETLIGHTS",
          status: "PENDING",
          location: "Oak Avenue",
          similarity: 0.91,
        },
      ],
    });

    render(<SemanticSearch />, { wrapper });

    fireEvent.change(screen.getByLabelText("Describe the problem"), {
      target: { value: "  broken lamp  " },
    });
    fireEvent.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      expect(searchMock).toHaveBeenCalledWith("broken lamp");
    });
    expect(
      await screen.findByText("Streetlight is flickering"),
    ).toBeInTheDocument();
    expect(screen.getByText("91% match")).toBeInTheDocument();
  });

  it("shows an empty state when no reports match", async () => {
    searchMock.mockResolvedValue({
      query: "unknown",
      attribution,
      results: [],
    });

    render(<SemanticSearch />, { wrapper });

    fireEvent.change(screen.getByLabelText("Describe the problem"), {
      target: { value: "unknown" },
    });
    fireEvent.click(screen.getByRole("button", { name: /search/i }));

    expect(
      await screen.findByText("No related reports found"),
    ).toBeInTheDocument();
  });
});
