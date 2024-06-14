// EditorPage.tsx
import React from 'react';
import TestEditor from './TestEditor';

const EditorPage: React.FC = () => {
	return (
		<div className="editor-page">
			<span>Edit your content</span>
			<TestEditor />
		</div>
	);
};

export default EditorPage;
