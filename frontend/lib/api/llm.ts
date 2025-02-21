export const sendPrompt = async (prompt: string) => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error sending prompt:', error);
    return null;
  }
};
