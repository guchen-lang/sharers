import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { ToolConfig } from '../../tools/registry';
import { tools } from '../../tools/registry';

function ToolIcon({ Icon }: { Icon: React.ComponentType<any> }) {
  return <Icon className="w-4 h-4 inline-block mr-2" />;
}

export default function Sidebar() {
  const [query, setQuery] = useState('');
  const location = useLocation();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tools;
    return tools.filter((t) => {
      const hay = [t.name, t.description, ...t.keywords].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  const categories = useMemo(() => {
    const map = new Map<string, ToolConfig[]>();
    for (const t of filtered) {
      const list = map.get(t.category) ?? [];
      list.push(t);
      map.set(t.category, list);
    }
    return map;
  }, [filtered]);

  return (
    <aside className="w-72 p-4 border-r bg-white dark:bg-slate-900">
      <div className="mb-4">
        <div className="text-lg font-semibold">Tools</div>
        <div className="text-sm text-slate-500 dark:text-slate-400">Offline-first toolbox</div>
      </div>

      <div className="mb-3">
        <input
          aria-label="Search tools"
          placeholder="Search tools..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-2 py-1 rounded border text-sm bg-slate-50 dark:bg-slate-800"
        />
      </div>

      <nav aria-label="Tool list">
        {[...categories.entries()].map(([category, items]) => (
          <div key={category} className="mb-4">
            <div className="text-xs font-medium text-slate-500 uppercase mb-2">{category}</div>
            <ul className="space-y-1">
              {items.map((t) => (
                <li key={t.id}>
                  <Link
                    to={t.route}
                    className={`flex items-center px-2 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${{
                      true: 'font-medium'
                    }[String(location.pathname === t.route)]}`}
                    aria-current={location.pathname === t.route ? 'page' : undefined}
                  >
                    <ToolIcon Icon={t.icon} />
                    <div>
                      <div className="text-sm">{t.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{t.description}</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
