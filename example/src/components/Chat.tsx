import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Trash2, Brain } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAi } from 'restar-ai';
import type { AiProvider, ProviderSettings, AiMessage } from 'restar-ai';
import './Chat.css';

interface ChatProps {
  provider: AiProvider;
  settings: ProviderSettings;
}

export default function Chat({ provider, settings }: ChatProps) {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState('');
  const [showThought, setShowThought] = useState(true);
  const [enableThinking, setEnableThinking] = useState(false);
  const [useStream, setUseStream] = useState(true);
  const { generate, stream, isGenerating, error } = useAi({ provider, settings });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMsg: AiMessage = {
      id: (crypto as any).randomUUID?.() || Math.random().toString(36).substring(2),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };
    
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');

    // Assistant message placeholder
    const assistantMsg: AiMessage = {
      id: (crypto as any).randomUUID?.() || Math.random().toString(36).substring(2),
      role: 'assistant',
      content: '',
      thought: '',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, assistantMsg]);

    const options = {
      messages: newMessages,
      prompt: '',
      enableThinking: enableThinking,
      thinkingBudget: 2048
    };

    try {
      if (useStream) {
        await stream(
          options,
          (chunk) => {
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last && last.role === 'assistant') {
                if (chunk.type === 'text') {
                  return [
                    ...prev.slice(0, -1),
                    { ...last, content: (last.content as string) + chunk.content }
                  ];
                } else if (chunk.type === 'thought') {
                  return [
                    ...prev.slice(0, -1),
                    { ...last, thought: (last.thought || '') + chunk.content }
                  ];
                }
              }
              return prev;
            });
          }
        );
      } else {
        const result = await generate(options);
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant') {
            return [
              ...prev.slice(0, -1),
              { ...last, content: result.content, thought: result.thought }
            ];
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Chat error:', err);
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-left">
          <h2>AI Chat</h2>
          <label className="thought-toggle">
            <input 
              type="checkbox" 
              checked={showThought} 
              onChange={(e) => setShowThought(e.target.checked)} 
            />
            <span>思考を表示</span>
          </label>
        </div>
        <button onClick={clearChat} title="Clear Chat">
          <Trash2 size={18} />
        </button>
      </div>

      <div className="messages-list">
        {messages.length === 0 && (
          <div className="empty-state">
            <Bot size={48} />
            <p>メッセージを入力して会話を始めましょう</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={msg.id || i} className={`message-item ${msg.role}`}>
            <div className="avatar">
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className="message-content">
              {msg.role === 'assistant' && msg.thought && showThought && (
                <div className="thought-area">
                  <div className="thought-header">
                    <Brain size={12} />
                    <span>Thought</span>
                  </div>
                  <ReactMarkdown>{msg.thought}</ReactMarkdown>
                </div>
              )}
              {msg.role === 'assistant' && isGenerating && i === messages.length - 1 && !msg.thought && !msg.content && (
                <div className="thinking-indicator">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              )}
              {(msg.content || (msg.role === 'assistant' && !isGenerating)) && (
                <div className="text-area">
                  <ReactMarkdown>{typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {error && <div className="error-message">{error}</div>}
        <div ref={scrollRef} />
      </div>

      <div className="input-area-wrapper">
        <div className="input-toolbar">
          <label className="thought-toggle">
            <input 
              type="checkbox" 
              checked={useStream} 
              onChange={(e) => setUseStream(e.target.checked)} 
            />
            <span>ストリーミング (Stream)</span>
          </label>
          <label className="thought-toggle">
            <input 
              type="checkbox" 
              checked={enableThinking} 
              onChange={(e) => setEnableThinking(e.target.checked)} 
            />
            <span>思考有効化 (Thinking Mode)</span>
          </label>
        </div>
        <div className="input-area">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="AIにメッセージを送る..."
            rows={1}
          />
          <button onClick={handleSend} disabled={isGenerating || !input.trim()}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
