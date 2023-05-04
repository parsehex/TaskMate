import React from 'react';

interface TokenCountDisplayProps {
	promptTokenCount: number;
}

const TokenCountDisplay: React.FC<TokenCountDisplayProps> = ({
	promptTokenCount,
}) => {
	const tokenCountClass =
		promptTokenCount >= 4096 ? 'token-count red' : 'token-count';

	return (
		<span className={tokenCountClass} title={`${promptTokenCount} tokens`}>
			{promptTokenCount} tokens
		</span>
	);
};

export default TokenCountDisplay;
