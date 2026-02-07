<script setup lang="ts">
import { ref, computed } from 'vue';
import { useProjectStore } from '@core/store';
import { Button } from '@core/components/ui/button';
import { Input } from '@core/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@core/components/ui/card';
import { useRouter } from 'vue-router';
import { PlusIcon, Trash2Icon } from 'lucide-vue-next';
import ConfirmDialog from './ConfirmDialog.vue';

const store = useProjectStore();
const router = useRouter();
const newProjectName = ref('');
const deleteDialog = ref<InstanceType<typeof ConfirmDialog> | null>(null);
const projectToDelete = ref<string | null>(null);

const sortedProjects = computed(() => {
	return [...store.projects].sort((a, b) => b.updatedAt - a.updatedAt);
});

function handleCreate() {
	if (!newProjectName.value) return;
	store.createProject(newProjectName.value);
	newProjectName.value = '';
}

function confirmDelete(id: string, event: Event) {
	event.stopPropagation();
	projectToDelete.value = id;
	deleteDialog.value?.open();
}

function handleDelete() {
	if (projectToDelete.value) {
		store.deleteProject(projectToDelete.value);
		projectToDelete.value = null;
	}
}

function selectProject(id: string) {
	router.push({ name: 'project', params: { id } });
}
</script>
<template>
	<div class="container mx-auto p-6 max-w-4xl">
		<h2 class="text-2xl font-bold mb-6">Projects</h2>
		<div class="flex gap-4 mb-8">
			<Input v-model="newProjectName" placeholder="New Project Name" @keyup.enter="handleCreate" class="max-w-md" />
			<Button @click="handleCreate">Create Project</Button>
		</div>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			<Card v-for="project in sortedProjects" :key="project.id" class="cursor-pointer hover:shadow-md transition-shadow"
				@click="selectProject(project.id)">
				<CardHeader>
					<CardTitle>{{ project.name }}</CardTitle>
					<CardDescription> Last updated: {{ new Date(project.updatedAt).toLocaleDateString() }} </CardDescription>
				</CardHeader>
				<CardContent>
					<span class="text-xs text-muted-foreground">{{ project.partCount }} parts</span>
				</CardContent>
				<CardFooter class="justify-end">
					<Button variant="destructive" size="sm" @click="(e: Event) => confirmDelete(project.id, e)"> Delete </Button>
				</CardFooter>
			</Card>
		</div>
		<div v-if="sortedProjects.length === 0" class="text-center py-12 text-gray-400"> No projects found. Create one to
			get started! </div>
		<ConfirmDialog ref="deleteDialog" title="Delete Project"
			description="Are you sure you want to delete this project? This action cannot be undone." :destructive="true"
			confirm-text="Delete" @confirm="handleDelete" />
	</div>
</template>
