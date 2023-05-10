import React, { useState, useEffect, useCallback } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Prompt_Part } from '../types';
import { generateSummary, getTokenCount, updatePromptPart } from '../api';
import { detectFileLanguage } from '../utils';
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
	const [content, setContent] = useState(promptPart.content || '');
	const [tokenCount, setTokenCount] = useState(0);
	const [isSaved, setIsSaved] = useState(true);
	const [summary, setSummary] = useState(promptPart.summary || '');
	const [activeTab, setActiveTab] = useState<'content' | 'summary'>(
		promptPart.use_summary ? 'summary' : 'content'
	);

	const [useSummary, setUseSummary] = useState(promptPart.use_summary);
	const [useTitle, setUseTitle] = useState(promptPart.use_title);
	const setOption = {
		useSummary: setUseSummary,
		useTitle: setUseTitle,
	};

	useEffect(() => {
		if (!promptPart) return;
		if (!content || promptPart.content !== content) {
			setContent(promptPart.content);
		}
		if (!summary || promptPart.summary !== summary) {
			setSummary(promptPart.summary);
		}
		setUseSummary(promptPart.use_summary);
		setUseTitle(promptPart.use_title);
		setIsSaved(true);
	}, [promptPart]);

	useEffect(() => {
		const text = activeTab === 'content' ? content : summary;
		getTokenCount({ text }).then((data) => {
			if (!data) return;
			setTokenCount(data.token_count);
		});
	}, [content, summary, activeTab]);

	// Save on Ctrl+S
	const handleKeyPress = useCallback(
		async (event: KeyboardEvent) => {
			if (event.code === 'KeyS' && (event.ctrlKey || event.metaKey)) {
				event.preventDefault();
				await handleSave();
			}
		},
		[content, summary]
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
					summary,
				})
			).promptPart;
			setPromptPart(updatedPromptPart);
		}
		setIsSaved(true);
	};

	const handleSummaryChange = (value: string | undefined, ev: any) => {
		if (!value) return;
		setSummary(value);
		setIsSaved(value === promptPart.summary);
		onContentChange && onContentChange(value);
	};
	const handleOptionChange = async (
		value: boolean,
		type: 'useTitle' | 'useSummary'
	) => {
		if (!promptPart || promptPart.id < 0) return;
		const data: any = {};
		if (type === 'useSummary') data.use_summary = value;
		else if (type === 'useTitle') data.use_title = value;
		setOption[type](value);

		const updatedPromptPart = (await updatePromptPart(promptPart.id, data))
			.promptPart;
		// console.log(useSummary, updatedPromptPart.use_summary);
		setPromptPart(updatedPromptPart);
	};

	const handleGenerateSummary = async () => {
		if (promptPart && promptPart.id >= 0) {
			const summary = (await generateSummary(promptPart.id)).summary;
			setSummary(summary);
			setIsSaved(false);
			setActiveTab('summary');
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
			<div>
				<div className={'tab-buttons' + (readOnly ? ' hidden' : '')}>
					<button
						className={activeTab === 'content' ? 'active' : ''}
						onClick={() => setActiveTab('content')}
					>
						Content
					</button>
					<button
						className={activeTab === 'summary' ? 'active' : ''}
						onClick={() => setActiveTab('summary')}
					>
						Summary
					</button>
					{!readOnly && activeTab !== 'summary' && (
						<button onClick={handleGenerateSummary}>Generate Summary</button>
					)}
				</div>
				<div className={'options' + (readOnly ? ' hidden' : '')}>
					<label>
						<input
							type="checkbox"
							checked={useSummary}
							onChange={(event) => {
								handleOptionChange(event.target.checked, 'useSummary');
							}}
						/>
						Use summary
					</label>
					<label>
						<input
							type="checkbox"
							checked={useTitle}
							onChange={(event) => {
								handleOptionChange(event.target.checked, 'useTitle');
							}}
						/>
						Use title
					</label>
				</div>
			</div>
			<MonacoEditor
				width="100%"
				language={detectFileLanguage(promptPart, activeTab)}
				theme="vs-dark"
				value={activeTab === 'content' ? content : summary}
				onChange={activeTab === 'content' ? handleChange : handleSummaryChange}
				options={options}
			/>
			<div className="bottom-bar">
				<button type="button" onClick={handleSave}>
					Save
				</button>
				<TokenCountDisplay tokenCount={tokenCount} />
			</div>
		</div>
	);
};

export default Editor;
