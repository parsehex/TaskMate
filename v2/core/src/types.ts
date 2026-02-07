
export interface Source {
  id: string;
  type: 'file' | 'snippet';
  name: string;
  content: string;
  enabled: boolean;
  meta?: Record<string, any>; // file paths, snippet tags, etc.
}

export interface Project {
  id: string;
  name: string;
  sources: Source[];
  options: {
    includeProjectFiles: boolean; // Toggle to include file tree context
  };
  fileTree?: string; // The generated file tree string (if toggled)
}
