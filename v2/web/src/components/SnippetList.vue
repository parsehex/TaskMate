<script setup lang="ts">
import { computed, ref } from 'vue';
import { useProjectStore } from '@core/store';
import { Button } from '@core/components/ui/button';
import { ScrollArea } from '@core/components/ui/scroll-area';
import { GripVerticalIcon, Trash2Icon, FolderTreeIcon, LockIcon } from 'lucide-vue-next';
import type { PromptPart } from '@core/types';
import ConfirmDialog from './ConfirmDialog.vue';

const store = useProjectStore();
const emit = defineEmits<{
	(e: 'select', id: string): void
}>();

const snippets = computed(() => {
	return store.currentProject?.promptParts.filter(p => p.type === 'snippet') || [];
});

const showFileTreeOption = computed(() => {
	return !!store.currentProject?.fileTree;
});

const isFileTreeEnabled = computed({
	get: () => store.currentProject?.options.includeProjectFiles || false,
	set: (val) => {
		if (store.currentProject) {
			store.updateProject({
				options: { ...store.currentProject.options, includeProjectFiles: val }
			});
		}
	}
});

// Delete Confirmation
const deleteDialog = ref<InstanceType<typeof ConfirmDialog> | null>(null);
const snippetToDelete = ref<string | null>(null);

function confirmDelete(id: string) {
	snippetToDelete.value = id;
	deleteDialog.value?.open();
}

function handleDelete() {
	if (snippetToDelete.value) {
		store.removePromptPart(snippetToDelete.value);
		snippetToDelete.value = null;
	}
}

// Drag and Drop
const draggedItem = ref<PromptPart | null>(null);

function onDragStart(event: DragEvent, item: PromptPart) {
	draggedItem.value = item;
	if (event.dataTransfer) {
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text/plain', item.id);
	}
}

function onDragOver(event: DragEvent) {
	event.preventDefault();
	if (event.dataTransfer) {
		event.dataTransfer.dropEffect = 'move';
	}
}

function onDrop(event: DragEvent, targetItem: PromptPart) {
	event.preventDefault();
	if (!draggedItem.value || draggedItem.value.id === targetItem.id) return;

	const allParts = store.currentProject?.promptParts || [];
	const fromIndex = allParts.findIndex(p => p.id === draggedItem.value?.id);
	const toIndex = allParts.findIndex(p => p.id === targetItem.id);

	if (fromIndex !== -1 && toIndex !== -1) {
		store.movePromptPart(fromIndex, toIndex);
	}

	draggedItem.value = null;
}
</script>
<template>
	<div class="flex flex-col h-full border rounded-lg bg-white overflow-hidden">
		<ScrollArea class="flex-1">
			<div v-if="snippets.length === 0 && !showFileTreeOption" class="p-4 text-center text-gray-400 text-sm"> No
				snippets yet. </div>
			<ul class="space-y-1 p-2">
				<li v-for="snippet in snippets" :key="snippet.id"
					class="flex items-center gap-2 p-2 rounded-md border bg-white hover:bg-gray-50 group transition-colors"
					:class="{ 'cursor-move': !snippet.meta?.isProjectFiles, 'cursor-pointer': true }"
					:draggable="!snippet.meta?.isProjectFiles" @dragstart="onDragStart($event, snippet)" @dragover="onDragOver"
					@drop="onDrop($event, snippet)" @click="emit('select', snippet.id)">
					<!-- Drag Handle / Icon -->
					<div class="text-gray-400 hover:text-gray-600">
						<FolderTreeIcon v-if="snippet.meta?.isProjectFiles" class="w-4 h-4 text-indigo-500" />
						<GripVerticalIcon v-else class="w-4 h-4 cursor-move" />
					</div>
					<!-- Checkbox -->
					<input type="checkbox" :checked="snippet.enabled" @change="store.togglePromptPart(snippet.id)" @click.stop=""
						class="rounded text-primary focus:ring-primary h-4 w-4" />
					<!-- Name -->
					<span class="text-sm font-medium truncate flex-1 leading-none select-none"
						:class="{ 'opacity-50': !snippet.enabled }"> {{ snippet.name }} </span>
					<!-- Delete Button (only for non-system snippets) -->
					<Button v-if="!snippet.meta?.isProjectFiles" variant="ghost" size="icon"
						class="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-destructive"
						@click.stop="confirmDelete(snippet.id)">
						<Trash2Icon class="w-4 h-4" />
					</Button>
					<div v-else class="h-6 w-6 flex items-center justify-center">
						<LockIcon class="w-3 h-3 text-gray-300" />
					</div>
				</li>
			</ul>
			<ConfirmDialog ref="deleteDialog" title="Delete Snippet"
				description="Are you sure you want to delete this snippet?" :destructive="true" confirm-text="Delete"
				@confirm="handleDelete" />
		</ScrollArea>
	</div>
</template>
