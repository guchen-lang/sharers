import type { DiffNode } from './diffUtils';
import { buildDiffTree } from './diffUtils';

export type CompareRequest = {
  id: string;
  leftText: string;
  rightText: string;
};

export type CompareResponse = {
  id: string;
  success: boolean;
  diff?: DiffNode;
  error?: string;
};

self.onmessage = function (ev: MessageEvent<CompareRequest>) {
  const msg = ev.data;
  const id = msg.id;
  try {
    const left = JSON.parse(msg.leftText);
    const right = JSON.parse(msg.rightText);
    const diff = buildDiffTree(left, right);
    // @ts-ignore
    self.postMessage({ id, success: true, diff } as CompareResponse);
  } catch (err: any) {
    const message = err && err.message ? String(err.message) : 'Invalid JSON';
    // @ts-ignore
    self.postMessage({ id, success: false, error: message } as CompareResponse);
  }
};
