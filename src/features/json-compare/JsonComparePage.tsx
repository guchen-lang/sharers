import React, { useEffect, useRef, useState } from 'react';
import CodeEditor, { CodeEditorHandle } from '../../shared/components/CodeEditor';
import { Button } from '../../shared/components/Button';
import JsonCompareTree from './JsonCompareTree';
import { useLocalStorage } from '../../shared/hooks/useLocalStorage';
import { DownloadCloud, Copy, ArrowDown, ArrowUp } from 'lucide-react';
import type { CompareResponse } from './compare.worker';

const WORKER_PATH = new URL('./compare.worker.ts?worker', import.meta.url);

export default function JsonComparePage() {
  const [left, setLeft] = useLocalStorage('devbox.json.compare.left', '{\n  "a": 1\n}');
  const [right, setRight] = useLocalStorage('devbox.json.compare.right', '{\n  "a": 2\n}');
  const [diff, setDiff] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const editorLeftRef = useRef<CodeEditorHandle | null>(null);
  const editorRightRef = useRef<CodeEditorHandle | null>(null);
  const idRef = useRef(0);

  const [leftHighlights, setLeftHighlights] = useState<{ from: number; to: number }[]>([]);
  const [rightHighlights, setRightHighlights] = useState<{ from: number; to: number }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const w = new Worker(WORKER_PATH, { type: 'module' });
    workerRef.current = w;
    w.onmessage = (ev: MessageEvent<CompareResponse>) => {
      setLoading(false);
      const res = ev.data;
      if (!res) return;
      if (res.success) {
        setError(null);
        setDiff(res.diff);
        // collect highlights for both editors
        const lh: { from: number; to: number }[] = [];
        const rh: { from: number; to: number }[] = [];
        collectHighlights(res.diff, left, right, lh, rh);
        setLeftHighlights(lh);
        setRightHighlights(rh);
        setCurrentIndex(0);
        // apply highlights
        if (editorLeftRef.current) editorLeftRef.current.setHighlights(lh);
        if (editorRightRef.current) editorRightRef.current.setHighlights(rh);
      } else {
        setDiff(null);
        setError(res.error || 'Parse error');
        setLeftHighlights([]);
        setRightHighlights([]);
        if (editorLeftRef.current) editorLeftRef.current.clearHighlights();
        if (editorRightRef.current) editorRightRef.current.clearHighlights();
      }
    };
    return () => {
      w.terminate();
      workerRef.current = null;
    };
  }, []);

  const compare = () => {
    const w = workerRef.current;
    if (!w) return;
    setLoading(true);
    const id = String(++idRef.current);
    w.postMessage({ id, leftText: left, rightText: right });
  };

  const copyDifferences = async () => {
    if (!diff) return;
    const changes: any[] = [];
    function walk(node: any, path: string[]) {
      if (!node) return;
      if (node.status !== 'equal') {
        changes.push({ path: path.join('.'), status: node.status, left: node.left, right: node.right });
      }
      if (node.children) {
        for (const c of node.children) walk(c, [...path, String(c.key)]);
      }
    }
    walk(diff, []);
    try {
      await navigator.clipboard.writeText(JSON.stringify(changes, null, 2));
    } catch (e) {
      // ignore
    }
  };

  const downloadDiff = () => {
    if (!diff) return;
    const blob = new Blob([JSON.stringify(diff, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diff.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  function collectHighlights(node: any, leftText: string, rightText: string, lh: any[], rh: any[]) {
    if (!node) return;
    // For primitive nodes with difference, try to locate value or key in the text
    if (node.status !== 'equal') {
      const k = node.key;
      if (node.type === 'primitive') {
        // prefer value-based highlight
        if (node.left !== undefined) {
          const v = JSON.stringify(node.left);
          const idx = leftText.indexOf(v);
          if (idx >= 0) lh.push({ from: idx, to: idx + v.length });
        }
        if (node.right !== undefined) {
          const v = JSON.stringify(node.right);
          const idx = rightText.indexOf(v);
          if (idx >= 0) rh.push({ from: idx, to: idx + v.length });
        }
        // fallback to key-based
        if ((node.left === undefined || node.right === undefined) && k !== undefined) {
          const keyPattern = '"' + String(k) + '"';
          const li = leftText.indexOf(keyPattern);
          if (li >= 0) lh.push({ from: li, to: li + keyPattern.length });
          const ri = rightText.indexOf(keyPattern);
          if (ri >= 0) rh.push({ from: ri, to: ri + keyPattern.length });
        }
      } else if (node.type === 'object' || node.type === 'array' || node.type === 'root') {
        // For container nodes, try to highlight the key if present
        if (k !== undefined) {
          const keyPattern = '"' + String(k) + '"';
          const li = leftText.indexOf(keyPattern);
          if (li >= 0) lh.push({ from: li, to: li + keyPattern.length });
          const ri = rightText.indexOf(keyPattern);
          if (ri >= 0) rh.push({ from: ri, to: ri + keyPattern.length });
        }
      }
    }
    if (node.children) {
      for (const c of node.children) collectHighlights(c, leftText, rightText, lh, rh);
    }
  }

  const gotoNext = (dir: 1 | -1) => {
    const total = Math.max(leftHighlights.length, rightHighlights.length);
    if (total === 0) return;
    let idx = currentIndex + dir;
    if (idx < 0) idx = total - 1;
    if (idx >= total) idx = 0;
    setCurrentIndex(idx);
    const lh = leftHighlights[idx];
    const rh = rightHighlights[idx];
    if (lh && editorLeftRef.current) editorLeftRef.current.setSelection(getLineFromOffset(left, lh.from).line, getLineFromOffset(left, lh.from).col);
    if (rh && editorRightRef.current) editorRightRef.current.setSelection(getLineFromOffset(right, rh.from).line, getLineFromOffset(right, rh.from).col);
  };

  function getLineFromOffset(text: string, offset: number) {
    const safe = Math.max(0, Math.min(offset, text.length));
    const before = text.slice(0, safe);
    const lines = before.split('\n');
    return { line: lines.length, col: lines[lines.length - 1].length + 1 };
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">JSON Compare</h1>
        <div className="flex gap-2">
          <button className="btn" onClick={compare} disabled={loading}>Compare</button>
          <button className="btn" onClick={copyDifferences} disabled={!diff}><Copy className="w-4 h-4 inline" /> Copy Differences</button>
          <button className="btn" onClick={downloadDiff} disabled={!diff}><DownloadCloud className="w-4 h-4 inline" /> Download Diff</button>
          <button className="btn" onClick={() => gotoNext(-1)} disabled={!diff}><ArrowUp className="w-4 h-4 inline" /> Prev</button>
          <button className="btn" onClick={() => gotoNext(1)} disabled={!diff}><ArrowDown className="w-4 h-4 inline" /> Next</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <div className="text-sm mb-2">Left (A)</div>
          <CodeEditor ref={editorLeftRef} value={left} onChange={(v) => setLeft(v)} />
        </div>

        <div className="flex flex-col">
          <div className="text-sm mb-2">Right (B)</div>
          <CodeEditor ref={editorRightRef} value={right} onChange={(v) => setRight(v)} />
        </div>
      </div>

      <div>
        <h2 className="text-md font-semibold mb-2">Comparison Tree</h2>
        <div className="p-2 border rounded bg-white dark:bg-slate-800 max-h-[60vh] overflow-auto">
          {error && <div className="text-red-600">{error}</div>}
          {!error && !diff && <div className="text-sm text-slate-500">No comparison yet.</div>}
          {diff && <JsonCompareTree node={diff} />}
        </div>
      </div>
    </div>
  );
}
