import type { FileSystemAdapter, FileStat } from '@core/fs';

const STORAGE_KEY = 'taskmate_vfs';

interface VFSNode {
	content?: string;
	type: 'file' | 'directory';
	updatedAt: number;
}

interface VFSData {
	[path: string]: VFSNode;
}

export class LocalStorageAdapter implements FileSystemAdapter {
	private loadData(): VFSData {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : {};
	}

	private saveData(data: VFSData) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	}

	async stat(path: string): Promise<FileStat | null> {
		const data = this.loadData();
		const node = data[path];
		if (!node) return null;

		return {
			name: path.split('/').pop() || path,
			path,
			type: node.type,
			size: node.content?.length || 0,
			updatedAt: node.updatedAt
		};
	}

	async readFile(path: string): Promise<string> {
		const data = this.loadData();
		const node = data[path];
		if (!node || node.type !== 'file') throw new Error(`File not found: ${path}`);
		return node.content || '';
	}

	async writeFile(path: string, content: string): Promise<void> {
		const data = this.loadData();
		data[path] = {
			type: 'file',
			content,
			updatedAt: Date.now()
		};
		// Ensure parent dirs exist? For now, simplistic flat-ish structure or just loose.
		this.saveData(data);
	}

	async readDir(path: string): Promise<FileStat[]> {
		const data = this.loadData();
		const keys = Object.keys(data).filter(k => k.startsWith(path) && k !== path);
		// This is a naive implementation; strictly speaking, readDir shouldn't be recursive
		// but since keys are flat properties, we need to filter immediate children.
		// For prototype, we might just return everything that matches prefix?
		// Implementing proper directory listing for flat map:

		const directChildren = keys.filter(k => {
			let relative = '';
			if (path === '/') {
				relative = k.substring(1); // remove leading slash
			} else {
				relative = k.substring(path.length + 1); // remove path + stash
			}
			return !relative.includes('/'); // no more slashes means immediate child
		});

		return directChildren.map(k => ({
			name: k.split('/').pop() || k,
			path: k,
			type: data[k].type,
			size: data[k].content?.length || 0,
			updatedAt: data[k].updatedAt
		}));
	}

	async createDir(path: string): Promise<void> {
		const data = this.loadData();
		data[path] = {
			type: 'directory',
			updatedAt: Date.now()
		};
		this.saveData(data);
	}

	async exists(path: string): Promise<boolean> {
		const data = this.loadData();
		return !!data[path];
	}

	async rm(path: string): Promise<void> {
		const data = this.loadData();
		if (data[path]) {
			// If directory, remove children
			if (data[path].type === 'directory') {
				Object.keys(data).forEach(p => {
					if (p.startsWith(path + '/')) {
						delete data[p];
					}
				});
			}
			delete data[path];
			this.saveData(data);
		}
	}

	async generateFileTree(): Promise<string> {
		const data = this.loadData();
		const paths = Object.keys(data).sort();
		return paths.map(p => {
			const depth = p.split('/').length - 1;
			const indent = '  '.repeat(Math.max(0, depth - 1));
			const name = p.split('/').pop() || '';
			const isDir = data[p].type === 'directory';
			return `${indent}${name}${isDir ? '/' : ''}`;
		}).join('\n');
	}
}
