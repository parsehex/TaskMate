<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useProjectStore } from '@core/store';
import { LocalStorageAdapter } from '../lib/vfs';
import { Button } from '@core/components/ui/button';
import { ScrollArea } from '@core/components/ui/scroll-area';
import { FileIcon, FolderIcon, PlusIcon } from 'lucide-vue-next';
import type { FileStat } from '@core/fs';

const props = defineProps<{
	vfs: LocalStorageAdapter
}>();

const store = useProjectStore();
const currentPath = ref('/');
const files = ref<FileStat[]>([]);

async function loadDir(path: string) {
	files.value = await props.vfs.readDir(path);
	currentPath.value = path;
}

onMounted(() => {
	loadDir('/');
});

async function handleNavigate(path: string) {
	await loadDir(path);
}

async function handleUp() {
	const parts = currentPath.value.split('/').filter(Boolean);
	parts.pop();
	const parent = '/' + parts.join('/');
	await loadDir(parent || '/');
}

async function addFileSource(file: FileStat) {
	if (file.type !== 'file') return;

	const content = await props.vfs.readFile(file.path);

	store.addSource({
		id: crypto.randomUUID(),
		type: 'file',
		name: file.name,
		content,
		enabled: true,
		meta: { path: file.path }
	});
}

function isAdded(path: string) {
	return store.currentProject?.sources.some(s => s.meta?.path === path);
}
</script>
<template>
	<div class="flex flex-col h-full border rounded-lg bg-white">
		<div class="p-3 border-b flex items-center justify-between bg-gray-50">
			<div class="flex items-center gap-2">
				<Button variant="ghost" size="icon" :disabled="currentPath === '/'" @click="handleUp"> ← </Button>
				<span class="font-mono text-sm">{{ currentPath }}</span>
			</div>
			<!-- Placeholder for Create File/Folder actions -->
		</div>
		<ScrollArea class="flex-1 p-2">
			<div v-if="files.length === 0" class="text-center py-4 text-gray-400 text-sm"> Empty directory </div>
			<div class="space-y-1">
				<div v-for="file in files" :key="file.path"
					class="flex items-center justify-between p-2 hover:bg-gray-100 rounded group">
					<div class="flex items-center gap-2 flex-1 cursor-pointer"
						@click="file.type === 'directory' ? handleNavigate(file.path) : null">
						<FolderIcon v-if="file.type === 'directory'" class="w-4 h-4 text-blue-500" />
						<FileIcon v-else class="w-4 h-4 text-gray-500" />
						<span class="text-sm truncate">{{ file.name }}</span>
					</div>
					<Button v-if="file.type === 'file'" variant="ghost" size="icon"
						class="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" :disabled="isAdded(file.path)"
						:title="isAdded(file.path) ? 'Already added' : 'Add to Project'" @click="addFileSource(file)">
						<PlusIcon class="w-4 h-4" />
					</Button>
				</div>
			</div>
		</ScrollArea>
	</div>
</template>
