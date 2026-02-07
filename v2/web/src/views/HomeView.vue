<script setup lang="ts">
import ProjectList from '../components/ProjectList.vue';
</script>
<template>
	<div class="h-full flex flex-col items-center justify-center p-8">
		<h1 class="text-2xl font-bold mb-8 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
			TaskMate v2 Projects </h1>
		<ProjectList />
	</div>
</template>
