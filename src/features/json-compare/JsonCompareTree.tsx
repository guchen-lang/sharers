import React, { useState } from 'react';
import type { DiffNode } from './diffUtils';

function statusColor(status: string) {
  switch (status) {
    case 'equal':
      return 'text-slate-600';
    case 'added':
      return 'text-green-600';
    case 'removed':
      return 'text-red-600';
    case 'changed':
      return 'text-yellow-600';
    case 'type-changed':
      return 'text-pink-600';
    default:
      return 'text-slate-600';
  }
}

export default function JsonCompareTree({ node }: { node: DiffNode }) {
  return (
    <div>
      <NodeView node={node} path={[]} />
    </div>
  );
}

function NodeView({ node, path }: { node: DiffNode; path: (string | number)[] }) {
  const [open, setOpen] = useState(true);
  const keyLabel = node.key !== undefined ? String(node.key) : '(root)';
  const colorClass = statusColor(node.status);

  return (
    <div className="ml-2">
      <div className="flex items-center gap-2">
        {node.children && node.children.length > 0 && (
          <button className="w-5" onClick={() => setOpen((s) => !s)}>{open ? '▾' : '▸'}</button>
        )}
        <div className={`font-mono text-sm ${colorClass}`}>
          <strong>{keyLabel}</strong>
          {node.type !== 'root' && (
            <span className="ml-2 text-xs text-slate-500">[{node.type}]</span>
          )}
          <span className="ml-2 text-xs text-slate-400">{node.status}</span>
        </div>
      </div>

      <div className="ml-6">
        {node.status !== 'equal' && node.type === 'primitive' && (
          <div className="text-xs">
            <div className="text-red-600">A: {JSON.stringify(node.left)}</div>
            <div className="text-green-600">B: {JSON.stringify(node.right)}</div>
          </div>
        )}

        {node.children && open && (
          <div>
            {node.children.map((c) => (
              <NodeView key={String(c.key)} node={c} path={[...path, c.key ?? '']} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
