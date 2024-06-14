import React, { useState, useRef, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

const TestEditor: React.FC = () => {
	const [selectedLines, setSelectedLines] = useState<Set<number>>(new Set());
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
	const decorationsRef = useRef<string[]>([]);
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const selectedLinesRef = useRef<Set<number>>(new Set());

	useEffect(() => {
		selectedLinesRef.current = selectedLines;
	}, [selectedLines]);

	let initialContent = '';
	// generate multiline
	for (let i = 0; i < 100; i++) {
		initialContent += `const a = ${i};\n`;
	}

	const handleEditorMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
		editorRef.current = editor;

		let isMouseDown = false;
		let initialLine: number | null = null;
		let shouldSelect: boolean | null = null;

		editor.onMouseDown((event) => {
			if (
				!event.target.position ||
				event.target.type !== monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN
			)
				return;
			isMouseDown = true;
			initialLine = event.target.position.lineNumber;
			shouldSelect = !selectedLines.has(initialLine); // Determine if we should select or deselect during this drag
			updateSelection(initialLine, shouldSelect); // Update the initial line based on the determined action
			setIsDragging(true);
			console.log(
				'onMouseDown - initialLine, shouldSelect:',
				initialLine,
				shouldSelect
			);
		});

		editor.onMouseUp((event) => {
			if (
				initialLine !== null &&
				event.target.position &&
				event.target.type ===
					monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN &&
				initialLine === event.target.position.lineNumber &&
				!isDragging
			) {
				updateSelection(
					initialLine,
					!selectedLinesRef.current.has(initialLine)
				);
			}

			isMouseDown = false;
			initialLine = null;
			shouldSelect = null;
			setIsDragging(false);
			console.log(
				'onMouseUp - selectedLines:',
				Array.from(selectedLinesRef.current)
			);
		});

		editor.onMouseMove((event) => {
			if (
				!isMouseDown ||
				!event.target.position ||
				initialLine === null ||
				shouldSelect === null ||
				event.target.type !== monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN
			)
				return;

			const currentLine = event.target.position.lineNumber;
			if (currentLine !== initialLine) {
				updateSelection(currentLine, shouldSelect);
			}
			console.log(
				'onMouseMove - currentLine, shouldSelect:',
				currentLine,
				shouldSelect
			);
		});
	};

	const updateSelection = (lineNumber: number, shouldSelect: boolean) => {
		setSelectedLines((prevSelectedLines) => {
			const newSelectedLines = new Set(prevSelectedLines);

			// Check if the line is already in the desired state
			if (shouldSelect && !newSelectedLines.has(lineNumber)) {
				newSelectedLines.add(lineNumber);
			} else if (!shouldSelect && newSelectedLines.has(lineNumber)) {
				newSelectedLines.delete(lineNumber);
			}

			applyDecorations(newSelectedLines);
			console.log(
				'updateSelection - lineNumber, shouldSelect, newSelectedLines:',
				lineNumber,
				shouldSelect,
				Array.from(newSelectedLines)
			);
			return newSelectedLines;
		});
	};

	const applyDecorations = (selectedLines: Set<number>) => {
		if (!editorRef.current) return;

		const newDecorations = Array.from(selectedLines).map((lineNumber) => ({
			range: new monaco.Range(lineNumber, 1, lineNumber, 1),
			options: {
				isWholeLine: true,
				className: 'selected-line',
				glyphMarginClassName: 'line-indicator',
				glyphMarginHoverMessage: { value: 'Selected Line' },
			},
		}));

		decorationsRef.current = editorRef.current.deltaDecorations(
			decorationsRef.current,
			newDecorations
		);
		console.log('applyDecorations - selectedLines:', Array.from(selectedLines));
	};

	useEffect(() => {
		return () => {
			const editor = editorRef.current;
			if (editor) {
				editor.dispose();
			}
		};
	}, []);

	return (
		<MonacoEditor
			height="90vh"
			theme="vs-dark"
			defaultLanguage="javascript"
			value={initialContent}
			onMount={handleEditorMount}
			options={{
				lineDecorationsWidth: 20,
				glyphMargin: true,
			}}
		/>
	);
};

export default TestEditor;
