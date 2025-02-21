import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { makePrompt } from '../utils';
import { useStore } from '../state';
import { sendPrompt } from '@/lib/api/llm';

const RunPromptButton: React.FC = () => {
	const { includedPromptParts, addChatMessage } = useStore((state) => state);
	const [isRunning, setIsRunning] = useState(false);

	const handleRunClick = async () => {
		if (isRunning || includedPromptParts.length === 0) return;

		setIsRunning(true);
		const prompt = makePrompt(includedPromptParts);

		// Add user's prompt to the chat
		const userMessage = { role: 'user', content: prompt };
		addChatMessage(userMessage);

		// Send the prompt to the LLM
		const response = await sendPrompt(prompt);

		// Add AI response to the chat
		if (response) {
			addChatMessage({ role: 'assistant', content: response });
		}

		setIsRunning(false);
	};

	return (
		<Button
			onClick={handleRunClick}
			disabled={isRunning}
			variant="default"
			size="xs"
		>
			{isRunning ? (
				'Running...'
			) : (
				<>
					<Play className="h-4 w-4 mr-1" /> Run
				</>
			)}
		</Button>
	);
};

export default RunPromptButton;
