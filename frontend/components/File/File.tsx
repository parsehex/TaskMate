import React, { useRef } from 'react';
import { File } from '@shared/types';
import CopyPromptButton from '@/components/CopyPromptButton';
import TokenCountDisplay from '@/components/TokenCountDisplay';
import { useFileState } from './useState';
import { ContextMenu } from './ContextMenu';
import { Checkbox } from '@/components/Checkbox';
import { Indicators } from './Indicators';
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
				'flex items-center justify-between p-1 rounded-md transition',
				'border border-transparent hover:border-gray-300',
				'shadow-sm cursor-pointer',
				{ 'bg-gray-100 dark:bg-gray-500': file.included },
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

			<div className="flex items-center gap-2 flex-1 mr-4">
				<Checkbox
					checked={file.included}
					handleCheckboxChange={handleCheckboxChange}
					handleCheckboxClick={handleCheckboxClick}
				/>

				<span className="file-name">{file.name.split('/').pop()}</span>

				{file.use_title && (
					<span className="indicator title-indicator text-blue-500">T</span>
				)}
			</div>

			<span className="mr-2 flex items-center gap-2">
				<Indicators file={file} />
				<CopyPromptButton promptParts={[file]} label="" />
			</span>

			<TokenCountDisplay tokenCount={tokenCount} small={true} />
		</div>
	);
};

export default File;
