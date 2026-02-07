<script setup lang="ts">
import { onMounted } from 'vue';
import { useProjectStore } from '@core/store';
import { LocalStorageAdapter } from './lib/vfs';

// example shadcn import:
import { Button } from '@core/components/ui/button';

const store = useProjectStore();
const vfs = new LocalStorageAdapter();

onMounted(async () => {
  // Initialize VFS with a sample file if empty
  if (!(await vfs.exists('/README.md'))) {
    await vfs.writeFile('/README.md', '# TaskMate v2\n\nWelcome to your project.');
  }

  // Initialize Project Store with a sample project
  store.setProject({
    id: '1',
    name: 'My Project',
    sources: [
      { id: 's1', type: 'file', name: 'README.md', content: await vfs.readFile('/README.md'), enabled: true }
    ],
    options: {
      includeProjectFiles: true
    },
    fileTree: 'README.md'
  });
});
</script>
<template>
  <div class="p-4 bg-gray-100 min-h-screen text-gray-800">
    <header class="mb-6 border-b pb-4 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-primary">TaskMate v2</h1>
        <p class="text-muted-foreground">Project Scaffolding & Context Manager</p>
      </div>
      <Button variant="outline">Settings</Button>
    </header>
    <div v-if="store.currentProject" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Sources Panel -->
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <h2 class="text-xl font-semibold mb-4 border-b pb-2">Sources</h2>
        <ul class="space-y-2">
          <li v-for="source in store.currentProject.sources" :key="source.id" class="flex items-center space-x-2">
            <input type="checkbox" :checked="source.enabled" @change="store.toggleSource(source.id)"
              class="rounded text-indigo-600 focus:ring-indigo-500" />
            <span>{{ source.name }}</span>
            <span class="text-xs text-gray-400 uppercase border px-1 rounded">{{ source.type }}</span>
          </li>
        </ul>
      </div>
      <!-- Prompt Preview Panel -->
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <h2 class="text-xl font-semibold mb-4 border-b pb-2">Generated Prompt Context</h2>
        <div
          class="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm font-mono leading-relaxed h-64 overflow-y-auto">
          <pre>{{ store.promptContent }}</pre>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-12 text-gray-500"> Loading project... </div>
  </div>
</template>
