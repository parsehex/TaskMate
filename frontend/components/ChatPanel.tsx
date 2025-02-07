import React, { useState } from 'react';
import { useStore } from '../state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sendPrompt } from '../api/llm';

const ChatPanel: React.FC = () => {
	const {
		chatMessages,
		addChatMessage,
		chatVisible,
		setChatVisible,
		setSelectedPromptPart,
	} = useStore((state) => state);
	const [input, setInput] = useState('');

	const handleSend = async () => {
		if (!input.trim()) return;

		const userMessage = { role: 'user', content: input };
		addChatMessage(userMessage);
		setInput('');

		const response = await sendPrompt(input);
		if (response) {
			addChatMessage({ role: 'assistant', content: response });
			if (!chatVisible) {
				setSelectedPromptPart(null);
				setChatVisible(true);
			}
		}
	};

	return (
		<div className="flex flex-col h-full p-4 pt-0 bg-gray-900 text-white">
			<h2 className="text-lg p-2">Chat</h2>
			<div className="flex-1 overflow-y-auto space-y-2">
				{chatMessages.map((msg, index) => (
					<div
						key={index}
						className={`p-2 rounded whitespace-pre-wrap ${
							msg.role === 'user' ? 'bg-blue-700' : 'bg-gray-700'
						}`}
					>
						{msg.content}
					</div>
				))}
			</div>
			<div className="flex mt-2">
				<Input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Type your prompt..."
				/>
				{/* TODO: Allow controlling what gets included in prompt. Allow sending all included prompts + message, etc */}
				<Button onClick={handleSend} className="ml-2">
					Send
				</Button>
			</div>
		</div>
	);
};

export default ChatPanel;
