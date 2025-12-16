import { useState, useRef, useEffect } from 'react';
import { streamChatResponse } from '../services/AI/aiService'; 
// ✅ Import du Contexte Global
import { useAI } from '../contexts/AIContext'; 
import { useLoading } from '../contexts/LoadingContext'; // Supposons que vous en ayez besoin pour les spinners

const useChatBot = () => {
    
    const { chatMessages, setChatMessages } = useAI(); 
    
    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false); 
    const chatMessagesRef = useRef(null);

    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [chatMessages, isTyping]);

    const sendChatMessage = async (msgOverride = null) => {
        const messageToSend = msgOverride || chatInput;
        if (!messageToSend.trim()) return;
        
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        const history = chatMessages.slice(-6).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
        }));

        setChatMessages(prev => [...prev, { sender: 'user', text: messageToSend, time }]);
        setChatInput('');
        setIsTyping(true);

        let aiFullText = "";

        // 4. Appel au Service
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
        // Envoi direct sans attendre la validation de l'input (meilleure UX pour les quick actions)
        sendChatMessage(question); 
    };

    return {
        chatMessages, // Le state des messages est maintenant persistant
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