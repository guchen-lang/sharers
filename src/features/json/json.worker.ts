// Worker runs in a separate thread to keep UI responsive on large JSON
export type WorkerRequest = {
  id: string;
  action: 'format' | 'minify' | 'validate' | 'parse';
  text: string;
};

export type WorkerResponse = {
  id: string;
  success: boolean;
  result?: string;
  parsed?: any;
  error?: string;
  position?: number;
  line?: number;
  column?: number;
};

function indexToLineCol(text: string, index: number) {
  const before = text.slice(0, index);
  const lines = before.split('\n');
  const line = lines.length;
  const column = lines[lines.length - 1].length + 1; // 1-based
  return { line, column };
}

self.onmessage = function (ev: MessageEvent<WorkerRequest>) {
  const msg = ev.data;
  const id = msg.id;
  try {
    if (msg.action === 'format' || msg.action === 'minify' || msg.action === 'parse' || msg.action === 'validate') {
      const parsed = JSON.parse(msg.text);
      if (msg.action === 'minify') {
        const result = JSON.stringify(parsed);
        const res: WorkerResponse = { id, success: true, result, parsed };
        // @ts-ignore
        self.postMessage(res);
        return;
      }
      if (msg.action === 'format') {
        // Pretty print with 2 spaces
        const result = JSON.stringify(parsed, null, 2);
        const res: WorkerResponse = { id, success: true, result, parsed };
        // @ts-ignore
        self.postMessage(res);
        return;
      }
      if (msg.action === 'validate' || msg.action === 'parse') {
        const result = JSON.stringify(parsed, null, 2);
        const res: WorkerResponse = { id, success: true, result, parsed };
        // @ts-ignore
        self.postMessage(res);
        return;
      }
    }
    // Unknown action
    // @ts-ignore
    self.postMessage({ id, success: false, error: 'Unknown action' });
  } catch (err: any) {
    const message = err && err.message ? String(err.message) : 'Invalid JSON';
    // try to extract position
    const m = /position (\d+)/i.exec(message) || /at position (\d+)/i.exec(message);
    let position: number | undefined;
    if (m && m[1]) position = parseInt(m[1], 10);
    let line: number | undefined;
    let column: number | undefined;
    if (typeof position === 'number' && !Number.isNaN(position)) {
      const lc = indexToLineCol(msg.text, position);
      line = lc.line;
      column = lc.column;
    }
    // @ts-ignore
    self.postMessage({ id, success: false, error: message, position, line, column });
  }
};
