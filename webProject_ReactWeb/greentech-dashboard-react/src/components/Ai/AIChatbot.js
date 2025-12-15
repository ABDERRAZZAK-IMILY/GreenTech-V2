import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import useChatbot from '../../hooks/useChatBot';

const AIChatbot = () => {
  const {
    chatMessages,
    chatInput,
    setChatInput,
    isTyping,
    sendChatMessage,
    handleChatEnter,
    quickAction,
    chatMessagesRef
  } = useChatbot();

  const formatStreamText = (text) => {
    if (!text) return "";
    
  
    text = text.replace(/([^\n])\n(?!\n|\*|#|-)/g, '$1\n\n'); 
    
    return text
      .replace(/\\n/g, '\n')
      .replace(/([^\n])\s*-\s/g, '$1\n- ')
      .replace(/([a-zA-Z])\n([a-zA-Z])/g, '$1 $2')
      .replace(/([^\n])\s*---\s*/g, '$1\n\n---\n\n')
      .replace(/\n{3,}/g, '\n\n').trim();
  };

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping, chatMessagesRef]);

  return (
    <div className="ai-chatbot-container" style={{ margin: '0' }}>
          <div className="chatbot-card" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}>
            <div className="chatbot-header" style={{
              background: `linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)`,
              padding: '20px 25px',
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <div className="chatbot-avatar" style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                <i className="fas fa-robot" />
              </div>
              <div className="chatbot-info">
                <h3 style={{
                  margin: '0',
                  fontSize: '18px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  Assistant GreenTech IA
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: '400',
                    opacity: '0.9'
                  }}>
                    <i className="fas fa-circle" style={{ fontSize: '8px', color: '#43e97b' }} /> En ligne
                  </span>
                </h3>
              </div>
            </div>

            <div className="chatbot-messages" ref={chatMessagesRef} style={{
              height: '450px',
              overflowY: 'auto',
              padding: '25px',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              background: 'rgba(0, 0, 0, 0.1)'
            }}>
              
{chatMessages.map((msg, index) => (
  <div key={index} className={`chat-message ${msg.sender}`} style={{
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
    animation: 'fadeInUp 0.3s ease',
    marginBottom: '20px'
  }}>
    {/* Avatar */}
    <div className="message-avatar" style={{
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      background: msg.sender === 'user'
        ? `linear-gradient(135deg, #0984e3 0%, #00cec9 100%)`
        : `#2f3640`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      color: 'white',
      flexShrink: 0,
      boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
    }}>
      <i className={msg.sender === 'user' ? 'fas fa-user' : 'fas fa-robot'} />
    </div>

    {/* Message Body */}
    <div style={{ flex: 1, maxWidth: '85%' }}>
      <div className="message-bubble" style={{
        padding: '15px 20px',
        borderRadius: msg.sender === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
        background: msg.sender === 'user'
          ? `linear-gradient(135deg, #0984e3 0%, #00cec9 100%)`
          : '#353b48', // Professional dark grey for AI
        color: 'white',
        fontSize: '14px',
        lineHeight: '1.6',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        wordWrap: 'break-word'
      }}>
        
{msg.sender === 'user' ? (
  msg.text
) : (
  <div className="markdown-content" style={{ 
      lineHeight: '1.6',
      fontSize: '14px',
      color: '#e0e0e0' // Couleur bach tban mzyan fou9 l-k7el
  }}>
<ReactMarkdown 
  remarkPlugins={[remarkGfm, remarkBreaks]} 
  components={{
    // 1. PARAGRAPHES: Zidna fihom Tisa3 w couleur mri7 l l-3in
   p: ({node, ...props}) => (
        <p style={{ 
            fontSize: '15px',
            lineHeight: '1.8', 
            color: '#e2e8f0',
            marginBottom: '12px',
            whiteSpace: 'pre-wrap' 
        }} {...props} />
    ),

    // 2. LISTES: N9ado les puces (points)
    ul: ({node, ...props}) => (
        <ul style={{ paddingLeft: '25px', marginBottom: '15px' }} {...props} />
    ),
    li: ({node, ...props}) => (
        <li style={{ 
            marginBottom: '8px', 
            color: '#cbd5e1',
            whiteSpace: 'pre-wrap', 
            paddingLeft: '5px'
        }} {...props} />
    ),

    // 3. TITRES: Nzidou lihom Gradient wla couleur GreenTech
    h1: ({node, ...props}) => (
        <h1 style={{ 
            fontSize: '22px', 
            fontWeight: '700', 
            background: 'linear-gradient(to right, #43e97b, #38f9d7)', 
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '25px 0 15px 0',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            paddingBottom: '10px'
        }} {...props} />
    ),
    h2: ({node, ...props}) => (
        <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#feca57',         // Couleur Jaune dyal GreenTech
            margin: '20px 0 10px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        }} {...props} />
    ),
    h3: ({node, ...props}) => (
        <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#ffffff', 
            margin: '15px 0 8px 0',
            textDecoration: 'underline',
            textDecorationColor: '#43e97b'
        }} {...props} />
    ),

    // 4. GRAS (Strong): N-meyzoh b couleur
    strong: ({node, ...props}) => (
        <span style={{ 
            color: '#feca57', 
            fontWeight: '700',
            backgroundColor: 'rgba(254, 202, 87, 0.1)', // Highlight khfif
            padding: '0 4px',
            borderRadius: '4px'
        }} {...props} />
    ),

    // 5. CITATIONS (Blockquote): Bhal l-Mola7adat l-mohimma
    blockquote: ({node, ...props}) => (
        <blockquote style={{
            borderLeft: '4px solid #43e97b',
            background: 'rgba(67, 233, 123, 0.1)',
            padding: '10px 15px',
            margin: '15px 0',
            borderRadius: '0 8px 8px 0',
            fontStyle: 'italic',
            color: '#a7f3d0'
        }} {...props} />
    ),

    // 6. CODE BLOCKS: Ila l-IA 3tatk chi code awla chiffre technique
    code: ({node, inline, className, children, ...props}) => {
        return inline ? (
            <code style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontFamily: 'monospace',
                color: '#ff9ff3',
                fontSize: '0.9em'
            }} {...props}>{children}</code>
        ) : (
            <div style={{
                background: '#1e1e2e',
                padding: '15px',
                borderRadius: '8px',
                margin: '15px 0',
                border: '1px solid rgba(255,255,255,0.1)',
                overflowX: 'auto'
            }}>
                <code style={{ fontFamily: 'monospace', color: '#a6accd' }} {...props}>
                    {children}
                </code>
            </div>
        )
    },

    // 7. TABLES: Ila l-IA daret tableau
    table: ({node, ...props}) => (
        <div style={{ overflowX: 'auto', margin: '20px 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }} {...props} />
        </div>
    ),
    thead: ({node, ...props}) => (
        <thead style={{ background: 'rgba(255,255,255,0.1)' }} {...props} />
    ),
    th: ({node, ...props}) => (
        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(255,255,255,0.1)', color: '#feca57' }} {...props} />
    ),
    td: ({node, ...props}) => (
        <td style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }} {...props} />
    )
  }}
>
  {formatStreamText(msg.text)}
</ReactMarkdown>
  </div>
)}      </div>
      
      {/* Time Stamp */}
      <div className="message-time" style={{
        fontSize: '11px',
        color: 'rgba(255,255,255,0.4)',
        marginTop: '6px',
        paddingLeft: msg.sender === 'user' ? '0' : '4px',
        textAlign: msg.sender === 'user' ? 'right' : 'left'
      }}>
        {msg.time}
      </div>
    </div>
  </div>
))}
              {isTyping && (
                <div className="chat-message ai" style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start'
                }}>
                  <div className="message-avatar" style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: `var(--accent-color)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    flexShrink: 0
                  }}>
                    <i className="fas fa-robot" />
                  </div>
                  <div className="chatbot-typing" style={{
                    padding: '12px 16px',
                    borderRadius: '18px 18px 18px 4px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div className="typing-indicator" style={{ display: 'flex', gap: '4px' }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        animation: 'typingDot 1.4s infinite',
                        animationDelay: '0s'
                      }} />
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        animation: 'typingDot 1.4s infinite',
                        animationDelay: '0.2s'
                      }} />
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        animation: 'typingDot 1.4s infinite',
                        animationDelay: '0.4s'
                      }} />
                    </div>
                    <span style={{ marginLeft: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      L'IA réfléchit...
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="chatbot-quick-actions" style={{
              padding: '15px 25px',
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(0, 0, 0, 0.1)'
            }}>
              <button onClick={() => quickAction('Quel département consomme le plus ?')} style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <i className="fas fa-chart-pie" /> Quel département consomme le plus ?
              </button>
              <button onClick={() => quickAction('Quelle est mon empreinte carbone ?')} style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <i className="fas fa-leaf" /> Empreinte CO2
              </button>
              <button onClick={() => quickAction('Quelles actions me conseilles-tu ?')} style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <i className="fas fa-lightbulb" /> Suggestions
              </button>
              <button onClick={() => quickAction('Bilan du mois')} style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <i className="fas fa-chart-bar" /> Bilan
              </button>
              <button onClick={() => quickAction('État des capteurs IoT ?')} style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <i className="fas fa-microchip" /> État des capteurs IoT ?
              </button>
            </div>

            <div className="chatbot-input-container" style={{
              padding: '20px 25px',
              background: 'rgba(0, 0, 0, 0.15)',
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              <input
                type="text"
                id="chatInput"
                placeholder="Posez votre question..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleChatEnter}
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  borderRadius: '25px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button className="send-btn" onClick={sendChatMessage} style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)`,
                border: 'none',
                color: 'white',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}>
                <i className="fas fa-paper-plane" />
              </button>
            </div>
          </div>
        </div>
  );
};

export default AIChatbot;