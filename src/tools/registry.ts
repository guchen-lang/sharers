diff --git a/src/tools/registry.ts b/src/tools/registry.ts
index 0000000..0000000 100644
--- a/src/tools/registry.ts
+++ b/src/tools/registry.ts
@@
 import { FileText, List, Settings as SettingsIcon } from 'lucide-react';
+import { Code } from 'lucide-react';
@@
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
   }
+  ,
+  {
+    id: 'json',
+    name: 'JSON',
+    icon: Code,
+    category: 'Utilities',
+    description: 'Format, minify, validate and inspect JSON (offline)',
+    keywords: ['json', 'format', 'minify', 'validate'],
+    component: React.lazy(() => import('../features/json/JsonPage')),
+    route: '/json'
+  }
 ];
