<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@core/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@core/components/ui/dialog';

const props = defineProps<{
	title: string;
	description: string;
	confirmText?: string;
	destructive?: boolean;
}>();

const emit = defineEmits<{
	(e: 'confirm'): void;
	(e: 'cancel'): void;
}>();

const isOpen = ref(false);

function open() {
	isOpen.value = true;
}

function close() {
	isOpen.value = false;
}

function handleConfirm() {
	emit('confirm');
	close();
}

defineExpose({ open, close });
</script>
<template>
	<Dialog v-model:open="isOpen">
		<DialogContent class="sm:max-w-md">
			<DialogHeader>
				<DialogTitle>{{ title }}</DialogTitle>
				<DialogDescription>{{ description }}</DialogDescription>
			</DialogHeader>
			<DialogFooter>
				<Button variant="secondary" @click="close">Cancel</Button>
				<Button :variant="destructive ? 'destructive' : 'default'" @click="handleConfirm"> {{ confirmText || 'Confirm'
					}} </Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
