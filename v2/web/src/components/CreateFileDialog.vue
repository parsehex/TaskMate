<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@core/components/ui/button';
import { Label } from '@core/components/ui/label';
import { Input } from '@core/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@core/components/ui/dialog';
import { PlusIcon } from 'lucide-vue-next';

const emit = defineEmits<{
	(e: 'create', name: string): void
}>();

const isOpen = ref(false);
const name = ref('');

function handleSubmit() {
	if (!name.value) return;
	emit('create', name.value);
	name.value = '';
	isOpen.value = false;
}
</script>
<template>
	<Dialog v-model:open="isOpen">
		<Button variant="ghost" size="sm" @click="isOpen = true" class="h-6 w-16" title="New File">
			<PlusIcon class="w-4 h-4 mr-1" /> File
		</Button>
		<DialogContent class="sm:max-w-md">
			<DialogHeader>
				<DialogTitle>Create File</DialogTitle>
			</DialogHeader>
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="filename">File Name</Label>
					<Input id="filename" v-model="name" placeholder="e.g. notes.txt" @keyup.enter="handleSubmit" />
				</div>
			</div>
			<DialogFooter>
				<Button variant="secondary" @click="isOpen = false">Cancel</Button>
				<Button @click="handleSubmit">Create</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
