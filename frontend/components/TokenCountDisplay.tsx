import React from 'react';

interface TokenCountDisplayProps {
	tokenCount: number;
	small?: boolean;
}

const TokenCountDisplay: React.FC<TokenCountDisplayProps> = ({
	tokenCount,
	small = false,
}) => {
	const tokenCountClass =
		tokenCount >= 4096 ? 'token-count red' : 'token-count';

	return (
		<span className={tokenCountClass} title={`${tokenCount} tokens`}>
			{tokenCount}{small ? '' : ' tokens'}
		</span>
	);
};

export default TokenCountDisplay;
