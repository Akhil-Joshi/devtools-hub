"use client";

import { useState, useCallback, useRef } from "react";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type ViewMode = "tree" | "raw";

function isRecord(value: JsonValue): value is { [key: string]: JsonValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isExpandable(value: JsonValue) {
  return Array.isArray(value) || isRecord(value);
}

function getNodeCount(value: JsonValue) {
  if (Array.isArray(value)) {
    return value.length;
  }

  if (isRecord(value)) {
    return Object.keys(value).length;
  }

  return 0;
}

function getInitialExpandedPaths(value: JsonValue, path = "root", depth = 0) {
  const paths = new Set<string>();

  if (!isExpandable(value) || depth > 1) {
    return paths;
  }

  paths.add(path);

  const entries = Array.isArray(value)
    ? value.map((item, index) => [String(index), item] as const)
    : Object.entries(value);

  entries.forEach(([key, child]) => {
    getInitialExpandedPaths(child, `${path}.${key}`, depth + 1).forEach(
      (childPath) => paths.add(childPath),
    );
  });

  return paths;
}

function getAllExpandablePaths(value: JsonValue, path = "root") {
  const paths = new Set<string>();

  if (!isExpandable(value)) {
    return paths;
  }

  paths.add(path);

  const entries = Array.isArray(value)
    ? value.map((item, index) => [String(index), item] as const)
    : Object.entries(value);

  entries.forEach(([key, child]) => {
    getAllExpandablePaths(child, `${path}.${key}`).forEach((childPath) =>
      paths.add(childPath),
    );
  });

  return paths;
}

function getNodeTone(value: JsonValue) {
  if (Array.isArray(value)) {
    return {
      row: "border-sky-200 bg-sky-50/80 hover:bg-sky-100/80 dark:border-sky-900/70 dark:bg-sky-950/35 dark:hover:bg-sky-950/55",
      icon: "border-sky-300 bg-sky-100 text-sky-800 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-200",
      badge:
        "bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-950 dark:text-sky-200 dark:ring-sky-800",
      bracket: "text-sky-700 dark:text-sky-300",
    };
  }

  if (isRecord(value)) {
    return {
      row: "border-indigo-200 bg-indigo-50/75 hover:bg-indigo-100/70 dark:border-indigo-900/70 dark:bg-indigo-950/35 dark:hover:bg-indigo-950/55",
      icon: "border-indigo-300 bg-indigo-100 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-200",
      badge:
        "bg-indigo-100 text-indigo-800 ring-indigo-200 dark:bg-indigo-950 dark:text-indigo-200 dark:ring-indigo-800",
      bracket: "text-indigo-700 dark:text-indigo-300",
    };
  }

  if (typeof value === "string") {
    return {
      row: "border-emerald-200 bg-emerald-50/65 hover:bg-emerald-100/60 dark:border-emerald-900/70 dark:bg-emerald-950/25 dark:hover:bg-emerald-950/45",
    };
  }

  if (typeof value === "number") {
    return {
      row: "border-blue-200 bg-blue-50/65 hover:bg-blue-100/60 dark:border-blue-900/70 dark:bg-blue-950/25 dark:hover:bg-blue-950/45",
    };
  }

  if (typeof value === "boolean") {
    return {
      row: "border-amber-200 bg-amber-50/70 hover:bg-amber-100/65 dark:border-amber-900/70 dark:bg-amber-950/25 dark:hover:bg-amber-950/45",
    };
  }

  return {
    row: "border-slate-200 bg-slate-100/80 hover:bg-slate-200/70 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:bg-slate-800",
  };
}

function PrimitiveValue({ value }: { value: JsonValue }) {
  if (typeof value === "string") {
    return (
      <span className="font-semibold text-emerald-700 dark:text-emerald-300">
        &quot;{value}&quot;
      </span>
    );
  }

  if (typeof value === "number") {
    return (
      <span className="font-semibold text-blue-700 dark:text-blue-300">
        {value}
      </span>
    );
  }

  if (typeof value === "boolean") {
    return (
      <span className="font-semibold text-amber-700 dark:text-amber-300">
        {String(value)}
      </span>
    );
  }

  return (
    <span className="font-semibold text-slate-500 dark:text-slate-400">
      null
    </span>
  );
}

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <span
      className={`h-2.5 w-2.5 border-b-2 border-r-2 transition-transform ${expanded ? "rotate-45" : "-rotate-45"
        }`}
      aria-hidden="true"
    />
  );
}

function JsonTreeNode({
  label,
  value,
  path,
  expandedPaths,
  onToggle,
  isRoot = false,
}: {
  label: string;
  value: JsonValue;
  path: string;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
  isRoot?: boolean;
}) {
  const expandable = isExpandable(value);
  const expanded = expandedPaths.has(path);
  const count = getNodeCount(value);
  const entries = Array.isArray(value)
    ? value.map((item, index) => [String(index), item] as const)
    : isRecord(value)
      ? Object.entries(value)
      : [];
  const tone = getNodeTone(value);

  return (
    <div
      className={
        isRoot
          ? ""
          : "relative ml-4 border-l-2 border-slate-200 pl-4 dark:border-slate-700"
      }
    >
      {!isRoot && (
        <span className="absolute left-0 top-4 h-px w-4 bg-slate-200 dark:bg-slate-700" />
      )}

      <div
        className={`group flex min-h-9 items-center gap-2 rounded-md border px-2.5 py-1.5 font-mono text-sm shadow-sm transition ${tone.row}`}
      >
        {expandable ? (
          <button
            type="button"
            onClick={() => onToggle(path)}
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded transition hover:scale-105 ${tone.icon}`}
            aria-label={expanded ? `Collapse ${label}` : `Expand ${label}`}
          >
            <Chevron expanded={expanded} />
          </button>
        ) : (
          <span className="h-6 w-6 shrink-0" />
        )}

        {!isRoot && (
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            &quot;{label}&quot;:
          </span>
        )}

        {expandable ? (
          <>
            <span className={`font-bold ${tone.bracket}`}>
              {Array.isArray(value) ? "[" : "{"}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${tone.badge}`}
            >
              {count} {Array.isArray(value) ? "items" : "keys"}
            </span>
            {!expanded && (
              <span className="text-slate-500 dark:text-slate-400">
                {Array.isArray(value) ? "...]" : "...}"}
              </span>
            )}
          </>
        ) : (
          <PrimitiveValue value={value} />
        )}
      </div>

      {expandable && expanded && (
        <div className="space-y-1 pt-1">
          {entries.length > 0 ? (
            entries.map(([key, child]) => (
              <JsonTreeNode
                key={`${path}.${key}`}
                label={key}
                value={child}
                path={`${path}.${key}`}
                expandedPaths={expandedPaths}
                onToggle={onToggle}
              />
            ))
          ) : (
            <div className="ml-12 rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-1.5 font-mono text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              Empty {Array.isArray(value) ? "array" : "object"}
            </div>
          )}
          <div className={`ml-9 px-2 py-1 font-mono text-sm font-bold ${tone.bracket}`}>
            {Array.isArray(value) ? "]" : "}"}
          </div>
        </div>
      )}
    </div>
  );
}

function countNodes(value: JsonValue): { keys: number; values: number } {
  if (Array.isArray(value)) {
    let k = 0, v = 0;
    value.forEach((item) => { const c = countNodes(item); k += c.keys; v += c.values; });
    return { keys: k, values: v + value.length };
  }
  if (isRecord(value)) {
    let k = 0, v = 0;
    Object.values(value).forEach((val) => { const c = countNodes(val); k += c.keys; v += c.values; });
    return { keys: k + Object.keys(value).length, values: v };
  }
  return { keys: 0, values: 1 };
}

function syntaxHighlight(json: string) {
  return json.replace(
    /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = "text-blue-700 dark:text-blue-300"; // number
      if (/^"/.test(match)) {
        cls = match.endsWith(":")
          ? "text-slate-800 dark:text-slate-200 font-semibold" // key
          : "text-emerald-700 dark:text-emerald-300"; // string
      } else if (/true|false/.test(match)) {
        cls = "text-amber-700 dark:text-amber-300";
      } else if (/null/.test(match)) {
        cls = "text-slate-500 dark:text-slate-400 italic";
      }
      return `<span class="${cls}">${match}</span>`;
    },
  );
}

export default function JsonFormatterClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [parsedJson, setParsedJson] = useState<JsonValue | null>(null);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const formatJSON = useCallback(() => {
    try {
      const parsed = JSON.parse(input) as JsonValue;
      setOutput(JSON.stringify(parsed, null, 2));
      setParsedJson(parsed);
      setExpandedPaths(getInitialExpandedPaths(parsed));
      setViewMode("tree");
      setError("");
    } catch (e) {
      const msg = e instanceof SyntaxError ? e.message : "Invalid JSON";
      setError(msg);
      setOutput("");
      setParsedJson(null);
      setExpandedPaths(new Set());
    }
  }, [input]);

  const loadSample = useCallback(() => {
    const sample = JSON.stringify(
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        isActive: true,
        address: {
          street: "123 Main St",
          city: "Springfield",
          zip: "62704",
        },
        roles: ["admin", "editor"],
        posts: [
          {
            id: 101,
            title: "Hello World",
            tags: ["intro", "welcome"],
            published: true,
          },
          {
            id: 102,
            title: "Second Post",
            tags: ["update"],
            published: false,
          },
        ],
      },
      null,
      2,
    );
    setInput(sample);
    setOutput("");
    setError("");

  }, []);

  const minifyJSON = useCallback(() => {
    try {
      const parsed = JSON.parse(input) as JsonValue;
      setOutput(JSON.stringify(parsed));
      setParsedJson(parsed);
      setExpandedPaths(getInitialExpandedPaths(parsed));
      setViewMode("raw");
      setError("");
    } catch (e) {
      const msg = e instanceof SyntaxError ? e.message : "Invalid JSON";
      setError(msg);
      setOutput("");
      setParsedJson(null);
      setExpandedPaths(new Set());
    }
  }, [input]);

  const copy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  const clear = useCallback(() => {
    setInput("");
    setOutput("");
    setParsedJson(null);       // 🔥 clear tree data
    setExpandedPaths(new Set()); // 🔥 reset expansion
    setError("");
  }, []);

  const download = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === "string") setInput(text);
    };
    reader.readAsText(file);
  }, []);

  const togglePath = (path: string) => {
    setExpandedPaths((current) => {
      const next = new Set(current);
      if (next.has(path)) { next.delete(path); } else { next.add(path); }
      return next;
    });
  };

  const expandAll = () => {
    if (parsedJson) setExpandedPaths(getAllExpandablePaths(parsedJson));
  };

  const collapseAll = () => {
    setExpandedPaths(new Set(parsedJson && isExpandable(parsedJson) ? ["root"] : []));
  };

  const stats = parsedJson ? countNodes(parsedJson) : null;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-semibold text-slate-950 dark:text-slate-50">
            Input JSON
          </h2>
        </div>

        <div className="space-y-4 p-4">
          <textarea
            id="json-input"
            className="h-[28rem] w-full resize-y rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-sm text-slate-900 caret-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:caret-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500 dark:focus:bg-slate-900"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste JSON here..."
          />

          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFile}
          />

          <div className="flex flex-wrap gap-3">
            <button
              id="json-format-btn"
              type="button"
              onClick={formatJSON}
              className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
            >
              Format
            </button>

            <button
              id="json-sample-btn"
              type="button"
              onClick={loadSample}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-900"
            >
              Load Sample
            </button>

            <button
              id="json-upload-btn"
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-900"
            >
              Upload File
            </button>

            <button
              id="json-copy-btn"
              type="button"
              onClick={copy}
              disabled={!output}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
            >
              {copied ? "Copied!" : "Copy Output"}
            </button>

            <button
              id="json-download-btn"
              type="button"
              onClick={download}
              disabled={!output}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-900 dark:disabled:text-slate-600"
            >
              Download
            </button>

            <button
              id="json-clear-btn"
              type="button"
              onClick={clear}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-red-400 hover:bg-red-50 hover:text-red-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-red-500 dark:hover:bg-red-950/40 dark:hover:text-red-300"
            >
              Clear
            </button>
          </div>

          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </p>
          )}
        </div>
      </section>

      <section className="min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-slate-950 dark:text-slate-50">
            Output Viewer
          </h2>

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={minifyJSON}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-900"
            >
              Minify
            </button>
            <div className="flex rounded-md border border-slate-300 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => setViewMode("tree")}
                className={`rounded px-3 py-1.5 text-sm font-semibold transition ${viewMode === "tree"
                  ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-slate-50"
                  : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-100"
                  }`}
              >
                Tree
              </button>
              <button
                type="button"
                onClick={() => setViewMode("raw")}
                className={`rounded px-3 py-1.5 text-sm font-semibold transition ${viewMode === "raw"
                  ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-slate-50"
                  : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-100"
                  }`}
              >
                Raw
              </button>
            </div>

            <button
              type="button"
              onClick={expandAll}
              disabled={!parsedJson}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800 dark:disabled:text-slate-600"
            >
              Expand All
            </button>

            <button
              type="button"
              onClick={collapseAll}
              disabled={!parsedJson}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800 dark:disabled:text-slate-600"
            >
              Collapse All
            </button>
          </div>
        </div>

        <div className="h-[34rem] overflow-auto bg-slate-100 p-4 dark:bg-slate-950">
          {!parsedJson && !output ? (
            <div className="flex h-full items-center justify-center rounded-md border border-dashed border-slate-300 bg-white px-4 text-center text-sm font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              Format valid JSON to inspect it as a collapsible tree.
            </div>
          ) : viewMode === "tree" && parsedJson ? (
            <div className="min-w-max rounded-md border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <JsonTreeNode
                label="root"
                value={parsedJson}
                path="root"
                expandedPaths={expandedPaths}
                onToggle={togglePath}
                isRoot
              />
            </div>
          ) : (
            <pre className="min-h-full min-w-max rounded-md border border-slate-200 bg-white p-4 font-mono text-sm leading-6 text-slate-800 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
              {output}
            </pre>
          )}
        </div>
      </section>
    </div>
  );
}
