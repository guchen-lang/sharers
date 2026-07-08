import React, { Suspense } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import './styles/globals.css';

const NotesPage = React.lazy(() => import('./features/notes/NotesPage'));
const TodosPage = React.lazy(() => import('./features/todos/TodosPage'));
const SettingsPage = React.lazy(() => import('./features/settings/SettingsPage'));

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="p-4 border-b">
        <nav className="container mx-auto flex gap-4">
          <Link to="/" className="font-semibold">
            DevBox
          </Link>
          <Link to="/notes" className="text-sm text-slate-600 dark:text-slate-300">
            Notes
          </Link>
          <Link to="/todos" className="text-sm text-slate-600 dark:text-slate-300">
            Todos
          </Link>
          <Link to="/settings" className="text-sm text-slate-600 dark:text-slate-300">
            Settings
          </Link>
        </nav>
      </header>

      <main className="container mx-auto p-4">
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/todos" element={<TodosPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
