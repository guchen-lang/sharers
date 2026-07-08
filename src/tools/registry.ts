import type { LazyExoticComponent, ComponentType } from 'react';
import React from 'react';
import { FileText, List, Settings as SettingsIcon, Code } from 'lucide-react';

export type ToolConfig = {
  id: string;
  name: string;
  icon: ComponentType<any>;
  category: string;
  description: string;
  keywords: string[];
  component: LazyExoticComponent<ComponentType<any>>;
  route: string;
};

// Lazy load feature pages so adding a tool doesn't bloat initial bundle
const NotesPage = async () => (await import('../features/notes/NotesPage')).default;
const TodosPage = async () => (await import('../features/todos/TodosPage')).default;
const SettingsPage = async () => (await import('../features/settings/SettingsPage')).default;

export const tools: ToolConfig[] = [
  {
    id: 'notes',
    name: 'Notes',
    icon: FileText,
    category: 'Productivity',
    description: 'Markdown notes with offline persistence',
    keywords: ['note', 'markdown', 'editor'],
    component: React.lazy(NotesPage),
    route: '/notes'
  },
  {
    id: 'todos',
    name: 'Todos',
    icon: List,
    category: 'Productivity',
    description: 'Simple todos and task lists',
    keywords: ['todo', 'tasks', 'checklist'],
    component: React.lazy(TodosPage),
    route: '/todos'
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: SettingsIcon,
    category: 'System',
    description: 'Application settings and preferences',
    keywords: ['settings', 'theme', 'preferences'],
    component: React.lazy(SettingsPage),
    route: '/settings'
  },
  {
    id: 'json',
    name: 'JSON',
    icon: Code,
    category: 'Utilities',
    description: 'Format, minify, validate and inspect JSON (offline)',
    keywords: ['json', 'format', 'minify', 'validate'],
    component: React.lazy(() => import('../features/json/JsonPage')),
    route: '/json'
  },
  {
    id: 'json-compare',
    name: 'JSON Compare',
    icon: Code,
    category: 'Utilities',
    description: 'Compare two JSON documents side-by-side and highlight differences',
    keywords: ['json', 'compare', 'diff', 'compare json'],
    component: React.lazy(() => import('../features/json-compare/JsonComparePage')),
    route: '/json-compare'
  }
];
