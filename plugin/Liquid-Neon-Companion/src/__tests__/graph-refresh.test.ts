import { describe, it, expect, vi } from "vitest";
import {
  createDebouncedAction,
  DEFAULT_GRAPH_REFRESH_OPTIONS,
  isStyleSettingsCssChange,
  mutationTouchesGraphColorVariables,
  refreshOpenGraphLeaves,
} from "../graph-refresh";

describe("graph refresh settings defaults", () => {
  it("enables automatic graph refresh and notices by default", () => {
    expect(DEFAULT_GRAPH_REFRESH_OPTIONS.autoRefreshGraphOnColorChange).toBe(true);
    expect(DEFAULT_GRAPH_REFRESH_OPTIONS.showGraphRefreshNotice).toBe(true);
  });
});

describe("Style Settings change detection", () => {
  it("recognizes css-change events emitted by Style Settings", () => {
    expect(isStyleSettingsCssChange({ source: "style-settings" })).toBe(true);
    expect(isStyleSettingsCssChange({ source: "theme" })).toBe(false);
    expect(isStyleSettingsCssChange(undefined)).toBe(false);
  });

  it("recognizes body style mutations touching graph CSS variables", () => {
    const body = {
      nodeName: "BODY",
      getAttribute: () => "--graph-node: #00f0ff; --ln-bg-opacity: 1;",
    };
    const records = [
      {
        type: "attributes",
        attributeName: "style",
        oldValue: "--graph-node: #9b5fff;",
        target: body,
      } as unknown as MutationRecord,
    ];

    expect(mutationTouchesGraphColorVariables(records)).toBe(true);
    expect(mutationTouchesGraphColorVariables([])).toBe(false);
  });
});

describe("createDebouncedAction", () => {
  it("runs once 300ms after the final trigger", () => {
    vi.useFakeTimers();
    try {
      const action = vi.fn();
      const debounced = createDebouncedAction(action, 300);

      debounced.trigger();
      vi.advanceTimersByTime(250);
      debounced.trigger();
      vi.advanceTimersByTime(299);
      expect(action).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(action).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("refreshOpenGraphLeaves", () => {
  it("is a no-op when no graph leaves are open", async () => {
    const Notice = vi.fn();
    const app = {
      workspace: {
        getLeavesOfType: vi.fn(() => []),
      },
    };

    const result = await refreshOpenGraphLeaves(app, DEFAULT_GRAPH_REFRESH_OPTIONS, Notice);

    expect(result.refreshed).toBe(0);
    expect(result.reopened).toBe(0);
    expect(Notice).not.toHaveBeenCalled();
  });

  it("uses an accessible non-destructive refresh method before reopening", async () => {
    const Notice = vi.fn();
    const render = vi.fn();
    const setViewState = vi.fn();
    const app = {
      workspace: {
        getLeavesOfType: vi.fn(() => [
          {
            view: { renderer: { render } },
            getViewState: vi.fn(() => ({ type: "graph", state: { pinned: true } })),
            setViewState,
          },
        ]),
      },
    };

    const result = await refreshOpenGraphLeaves(app, DEFAULT_GRAPH_REFRESH_OPTIONS, Notice);

    expect(render).toHaveBeenCalledTimes(1);
    expect(setViewState).not.toHaveBeenCalled();
    expect(result.refreshed).toBe(1);
    expect(result.reopened).toBe(0);
    expect(Notice).toHaveBeenCalledWith("Liquid Neon: graph colors updated", 2000);
  });

  it("falls back to reopening the graph leaf when no refresh API is accessible", async () => {
    const setViewState = vi.fn().mockResolvedValue(undefined);
    const app = {
      workspace: {
        getLeavesOfType: vi.fn(() => [
          {
            view: {},
            getViewState: vi.fn(() => ({ type: "graph", state: { local: true } })),
            setViewState,
          },
        ]),
      },
    };

    const result = await refreshOpenGraphLeaves(app, { ...DEFAULT_GRAPH_REFRESH_OPTIONS, showGraphRefreshNotice: false });

    expect(setViewState).toHaveBeenNthCalledWith(1, { type: "empty", state: {}, active: false });
    expect(setViewState).toHaveBeenNthCalledWith(2, { type: "graph", state: { local: true } });
    expect(result.refreshed).toBe(0);
    expect(result.reopened).toBe(1);
  });
});
