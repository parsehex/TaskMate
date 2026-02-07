<script setup lang="ts">
import { ref } from 'vue';
import { useProjectStore } from '@core/store';
import { Button } from '@core/components/ui/button';
import { Label } from '@core/components/ui/label';
import { Input } from '@core/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@core/components/ui/dialog';
import { PlusIcon } from 'lucide-vue-next';

const store = useProjectStore();
const isOpen = ref(false);
const name = ref('');

function handleSubmit() {
	if (!name.value) return;

	store.addPromptPart({
		id: crypto.randomUUID(),
		type: 'snippet',
		name: name.value,
		content: '',
		enabled: true,
		options: { useTitle: true }
	});

	name.value = '';
	isOpen.value = false;
}
</script>
<template>
	<Dialog v-model:open="isOpen">
		<Button variant="outline" size="sm" @click="isOpen = true">
			<PlusIcon class="w-4 h-4 mr-1" /> Snippet
		</Button>
		<DialogContent class="sm:max-w-md">
			<DialogHeader>
				<DialogTitle>Create Snippet</DialogTitle>
			</DialogHeader>
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="name">Snippet Name</Label>
					<Input id="name" v-model="name" placeholder="e.g. System Prompt" @keyup.enter="handleSubmit" />
				</div>
			</div>
			<DialogFooter>
				<Button variant="secondary" @click="isOpen = false">Cancel</Button>
				<Button @click="handleSubmit">Create</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
