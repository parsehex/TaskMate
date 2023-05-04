import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Monaco } from '@monaco-editor/react';
import { Prompt_Part } from '../types';
import { getTokenCount } from '../api';

interface EditorProps {
	promptPart: Prompt_Part;
	readOnly: boolean;
	onContentChange?: (content: string) => void;
	onSave: (content: string) => void;
}

const Editor: React.FC<EditorProps> = ({
	promptPart,
	readOnly,
	onContentChange,
	onSave,
}) => {
	const initialContent = promptPart.content;
	const [content, setContent] = useState(initialContent);
	const [tokenCount, setTokenCount] = useState(promptPart.token_count);

	useEffect(() => {
		setContent(promptPart.content);
	}, [promptPart]);

	useEffect(() => {
		getTokenCount({ text: content }).then((data) => {
			if (!data) return;
			setTokenCount(data.token_count);
		});
	}, [content]);

	const handleChange = (value: string | undefined, ev: any) => {
		if (!value) return;
		setContent(value);
		onContentChange && onContentChange(value);
	};

	const handleSave = () => {
		onSave(content);
	};

	const detectFileLanguage = (name: string) => {
		const extension = name.split('.').pop();
		switch (extension) {
			case 'js':
				return 'javascript';
			case 'ts':
				return 'typescript';
			case 'py':
				return 'python';
			case '':
				return 'markdown';
			default:
				return extension;
		}
	};

	return (
		<div className="editor">
			<h2>
				{readOnly ? '' : 'Editing:'} {promptPart.name}
			</h2>
			<MonacoEditor
				height="75vh"
				width="100%"
				language={detectFileLanguage(promptPart.name)}
				theme="vs-dark"
				value={content}
				onChange={handleChange}
				options={{ domReadOnly: readOnly, wordWrap: 'on' }}
			/>
			<button type="button" onClick={handleSave}>
				Save
			</button>
			<span className="token-count">{tokenCount} tokens</span>
		</div>
	);
};

export default Editor;
