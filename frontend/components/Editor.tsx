import React, { useState, useEffect } from 'react';
import { Prompt_Part } from './App';

interface EditorProps {
	promptPart: Prompt_Part;
	onContentChange: (content: string) => void;
	onSave: (content: string) => void;
}

const Editor: React.FC<EditorProps> = ({
	onContentChange,
	onSave,
	promptPart,
}) => {
	const initialContent = promptPart.content;
	const [content, setContent] = useState(initialContent);
	const [tokenCount, setTokenCount] = useState(promptPart.token_count);

	useEffect(() => {
		setContent(promptPart.content);
	}, [promptPart]);

	const getTokenCount = async (text: string) => {
		const response = await fetch('/api/count_tokens', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ text }),
		});
		const data = await response.json();
		setTokenCount(data.token_count);
	};
	useEffect(() => {
		getTokenCount(content);
	}, [content]);

	const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setContent(event.target.value);
		onContentChange(event.target.value);
	};

	const handelSave = () => {
		onSave(content);
	};

	return (
		<div className="editor">
			<h2>Editing: {promptPart.name}</h2>
			<textarea
				className="editor-textarea"
				value={content || ''}
				onChange={handleChange}
			/>
			{/* save button */}
			<button type="button" onClick={handelSave}>
				Save
			</button>
			Tokens: {tokenCount}
		</div>
	);
};

export default Editor;
