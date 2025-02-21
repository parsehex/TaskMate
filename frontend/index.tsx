import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import '@szhsin/react-menu/dist/index.css';
import 'react-tooltip/dist/react-tooltip.css';
// import './scss/style.scss';
import './globals.css';
import { App } from './components/App';
import { initWebsocket } from '@/lib/ws';
console.log('test');

(async () => {
	await initWebsocket();

	const root = createRoot(document.getElementById('root') as HTMLDivElement);
	root.render(
		<DndProvider backend={HTML5Backend}>
			<App />
		</DndProvider>
	);
})();
