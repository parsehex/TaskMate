import React, { useState, useEffect, useCallback, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Prompt_Part, Snippet, isSnippet } from '../../shared/types';
import { updateFile } from '../api/files';
import { updateSnippet } from '../api/snippets';
import { generateSummary, getTokenCount } from '../api/utils';
import { useStore } from '../state';
import { detectFileLanguage } from '../utils';
import EditableName from './EditableName';
import TokenCountDisplay from './TokenCountDisplay';

interface EditorProps {
	onContentChange?: (content: string) => void;
}

const Editor: React.FC<EditorProps> = ({ onContentChange }) => {
	const [promptPart, setFile, setSnippet, readOnly, setReadOnly, isConnected] =
		useStore((state) => [
			state.selectedPromptPart,
			state.setFile,
			state.setSnippet,
			state.readOnly,
			state.setReadOnly,
			state.isConnected,
		]);
	const [content, setContent] = useState(promptPart?.content || '');
	const [tokenCount, setTokenCount] = useState(0);
	const [isSaved, setIsSaved] = useState(true);
	const [summary, setSummary] = useState(promptPart?.summary || '');
	const [activeTab, setActiveTab] = useState<'content' | 'summary'>(
		promptPart?.use_summary ? 'summary' : 'content'
	);

	const [useSummary, setUseSummary] = useState(promptPart?.use_summary);
	const [useTitle, setUseTitle] = useState(promptPart?.use_title);
	const setOption = {
		useSummary: setUseSummary,
		useTitle: setUseTitle,
	};

	const readOnlyState = useRef({
		restore: false,
		oldValue: false,
	});

	useEffect(() => {
		// If we're not connected, set the editor to read-only and save
		// the old value so we can restore it after we reconnect.
		if (!isConnected) {
			readOnlyState.current.restore = true;
			readOnlyState.current.oldValue = readOnly;
			setReadOnly(true);
		} else if (readOnlyState.current.restore) {
			setReadOnly(readOnlyState.current.oldValue);
			readOnlyState.current.restore = false;
		}
	}, [isConnected]);

	useEffect(() => {
		if (!promptPart) return;
		if (promptPart.content !== content) {
			setContent(promptPart.content || '');
		}
		if (!summary || promptPart.summary !== summary) {
			setSummary(promptPart.summary);
		}
		setUseSummary(promptPart.use_summary);
		setUseTitle(promptPart.use_title);
		setIsSaved(true);
		setActiveTab(promptPart.use_summary ? 'summary' : 'content');
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

	const handleNameChange = async (newName: string) => {
		if (!promptPart || promptPart.id < 0) return;
		if (newName !== promptPart?.name) {
			const setFunc = isSnippet(promptPart) ? setSnippet : setFile;
			const updateFunc = isSnippet(promptPart) ? updateSnippet : updateFile;
			const updatedPart = await updateFunc(promptPart.id, { name: newName });
			setFunc(updatedPart as any);
		}
	};

	const handleChange = (value: string | undefined, ev: any) => {
		if (!value) return;
		setContent(value);
		setIsSaved(value === promptPart?.content);
		onContentChange && onContentChange(value);
	};

	const handleSave = async () => {
		if (promptPart && promptPart.id >= 0) {
			const data: any = {};
			if (activeTab === 'content') data.content = content;
			else if (activeTab === 'summary') data.summary = summary;
			const setFunc = isSnippet(promptPart) ? setSnippet : setFile;
			const updateFunc = isSnippet(promptPart) ? updateSnippet : updateFile;
			const updatedPart = await updateFunc(promptPart.id, data);
			setFunc(updatedPart as any);
		}
		setIsSaved(true);
	};

	const handleSummaryChange = (value: string | undefined, ev: any) => {
		if (!value) return;
		setSummary(value);
		setIsSaved(value === promptPart?.summary);
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
		const setFunc = isSnippet(promptPart) ? setSnippet : setFile;
		const updateFunc = isSnippet(promptPart) ? updateSnippet : updateFile;
		const updatedPart = await updateFunc(promptPart.id, data);
		setFunc(updatedPart as any);
	};

	const handleGenerateSummary = async () => {
		if (promptPart && promptPart.id >= 0) {
			const data: any = {};
			if (isSnippet(promptPart)) data.snippetId = promptPart.id;
			else data.fileId = promptPart.id;
			setSummary((await generateSummary(data)).data.text);
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
					name={promptPart?.name || ''}
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
				language={
					promptPart ? detectFileLanguage(promptPart, activeTab) : 'plaintext'
				}
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
