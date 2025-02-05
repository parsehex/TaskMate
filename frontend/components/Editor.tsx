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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const Editor: React.FC = () => {
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

	useEffect(() => {
		const text = activeTab === 'content' ? content : summary;
		getTokenCount({ text }).then((data) => {
			if (!data) return;
			setTokenCount(data.token_count);
		});
	}, [content, summary, activeTab]);

	const handleNameChange = async (newName: string) => {
		if (!promptPart || promptPart.id === '-1') return;
		if (newName !== promptPart?.name) {
			const setFunc = isSnippet(promptPart) ? setSnippet : setFile;
			const updateFunc = isSnippet(promptPart) ? updateSnippet : updateFile;
			const updatedPart = await updateFunc(promptPart.id, { name: newName });
			setFunc(updatedPart as any);
		}
	};

	const handleSave = async () => {
		if (!promptPart || promptPart.id === '-1') return;
		const data: any = {};
		if (activeTab === 'content') data.content = content;
		else if (activeTab === 'summary') data.summary = summary;

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
		data[type] = value;
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
				<EditableName
					name={promptPart?.name || ''}
					onNameChange={(newName) => {
						handleNameChange(newName);
					}}
				/>
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
				options={{ readOnly }}
			/>
			<div className="flex items-center justify-between mt-2">
				<Button onClick={handleSave} disabled={isSaved}>
					Save
				</Button>
				<TokenCountDisplay tokenCount={tokenCount} />
			</div>
		</div>
	);
};

export default Editor;
