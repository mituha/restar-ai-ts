import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAi } from 'restar-ai';
import type { AiProvider, ProviderSettings } from 'restar-ai';
import './Chat.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatProps {
  provider: AiProvider;
  settings: ProviderSettings;
}

export default function Chat({ provider, settings }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const { stream, isGenerating, error } = useAi({ provider, settings });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMsg: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');

    // Assistant message placeholder
    const assistantMsg: Message = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      await stream(
        {
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          prompt: '' // Not used when messages is provided
        },
        (chunk) => {
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'assistant') {
              return [...prev.slice(0, -1), { ...last, content: last.content + chunk }];
            }
            return prev;
          });
        }
      );
    } catch (err) {
      console.error('Chat error:', err);
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>AI Chat</h2>
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
          <div key={i} className={`message-item ${msg.role}`}>
            <div className="avatar">
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className="message-content">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {error && <div className="error-message">{error}</div>}
        <div ref={scrollRef} />
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
  );
}
