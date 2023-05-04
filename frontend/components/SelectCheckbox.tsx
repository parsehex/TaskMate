import React from 'react';

interface SelectAllCheckboxProps {
	label: string;
	select: boolean;
	setSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SelectCheckbox: React.FC<SelectAllCheckboxProps> = ({
	label,
	select,
	setSelect,
}) => {
	return (
		<span className="checkbox">
			<label htmlFor="select-all">{label}</label>
			<input
				id="select-all"
				type="checkbox"
				checked={select}
				onChange={setSelect}
			/>
		</span>
	);
};

export default SelectCheckbox;
