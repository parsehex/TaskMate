<script setup lang="ts">
import { onMounted } from 'vue';
import { useProjectStore } from '@core/store';
import { LocalStorageAdapter } from './lib/vfs';
import ProjectList from './components/ProjectList.vue';
import FileBrowser from './components/FileBrowser.vue';
import SnippetEditor from './components/SnippetEditor.vue';
import { Button } from '@core/components/ui/button';
import { ScrollArea } from '@core/components/ui/scroll-area';
import { ChevronLeftIcon, CopyIcon, CheckIcon } from 'lucide-vue-next';
import { ref } from 'vue';

const store = useProjectStore();
const vfs = new LocalStorageAdapter();
const copied = ref(false);

onMounted(async () => {
  // Ensure basic FS structure
  if (!(await vfs.exists('/README.md'))) {
    await vfs.writeFile('/README.md', '# TaskMate v2\n\nWelcome to your project workspace.');
  }
});

function copyToClipboard() {
  navigator.clipboard.writeText(store.promptContent);
  copied.value = true;
  setTimeout(() => copied.value = false, 2000);
}

function closeProject() {
  store.currentProject = null;
}
</script>
<template>
  <div class="min-h-screen bg-background text-foreground flex flex-col">
    <header class="border-b px-6 py-3 flex justify-between items-center bg-card">
      <div class="flex items-center gap-4">
        <Button v-if="store.currentProject" variant="ghost" size="icon" @click="closeProject">
          <ChevronLeftIcon class="w-5 h-5" />
        </Button>
        <div>
          <h1 class="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            TaskMate v2 </h1>
          <p v-if="store.currentProject" class="text-xs text-muted-foreground"> {{ store.currentProject.name }} </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <SnippetEditor v-if="store.currentProject" />
        <Button variant="outline" size="sm">Settings</Button>
      </div>
    </header>
    <main class="flex-1 overflow-hidden">
      <!-- Project List View -->
      <ProjectList v-if="!store.currentProject" />
      <!-- Project Workspace View -->
      <div v-else class="h-full flex flex-col md:flex-row divide-y md:divide-x md:divide-y-0">
        <!-- Left Panel: File Browser & Sources -->
        <div class="w-full md:w-80 flex flex-col h-1/2 md:h-full bg-gray-50/50">
          <div class="p-4 border-b">
            <h3 class="font-semibold mb-2">Projects Files</h3>
            <FileBrowser :vfs="vfs" class="h-64 border rounded-md shadow-sm" />
          </div>
          <div class="flex-1 p-4 overflow-hidden flex flex-col">
            <h3 class="font-semibold mb-2 flex justify-between items-center"> Active Sources <span
                class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"> {{ store.activeSources.length }}
              </span>
            </h3>
            <ScrollArea class="flex-1 -mx-2 px-2">
              <div v-if="store.currentProject.sources.length === 0" class="text-sm text-gray-500 italic"> No sources
                added yet. </div>
              <ul class="space-y-2">
                <li v-for="source in store.currentProject.sources" :key="source.id"
                  class="flex items-center justify-between p-2 bg-white border rounded-md shadow-sm hover:shadow transition-all">
                  <div class="flex items-center gap-2 overflow-hidden">
                    <input type="checkbox" :checked="source.enabled" @change="store.toggleSource(source.id)"
                      class="rounded text-primary focus:ring-primary" />
                    <span class="text-sm truncate select-none" :class="{ 'opacity-50': !source.enabled }"> {{
                      source.name }} </span>
                  </div>
                  <Button variant="ghost" size="icon" class="h-6 w-6 text-gray-400 hover:text-destructive"
                    @click="store.removeSource(source.id)"> &times; </Button>
                </li>
              </ul>
            </ScrollArea>
          </div>
        </div>
        <!-- Right Panel: Prompt Preview -->
        <div class="flex-1 flex flex-col h-1/2 md:h-full bg-white">
          <div class="p-4 border-b flex justify-between items-center bg-gray-50/30">
            <h2 class="font-semibold">Context Preview</h2>
            <div class="flex items-center gap-2">
              <span class="text-xs text-muted-foreground font-mono"> {{ store.promptContent.length }} chars </span>
              <Button size="sm" @click="copyToClipboard" :variant="copied ? 'secondary' : 'default'">
                <CheckIcon v-if="copied" class="w-4 h-4 mr-1" />
                <CopyIcon v-else class="w-4 h-4 mr-1" /> {{ copied ? 'Copied!' : 'Copy Prompt' }}
              </Button>
            </div>
          </div>
          <div class="flex-1 p-0 relative">
            <textarea
              class="w-full h-full p-6 resize-none focus:outline-none font-mono text-sm bg-gray-50 text-gray-800 leading-relaxed"
              readonly :value="store.promptContent"></textarea>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
