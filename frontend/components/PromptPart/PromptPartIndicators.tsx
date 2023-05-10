import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faBookOpen } from '@fortawesome/free-solid-svg-icons';

import { Prompt_Part } from '../../../types';

interface PromptPartIndicatorsProps {
	promptPart: Prompt_Part;
}

const PromptPartIndicators: React.FC<PromptPartIndicatorsProps> = ({
	promptPart,
}) => (
	<>
		{promptPart.use_summary && (
			<span className="indicator" title="Uses the summary">
				<FontAwesomeIcon icon={faBookOpen} color="orange" />
			</span>
		)}
		{promptPart.part_type === 'file' && (
			<span className="indicator" title="Is a file">
				<FontAwesomeIcon icon={faFile} />
			</span>
		)}
	</>
);

export default PromptPartIndicators;
