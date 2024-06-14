import React, { useState, useEffect, useCallback, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Range } from 'monaco-editor';
import * as monaco from 'monaco-editor';
import { Prompt_Part, Snippet, isFile, isSnippet } from '../../shared/types';
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

const parseSelectedLines = (lines: string | string[]): Range[] => {
	if (!lines) return [];
	if (typeof lines === 'string') lines = lines.split(',');
	const ranges: Range[] = [];

	lines.forEach((line) => {
		if (line.includes('-')) {
			const [start, end] = line.split('-').map(Number);
			ranges.push(new Range(start, 1, end, 1));
		} else {
			const lineNumber = Number(line);
			ranges.push(new Range(lineNumber, 1, lineNumber, 1));
		}
	});

	return ranges;
};

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

	const [selectedLines, setSelectedLines] = useState<Set<number>>(new Set());
	const [selectedDuringDrag, setSelectedDuringDrag] = useState<Set<number>>(
		new Set()
	);
	const editorRef = useRef(null as monaco.editor.IStandaloneCodeEditor | null);
	const decorationsCollectionRef = useRef(
		null as monaco.editor.IEditorDecorationsCollection | null
	);

	const handleEditorMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
		editorRef.current = editor;
		decorationsCollectionRef.current = editor.createDecorationsCollection([]);

		let isMouseDown = false;
		let initialLine = -1;
		let isSelecting = true;

		const updateSelection = (lineNumber: number, select?: boolean) => {
			console.log(selectedLines, lineNumber);
			const newSet = new Set([...selectedLines]);
			const lineSelected = selectedLines.has(lineNumber);

			isSelecting = lineSelected;
			if (select !== undefined) isSelecting = select;

			if (!isSelecting) {
				newSet.delete(lineNumber);
			} else {
				newSet.add(lineNumber);
			}
			setSelectedLines(newSet);
		};

		editor.onMouseDown((event) => {
			if (!event.target.position || event.target.type !== 2) return;
			isMouseDown = true;
			initialLine = event.target.position.lineNumber;

			const lineSelected = selectedLines.has(initialLine);
			isSelecting = !lineSelected;
			// console.log(isSelecting, lineSelected, selectedLines, initialLine);

			updateSelection(initialLine, isSelecting);
		});

		editor.onMouseMove((event) => {
			if (!isMouseDown || !event.target.position) return;
			const lineNumber = event.target.position.lineNumber;

			if (selectedDuringDrag.has(lineNumber)) return;
			console.log(
				// selectedDuringDrag,
				'drag',
				lineNumber,
				selectedDuringDrag.has(lineNumber)
			);

			updateSelection(lineNumber);

			selectedDuringDrag.add(lineNumber);
		});

		editor.onMouseUp(() => {
			if (!isMouseDown) return;
			isMouseDown = false;
			initialLine = -1;

			setSelectedDuringDrag(new Set());
		});
	};

	const applyDecorations = () => {
		if (!editorRef.current) return;

		const newDecorations = Array.from(selectedLines).map((lineNumber) => ({
			range: new monaco.Range(
				lineNumber,
				1,
				lineNumber,
				editorRef.current?.getModel()?.getLineMaxColumn(lineNumber) || 1
			),
			options: {
				isWholeLine: true,
				className: 'selected-line',
				glyphMarginClassName: 'line-indicator',
				glyphMarginHoverMessage: { value: 'Selected Line' },
			},
		}));

		if (decorationsCollectionRef.current) {
			// decorationsCollectionRef.current.clear();
			decorationsCollectionRef.current =
				editorRef.current.createDecorationsCollection(newDecorations);
		}
		console.log(decorationsCollectionRef.current?.getRanges());
	};

	useEffect(() => {
		applyDecorations();
	}, [selectedLines]);

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
		if (isFile(promptPart) && promptPart.selected_lines) {
			const lines = promptPart.selected_lines.map((line) => +line);
			setSelectedLines(new Set(lines));
		} else {
			setSelectedLines(new Set());
		}
	}, [promptPart]);

	useEffect(() => {
		const text = activeTab === 'content' ? content : summary;
		getTokenCount({ text }).then((data) => {
			if (!data) return;
			setTokenCount(data.token_count);
		});
	}, [content, summary, activeTab]);

	const handleKeyPress = useCallback(
		async (event: KeyboardEvent) => {
			if (event.code !== 'KeyS' || (!event.ctrlKey && !event.metaKey)) return;

			event.preventDefault();
			await handleSave();
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
		if (newName === promptPart?.name) return;
		const setFunc = isSnippet(promptPart) ? setSnippet : setFile;
		const updateFunc = isSnippet(promptPart) ? updateSnippet : updateFile;
		const updatedPart = await updateFunc(promptPart.id, { name: newName });
		setFunc(updatedPart as any);
	};

	const handleChange = (value: string | undefined, ev: any) => {
		if (!value) return;
		setContent(value);
		setIsSaved(value === promptPart?.content);
		onContentChange && onContentChange(value);
	};

	const handleSave = async () => {
		if (!promptPart || promptPart.id < 0) return;
		const data: any = {};
		if (activeTab === 'content') data.content = content;
		else if (activeTab === 'summary') data.summary = summary;
		const setFunc = isSnippet(promptPart) ? setSnippet : setFile;
		const updateFunc = isSnippet(promptPart) ? updateSnippet : updateFile;
		const updatedPart = await updateFunc(promptPart.id, data);
		setFunc(updatedPart as any);

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
		if (!promptPart || promptPart.id < 0) return;
		const data: any = {};
		if (isSnippet(promptPart)) data.snippetId = promptPart.id;
		else data.fileId = promptPart.id;
		setSummary((await generateSummary(data)).data.text);
		setIsSaved(false);
		setActiveTab('summary');
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
				onMount={handleEditorMount}
				options={{
					...options,
					lineDecorationsWidth: 20,
					glyphMargin: true,
				}}
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
