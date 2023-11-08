import React from 'react';

interface TokenCountDisplayProps {
	tokenCount: number;
	small?: boolean;
}

const TokenCountDisplay: React.FC<TokenCountDisplayProps> = ({
	tokenCount,
	small = false,
}) => {
	let tokenCountClass = 'token-count';
	if (tokenCount >= 128000) {
		tokenCountClass += ' red';
	} else if (tokenCount >= 32000) {
		tokenCountClass += ' orange';
	} else if (tokenCount >= 5000) {
		tokenCountClass += ' yellow';
	} else {
		tokenCountClass += ' green';
	}

	return (
		<span className={tokenCountClass} title={`${tokenCount} tokens`}>
			{tokenCount}
			{small ? '' : ' tokens'}
		</span>
	);
};

export default TokenCountDisplay;
