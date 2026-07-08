import { indexToLineCol, extractPositionFromErrorMessage } from './jsonWorkerUtils';

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
    // try to extract position using helper
    let position = extractPositionFromErrorMessage(message);
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
