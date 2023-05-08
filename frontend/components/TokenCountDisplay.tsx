import React from 'react';

interface TokenCountDisplayProps {
	tokenCount: number;
}

const TokenCountDisplay: React.FC<TokenCountDisplayProps> = ({
	tokenCount,
}) => {
	const tokenCountClass =
		tokenCount >= 4096 ? 'token-count red' : 'token-count';

	return (
		<span className={tokenCountClass} title={`${tokenCount} tokens`}>
			{tokenCount} tokens
		</span>
	);
};

export default TokenCountDisplay;
