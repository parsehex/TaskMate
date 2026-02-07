<script setup lang="ts">
import { ref } from 'vue';
import { useProjectStore } from '@core/store';
import { Button } from '@core/components/ui/button';
import { Label } from '@core/components/ui/label';
import { Input } from '@core/components/ui/input';
import { Textarea } from '@core/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@core/components/ui/dialog';

const store = useProjectStore();
const isOpen = ref(false);
const name = ref('');
const content = ref('');

function handleSubmit() {
	if (!name.value || !content.value) return;

	store.addSource({
		id: crypto.randomUUID(),
		type: 'snippet',
		name: name.value,
		content: content.value,
		enabled: true,
		options: { useTitle: true }
	});

	name.value = '';
	content.value = '';
	isOpen.value = false;
}
</script>
<template>
	<Dialog v-model:open="isOpen">
		<Button variant="outline" @click="isOpen = true">New Snippet</Button>
		<DialogContent class="sm:max-w-md">
			<DialogHeader>
				<DialogTitle>Create Snippet</DialogTitle>
			</DialogHeader>
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="name">Snippet Name</Label>
					<Input id="name" v-model="name" placeholder="e.g. System Prompt" />
				</div>
				<div class="space-y-2">
					<Label for="content">Content</Label>
					<Textarea id="content" v-model="content" placeholder="Enter snippet text..." class="h-32" />
				</div>
			</div>
			<DialogFooter>
				<Button variant="secondary" @click="isOpen = false">Cancel</Button>
				<Button @click="handleSubmit">Add Snippet</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
