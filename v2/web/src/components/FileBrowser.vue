<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useProjectStore } from '@core/store';
import { LocalStorageAdapter } from '../lib/vfs';
import { Button } from '@core/components/ui/button';
import { ScrollArea } from '@core/components/ui/scroll-area';
import { FileIcon, FolderIcon, Trash2Icon, PencilIcon } from 'lucide-vue-next';
import type { FileStat } from '@core/fs';

import CreateFileDialog from './CreateFileDialog.vue';
import ConfirmDialog from './ConfirmDialog.vue';
import RenameFileDialog from './RenameFileDialog.vue';

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

// Rename Dialog State
const renameDialog = ref<InstanceType<typeof RenameFileDialog> | null>(null);
const fileToRename = ref<string | null>(null);

async function loadDir(path: string) {
	files.value = await props.vfs.readDir(path);
	currentPath.value = path;
}

onMounted(async () => {
	await loadDir('/');
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

function openRenameDialog(path: string) {
	fileToRename.value = path;
	const currentName = path.split('/').pop() || '';
	renameDialog.value?.open(currentName);
}

async function handleRename(newName: string) {
	if (!fileToRename.value || !newName) return;

	const oldPath = fileToRename.value;
	// Calculate new path
	const parentPath = oldPath.substring(0, oldPath.lastIndexOf('/'));
	const newPath = parentPath === '' ? `/${newName}` : `${parentPath}/${newName}`;

	try {
		await props.vfs.rename(oldPath, newPath);

		// If the file was in the project as a snippet, we should probably update it or remove/re-add it
		// For now, let's just remove the old one if it exists to prevent broken links
		const partId = getPromptPartId(oldPath);
		if (partId) {
			// Update the part meta path and name
			const part = store.currentProject?.promptParts.find(p => p.id === partId);
			if (part && part.type === 'file') {
				store.updatePromptPart({
					...part,
					name: newName,
					meta: { ...part.meta, path: newPath }
				});
			}
		}

		await loadDir(currentPath.value);
		emit('change');
	} catch (e) {
		console.error("Rename failed", e);
		alert("Rename failed: " + e); // Simple feedback
	}

	fileToRename.value = null;
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
	<div class="flex flex-col h-full border rounded-lg bg-white overflow-hidden text-sm">
		<!-- Header: Merged Path/Nav and Actions -->
		<div class="p-3 border-b flex items-center justify-between bg-white flex-none h-[53px]">
			<div class="flex items-center gap-2 overflow-hidden flex-1 mr-2">
				<template v-if="currentPath !== '/'">
					<Button variant="ghost" size="icon" @click="handleUp" class="h-6 w-6 shrink-0 mr-1"> ← </Button>
					<span class="font-semibold text-gray-500 mr-1">Files</span>
					<span class="text-gray-300 mx-1">/</span>
					<span class="font-mono text-xs truncate" :title="currentPath">{{ currentPath }}</span>
				</template>
				<template v-else>
					<span class="font-semibold text-sm">Files</span>
					<span class="text-gray-300 mx-2">/</span>
				</template>
			</div>
			<div class="flex items-center gap-1">
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
						<span class="text-sm truncate select-none">{{ file.name }}</span>
					</div>
					<!-- Actions -->
					<div class="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
						<Button variant="ghost" size="icon" class="h-6 w-6 text-gray-400 hover:text-blue-600"
							@click.stop="openRenameDialog(file.path)" title="Rename">
							<PencilIcon class="w-3 h-3" />
						</Button>
						<Button variant="ghost" size="icon" class="h-6 w-6 text-gray-400 hover:text-destructive"
							@click.stop="confirmDelete(file.path)" title="Delete">
							<Trash2Icon class="w-3 h-3" />
						</Button>
					</div>
				</div>
			</div>
			<ConfirmDialog ref="deleteDialog" title="Delete File"
				description="Are you sure you want to delete this file/folder? This cannot be undone." :destructive="true"
				confirm-text="Delete" @confirm="handleDelete" />
			<RenameFileDialog ref="renameDialog" @rename="handleRename" />
		</ScrollArea>
	</div>
</template>
