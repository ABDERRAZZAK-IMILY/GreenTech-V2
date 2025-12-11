export const streamChatResponse = async (userMessage, history, onChunk, onError) => {
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch('http://localhost:8080/api/chat/stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message: userMessage, history })
        });

        if (!response.body) throw new Error("ReadableStream not supported.");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data:')) {
                    const cleanText = line.replace('data:', '');
                    onChunk(cleanText); 
                }
            }
        }
    } catch (error) {
        if (onError) onError(error);
    }
};