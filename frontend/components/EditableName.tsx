import React, {
	useState,
	forwardRef,
	useImperativeHandle,
	Ref,
	useEffect,
} from 'react';

interface EditableNameProps {
	name: string;
	onNameChange: (newName: string) => void;
}

export interface EditableNameRef {
	triggerEdit: () => void;
}

const EditableName: React.ForwardRefRenderFunction<
	EditableNameRef,
	EditableNameProps
> = ({ name, onNameChange }, ref) => {
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [newName, setNewName] = useState(name);

	const triggerEdit = () => {
		setIsEditing(true);
	};

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
			inputRef.current.setSelectionRange(0, inputRef.current.value.length);
		}
	}, [isEditing]);

	useImperativeHandle(ref, () => ({
		triggerEdit,
	}));

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
			ref={inputRef}
			type="text"
			className="editable-name font-medium"
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

export default forwardRef(EditableName);
