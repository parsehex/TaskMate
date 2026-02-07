<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
import { useProjectStore } from '@core/store';
import { LocalStorageAdapter } from '../lib/vfs';
import FileBrowser from '../components/FileBrowser.vue';
import CreateSnippetDialog from '../components/CreateSnippetDialog.vue';
import SnippetList from '../components/SnippetList.vue';
import { Button } from '@core/components/ui/button';
import { ChevronLeftIcon, CopyIcon, CheckIcon, EyeIcon, XIcon } from 'lucide-vue-next';
import { Input } from '@core/components/ui/input';
import { Textarea } from '@core/components/ui/textarea';
import { ScrollArea } from '@core/components/ui/scroll-area';
import { useRouter } from 'vue-router';

const props = defineProps<{
    id: string
}>();

const store = useProjectStore();
const router = useRouter();
const vfs = new LocalStorageAdapter();
const copied = ref(false);
const selectedPartId = ref<string | null>(null);
const isReady = ref(false);

const selectedPart = computed(() => {
    if (!selectedPartId.value || !store.currentProject) return null;
    return store.currentProject.promptParts.find(p => p.id === selectedPartId.value) || null;
});

const editorContent = ref('');
const editorName = ref('');
const isReadOnly = ref(false);
const allowFileEditing = ref(true); // Flag to control file editing capability

watch([selectedPart, () => selectedPartId.value], async ([newPart, newId]) => {
    isReadOnly.value = false;
    if (newPart) {
        editorContent.value = newPart.content;
        editorName.value = newPart.name;
        // Files are editable if allowFileEditing is true
        if (newPart.type === 'file' && !allowFileEditing.value) {
            isReadOnly.value = true;
        }
        // Project Files are always read-only
        if (newPart.meta?.isProjectFiles) {
            isReadOnly.value = true;
        }
    } else if (newId && typeof newId === 'string' && newId.startsWith('/')) {
        const path = newId;
        try {
            editorName.value = path.split('/').pop() || path;
            editorContent.value = await vfs.readFile(path);
            // Files are editable if allowFileEditing is true
            if (!allowFileEditing.value) {
                isReadOnly.value = true;
            }
        } catch (e) {
            editorContent.value = 'Error loading file.';
            isReadOnly.value = true;
        }
    } else {
        editorContent.value = '';
        editorName.value = '';
    }
});

async function savePart() {
    if (isReadOnly.value) return;

    if (selectedPart.value) {
        // Saving a Part
        const updates: any = {
            ...selectedPart.value,
            name: editorName.value,
            content: editorContent.value
        };

        // If it's a file part, also write to VFS
        if (selectedPart.value.type === 'file' && selectedPart.value.meta?.path) {
            await vfs.writeFile(selectedPart.value.meta.path, editorContent.value);
            // Also refresh file tree/browser if needed?
        }

        store.updatePromptPart(updates);
    } else if (selectedPartId.value && typeof selectedPartId.value === 'string' && selectedPartId.value.startsWith('/')) {
        // Saving a File (Preview mode)
        const path = selectedPartId.value;
        await vfs.writeFile(path, editorContent.value);

        // If this file is also an active part (though selectedPart would likely be set if it was matched by handleSelectFile...
        // actually handleSelectFile prioritizes Part ID if found. So this block handles case where file is NOT yet a part.)
        // But what if we want to update the part if it exists but we somehow selected by path?
        // handleSelectFile logic prevents this mostly.

        // Trigger a change event or refresh?
        // We might need to refresh file tree if content affects it (unlikely) or just good practice.
    }
}

onMounted(async () => {
    store.loadProject(props.id);
    if (!store.currentProject) {
        // Project not found? Redirect home
        router.push('/');
        return;
    }

    // FS Init Logic (ensure files exist for every project session)
    try {
        // Update file tree
        const tree = await vfs.generateFileTree();
        store.updateProject({ fileTree: tree });
    } catch (e) {
        console.error("FS Init Error", e);
    } finally {
        isReady.value = true;
    }
});

onUnmounted(() => {
    store.currentProject = null;
});

function copyToClipboard() {
    navigator.clipboard.writeText(store.promptContent);
    copied.value = true;
    setTimeout(() => copied.value = false, 2000);
}

function handleBack() {
    router.push('/');
}

function handleSelectPart(id: string) {
    selectedPartId.value = id;
}

function handleSelectFile(path: string) {
    const part = store.currentProject?.promptParts.find(p => p.meta?.path === path);
    if (part) {
        selectedPartId.value = part.id;
    } else {
        selectedPartId.value = path;
    }
}

async function refreshFileTree() {
    const tree = await vfs.generateFileTree();
    store.updateProject({ fileTree: tree });
}
</script>
<template>
    <div v-if="store.currentProject && isReady" class="h-full flex flex-col font-sans">
        <!-- Project Header -->
        <header class="border-b px-4 py-2 flex justify-between items-center bg-white shadow-sm z-10 flex-none">
            <div class="flex items-center gap-3">
                <Button variant="ghost" size="icon" @click="handleBack" class="h-8 w-8">
                    <ChevronLeftIcon class="w-4 h-4" />
                </Button>
                <div class="flex items-center gap-2">
                    <h1
                        class="font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent text-lg">
                        TaskMate <span class="text-xs font-medium text-gray-500">v2</span>
                    </h1>
                    <div class="h-4 w-px bg-gray-300 mx-1"></div>
                    <p class="text-sm font-medium text-gray-700"> {{ store.currentProject.name }} </p>
                    <div class="flex items-center gap-2 ml-8">
                        <div class="flex items-center gap-2">
                            <Button size="sm" @click="copyToClipboard" :variant="copied ? 'secondary' : 'default'">
                                <CheckIcon v-if="copied" class="w-4 h-4 mr-1" />
                                <CopyIcon v-else class="w-4 h-4 mr-1" /> {{ copied ? 'Copied!' : 'Copy Prompt' }}
                            </Button>
                            <span class="text-xs text-muted-foreground font-mono"> {{ store.promptContent.length }}
                                chars </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <!-- Project Actions -->
            </div>
        </header>
        <div class="flex-1 flex flex-col md:flex-row divide-y md:divide-x md:divide-y-0 overflow-hidden">
            <!-- Left Panel: Snippets & Files -->
            <div class="w-full md:w-80 flex flex-col h-1/2 md:h-full bg-gray-50/50">
                <!-- Top: Snippets -->
                <div class="flex-1 flex flex-col min-h-0 border-b">
                    <div class="p-3 border-b flex justify-between items-center bg-white">
                        <span class="font-semibold text-sm">Snippets</span>
                        <CreateSnippetDialog />
                    </div>
                    <SnippetList @select="handleSelectPart" class="flex-1 border-none rounded-none" />
                </div>
                <!-- Bottom: Files -->
                <div class="flex-1 flex flex-col min-h-0">
                    <div class="p-3 border-b bg-white">
                        <span class="font-semibold text-sm">Files</span>
                    </div>
                    <FileBrowser :vfs="vfs" @select-file="handleSelectFile" @change="refreshFileTree"
                        class="flex-1 border-none rounded-none" />
                </div>
            </div>
            <!-- Right Panel: Editor / Preview -->
            <div class="flex-1 flex flex-col h-1/2 md:h-full bg-white relative">
                <!-- Editor Toolbar -->
                <div class="h-12 border-b flex justify-between items-center px-4 bg-white/80 backdrop-blur">
                    <div class="flex items-center gap-2 flex-1">
                        <template v-if="selectedPartId">
                            <Button v-if="selectedPartId" size="icon-sm" variant="destructive-outline"
                                @click="selectedPartId = null">
                                <XIcon class="w-4 h-4" />
                            </Button>
                            <span v-if="selectedPart"
                                class="text-xs font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 uppercase">{{
                                    selectedPart.type }}</span>
                            <span v-else
                                class="text-xs font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 uppercase">FILE
                                PREVIEW</span>
                            <Input v-if="selectedPart && !isReadOnly" v-model="editorName"
                                class="h-8 w-48 font-medium bg-transparent border-transparent hover:border-input focus:border-input transition-colors"
                                placeholder="Name" @blur="savePart" />
                            <span v-else class="font-medium text-sm px-3">{{ editorName }}</span>
                        </template>
                        <template v-else>
                            <EyeIcon class="w-4 h-4 text-gray-400" />
                            <span class="text-sm font-medium text-gray-600">Prompt Preview</span>
                        </template>
                    </div>
                </div>
                <!-- Content Area -->
                <div class="flex-1 relative overflow-hidden">
                    <!-- Part Editor / Preview -->
                    <div v-if="selectedPartId" class="h-full flex flex-col">
                        <Textarea v-model="editorContent"
                            class="flex-1 p-6 resize-none focus:outline-none font-mono text-sm bg-white text-gray-800 leading-relaxed border-0 shadow-none rounded-none"
                            placeholder="Type something..." :readonly="isReadOnly" @blur="savePart" />
                    </div>
                    <!-- Prompt Preview -->
                    <div v-else class="h-full relative overflow-hidden bg-gray-50">
                        <ScrollArea class="h-full w-full">
                            <div class="p-6">
                                <pre
                                    class="font-mono text-sm text-gray-800 whitespace-pre-wrap">{{ store.promptContent }}</pre>
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else class="h-full flex items-center justify-center">
        <div v-if="!isReady" class="animate-pulse">Loading Workspace...</div>
        <div v-else>Project not found.</div>
    </div>
</template>
