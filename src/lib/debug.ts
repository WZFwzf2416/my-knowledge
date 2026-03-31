const isDebugEnabled = process.env.NODE_ENV !== "production" || process.env.DEBUG_LOG === "true";

type DebugOptions = {
  depth?: number | null;
  enabled?: boolean;
};

export function debugLog(label: string, value: unknown, options: DebugOptions = {}) {
  const { depth = null, enabled = true } = options;

  if (!isDebugEnabled || !enabled) {
    return;
  }

  console.log(`\n[debug] ${label}`);
  console.dir(value, { depth, colors: true });
}

export function debugJson(label: string, value: unknown, enabled = true) {
  if (!isDebugEnabled || !enabled) {
    return;
  }

  console.log(`\n[debug-json] ${label}`);
  console.log(JSON.stringify(value, null, 2));
}