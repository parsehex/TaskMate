import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faBookOpen } from '@fortawesome/free-solid-svg-icons';

import { File } from '../../../shared/types';

interface IndicatorsProps {
	file: File;
}

export const Indicators: React.FC<IndicatorsProps> = ({ file }) => (
	<span>
		{file.use_summary && (
			<span className="indicator" title="Uses the summary">
				<FontAwesomeIcon icon={faBookOpen} color="orange" />
			</span>
		)}
		<span className="indicator" title="Is a file">
			<FontAwesomeIcon icon={faFile} />
		</span>
	</span>
);
