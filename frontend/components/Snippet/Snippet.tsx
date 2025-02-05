import React, { useRef } from 'react';
import { Snippet } from '../../../shared/types';
import EditableName, { EditableNameRef } from '../EditableName';
import CopyPromptButton from '../CopyPromptButton';
import TokenCountDisplay from '../TokenCountDisplay';
import { useSnippetState } from './useState';
import { ContextMenu } from './ContextMenu';
import { Checkbox } from '../Checkbox';
import { Indicators } from './Indicators';

interface SnippetProps {
	snippet: Snippet;
	move: (dragIndex: number, hoverIndex: number) => Promise<void>;
	index: number;
	selected: boolean;
}

const Snippet: React.FC<SnippetProps> = ({
	snippet,
	selected,
	move,
	index,
}) => {
	const ref = useRef<HTMLDivElement>(null);
	const editableNameRef = useRef<EditableNameRef>(null);

	const {
		menuOpen,
		setMenuOpen,
		isDragging,
		handleContextMenu,
		handleOnSelect,
		handleCheckboxChange,
		handleCheckboxClick,
		handleNameChange,
		tokenCount,
	} = useSnippetState({
		snippet,
		move,
		index,
		ref,
	});

	return (
		<div
			ref={ref}
			className={[
				'prompt-part snippet ',
				snippet.included ? 'included ' : '',
				selected ? 'selected ' : '',
			].join(' ')}
			onClick={handleOnSelect}
			onContextMenu={handleContextMenu}
			style={{
				opacity: isDragging ? 0.5 : 1,
			}}
		>
			<ContextMenu
				snippet={snippet}
				menuOpen={menuOpen}
				setMenuOpen={setMenuOpen}
				anchorRef={ref}
				editableNameRef={editableNameRef}
				move={move}
			/>
			<main className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Checkbox
						checked={snippet.included}
						handleCheckboxChange={handleCheckboxChange}
						handleCheckboxClick={handleCheckboxClick}
					/>

					<EditableName
						ref={editableNameRef}
						name={snippet.name}
						onNameChange={handleNameChange}
					/>
					{snippet.use_title && (
						<span
							className="indicator title-indicator"
							title="Includes the title"
						>
							T
						</span>
					)}
					<span>
						<Indicators file={snippet} />
						<CopyPromptButton promptParts={[snippet]} label="" />
					</span>
				</div>
				<TokenCountDisplay tokenCount={tokenCount} small={true} />
			</main>
		</div>
	);
};

export default Snippet;
