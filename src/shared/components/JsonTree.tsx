import React, { useState } from 'react';

type NodeProps = { k?: string | number; data: any };

function isObject(val: any) {
  return val && typeof val === 'object' && !Array.isArray(val);
}

const MAX_VISIBLE = 200; // threshold to avoid rendering very large lists

export default function JsonTree({ data }: { data: any }) {
  return (
    <div className="text-sm font-mono">
      <JsonNode data={data} />
    </div>
  );
}

function JsonNode({ k, data }: NodeProps) {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const type = Array.isArray(data) ? 'array' : isObject(data) ? 'object' : typeof data;

  if (type === 'object') {
    const keys = Object.keys(data);
    const visibleKeys = showAll ? keys : keys.slice(0, MAX_VISIBLE);
    return (
      <div className="ml-2">
        <div className="cursor-pointer select-none text-slate-700 dark:text-slate-200" onClick={() => setOpen((s) => !s)}>
          <span className="mr-1">{open ? '▾' : '▸'}</span>
          <strong>{k !== undefined ? `${k}: ` : ''}{'{...}'}</strong>
        </div>
        {open && (
          <div className="ml-4 border-l pl-2">
            {visibleKeys.map((key) => (
              <JsonNode key={String(key)} k={key} data={data[key]} />
            ))}
            {keys.length > MAX_VISIBLE && !showAll && (
              <div className="mt-1">
                <button className="text-sm underline" onClick={() => setShowAll(true)}>Show all {keys.length} keys</button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (type === 'array') {
    const len = data.length;
    const visible = showAll ? data : data.slice(0, MAX_VISIBLE);
    return (
      <div className="ml-2">
        <div className="cursor-pointer select-none text-slate-700 dark:text-slate-200" onClick={() => setOpen((s) => !s)}>
          <span className="mr-1">{open ? '▾' : '▸'}</span>
          <strong>{k !== undefined ? `${k}: ` : ''}[{len}]</strong>
        </div>
        {open && (
          <div className="ml-4 border-l pl-2">
            {visible.map((item: any, idx: number) => (
              <JsonNode key={idx} k={idx} data={item} />
            ))}
            {len > MAX_VISIBLE && !showAll && (
              <div className="mt-1">
                <button className="text-sm underline" onClick={() => setShowAll(true)}>Show first {MAX_VISIBLE} of {len} items</button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // primitive
  return (
    <div className="ml-2 text-slate-700 dark:text-slate-200">
      <span className="text-slate-500 mr-1">{k !== undefined ? `${k}:` : ''}</span>
      <span className="font-medium">{String(data)}</span>
    </div>
  );
}
