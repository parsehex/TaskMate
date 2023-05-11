import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faFile,
	faHeading,
	faBookOpen,
} from '@fortawesome/free-solid-svg-icons';
import { Menu, MenuButton, ControlledMenu, MenuItem } from '@szhsin/react-menu';

import { Prompt_Part } from '../../../types';
import EditableName, { EditableNameRef } from '../EditableName';
import TokenCountDisplay from '../TokenCountDisplay';
import { usePromptPartState } from './usePromptPartState';
import PromptPartContextMenu from './PromptPartContextMenu';
import PromptPartCheckbox from './PromptPartCheckbox';
import PromptPartIndicators from './PromptPartIndicators';

interface PromptPartProps {
	promptPart: Prompt_Part;
	promptParts: Prompt_Part[];
	onSelect: (promptPart: Prompt_Part) => void;
	setPromptPart: (promptPart: Prompt_Part) => void;
	setPromptParts: (promptParts: Prompt_Part[]) => void;
	onCheckboxChange: (
		event: React.ChangeEvent<HTMLInputElement>,
		promptPart: Prompt_Part
	) => void;
	movePromptPart: (dragIndex: number, hoverIndex: number) => void;
	index: number;
	selected: boolean;
}

const PromptPart: React.FC<PromptPartProps> = ({
	promptPart,
	promptParts,
	onSelect,
	setPromptPart,
	setPromptParts,
	onCheckboxChange,
	movePromptPart,
	index,
	selected,
}) => {
	const ref = useRef<HTMLLIElement>(null);
	const editableNameRef = useRef<EditableNameRef>(null);

	const {
		menuOpen,
		setMenuOpen,
		isDragging,
		handleContextMenu,
		handleOnSelect,
		handleNameChange,
		handleCheckboxChange,
		handleCheckboxClick,
		tokenCount,
	} = usePromptPartState({
		promptPart,
		promptParts,
		onSelect,
		setPromptPart,
		setPromptParts,
		onCheckboxChange,
		movePromptPart,
		index,
	});

	return (
		<li
			ref={ref}
			className={[
				'prompt-part',
				promptPart.included ? 'included' : '',
				selected ? 'selected' : '',
			].join(' ')}
			onClick={handleOnSelect}
			onContextMenu={handleContextMenu}
			style={{
				opacity: isDragging ? 0.5 : 1,
			}}
		>
			<PromptPartContextMenu
				menuOpen={menuOpen}
				setMenuOpen={setMenuOpen}
				anchorRef={ref}
				editableNameRef={editableNameRef}
				promptPart={promptPart}
				promptParts={promptParts}
				setPromptPart={setPromptPart}
				setPromptParts={setPromptParts}
			/>
			<main>
				<div>
					<PromptPartCheckbox
						isIncluded={promptPart.included}
						handleCheckboxChange={handleCheckboxChange}
						handleCheckboxClick={handleCheckboxClick}
					/>
					<EditableName
						ref={editableNameRef}
						name={promptPart.name}
						onNameChange={handleNameChange}
					/>
					{promptPart.use_title && (
						<span
							className="indicator title-indicator"
							title="Includes the title"
						>
							T
						</span>
					)}
				</div>

				<PromptPartIndicators promptPart={promptPart} />
			</main>

			<TokenCountDisplay tokenCount={tokenCount} small={true} />
		</li>
	);
};

export default PromptPart;
