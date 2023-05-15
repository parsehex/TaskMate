import React from 'react';

interface CheckboxProps {
	checked: boolean;
	label?: string;
	handleCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	handleCheckboxClick: (event: React.MouseEvent<HTMLInputElement>) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({
	checked,
	label,
	handleCheckboxChange,
	handleCheckboxClick,
}) => (
	<label onClick={handleCheckboxClick as any}>
		{label}
		<input
			type="checkbox"
			checked={!!checked}
			onChange={handleCheckboxChange}
			onClick={handleCheckboxClick}
		/>
	</label>
);
