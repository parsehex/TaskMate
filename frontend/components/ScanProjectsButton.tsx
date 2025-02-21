import React from 'react';
import { Button } from '@/components/ui/button';
import { rescanProjects } from '@/lib/api/projects';

const ScanProjectsButton: React.FC = () => {
	const handlePreviewClick = async () => {
		await rescanProjects();
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
