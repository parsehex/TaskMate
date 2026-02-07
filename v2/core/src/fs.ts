export interface FileStat {
	type: 'file' | 'directory';
	name: string;
	path: string;
	size?: number;
	updatedAt?: number;
}

export interface FileSystemAdapter {
	stat(path: string): Promise<FileStat | null>;
	readFile(path: string): Promise<string>;
	writeFile(path: string, content: string): Promise<void>;
	readDir(path: string): Promise<FileStat[]>;
	createDir(path: string): Promise<void>;
	exists(path: string): Promise<boolean>;
}
