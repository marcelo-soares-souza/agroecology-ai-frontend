import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { renderHook, act } from "@testing-library/react";
import { usePolling } from "./use-polling";

describe("usePolling", () => {
  beforeEach(() => {
    mock.restore();
  });

  afterEach(() => {
    mock.restore();
  });

  it("returns loading state initially when enabled", async () => {
    const fetchFn = mock(() => Promise.resolve({ status: "done" }));
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
      }),
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(fetchFn).toHaveBeenCalled();
    expect(result.current.data).toEqual({ value: 42, status: "done" });
    expect(result.current.loading).toBe(false);
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

    await act(async () => {
      await new Promise((r) => setTimeout(r, 200));
    });

    expect(callCount).toBeGreaterThanOrEqual(2);
    expect(result.current.data?.status).toBe("done");
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

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("handles errors", async () => {
    const fetchFn = mock(() => Promise.reject(new Error("network error")));
    const { result } = renderHook(() =>
      usePolling({
        fetchFn,
        isDone: (d: { status: string }) => d.status === "done",
      }),
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(result.current.error).toBe("network error");
    expect(result.current.loading).toBe(false);
  });
});
