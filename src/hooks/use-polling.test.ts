import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { renderHook, waitFor } from "@testing-library/react";
import { usePolling } from "./use-polling";

describe("usePolling", () => {
  beforeEach(() => {
    mock.restore();
  });

  afterEach(() => {
    mock.restore();
  });

  it("returns loading state initially when enabled", () => {
    const fetchFn = mock(() => new Promise<{ status: string }>(() => {}));
    const { result } = renderHook(() =>
      usePolling({
        fetchFn,
        isDone: (d: { status: string }) => d.status === "done",
      }),
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("sets data when fetch completes and isDone returns true", async () => {
    const fetchFn = mock(() => Promise.resolve({ value: 42, status: "done" }));
    const { result } = renderHook(() =>
      usePolling({
        fetchFn,
        isDone: (d: { status: string }) => d.status === "done",
        interval: 50,
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(fetchFn).toHaveBeenCalled();
    expect(result.current.data).toEqual({ value: 42, status: "done" });
  });

  it("continues polling when isDone returns false", async () => {
    let callCount = 0;
    const fetchFn = mock(() => {
      callCount++;
      if (callCount >= 2) {
        return Promise.resolve({ status: "done" });
      }
      return Promise.resolve({ status: "processing" });
    });

    const { result } = renderHook(() =>
      usePolling({
        fetchFn,
        isDone: (d: { status: string }) => d.status === "done",
        interval: 50,
      }),
    );

    await waitFor(() => {
      expect(result.current.data?.status).toBe("done");
    });

    expect(callCount).toBeGreaterThanOrEqual(2);
  });

  it("does not poll when enabled is false", async () => {
    const fetchFn = mock(() => Promise.resolve({ status: "done" }));
    renderHook(() =>
      usePolling({
        fetchFn,
        isDone: (d: { status: string }) => d.status === "done",
        enabled: false,
      }),
    );

    await new Promise((r) => setTimeout(r, 100));

    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("handles errors", async () => {
    const fetchFn = mock(() => Promise.reject(new Error("network error")));
    const { result } = renderHook(() =>
      usePolling({
        fetchFn,
        isDone: (d: { status: string }) => d.status === "done",
        interval: 50,
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("network error");
  });
});
