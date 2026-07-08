import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Sidebar from './shared/components/Sidebar';
import { tools } from './tools/registry';

const JsonComparePage = React.lazy(() => import('./features/json-compare/JsonComparePage'));

export default function App() {
  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Sidebar />
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Explicit route for JSON Compare to ensure the page renders even if tools mapping has issues */}
          <Route
            path="/json-compare"
            element={
              <Suspense fallback={<div>Loading JSON Compare...</div>}>
                <JsonComparePage />
              </Suspense>
            }
          />

          {tools.map((t) => {
            const Comp = t.component;
            return (
              <Route
                key={t.id}
                path={t.route}
                element={
                  <Suspense fallback={<div>Loading {t.name}...</div>}>
                    <Comp />
                  </Suspense>
                }
              />
            );
          })}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
