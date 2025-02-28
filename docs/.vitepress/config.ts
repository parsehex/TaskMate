import { defineConfig } from 'vitepress';

export default defineConfig({
	title: 'TaskMate Documentation',
	description: 'Guides and documentation for TaskMate, the LLM task-helper.',
	themeConfig: {
		nav: [
			{ text: 'User Guide', link: '/guide/' },
			{ text: 'Developer Docs', link: '/developer/' },
			{ text: 'GitHub', link: 'https://github.com/parsehex/TaskMate' },
		],
		sidebar: [
			{
				text: 'Introduction',
				items: [
					{ text: 'Overview', link: '/' },
					{ text: 'Getting Started', link: '/getting-started' },
				],
			},
			// {
			// 	text: 'Guides',
			// 	items: [
			// 		{ text: 'User Guide', link: '/guide/' },
			// 		{ text: 'Developer Docs', link: '/developer/' },
			// 	],
			// },
			// { text: 'FAQ', link: '/faq/' },
		],
	},
});
