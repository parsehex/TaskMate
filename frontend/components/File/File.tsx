import React, { useRef } from 'react';
import { File } from '../../../shared/types';
import CopyPromptButton from '../CopyPromptButton';
import TokenCountDisplay from '../TokenCountDisplay';
import { useFileState } from './useState';
import { ContextMenu } from './ContextMenu';
import { Checkbox } from '../Checkbox';
import { Indicators } from './Indicators';

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
			className={[
				'prompt-part file ',
				file.included ? 'included ' : '',
				selected ? 'selected ' : '',
			].join(' ')}
			onClick={handleOnSelect}
			onContextMenu={handleContextMenu}
		>
			<ContextMenu
				file={file}
				menuOpen={menuOpen}
				setMenuOpen={setMenuOpen}
				anchorRef={ref}
			/>
			<main>
				<div>
					<Checkbox
						checked={file.included}
						handleCheckboxChange={handleCheckboxChange}
						handleCheckboxClick={handleCheckboxClick}
					/>

					{/* show file name (show rightmost name) */}
					<span className="file-name">{file.name.split('/').pop()}</span>
					{file.use_title && (
						<span
							className="indicator title-indicator"
							title="Includes the title"
						>
							T
						</span>
					)}
				</div>

				<span>
					<Indicators file={file} />
					<CopyPromptButton promptParts={[file]} label="" />
				</span>
			</main>

			<TokenCountDisplay tokenCount={tokenCount} small={true} />
		</div>
	);
};

export default File;
