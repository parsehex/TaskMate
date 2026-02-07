<script setup lang="ts">
import { ref, computed } from 'vue';
import { useProjectStore } from '@core/store';
import { Button } from '@core/components/ui/button';
import { Input } from '@core/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@core/components/ui/card';

const store = useProjectStore();
const newProjectName = ref('');

const sortedProjects = computed(() => {
	return [...store.projects].sort((a, b) => b.updatedAt - a.updatedAt);
});

function handleCreate() {
	if (!newProjectName.value.trim()) return;
	store.createProject(newProjectName.value);
	newProjectName.value = '';
}

function handleDelete(id: string, event: Event) {
	event.stopPropagation(); // Prevent card click
	if (confirm('Are you sure you want to delete this project?')) {
		store.deleteProject(id);
	}
}

function selectProject(id: string) {
	store.loadProject(id);
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
					<p class="text-sm text-gray-500">{{ project.sourceCount }} source(s)</p>
				</CardContent>
				<CardFooter class="justify-end">
					<Button variant="destructive" size="sm" @click="(e: Event) => handleDelete(project.id, e)"> Delete </Button>
				</CardFooter>
			</Card>
		</div>
		<div v-if="sortedProjects.length === 0" class="text-center py-12 text-gray-400"> No projects found. Create one to
			get started! </div>
	</div>
</template>
