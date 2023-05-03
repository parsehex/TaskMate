import React, { useState, useEffect } from 'react';

interface EditorProps {
	initialContent: string;
	onContentChange: (content: string) => void;
	onSave: (content: string) => void;
}

const Editor: React.FC<EditorProps> = ({
	initialContent,
	onContentChange,
	onSave,
}) => {
	const [content, setContent] = useState(initialContent);

	useEffect(() => {
		setContent(initialContent);
	}, [initialContent]);

	const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setContent(event.target.value);
		onContentChange(event.target.value);
	};

	const handelSave = () => {
		onSave(content);
	};

	return (
		<div className="editor">
			<textarea
				className="editor-textarea"
				value={content || ''}
				onChange={handleChange}
			/>
			{/* save button */}
			<button type="button" onClick={handelSave}>
				Save
			</button>
		</div>
	);
};

export default Editor;
