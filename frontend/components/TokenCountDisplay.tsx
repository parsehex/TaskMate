import React from 'react';
import { cn } from '@/lib/utils';

interface TokenCountDisplayProps {
	tokenCount: number;
	small?: boolean;
}

const TokenCountDisplay: React.FC<TokenCountDisplayProps> = ({
	tokenCount,
	small = false,
}) => {
	// TODO (disjointed) add option to color the count relative to the included parts
	//   so that when you have any parts selected, the color is based on the count with this part too
	const getColorClass = () => {
		if (tokenCount >= 128000) return 'text-red-500';
		if (tokenCount >= 32000) return 'text-orange-500';
		if (tokenCount >= 5000) return 'text-yellow-500';
		return 'text-green-500';
	};

	return (
		<span className={cn('font-medium', getColorClass())}>
			{tokenCount}
			{small ? '' : ' tokens'}
		</span>
	);
};

export default TokenCountDisplay;
