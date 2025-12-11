import { useState, useRef, useEffect } from 'react';
import { streamChatResponse } from '../services/AI/aiService'; 

const useChatBot = () => {
   const [chatMessages, setChatMessages] = useState([
    {
        sender: 'ai',
        text: "Bonjour ! 👋 Je suis l'assistant intelligent **GreenTech**.\n\nJe suis là pour optimiser votre performance énergétique. Je peux :\n\n- 📊 **Analyser** vos consommations (Électricité, Gaz, Transport)\n- 🔮 **Prédire** vos futures factures et émissions CO₂\n- 💡 **Proposer** des solutions pour réduire les coûts\n- ⚠️ **Détecter** les anomalies en temps réel\n\n**Posez-moi une question ou choisissez une action ci-dessous !** 👇",
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }
]);
    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatMessagesRef = useRef(null);

    // Auto Scroll
    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [chatMessages, isTyping]);

    const sendChatMessage = async (msgOverride = null) => {
        const messageToSend = msgOverride || chatInput;
        if (!messageToSend.trim()) return;
        
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        // 1. Préparer l'historique pour l'API
        const history = chatMessages.slice(-6).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
        }));

        // 2. Ajouter le message utilisateur à l'UI
        setChatMessages(prev => [...prev, { sender: 'user', text: messageToSend, time }]);
        setChatInput('');
        setIsTyping(true);

        let aiFullText = "";

        // 3. Appel au Service
        await streamChatResponse(
            messageToSend, 
            history, 
            (chunk) => { 
                setIsTyping(false);
                aiFullText += chunk; 

                setChatMessages(prev => {
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg && lastMsg.sender === 'ai') {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1] = { ...lastMsg, text: aiFullText };
                        return newMsgs;
                    } else {
                        // Sinon on crée le message de l'IA
                        return [...prev, { sender: 'ai', text: aiFullText, time }];
                    }
                });
            },
            (error) => {
                console.error("Erreur Chatbot:", error);
                setIsTyping(false);
                setChatMessages(prev => [
                    ...prev, 
                    { sender: 'ai', text: "⚠️ Désolé, une erreur est survenue.", time }
                ]);
            }
        );
    };

    const handleChatEnter = (event) => {
        if (event.key === 'Enter') {
            sendChatMessage();
        }
    };
    
    const quickAction = (question) => {
        setChatInput(question);
        sendChatMessage(question); 
    };

    return {
        chatMessages,
        chatInput,
        setChatInput,
        isTyping,
        sendChatMessage,
        handleChatEnter,
        quickAction,
        chatMessagesRef
    };
};

export default useChatBot;