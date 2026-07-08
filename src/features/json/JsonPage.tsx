import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Code, UploadCloud, DownloadCloud, FileText, CheckCircle, AlertCircle, Copy } from 'lucide-react';

import JsonTree from '../../shared/components/JsonTree';
import { useLocalStorage } from '../../shared/hooks/useLocalStorage';
import CodeEditor, { CodeEditorHandle } from '../../shared/components/CodeEditor';

// Worker types
import type { WorkerRequest, WorkerResponse } from './json.worker';

const WORKER_PATH = new URL('./json.worker.ts', import.meta.url);

export default function JsonPage(): JSX.Element {
  const [input, setInput] = useLocalStorage('devbox.json.lastInput', '{\n  "hello": "world"\n}');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<{ message: string; line?: number; column?: number } | null>(null);
  const [parsed, setParsed] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const pendingId = useRef(0);
  const editorRef = useRef<CodeEditorHandle | null>(null);
  const debounceTimer = useRef<number | null>(null);

  useEffect(() => {
    const w = new Worker(WORKER_PATH, { type: 'module' });
    workerRef.current = w;
    w.onmessage = (ev: MessageEvent<WorkerResponse>) => {
      const res = ev.data;
      if (!res) return;
      setLoading(false);
      if (res.success) {
        setError(null);
        if (res.result !== undefined) setOutput(res.result);
        if (res.parsed !== undefined) setParsed(res.parsed);
        setMessage('OK');
        window.setTimeout(() => setMessage(null), 1200);
      } else {
        setOutput('');
        setParsed(undefined);
        setError({ message: res.error ?? 'Unknown parse error', line: res.line, column: res.column });
        if (res.line !== undefined && editorRef.current) editorRef.current.setSelection(res.line, res.column);
      }
    };
    return () => {
      w.terminate();
      workerRef.current = null;
    };
  }, []);

  const postAction = (action: WorkerRequest['action'], text?: string) => {
    const w = workerRef.current;
    if (!w) return;
    const id = String(++pendingId.current);
    setLoading(true);
    w.postMessage({ id, action, text: text ?? input });
  };

  useEffect(() => {
    // debounced auto-validate on input change
    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(() => {
      postAction('validate');
    }, 800) as unknown as number;
    return () => {
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const handleFormat = () => postAction('format');
  const handleMinify = () => postAction('minify');
  const handleValidate = () => postAction('validate');
  const handleParse = () => postAction('parse');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output || input);
      setMessage('Copied');
      window.setTimeout(() => setMessage(null), 1200);
    } catch (e) {
      setMessage('Copy failed');
      window.setTimeout(() => setMessage(null), 1200);
    }
  };

  const handleDownload = () => {
    const text = output || input;
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const txt = await f.text();
    setInput(txt);
    postAction('parse', txt);
  };

  const canShowTree = parsed !== null && parsed !== undefined && typeof parsed === 'object';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-lg font-semibold flex items-center gap-2"><Code className="w-5 h-5" /> JSON Tool</h1>
          <div className="ml-auto flex gap-2">
            <button onClick={handleFormat} className="btn">Format</button>
            <button onClick={handleMinify} className="btn">Minify</button>
            <button onClick={handleValidate} className="btn">Validate</button>
            <button onClick={handleCopy} className="btn">Copy</button>
            <button onClick={handleDownload} className="btn">Download</button>
            <button onClick={handleUploadClick} className="btn">Upload</button>
            <input ref={fileInputRef} type="file" accept="application/json" onChange={handleFile} style={{ display: 'none' }} />
          </div>
        </div>

        <div className="flex-1">
          <CodeEditor
            ref={editorRef}
            value={input}
            onChange={(v) => setInput(v)}
          />
        </div>

        <div className="mt-2 flex items-center gap-2">
          <div className="text-sm text-slate-500">Last output: {loading ? 'Processing...' : parsed ? 'OK' : '—'}</div>
          {message && <div className="text-sm text-slate-600">{message}</div>}
          {error && (
            <div className="text-sm text-red-600 flex items-center gap-2"><AlertCircle className="w-4 h-4" />
              <div>
                <div>{error.message}</div>
                {error.line !== undefined && (
                  <div className="text-xs text-slate-500">Line: {error.line}, Column: {error.column}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="md:col-span-1">
        <div className="mb-2 flex items-center gap-2">
          <h2 className="text-md font-semibold flex items-center gap-2"><FileText className="w-4 h-4" /> Preview</h2>
          <div className="ml-auto text-sm text-slate-500">{loading ? 'Processing...' : ''}</div>
        </div>

        <div className="p-2 bg-white dark:bg-slate-800 rounded border h-[70vh] overflow-auto">
          {error ? (
            <div className="text-sm text-red-600">
              <div className="font-medium">Error: {error.message}</div>
              {error.line !== undefined && (
                <div className="text-xs text-slate-500">Line {error.line}, Column {error.column}</div>
              )}
            </div>
          ) : (
            <div>
              <pre className="whitespace-pre-wrap font-mono text-sm text-slate-800 dark:text-slate-100">{output}</pre>
            </div>
          )}

          {canShowTree && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">Tree View</h3>
              <JsonTree data={parsed} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
