import React, { useState, useEffect, useCallback } from 'react';
import MonacoEditor, { useMonaco, Monaco } from '@monaco-editor/react';
import { Prompt_Part } from '../types';
import { getTokenCount, updatePromptPart } from '../api';

interface EditorProps {
	selectedPromptPartId: number | null;
	promptParts: Prompt_Part[];
	setPromptParts: (promptParts: Prompt_Part[]) => void;
	readOnly: boolean;
	onContentChange?: (content: string) => void;
	onSave: (content: string) => void;
}

const Editor: React.FC<EditorProps> = ({
	selectedPromptPartId,
	promptParts,
	setPromptParts,
	readOnly,
	onContentChange,
	onSave,
}) => {
	const initialPromptPart = promptParts.find(
		(promptPart) => promptPart.id === selectedPromptPartId
	);
	if (!initialPromptPart) return null;
	const [selectedPromptPart, setSelectedPromptPart] =
		useState<Prompt_Part>(initialPromptPart);
	const initialContent = initialPromptPart.content;
	const [content, setContent] = useState(initialContent);
	const [tokenCount, setTokenCount] = useState(initialPromptPart.token_count);
	const [isSaved, setIsSaved] = useState(true);
	const [isEditingName, setIsEditingName] = useState(false);
	const [newName, setNewName] = useState(initialPromptPart.name);

	useEffect(() => {
		const part = promptParts?.find((part) => part.id === selectedPromptPartId);
		if (!part) return;
		setSelectedPromptPart(part);
		if (part.content !== content) {
		}
		setIsSaved(part.content === content);
	}, [selectedPromptPartId, promptParts]);

	useEffect(() => {
		getTokenCount({ text: content }).then((data) => {
			if (!data) return;
			setTokenCount(data.token_count);
		});
	}, [content]);

	// Save on Ctrl+S
	const handleKeyPress = useCallback(
		(event: KeyboardEvent) => {
			if (event.code === 'KeyS' && (event.ctrlKey || event.metaKey)) {
				event.preventDefault();
				handleSave();
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

	const handleNameChange = (event) => {
		setNewName(event.target.value);
	};

	const handleNameSubmit = async (event) => {
		event.preventDefault();
		const updatedPromptPart = await updatePromptPart(selectedPromptPart.id, {
			name: newName,
		});
		const updatedPromptParts = promptParts?.map((part) => {
			if (part.id === updatedPromptPart.promptPart.id) {
				return updatedPromptPart.promptPart;
			}
			return part;
		});
		if (updatedPromptParts) {
			setPromptParts(updatedPromptParts);
		}

		setIsEditingName(false);
	};

	const handleNameDoubleClick = () => {
		if (!readOnly) {
			setIsEditingName(true);
		}
	};

	const handleChange = (value: string | undefined, ev: any) => {
		if (!value) return;
		setContent(value);
		setIsSaved(value === selectedPromptPart.content);
		onContentChange && onContentChange(value);
	};

	const handleSave = () => {
		onSave(content);
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

	return (
		<div className="editor">
			<h2>
				{readOnly ? '' : 'Editing: '}
				{isEditingName ? (
					<form onSubmit={handleNameSubmit}>
						<input
							type="text"
							value={newName}
							onChange={handleNameChange}
							onBlur={handleNameSubmit}
							autoFocus
						/>
					</form>
				) : (
					<span onDoubleClick={handleNameDoubleClick}>
						{selectedPromptPart.name}
					</span>
				)}
				{isSaved ? '' : '*'}
			</h2>
			<MonacoEditor
				height="75vh"
				width="100%"
				language={detectFileLanguage(selectedPromptPart.name)}
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
