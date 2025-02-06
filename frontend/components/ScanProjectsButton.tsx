import React from 'react';
import { Button } from '@/components/ui/button';

const ScanProjectsButton: React.FC = () => {
	const handlePreviewClick = async () => {
		await fetch('/rescan-projects', { method: 'POST' });
	};

	return (
		<>
			<Button
				variant="secondary"
				size="xs"
				data-tooltip-id="previewButton"
				data-tooltip-html="Re-scan All Projects"
				data-tooltip-delay-show={250}
				data-data-tooltip-place="bottom"
				onClick={handlePreviewClick}
			>
				Scan
			</Button>
		</>
	);
};

export default ScanProjectsButton;
