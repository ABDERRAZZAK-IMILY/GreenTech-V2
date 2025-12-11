import { useState, useEffect, useRef } from 'react';
import { streamChatResponse } from '../services/AI/chatService'; 

const useChatbotLogic = ( ) => {
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const chatMessagesRef = useRef(null);

    // Initialisation
    useEffect(() => {
        setChatMessages([{
            sender: 'ai',
            text: "Bonjour ! Je suis l'IA GreenTech. Posez-moi une question !",
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }]);
    }, []);

    // Auto Scroll
    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [chatMessages, isTyping]);

    const sendChatMessage = async () => {
        if (!chatInput.trim()) return;
        
        const userMsg = chatInput;
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        // 1. Kan-zidou l-message dyal User
        const history = chatMessages.slice(-6).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
        }));

        setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, time }]);
        setChatInput('');
        setIsTyping(true);
        
        // ❌ HYYEDNA HADI: setChatMessages(prev => [...prev, { sender: 'ai', text: "", time }]);
        // L-message dyal AI maghaytzadch daba

        let aiFullText = "";

        await streamChatResponse(
            userMsg, 
            history, 
            (chunk) => { 
                setIsTyping(false); // Kan7bsso l-loading mli kaybda l-ktiba
                aiFullText += chunk; 

                setChatMessages(prev => {
                    const lastMsg = prev[prev.length - 1];

                    // Logic: Ila kan akher message howa 'ai', kan-updatiwh.
                    // Ila kan akher message howa 'user', kankriyiw wahd jdid dyal 'ai'.
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
                
                // Hta f l-error, khassna nchofo wash message déjà kayn ola la
                setChatMessages(prev => {
                    const lastMsg = prev[prev.length - 1];
                    const errorText = "⚠️ Désolé, une erreur est survenue.";

                    if (lastMsg && lastMsg.sender === 'ai') {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1].text = errorText;
                        return newMsgs;
                    } else {
                        return [...prev, { sender: 'ai', text: errorText, time }];
                    }
                });
            }
        );
    };

    // 👇 Helper Functions
    const handleChatEnter = (event) => {
        if (event.key === 'Enter') {
            sendChatMessage();
        }
    };
    
    const quickAction = (question) => {
        // Hna khassna ndiro chwiya d modification bach tkhdm mzyan m3a state
        setChatInput(question);
        // Best practice: N3yytou l sendChatMessage direct bla timeout ila kan momkin, 
        // walakin madaam khdamti b timeout, khalliha haka:
        setTimeout(() => sendChatMessage(), 100); 
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

export default useChatbotLogic;