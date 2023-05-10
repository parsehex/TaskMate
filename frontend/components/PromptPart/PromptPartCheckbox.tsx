import React from 'react';

interface PromptPartCheckboxProps {
	isIncluded: boolean;
	handleCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	handleCheckboxClick: (event: React.MouseEvent<HTMLInputElement>) => void;
}

const PromptPartCheckbox: React.FC<PromptPartCheckboxProps> = ({
	isIncluded,
	handleCheckboxChange,
	handleCheckboxClick,
}) => (
	<input
		type="checkbox"
		checked={!!isIncluded}
		onChange={handleCheckboxChange}
		onClick={handleCheckboxClick}
	/>
);

export default PromptPartCheckbox;
