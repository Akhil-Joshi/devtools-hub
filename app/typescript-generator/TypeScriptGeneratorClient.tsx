"use client";

import { useState, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** Represents either a resolved TS primitive or a reference to another interface. */
type TsFieldType =
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "any"
  | "unknown"
  | { arrayOf: TsFieldType | TsFieldType[] }
  | { interfaceRef: string };

interface TsField {
  name: string;
  type: TsFieldType | TsFieldType[];
  optional: boolean;
}

interface TsInterface {
  name: string;
  fields: TsField[];
}

/* ------------------------------------------------------------------ */
/*  JSON → interfaces logic                                            */
/* ------------------------------------------------------------------ */

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function sanitizeKey(key: string) {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
}

function singularize(name: string) {
  if (name.endsWith("ies")) return name.slice(0, -3) + "y";
  if (name.endsWith("ses") || name.endsWith("xes") || name.endsWith("zes"))
    return name.slice(0, -2);
  if (name.endsWith("s") && !name.endsWith("ss")) return name.slice(0, -1);
  return name;
}

/**
 * Walk arbitrary JSON and produce a flat list of `TsInterface` definitions.
 */
function generateInterfaces(
  json: unknown,
  rootName: string,
): TsInterface[] {
  const interfaces: TsInterface[] = [];
  const seen = new Map<string, string>(); // fingerprint → interface name
  let counter = 0;

  function fingerprint(obj: Record<string, unknown>) {
    return Object.keys(obj).sort().join(",");
  }

  function nextName(hint: string) {
    const base = capitalize(hint);
    const existing = interfaces.find((i) => i.name === base);
    if (!existing) return base;
    counter += 1;
    return `${base}${counter}`;
  }

  function resolveType(value: unknown, hint: string): TsFieldType {
    if (value === null) return "null";
    if (typeof value === "string") return "string";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";

    if (Array.isArray(value)) {
      if (value.length === 0) return { arrayOf: "any" };

      const elementTypes: TsFieldType[] = [];
      const seenPrimitives = new Set<string>();

      for (const item of value) {
        const t = resolveType(item, singularize(hint));
        const key = typeToString(t);
        if (!seenPrimitives.has(key)) {
          seenPrimitives.add(key);
          elementTypes.push(t);
        }
      }

      // Merge object interfaces that came from the same array.
      // If there are multiple interface refs with identical fields, keep one.
      const mergedTypes = mergeInterfaceRefs(elementTypes);

      if (mergedTypes.length === 1) {
        return { arrayOf: mergedTypes[0] };
      }

      return { arrayOf: mergedTypes };
    }

    if (typeof value === "object") {
      const obj = value as Record<string, unknown>;
      const fp = fingerprint(obj);

      if (seen.has(fp)) {
        return { interfaceRef: seen.get(fp)! };
      }

      const name = nextName(hint);
      seen.set(fp, name);

      const fields: TsField[] = Object.entries(obj).map(([key, val]) => ({
        name: key,
        type: resolveType(val, key),
        optional: false,
      }));

      interfaces.push({ name, fields });
      return { interfaceRef: name };
    }

    return "unknown";
  }

  function mergeInterfaceRefs(types: TsFieldType[]): TsFieldType[] {
    const refs: { interfaceRef: string }[] = [];
    const others: TsFieldType[] = [];

    for (const t of types) {
      if (typeof t === "object" && "interfaceRef" in t) {
        refs.push(t);
      } else {
        others.push(t);
      }
    }

    if (refs.length <= 1) return types;

    // Merge all interface refs into one by combining fields (marking extras optional).
    const allFields = new Map<string, { types: TsFieldType[]; count: number }>();
    const totalRefs = refs.length;

    for (const ref of refs) {
      const iface = interfaces.find((i) => i.name === ref.interfaceRef);
      if (!iface) continue;

      for (const f of iface.fields) {
        const entry = allFields.get(f.name);
        if (entry) {
          const key = Array.isArray(f.type)
            ? f.type.map(typeToString).join(" | ")
            : typeToString(f.type);
          if (!entry.types.some((t) => typeToString(t) === key)) {
            entry.types.push(Array.isArray(f.type) ? f.type[0] : f.type);
          }
          entry.count += 1;
        } else {
          allFields.set(f.name, {
            types: [Array.isArray(f.type) ? f.type[0] : f.type],
            count: 1,
          });
        }
      }
    }

    // Remove the old individual interfaces.
    const keepName = refs[0].interfaceRef;
    for (let i = 1; i < refs.length; i++) {
      const idx = interfaces.findIndex((iface) => iface.name === refs[i].interfaceRef);
      if (idx !== -1) interfaces.splice(idx, 1);
    }

    // Update the kept interface with merged fields.
    const keptIdx = interfaces.findIndex((iface) => iface.name === keepName);
    if (keptIdx !== -1) {
      interfaces[keptIdx].fields = Array.from(allFields.entries()).map(
        ([name, { types, count }]) => ({
          name,
          type: types.length === 1 ? types[0] : types,
          optional: count < totalRefs,
        }),
      );
    }

    return [refs[0], ...others];
  }

  resolveType(json, rootName);

  return interfaces;
}

/* ------------------------------------------------------------------ */
/*  Render types → string                                              */
/* ------------------------------------------------------------------ */

function typeToString(t: TsFieldType): string {
  if (typeof t === "string") return t;
  if ("arrayOf" in t) {
    if (Array.isArray(t.arrayOf)) {
      return `(${t.arrayOf.map(typeToString).join(" | ")})[]`;
    }
    const inner = typeToString(t.arrayOf);
    return inner.includes("|") ? `(${inner})[]` : `${inner}[]`;
  }
  if ("interfaceRef" in t) return t.interfaceRef;
  return "unknown";
}

function fieldTypeToString(t: TsFieldType | TsFieldType[]): string {
  if (Array.isArray(t)) {
    return t.map(typeToString).join(" | ");
  }
  return typeToString(t);
}

function interfacesToString(interfaces: TsInterface[]): string {
  return interfaces
    .map((iface) => {
      const fields = iface.fields
        .map((f) => {
          const opt = f.optional ? "?" : "";
          return `  ${sanitizeKey(f.name)}${opt}: ${fieldTypeToString(f.type)};`;
        })
        .join("\n");

      return `export interface ${iface.name} {\n${fields}\n}`;
    })
    .join("\n\n");
}

/* ------------------------------------------------------------------ */
/*  Preview colouring helpers                                          */
/* ------------------------------------------------------------------ */

type TokenKind =
  | "keyword"
  | "typeName"
  | "fieldName"
  | "typeRef"
  | "punctuation"
  | "plain";

interface Token {
  text: string;
  kind: TokenKind;
}

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];

  // Match export / interface keywords
  const kwMatch = line.match(/^(export\s+)(interface\s+)(\w+)(\s*\{)/);
  if (kwMatch) {
    tokens.push({ text: kwMatch[1], kind: "keyword" });
    tokens.push({ text: kwMatch[2], kind: "keyword" });
    tokens.push({ text: kwMatch[3], kind: "typeName" });
    tokens.push({ text: kwMatch[4], kind: "punctuation" });
    return tokens;
  }

  // Match field line:  fieldName?: TypeName;
  const fieldMatch = line.match(/^(\s+)("?[\w$]+"?\??)(:\s+)(.+)(;)$/);
  if (fieldMatch) {
    tokens.push({ text: fieldMatch[1], kind: "plain" });
    tokens.push({ text: fieldMatch[2], kind: "fieldName" });
    tokens.push({ text: fieldMatch[3], kind: "punctuation" });
    tokens.push({ text: fieldMatch[4], kind: "typeRef" });
    tokens.push({ text: fieldMatch[5], kind: "punctuation" });
    return tokens;
  }

  // Closing brace
  if (line.trim() === "}") {
    tokens.push({ text: line, kind: "punctuation" });
    return tokens;
  }

  tokens.push({ text: line, kind: "plain" });
  return tokens;
}

const kindClasses: Record<TokenKind, string> = {
  keyword: "text-purple-600 dark:text-purple-400",
  typeName: "text-sky-600 dark:text-sky-400 font-semibold",
  fieldName: "text-emerald-700 dark:text-emerald-300",
  typeRef: "text-amber-600 dark:text-amber-300",
  punctuation: "text-slate-500 dark:text-slate-400",
  plain: "text-slate-800 dark:text-slate-200",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function TypeScriptGeneratorClient() {
  const [input, setInput] = useState("");
  const [rootName, setRootName] = useState("Root");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      const interfaces = generateInterfaces(parsed, rootName || "Root");
      const result = interfacesToString(interfaces);

      if (result.trim().length === 0) {
        // Primitive JSON value
        const primitiveType = parsed === null ? "null" : typeof parsed;
        setOutput(`export type ${rootName || "Root"} = ${primitiveType};`);
      } else {
        setOutput(result);
      }

      setError("");
    } catch {
      setError("Invalid JSON — please check your input and try again.");
      setOutput("");
    }
  }, [input, rootName]);

  const copy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, [output]);

  const clear = useCallback(() => {
    setInput("");
    setOutput("");
    setError("");
  }, []);

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

  /* ---------- output lines for syntax-highlighted preview ---------- */
  const outputLines = output ? output.split("\n") : [];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
      {/* ---- INPUT PANEL ---- */}
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-semibold text-slate-950 dark:text-slate-50">
            Input JSON
          </h2>
        </div>

        <div className="space-y-4 p-4">
          {/* Root name input */}
          <div className="flex items-center gap-3">
            <label
              htmlFor="ts-root-name"
              className="shrink-0 text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Root name
            </label>
            <input
              id="ts-root-name"
              type="text"
              value={rootName}
              onChange={(e) => setRootName(e.target.value)}
              className="w-40 rounded-md border border-slate-300 bg-slate-50 px-3 py-1.5 font-mono text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500 dark:focus:bg-slate-900"
              placeholder="Root"
            />
          </div>

          <textarea
            id="ts-json-input"
            className="h-[26rem] w-full resize-y rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-sm text-slate-900 caret-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:caret-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500 dark:focus:bg-slate-900"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste JSON here..."
          />

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={generate}
              className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
            >
              Generate
            </button>

            <button
              type="button"
              onClick={loadSample}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-900"
            >
              Load Sample
            </button>

            <button
              type="button"
              onClick={copy}
              disabled={!output}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
            >
              {copied ? "Copied!" : "Copy Output"}
            </button>

            <button
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

      {/* ---- OUTPUT PANEL ---- */}
      <section className="min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-slate-950 dark:text-slate-50">
            TypeScript Output
          </h2>

          {output && (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-800">
              {interfaces(output)} interface{interfaces(output) !== 1 ? "s" : ""}{" "}
              generated
            </span>
          )}
        </div>

        <div className="h-[34rem] overflow-auto bg-slate-100 p-4 dark:bg-slate-950">
          {!output ? (
            <div className="flex h-full items-center justify-center rounded-md border border-dashed border-slate-300 bg-white px-4 text-center text-sm font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              Paste JSON and hit &ldquo;Generate&rdquo; to see TypeScript
              interfaces here.
            </div>
          ) : (
            <div className="min-w-max rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {/* Line-numbered, syntax-highlighted output */}
              <pre className="p-4 font-mono text-sm leading-7">
                {outputLines.map((line, idx) => {
                  const tokens = tokenizeLine(line);
                  return (
                    <div key={idx} className="flex">
                      <span className="mr-4 inline-block w-6 select-none text-right text-slate-400 dark:text-slate-600">
                        {idx + 1}
                      </span>
                      <span>
                        {tokens.map((tok, ti) => (
                          <span key={ti} className={kindClasses[tok.kind]}>
                            {tok.text}
                          </span>
                        ))}
                      </span>
                    </div>
                  );
                })}
              </pre>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* Small helper used in the badge */
function interfaces(output: string) {
  return (output.match(/export interface/g) || []).length +
    (output.match(/export type/g) || []).length;
}
