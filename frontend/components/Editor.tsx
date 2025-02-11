import React, { useState, useEffect, useCallback, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { isSnippet } from '@shared/types';
import { updateFile } from '../api/files';
import { updateSnippet } from '../api/snippets';
import { getTokenCount } from '../api/utils';
import { useStore } from '../state';
import { detectFileLanguage } from '../utils';
import TokenCountDisplay from './TokenCountDisplay';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

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

	const handleChange = (value: string | undefined, ev: any) => {
		if (!value) return;
		setContent(value);
		setIsSaved(value === promptPart?.content);
		onContentChange && onContentChange(value);
	};
	const handleSummaryChange = (value: string | undefined, ev: any) => {
		if (!value) return;
		setSummary(value);
		setIsSaved(value === promptPart?.summary);
		onContentChange && onContentChange(value);
	};

	const handleSave = async () => {
		if (!promptPart || promptPart.id === '-1') return;
		const data: any = {};
		if (activeTab === 'content') data.content = content;
		else if (activeTab === 'summary') data.summary = summary;
		const isFileSnippet = promptPart.id.startsWith('file-backed:');
		if (isFileSnippet) {
			// set this data so that it's returned back to us
			data.name = promptPart.name;
			data.project_id = promptPart.project_id;
			data.included = promptPart.included;
			data.use_title = promptPart.use_title;
			if (data.content === undefined) data.content = promptPart.content;
		}

		const setFunc = isSnippet(promptPart) ? setSnippet : setFile;
		const updateFunc = isSnippet(promptPart) ? updateSnippet : updateFile;
		const updatedPart = await updateFunc(promptPart.id, data);
		setFunc(updatedPart as any);
		setIsSaved(true);
	};

	const handleOptionChange = async (
		value: boolean,
		type: 'useTitle' | 'useSummary'
	) => {
		if (!promptPart || promptPart.id === '-1') return;
		const data: any = {};
		const isFileSnippet = promptPart.id.startsWith('file-backed:');
		const dbType = type === 'useSummary' ? 'use_summary' : 'use_title';
		if (isFileSnippet) {
			data.name = promptPart.name;
			data.project_id = promptPart.project_id;
			data.included = promptPart.included;
			if (dbType !== 'use_title') data.use_title = promptPart.use_title;
			data.content = promptPart.content;
		}
		data[dbType] = value;
		type === 'useSummary' ? setUseSummary(value) : setUseTitle(value);

		const setFunc = isSnippet(promptPart) ? setSnippet : setFile;
		const updateFunc = isSnippet(promptPart) ? updateSnippet : updateFile;
		const updatedPart = await updateFunc(promptPart.id, data);
		setFunc(updatedPart as any);
	};

	return (
		<div className="editor h-[80vh]">
			<h2>
				{readOnly ? '' : 'Editing: '}
				<span className="font-mono">{promptPart?.name || ''}</span>
				{isSaved || readOnly ? '' : '*'}
			</h2>
			<div className="flex items-center gap-4 mb-2">
				<Button
					variant={activeTab === 'content' ? 'outline' : 'default'}
					onClick={() => setActiveTab('content')}
				>
					Content
				</Button>
				<Button
					variant={activeTab === 'summary' ? 'outline' : 'default'}
					onClick={() => setActiveTab('summary')}
				>
					Summary
				</Button>
			</div>
			<div className="flex items-center gap-4">
				<Checkbox
					id="use-summary"
					checked={useSummary}
					onCheckedChange={(checked) =>
						handleOptionChange(!!checked, 'useSummary')
					}
				/>
				<label htmlFor="use-summary">Use summary</label>

				<Checkbox
					id="use-title"
					checked={useTitle}
					onCheckedChange={(checked) =>
						handleOptionChange(!!checked, 'useTitle')
					}
				/>
				<label htmlFor="use-title">Use title</label>
			</div>
			<MonacoEditor
				width="100%"
				language={
					promptPart ? detectFileLanguage(promptPart, activeTab) : 'plaintext'
				}
				theme="vs-dark"
				value={activeTab === 'content' ? content : summary}
				onChange={activeTab === 'content' ? handleChange : handleSummaryChange}
				options={{ readOnly, wordWrap: 'on' }}
			/>
			<div className="flex items-center justify-between mt-2 px-2">
				<Button onClick={handleSave} disabled={isSaved}>
					Save
				</Button>
				<TokenCountDisplay tokenCount={tokenCount} />
			</div>
		</div>
	);
};

export default Editor;
