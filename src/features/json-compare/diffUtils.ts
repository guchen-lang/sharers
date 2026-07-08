export type DiffStatus = 'equal' | 'added' | 'removed' | 'changed' | 'type-changed';

export type DiffNode = {
  key?: string | number;
  type: 'object' | 'array' | 'primitive' | 'root';
  status: DiffStatus;
  left?: any;
  right?: any;
  children?: DiffNode[];
};

function isObject(v: any) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function isPrimitive(v: any) {
  return v === null || typeof v !== 'object';
}

export function diffValues(left: any, right: any, key?: string | number): DiffNode {
  if (isPrimitive(left) && isPrimitive(right)) {
    if (left === right) return { key, type: 'primitive', status: 'equal', left, right };
    return { key, type: 'primitive', status: 'changed', left, right };
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    const len = Math.max(left.length, right.length);
    const children: DiffNode[] = [];
    for (let i = 0; i < len; i++) {
      if (i >= left.length) {
        children.push({ key: i, type: 'primitive', status: 'added', left: undefined, right: right[i] });
      } else if (i >= right.length) {
        children.push({ key: i, type: 'primitive', status: 'removed', left: left[i], right: undefined });
      } else {
        children.push(diffValues(left[i], right[i], i));
      }
    }
    const status = children.every((c) => c.status === 'equal') ? 'equal' : 'changed';
    return { key, type: 'array', status, left, right, children };
  }

  if (isObject(left) && isObject(right)) {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    const allKeys = Array.from(new Set([...leftKeys, ...rightKeys]));
    // ignore key order by using set; preserve sorted order for stable UI
    allKeys.sort();
    const children: DiffNode[] = [];
    for (const k of allKeys) {
      if (!(k in left)) {
        children.push({ key: k, type: 'primitive', status: 'added', left: undefined, right: right[k] });
      } else if (!(k in right)) {
        children.push({ key: k, type: 'primitive', status: 'removed', left: left[k], right: undefined });
      } else {
        children.push(diffValues(left[k], right[k], k));
      }
    }
    const status = children.every((c) => c.status === 'equal') ? 'equal' : 'changed';
    return { key, type: 'object', status, left, right, children };
  }

  // types differ
  return { key, type: 'primitive', status: 'type-changed', left, right };
}

export function buildDiffTree(left: any, right: any): DiffNode {
  const root = diffValues(left, right, undefined);
  root.type = 'root';
  return root;
}
