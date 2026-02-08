<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@core/components/ui/button';
import { Label } from '@core/components/ui/label';
import { Input } from '@core/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@core/components/ui/dialog';

const emit = defineEmits<{
	(e: 'rename', newName: string): void
}>();

const isOpen = ref(false);
const name = ref('');

function open(currentName: string) {
	name.value = currentName;
	isOpen.value = true;
}

function close() {
	isOpen.value = false;
}

function handleSubmit() {
	if (!name.value || !name.value.trim()) return;
	emit('rename', name.value);
	close();
}

defineExpose({ open, close });
</script>
<template>
	<Dialog v-model:open="isOpen">
		<DialogContent class="sm:max-w-md">
			<DialogHeader>
				<DialogTitle>Rename</DialogTitle>
			</DialogHeader>
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="filename">New Name</Label>
					<Input id="filename" v-model="name" placeholder="e.g. notes.txt" @keyup.enter="handleSubmit" />
				</div>
			</div>
			<DialogFooter>
				<Button variant="secondary" @click="close">Cancel</Button>
				<Button @click="handleSubmit">Rename</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
