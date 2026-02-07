<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useProjectStore } from '@core/store';
import { LocalStorageAdapter } from '../lib/vfs';
import { Button } from '@core/components/ui/button';
import { ScrollArea } from '@core/components/ui/scroll-area';
import { FileIcon, FolderIcon, Trash2Icon } from 'lucide-vue-next';
import type { FileStat } from '@core/fs';

import CreateFileDialog from './CreateFileDialog.vue';
import ConfirmDialog from './ConfirmDialog.vue';

const props = defineProps<{
	vfs: LocalStorageAdapter
}>();

const emit = defineEmits<{
	(e: 'select-file', path: string): void,
	(e: 'change'): void
}>();

const store = useProjectStore();
const currentPath = ref('/');
const files = ref<FileStat[]>([]);

// Delete Dialog State
const deleteDialog = ref<InstanceType<typeof ConfirmDialog> | null>(null);
const fileToDelete = ref<string | null>(null);

async function loadDir(path: string) {
	files.value = await props.vfs.readDir(path);
	currentPath.value = path;
}

onMounted(async () => {
	// Initial load
	await loadDir('/');
});

// Watch for VFS changes or explicitly reload when prop changes (if vfs was reactive, but it's not usually)
// However, we can add a method to refresh explicitly if needed, but for now let's just log.
// If the VFS is empty at first, it might be because the files haven't been written to LocalStorage yet in the parent.
// But we await the write in parent before setting isReady.

async function handleNavigate(path: string) {
	await loadDir(path);
}

async function handleUp() {
	const parts = currentPath.value.split('/').filter(Boolean);
	parts.pop();
	const parent = '/' + parts.join('/');
	await loadDir(parent || '/');
}

async function handleCreateFile(name: string) {
	if (!name) return;
	const path = currentPath.value === '/' ? `/${name}` : `${currentPath.value}/${name}`;
	await props.vfs.writeFile(path, '');
	await loadDir(currentPath.value);
	emit('change');
}

function confirmDelete(path: string) {
	fileToDelete.value = path;
	deleteDialog.value?.open();
}

async function handleDelete() {
	if (fileToDelete.value) {
		const path = fileToDelete.value;
		await props.vfs.rm(path);

		// Remove from project if added
		const partId = getPromptPartId(path);
		if (partId) {
			store.removePromptPart(partId);
		}

		await loadDir(currentPath.value);
		emit('change');
		fileToDelete.value = null;
	}
}

async function toggleFilePart(file: FileStat) {
	if (file.type !== 'file') return;

	// Check if already exists
	const existing = store.currentProject?.promptParts.find(p => p.meta?.path === file.path);
	if (existing) {
		store.removePromptPart(existing.id);
		return;
	}

	const content = await props.vfs.readFile(file.path);

	store.addPromptPart({
		id: crypto.randomUUID(),
		type: 'file',
		name: file.name,
		content,
		enabled: true,
		meta: { path: file.path }
	});
}

function getPromptPartId(path: string) {
	return store.currentProject?.promptParts.find(s => s.meta?.path === path)?.id;
}

function isAdded(path: string) {
	return !!getPromptPartId(path);
}
</script>
<template>
	<div class="flex flex-col h-full border rounded-lg bg-white overflow-hidden">
		<div class="p-3 border-b flex items-center justify-between bg-gray-50 flex-none">
			<div class="flex items-center gap-2 overflow-hidden">
				<Button variant="ghost" size="icon" :disabled="currentPath === '/'" @click="handleUp" class="h-6 w-6"> ←
				</Button>
				<span class="font-mono text-xs truncate max-w-[150px]" :title="currentPath">{{ currentPath }}</span>
			</div>
		</div>
		<div class="flex items-center gap-2">
			<CreateFileDialog @create="handleCreateFile" />
		</div>
	</div>
	<ScrollArea class="flex-1 p-2">
		<div v-if="files.length === 0" class="text-center py-4 text-gray-400 text-sm"> Empty directory </div>
		<div class="space-y-1">
			<div v-for="file in files" :key="file.path"
				class="flex items-center justify-between p-2 hover:bg-gray-100 rounded group cursor-pointer"
				@click="file.type === 'directory' ? handleNavigate(file.path) : emit('select-file', file.path)">
				<div class="flex items-center gap-2 flex-1 overflow-hidden">
					<input v-if="file.type === 'file'" type="checkbox" :checked="isAdded(file.path)"
						@change.stop="toggleFilePart(file)" @click.stop class="rounded text-primary focus:ring-primary mr-2" />
					<span v-else class="w-6"></span>
					<FolderIcon v-if="file.type === 'directory'" class="w-4 h-4 text-blue-500 flex-shrink-0" />
					<FileIcon v-else class="w-4 h-4 text-gray-500 flex-shrink-0" />
					<span class="text-sm truncate">{{ file.name }}</span>
				</div>
				<!-- Delete Button -->
				<Button variant="ghost" size="icon"
					class="h-6 w-6 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-destructive"
					@click.stop="confirmDelete(file.path)">
					<Trash2Icon class="w-4 h-4" />
				</Button>
			</div>
		</div>
		<ConfirmDialog ref="deleteDialog" title="Delete File"
			description="Are you sure you want to delete this file/folder? This cannot be undone." :destructive="true"
			confirm-text="Delete" @confirm="handleDelete" />
	</ScrollArea>
</template>
