import React, { useRef } from 'react';
import { File } from '../../../shared/types';
import CopyPromptButton from '../CopyPromptButton';
import TokenCountDisplay from '../TokenCountDisplay';
import { useFileState } from './useState';
import { ContextMenu } from './ContextMenu';
import { Checkbox } from '../Checkbox';
import { Indicators } from './Indicators';
import { FileText } from 'lucide-react';
import clsx from 'clsx';

interface FileProps {
	file: File;
	index: number;
	selected: boolean;
}

const File: React.FC<FileProps> = ({ file, selected }) => {
	const ref = useRef<HTMLDivElement>(null);

	const {
		menuOpen,
		setMenuOpen,
		handleContextMenu,
		handleOnSelect,
		handleCheckboxChange,
		handleCheckboxClick,
		tokenCount,
	} = useFileState({
		file,
	});

	return (
		<div
			ref={ref}
			// className={[
			// 	'flex items-center gap-2 p-2 rounded-md cursor-pointer',
			// 	'hover:bg-accent',
			// 	file.included ? 'bg-muted' : '',
			// 	selected ? 'border border-primary' : '',
			// ].join(' ')}
			className={clsx(
				'flex items-center justify-between p-2 rounded-md transition',
				'border border-transparent hover:border-gray-300',
				'shadow-sm cursor-pointer',
				{ 'bg-gray-100 dark:bg-gray-700': file.included },
				{ 'ring-2 ring-blue-500': selected }
			)}
			onClick={handleOnSelect}
			onContextMenu={handleContextMenu}
		>
			<ContextMenu
				file={file}
				menuOpen={menuOpen}
				setMenuOpen={setMenuOpen}
				anchorRef={ref}
			/>

			<Checkbox
				checked={file.included}
				handleCheckboxChange={handleCheckboxChange}
				handleCheckboxClick={handleCheckboxClick}
			/>

			<span className="file-name ml-1">{file.name.split('/').pop()}</span>

			{file.use_title && (
				<span className="indicator title-indicator text-blue-500">T</span>
			)}

			<span className="ml-auto flex items-center gap-2">
				<Indicators file={file} />
				<CopyPromptButton promptParts={[file]} label="" />
			</span>

			<TokenCountDisplay tokenCount={tokenCount} small={true} />
		</div>
	);
};

export default File;
