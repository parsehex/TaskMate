import React, { useState, useEffect, useCallback } from 'react';
import MonacoEditor, { useMonaco, Monaco } from '@monaco-editor/react';
import { Prompt_Part } from '../types';
import { getTokenCount, updatePromptPart } from '../api';
import EditableName from './EditableName';
import TokenCountDisplay from './TokenCountDisplay';

interface EditorProps {
	promptPart: Prompt_Part;
	setPromptPart: (promptPart: Prompt_Part) => void;
	readOnly: boolean;
	onContentChange?: (content: string) => void;
}

const Editor: React.FC<EditorProps> = ({
	promptPart,
	setPromptPart,
	readOnly,
	onContentChange,
}) => {
	const initialContent = promptPart.content;
	const [content, setContent] = useState(initialContent);
	const [tokenCount, setTokenCount] = useState(0);
	const [isSaved, setIsSaved] = useState(true);
	const [isEditingName, setIsEditingName] = useState(false);
	const [newName, setNewName] = useState(promptPart.name);

	useEffect(() => {
		if (!promptPart) return;
		if (!content || promptPart.content !== content) {
			setContent(promptPart.content);
		}
		setIsSaved(true);
	}, [promptPart]);

	useEffect(() => {
		getTokenCount({ text: content }).then((data) => {
			if (!data) return;
			setTokenCount(data.token_count);
		});
	}, [content]);

	// Save on Ctrl+S
	const handleKeyPress = useCallback(
		async (event: KeyboardEvent) => {
			if (event.code === 'KeyS' && (event.ctrlKey || event.metaKey)) {
				event.preventDefault();
				await handleSave();
			}
		},
		[content]
	);
	useEffect(() => {
		window.addEventListener('keydown', handleKeyPress);

		return () => {
			window.removeEventListener('keydown', handleKeyPress);
		};
	}, [handleKeyPress]);

	const handleNameChange = async (event) => {
		const newName = event.target.value;
		if (newName !== promptPart.name) {
			promptPart = (await updatePromptPart(promptPart.id, { name: newName }))
				.promptPart;
			setPromptPart(promptPart);
		}
	};

	const handleChange = (value: string | undefined, ev: any) => {
		if (!value) return;
		setContent(value);
		setIsSaved(value === promptPart.content);
		onContentChange && onContentChange(value);
	};

	const handleSave = async () => {
		if (promptPart && promptPart.id >= 0) {
			const updatedPromptPart = (
				await updatePromptPart(promptPart.id, {
					content,
				})
			).promptPart;
			setPromptPart(updatedPromptPart);
		}
		setIsSaved(true);
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

	const options: any = {
		readOnly: readOnly,
		wordWrap: 'on',
	};

	return (
		<div className="editor">
			<h2>
				{readOnly ? '' : 'Editing: '}
				<EditableName
					name={promptPart.name}
					onNameChange={(newName) => {
						handleNameChange(newName);
					}}
				/>
				{isSaved || readOnly ? '' : '*'}
			</h2>
			<MonacoEditor
				height="75vh"
				width="100%"
				language={detectFileLanguage(promptPart.name)}
				theme="vs-dark"
				value={content}
				onChange={handleChange}
				options={options}
			/>
			<button type="button" onClick={handleSave}>
				Save
			</button>
				<TokenCountDisplay tokenCount={tokenCount} />
		</div>
	);
};

export default Editor;
