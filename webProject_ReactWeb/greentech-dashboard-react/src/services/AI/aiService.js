
const API_BASE_URL = 'http://localhost:8080/api/ai';

export const streamChatResponse = async (userMessage, history, onChunk, onError) => {
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_BASE_URL}/chat/stream`, { 
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

// --- SERVICE PRÉDICTIONS (JSON) ---
export const getAIPredictions = async () => {
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_BASE_URL}/predictions`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        return await response.json(); 
    } catch (error) {
        console.error("Erreur Service AI:", error);
        throw error; 
    }
};