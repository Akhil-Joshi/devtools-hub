"use client";

import { useRef, useEffect, useCallback, useState } from "react";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/* ------------------------------------------------------------------ */
/*  Layout types                                                       */
/* ------------------------------------------------------------------ */

interface GraphNode {
  id: string;
  label: string;
  value: string;
  type: "object" | "array" | "string" | "number" | "boolean" | "null";
  x: number;
  y: number;
  w: number;
  h: number;
  children: string[];
}

/* ------------------------------------------------------------------ */
/*  Colors                                                             */
/* ------------------------------------------------------------------ */

const COLORS = {
  object: { bg: "#eef2ff", border: "#818cf8", text: "#3730a3", head: "#c7d2fe" },
  array: { bg: "#f0f9ff", border: "#38bdf8", text: "#0c4a6e", head: "#bae6fd" },
  string: { bg: "#ecfdf5", border: "#34d399", text: "#065f46", head: "#a7f3d0" },
  number: { bg: "#eff6ff", border: "#60a5fa", text: "#1e3a5f", head: "#bfdbfe" },
  boolean: { bg: "#fffbeb", border: "#fbbf24", text: "#78350f", head: "#fde68a" },
  null: { bg: "#f8fafc", border: "#94a3b8", text: "#475569", head: "#cbd5e1" },
};

const DARK_COLORS = {
  object: { bg: "#1e1b4b", border: "#818cf8", text: "#c7d2fe", head: "#312e81" },
  array: { bg: "#0c4a6e", border: "#38bdf8", text: "#bae6fd", head: "#075985" },
  string: { bg: "#064e3b", border: "#34d399", text: "#a7f3d0", head: "#065f46" },
  number: { bg: "#1e3a5f", border: "#60a5fa", text: "#bfdbfe", head: "#1e40af" },
  boolean: { bg: "#78350f", border: "#fbbf24", text: "#fde68a", head: "#92400e" },
  null: { bg: "#1e293b", border: "#94a3b8", text: "#cbd5e1", head: "#334155" },
};

/* ------------------------------------------------------------------ */
/*  Build flat node list from JSON                                     */
/* ------------------------------------------------------------------ */

const NODE_W = 220;
const NODE_HEAD = 28;
const ROW_H = 24;
const PAD = 12;
const H_GAP = 60;
const V_GAP = 20;

function measureNode(n: { rows: number }): { w: number; h: number } {
  return { w: NODE_W, h: NODE_HEAD + Math.max(n.rows, 1) * ROW_H + PAD };
}

function buildGraph(json: JsonValue): GraphNode[] {
  const nodes: GraphNode[] = [];
  let idCounter = 0;

  function walk(value: JsonValue, label: string): string {
    const id = `n${idCounter++}`;

    if (value === null) {
      const m = measureNode({ rows: 1 });
      nodes.push({ id, label, value: "null", type: "null", x: 0, y: 0, ...m, children: [] });
      return id;
    }

    if (typeof value === "string") {
      const display = value.length > 24 ? value.slice(0, 22) + "…" : value;
      const m = measureNode({ rows: 1 });
      nodes.push({ id, label, value: `"${display}"`, type: "string", x: 0, y: 0, ...m, children: [] });
      return id;
    }

    if (typeof value === "number" || typeof value === "boolean") {
      const m = measureNode({ rows: 1 });
      nodes.push({ id, label, value: String(value), type: typeof value as "number" | "boolean", x: 0, y: 0, ...m, children: [] });
      return id;
    }

    if (Array.isArray(value)) {
      const childIds: string[] = [];
      value.forEach((item, i) => {
        childIds.push(walk(item, `[${i}]`));
      });
      const rows = value.length === 0 ? 1 : 1;
      const m = measureNode({ rows });
      nodes.push({
        id, label, value: `Array [${value.length}]`, type: "array",
        x: 0, y: 0, ...m, children: childIds,
      });
      return id;
    }

    if (typeof value === "object") {
      const keys = Object.keys(value);
      const childIds: string[] = [];
      keys.forEach((key) => {
        childIds.push(walk((value as Record<string, JsonValue>)[key], key));
      });
      const rows = keys.length === 0 ? 1 : Math.min(keys.length, 6);
      const m = measureNode({ rows });
      nodes.push({
        id, label, value: `Object {${keys.length}}`, type: "object",
        x: 0, y: 0, w: m.w, h: NODE_HEAD + rows * ROW_H + PAD, children: childIds,
      });
      return id;
    }

    return id;
  }

  if (json !== undefined) walk(json, "root");
  return nodes;
}

/* ------------------------------------------------------------------ */
/*  Tree layout (left-to-right)                                        */
/* ------------------------------------------------------------------ */

function layoutTree(nodes: GraphNode[]): void {
  if (nodes.length === 0) return;

  const map = new Map<string, GraphNode>();
  nodes.forEach((n) => map.set(n.id, n));

  const root = nodes[nodes.length - 1];

  const subtreeH = new Map<string, number>();

  function calcHeight(id: string): number {
    const node = map.get(id)!;
    if (node.children.length === 0) {
      subtreeH.set(id, node.h);
      return node.h;
    }
    const childH = node.children.reduce((sum, cid) => sum + calcHeight(cid) + V_GAP, -V_GAP);
    const h = Math.max(node.h, childH);
    subtreeH.set(id, h);
    return h;
  }

  calcHeight(root.id);

  function position(id: string, x: number, yStart: number): void {
    const node = map.get(id)!;
    const totalH = subtreeH.get(id)!;
    node.x = x;
    node.y = yStart + (totalH - node.h) / 2;

    if (node.children.length === 0) return;

    const childX = x + node.w + H_GAP;
    let cy = yStart;
    node.children.forEach((cid) => {
      const ch = subtreeH.get(cid)!;
      position(cid, childX, cy);
      cy += ch + V_GAP;
    });
  }

  position(root.id, 40, 40);
}

/* ------------------------------------------------------------------ */
/*  Canvas renderer                                                    */
/* ------------------------------------------------------------------ */

function drawGraph(
  ctx: CanvasRenderingContext2D,
  nodes: GraphNode[],
  scale: number,
  offsetX: number,
  offsetY: number,
  isDark: boolean,
  width: number,
  height: number,
  parentKeys: Map<string, string[]>,
) {
  const colors = isDark ? DARK_COLORS : COLORS;
  // Match slate-950 (#020617) for dark, slate-100 (#f1f5f9) for light
  const bgColor = isDark ? "#020617" : "#f1f5f9";
  const edgeColor = isDark ? "rgba(148,163,184,0.35)" : "rgba(100,116,139,0.3)";
  const dotBg = isDark ? "rgba(51,65,85,0.5)" : "rgba(203,213,225,0.5)";

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Dot grid
  ctx.fillStyle = dotBg;
  const dotSpacing = 24 * scale;
  const startX = offsetX % dotSpacing;
  const startY = offsetY % dotSpacing;
  for (let x = startX; x < width; x += dotSpacing) {
    for (let y = startY; y < height; y += dotSpacing) {
      ctx.beginPath();
      ctx.arc(x, y, 1 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);

  const map = new Map<string, GraphNode>();
  nodes.forEach((n) => map.set(n.id, n));

  // Draw edges
  ctx.lineWidth = 2;
  ctx.strokeStyle = edgeColor;
  nodes.forEach((node) => {
    node.children.forEach((cid, ci) => {
      const child = map.get(cid);
      if (!child) return;

      const fromX = node.x + node.w;
      const fromY = node.y + NODE_HEAD + (Math.min(ci, 5)) * ROW_H + ROW_H / 2;
      const toX = child.x;
      const toY = child.y + child.h / 2;

      const cpOffset = Math.min(Math.abs(toX - fromX) * 0.5, 50);

      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.bezierCurveTo(fromX + cpOffset, fromY, toX - cpOffset, toY, toX, toY);
      ctx.stroke();

      // Arrow
      const arrowSize = 5;
      const angle = Math.atan2(toY - toY, toX - (toX - cpOffset));
      ctx.fillStyle = edgeColor;
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - arrowSize * Math.cos(angle - 0.4), toY - arrowSize * Math.sin(angle - 0.4));
      ctx.lineTo(toX - arrowSize * Math.cos(angle + 0.4), toY - arrowSize * Math.sin(angle + 0.4));
      ctx.closePath();
      ctx.fill();
    });
  });

  // Draw nodes
  nodes.forEach((node) => {
    const c = colors[node.type];
    const r = 8;

    // Shadow
    ctx.shadowColor = isDark ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.1)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;

    // Body
    ctx.beginPath();
    ctx.roundRect(node.x, node.y, node.w, node.h, r);
    ctx.fillStyle = c.bg;
    ctx.fill();
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Header bar
    ctx.beginPath();
    ctx.roundRect(node.x, node.y, node.w, NODE_HEAD, [r, r, 0, 0]);
    ctx.fillStyle = c.head;
    ctx.fill();

    // Header divider
    ctx.beginPath();
    ctx.moveTo(node.x, node.y + NODE_HEAD);
    ctx.lineTo(node.x + node.w, node.y + NODE_HEAD);
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Header text
    ctx.fillStyle = c.text;
    ctx.font = "bold 11px ui-monospace, SFMono-Regular, monospace";
    ctx.textBaseline = "middle";
    const headerLabel = node.label.length > 20 ? node.label.slice(0, 18) + "…" : node.label;
    ctx.fillText(headerLabel, node.x + 8, node.y + NODE_HEAD / 2);

    // Type badge in header
    const badge = node.type === "object" ? "{}" : node.type === "array" ? "[]" : node.type;
    ctx.font = "9px ui-monospace, SFMono-Regular, monospace";
    const badgeW = ctx.measureText(badge).width + 8;
    const badgeX = node.x + node.w - badgeW - 6;
    const badgeY = node.y + 5;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, 16, 4);
    ctx.fillStyle = c.border + "30";
    ctx.fill();
    ctx.fillStyle = c.text;
    ctx.fillText(badge, badgeX + 4, badgeY + 9);

    // Body content
    ctx.font = "11px ui-monospace, SFMono-Regular, monospace";

    if (node.type === "object") {
      const keys = parentKeys.get(node.id) || [];
      keys.slice(0, 6).forEach((key, i) => {
        const rowY = node.y + NODE_HEAD + i * ROW_H + ROW_H / 2 + 2;
        ctx.fillStyle = isDark ? "#c7d2fe" : "#4338ca";
        ctx.fillText(key, node.x + 8, rowY);
        ctx.beginPath();
        ctx.arc(node.x + node.w, rowY, 3, 0, Math.PI * 2);
        ctx.fillStyle = c.border;
        ctx.fill();
      });
      if (keys.length > 6) {
        const rowY = node.y + NODE_HEAD + 5 * ROW_H + ROW_H / 2 + 2;
        ctx.fillStyle = isDark ? "#94a3b8" : "#64748b";
        ctx.fillText(`+${keys.length - 6} more…`, node.x + 8, rowY);
      }
    } else if (node.type === "array") {
      const rowY = node.y + NODE_HEAD + ROW_H / 2 + 2;
      ctx.fillStyle = isDark ? "#bae6fd" : "#0369a1";
      const countMatch = node.value.match(/\[(\d+)\]/);
      ctx.fillText(countMatch ? `${countMatch[1]} items` : node.value, node.x + 8, rowY);
      node.children.slice(0, 6).forEach((_, i) => {
        const dotY = node.y + NODE_HEAD + i * ROW_H + ROW_H / 2 + 2;
        ctx.beginPath();
        ctx.arc(node.x + node.w, dotY, 3, 0, Math.PI * 2);
        ctx.fillStyle = c.border;
        ctx.fill();
      });
    } else {
      const rowY = node.y + NODE_HEAD + ROW_H / 2 + 2;
      ctx.fillStyle = c.text;
      const display = node.value.length > 26 ? node.value.slice(0, 24) + "…" : node.value;
      ctx.fillText(display, node.x + 8, rowY);
    }

    // Left connector dot
    ctx.beginPath();
    ctx.arc(node.x, node.y + node.h / 2, 3, 0, Math.PI * 2);
    ctx.fillStyle = c.border;
    ctx.fill();
  });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function JsonGraphView({ data }: { data: JsonValue }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 40, y: 40 });
  const [scale, setScale] = useState(1);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const nodesRef = useRef<GraphNode[]>([]);
  const parentKeysRef = useRef<Map<string, string[]>>(new Map());

  // Build graph data
  useEffect(() => {
    const nodes = buildGraph(data);
    layoutTree(nodes);
    nodesRef.current = nodes;

    // Build parent keys map for object nodes
    const pkMap = new Map<string, string[]>();
    let idx = 0;
    function walkMap(value: JsonValue): void {
      const id = `n${idx++}`;
      if (value === null || typeof value !== "object") return;
      if (Array.isArray(value)) {
        value.forEach((item) => walkMap(item));
      } else {
        pkMap.set(id, Object.keys(value));
        Object.values(value).forEach((v) => walkMap(v));
      }
    }
    walkMap(data);
    parentKeysRef.current = pkMap;

    // Auto-fit: scale to fill the viewport width; never shrink below 0.7 or above 1.0
    if (nodes.length > 0) {
      const container = containerRef.current;
      if (container) {
        const cw = container.clientWidth;
        const ch = container.clientHeight;

        let maxX = 0, maxY = 0;
        nodes.forEach((n) => {
          maxX = Math.max(maxX, n.x + n.w + 60);
          maxY = Math.max(maxY, n.y + n.h + 60);
        });

        // Fit width first so the root node is always visible at a comfortable size
        const scaleByWidth = (cw - 80) / maxX;
        const scaleByHeight = (ch - 80) / maxY;
        // Prefer the width-driven scale; clamp between 0.65 and 1.15
        const s = Math.min(scaleByWidth, scaleByHeight, 1.15);
        const finalScale = Math.max(s, 0.65);

        setScale(finalScale);
        setOffset({ x: 24, y: 24 });
      }
    }
  }, [data]);

  // Render
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = container.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const isDark =
      window.matchMedia("(prefers-color-scheme: dark)").matches ||
      document.documentElement.classList.contains("dark");

    drawGraph(ctx, nodesRef.current, scale, offset.x, offset.y, isDark, w, h, parentKeysRef.current);
  }, [scale, offset]);

  useEffect(() => {
    render();
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    mql.addEventListener("change", render);
    const observer = new MutationObserver(render);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("resize", render);
    return () => {
      mql.removeEventListener("change", render);
      observer.disconnect();
      window.removeEventListener("resize", render);
    };
  }, [render]);

  // Pan
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
  }, []);

  const onMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  // Zoom
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.92 : 1.08;
    setScale((s) => Math.min(Math.max(s * delta, 0.15), 3));
  }, []);

  const zoomIn = () => setScale((s) => Math.min(s * 1.2, 3));
  const zoomOut = () => setScale((s) => Math.max(s * 0.8, 0.15));
  const resetView = useCallback(() => {
    setScale(1);
    setOffset({ x: 24, y: 24 });
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden rounded-md bg-slate-100 dark:bg-[#020617]"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      />

      {/* Zoom controls */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg border border-slate-300 bg-white/90 p-1 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
        <button
          type="button"
          onClick={zoomOut}
          className="rounded px-2 py-1 text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          −
        </button>
        <span className="min-w-[3rem] text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          {Math.round(scale * 100)}%
        </span>
        <button
          type="button"
          onClick={zoomIn}
          className="rounded px-2 py-1 text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          +
        </button>
        <div className="mx-0.5 h-4 w-px bg-slate-300 dark:bg-slate-600" />
        <button
          type="button"
          onClick={resetView}
          className="rounded px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Reset
        </button>
      </div>
    </div>
  );
}