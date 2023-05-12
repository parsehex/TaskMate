import React, { useRef } from 'react';
import { Prompt_Part } from '../../../types';
import EditableName, { EditableNameRef } from '../EditableName';
import CopyPromptButton from '../CopyPromptButton';
import TokenCountDisplay from '../TokenCountDisplay';
import { usePromptPartState } from './usePromptPartState';
import PromptPartContextMenu from './PromptPartContextMenu';
import PromptPartCheckbox from './PromptPartCheckbox';
import PromptPartIndicators from './PromptPartIndicators';

interface PromptPartProps {
	promptPart: Prompt_Part;
	onSelect: (promptPart: Prompt_Part) => void;
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
	onSelect,
	onCheckboxChange,
	movePromptPart,
	index,
	selected,
}) => {
	const ref = useRef<HTMLDivElement>(null);
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
		onSelect,
		onCheckboxChange,
		movePromptPart,
		index,
	});

	return (
		<div
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
				promptPart={promptPart}
				menuOpen={menuOpen}
				setMenuOpen={setMenuOpen}
				anchorRef={ref}
				editableNameRef={editableNameRef}
			/>
			<main>
				<div>
					<PromptPartCheckbox
						isIncluded={promptPart.included}
						handleCheckboxChange={handleCheckboxChange}
						handleCheckboxClick={handleCheckboxClick}
					/>

					{promptPart.part_type !== 'file' && (
						<EditableName
							ref={editableNameRef}
							name={promptPart.name}
							onNameChange={handleNameChange}
						/>
					)}
					{/* show file name if file (show rightmost name) */}
					{promptPart.part_type === 'file' && (
						<span className="file-name">
							{promptPart.name.split('/').pop()}
						</span>
					)}

					{promptPart.use_title && (
						<span
							className="indicator title-indicator"
							title="Includes the title"
						>
							T
						</span>
					)}
				</div>

				<span>
					<PromptPartIndicators promptPart={promptPart} />
					<CopyPromptButton promptParts={[promptPart]} label="" />
				</span>
			</main>

			<TokenCountDisplay tokenCount={tokenCount} small={true} />
		</div>
	);
};

export default PromptPart;
