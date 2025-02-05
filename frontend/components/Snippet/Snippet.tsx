import React, { useRef } from 'react';
import { Snippet } from '../../../shared/types';
import EditableName, { EditableNameRef } from '../EditableName';
import CopyPromptButton from '../CopyPromptButton';
import TokenCountDisplay from '../TokenCountDisplay';
import { useSnippetState } from './useState';
import { ContextMenu } from './ContextMenu';
import { Checkbox } from '../Checkbox';
import { Indicators } from './Indicators';
import clsx from 'clsx';

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
			className={clsx(
				'flex items-center justify-between p-2 rounded-md transition',
				'border border-transparent hover:border-gray-300',
				'bg-background text-foreground',
				'shadow-sm cursor-pointer',
				{ 'bg-gray-100 dark:bg-gray-500': snippet.included },
				{ 'ring-2 ring-blue-500': selected },
				{ 'opacity-50': isDragging }
			)}
			onClick={handleOnSelect}
			onContextMenu={handleContextMenu}
		>
			<ContextMenu
				snippet={snippet}
				menuOpen={menuOpen}
				setMenuOpen={setMenuOpen}
				anchorRef={ref}
				editableNameRef={editableNameRef}
				move={move}
			/>

			<div className="flex items-center gap-2 flex-1">
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
						className="indicator title-indicator text-blue-500"
						title="Includes the title"
					>
						T
					</span>
				)}

				<span className="flex items-center gap-1">
					<Indicators file={snippet} />
					<CopyPromptButton promptParts={[snippet]} label="" />
				</span>
			</div>

			<TokenCountDisplay tokenCount={tokenCount} small={true} />
		</div>
	);
};

export default Snippet;
