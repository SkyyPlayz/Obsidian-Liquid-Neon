export interface GraphRefreshOptions {
  autoRefreshGraphOnColorChange: boolean;
  showGraphRefreshNotice: boolean;
}

export interface GraphRefreshResult {
  refreshed: number;
  reopened: number;
}

export const GRAPH_REFRESH_DEBOUNCE_MS = 300;

export const DEFAULT_GRAPH_REFRESH_OPTIONS: GraphRefreshOptions = {
  autoRefreshGraphOnColorChange: true,
  showGraphRefreshNotice: true,
};

type TimerHandle = ReturnType<typeof setTimeout>;

type NoticeConstructor = new (message: string, timeout?: number) => unknown;

type UnknownRecord = Record<string, unknown>;

const GRAPH_CSS_VARIABLE_PATTERN = /--graph-(?:node|line|text|arrow|unresolved|tag|attachment)/i;

export function isStyleSettingsCssChange(data: unknown): boolean {
  return typeof data === "object" && data !== null && (data as UnknownRecord).source === "style-settings";
}

export function mutationTouchesGraphColorVariables(records: MutationRecord[]): boolean {
  return records.some((record) => {
    if (record.type !== "attributes" || record.attributeName !== "style") return false;
    const target = record.target as Element | null;
    if (!target || target.nodeName !== "BODY") return false;

    const oldStyle = record.oldValue ?? "";
    const currentStyle = target.getAttribute("style") ?? "";
    return GRAPH_CSS_VARIABLE_PATTERN.test(oldStyle) || GRAPH_CSS_VARIABLE_PATTERN.test(currentStyle);
  });
}

export function createDebouncedAction(action: () => void | Promise<void>, waitMs = GRAPH_REFRESH_DEBOUNCE_MS) {
  let timer: TimerHandle | null = null;

  return {
    trigger(): void {
      if (timer !== null) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        void action();
      }, waitMs);
    },

    cancel(): void {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    },

    isPending(): boolean {
      return timer !== null;
    },
  };
}

export async function refreshOpenGraphLeaves(
  app: unknown,
  options: Pick<GraphRefreshOptions, "showGraphRefreshNotice">,
  NoticeCtor?: NoticeConstructor
): Promise<GraphRefreshResult> {
  const workspace = getObject(app).workspace;
  const getLeavesOfType = getObject(workspace).getLeavesOfType;
  if (typeof getLeavesOfType !== "function") return { refreshed: 0, reopened: 0 };

  const leaves = getLeavesOfType.call(workspace, "graph") as unknown[];
  if (!Array.isArray(leaves) || leaves.length === 0) return { refreshed: 0, reopened: 0 };

  const result: GraphRefreshResult = { refreshed: 0, reopened: 0 };
  for (const leaf of leaves) {
    const view = getObject(leaf).view;
    if (tryNonDestructiveRefresh(view)) {
      result.refreshed += 1;
      continue;
    }

    await reopenGraphLeaf(leaf);
    result.reopened += 1;
  }

  if ((result.refreshed > 0 || result.reopened > 0) && options.showGraphRefreshNotice && NoticeCtor) {
    new NoticeCtor("Liquid Neon: graph colors updated", 2000);
  }

  return result;
}

function tryNonDestructiveRefresh(view: unknown): boolean {
  const methodOwners = [
    getObject(view),
    getObject(getObject(view).renderer),
    getObject(getObject(view).graph),
    getObject(getObject(getObject(view).graph).renderer),
    getObject(getObject(view).px),
    getObject(getObject(getObject(view).graph).px),
    getObject(getObject(view).engine),
  ];

  const methodNames = [
    "updateColors",
    "refreshColors",
    "refresh",
    "requestRender",
    "render",
    "rerender",
    "resize",
    "onResize",
  ];

  for (const owner of methodOwners) {
    for (const methodName of methodNames) {
      const method = owner[methodName];
      if (typeof method !== "function") continue;
      try {
        method.call(owner);
        return true;
      } catch {
        // Keep probing: Obsidian internals differ by release.
      }
    }
  }

  return false;
}

async function reopenGraphLeaf(leaf: unknown): Promise<void> {
  const leafObject = getObject(leaf);
  const getViewState = leafObject.getViewState;
  const setViewState = leafObject.setViewState;

  if (typeof setViewState === "function") {
    const originalState =
      typeof getViewState === "function"
        ? getViewState.call(leaf)
        : { type: "graph", state: {} };
    await setViewState.call(leaf, { type: "empty", state: {}, active: false });
    await setViewState.call(leaf, ensureGraphViewState(originalState));
  }
}

function ensureGraphViewState(state: unknown): { type: string; state: unknown } {
  const stateObject = getObject(state);
  return {
    type: typeof stateObject.type === "string" ? stateObject.type : "graph",
    state: stateObject.state ?? {},
  };
}

function getObject(value: unknown): UnknownRecord {
  return typeof value === "object" && value !== null ? (value as UnknownRecord) : {};
}
