import React, { useState } from 'react';

interface EditableNameProps {
	name: string;
	onNameChange: (newName: string) => void;
}

const EditableName: React.FC<EditableNameProps> = ({ name, onNameChange }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [newName, setNewName] = useState(name);

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setNewName(event.target.value);
	};

	const handleSubmit = (
		event:
			| React.FocusEvent<HTMLInputElement>
			| React.KeyboardEvent<HTMLInputElement>
	) => {
		if (
			event.type === 'blur' ||
			(event.type === 'keydown' && 'key' in event && event.key === 'Enter')
		) {
			setIsEditing(false);
			onNameChange(newName);
		}
	};

	return isEditing ? (
		<input
			type="text"
			className="editable-name"
			value={newName}
			onChange={handleChange}
			onBlur={handleSubmit}
			onKeyDown={handleSubmit}
			autoFocus
		/>
	) : (
		<span className="editable-name" onDoubleClick={handleEdit}>
			{name}
		</span>
	);
};

export default EditableName;
