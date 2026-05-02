import { useState, useRef, useEffect } from 'react';
import { User, Bot, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAi, AiChatInput } from 'restar-ai';
import type { AiProvider, ProviderSettings, AiMessage } from 'restar-ai';
import './Chat.css';

interface ChatProps {
  provider: AiProvider;
  settings: ProviderSettings;
}

/**
 * シンプルなチャット UI コンポーネント
 * 
 * ライブラリの基本機能（ストリーミング生成）を利用した標準的なチャットを提供します。
 */
export default function Chat({ provider, settings }: ChatProps) {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState('');
  const { stream, isGenerating, error } = useAi({ provider, settings });
  const scrollRef = useRef<HTMLDivElement>(null);

  // 新しいメッセージが追加されたらスクロール
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

    // アシスタントの応答用プレースホルダー
    const assistantMsg: AiMessage = {
      id: (crypto as any).randomUUID?.() || Math.random().toString(36).substring(2),
      role: 'assistant',
      content: '',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      // ストリーミング生成を実行
      await stream(
        { messages: newMessages, prompt: '' },
        (chunk) => {
          if (chunk.type === 'text') {
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last && last.role === 'assistant') {
                return [
                  ...prev.slice(0, -1),
                  { ...last, content: (last.content as string) + chunk.content }
                ];
              }
              return prev;
            });
          }
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
        <h2>Simple Chat</h2>
        <button onClick={clearChat} title="履歴をクリア">
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
              <ReactMarkdown>
                {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {error && <div className="error-message">{error}</div>}
        <div ref={scrollRef} />
      </div>

      <div className="input-area-wrapper">
        <AiChatInput 
          value={input}
          onChange={setInput}
          onSend={handleSend}
          isStreaming={isGenerating}
          placeholder="AIにメッセージを送る..."
        />
      </div>
    </div>
  );
}
