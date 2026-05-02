import React, { useRef, useEffect } from 'react';
import { Send, Square, Hammer, Lightbulb } from 'lucide-react';
import './AiChatInput.css';

/**
 * AiChatInput コンポーネントのプロパティ
 */
export interface AiChatInputProps {
    /** 入力値 */
    value: string;
    /** 値が変更された時のコールバック */
    onChange: (value: string) => void;
    /** 送信ボタンが押された、またはEnterキーが押された時のコールバック */
    onSend: () => void;
    /** 生成停止ボタンが押された時のコールバック（オプション） */
    onStop?: () => void;
    /** 生成中かどうか（送信ボタンが停止ボタンに変わります） */
    isStreaming?: boolean;
    /** 入力を無効化するかどうか */
    disabled?: boolean;
    /** プレースホルダー文字列 */
    placeholder?: string;
    
    // 機能トグル
    /** ツール使用の有効状態（オプション） */
    useTools?: boolean;
    /** ツール使用の有効状態が変更された時のコールバック（オプション） */
    onUseToolsChange?: (enabled: boolean) => void;
    /** 思考プロセス表示の有効状態（オプション） */
    useThinking?: boolean;
    /** 思考プロセス表示の有効状態が変更された時のコールバック（オプション） */
    onUseThinkingChange?: (enabled: boolean) => void;
}

/**
 * 小分けにされた AI チャット入力コンポーネント
 * 
 * 自動リサイズ対応のテキストエリア、送信/停止ボタン、および
 * 思考プロセスやツールの切り替えトグルを提供します。
 */
export function AiChatInput({
    value,
    onChange,
    onSend,
    onStop,
    isStreaming = false,
    disabled = false,
    placeholder = "AIにメッセージを送信...",
    useTools,
    onUseToolsChange,
    useThinking,
    onUseThinkingChange
}: AiChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // テキストエリアの自動リサイズ
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!disabled && !isStreaming && value.trim()) {
                onSend();
            }
        }
    };

    return (
        <div className="restar-ai-chat-input-container">
            <div className="input-toolbar">
                {onUseThinkingChange && (
                    <button 
                        className={`tool-toggle ${useThinking ? 'active' : ''}`}
                        onClick={() => onUseThinkingChange(!useThinking)}
                        title="思考プロセスを有効化"
                    >
                        <Lightbulb size={14} />
                        <span>思考</span>
                    </button>
                )}
                {onUseToolsChange && (
                    <button 
                        className={`tool-toggle ${useTools ? 'active' : ''}`}
                        onClick={() => onUseToolsChange(!useTools)}
                        title="ツールの使用を許可"
                    >
                        <Hammer size={14} />
                        <span>ツール</span>
                    </button>
                )}
            </div>
            <div className="input-wrapper">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={1}
                />
                <div className="input-actions">
                    {isStreaming ? (
                        <button 
                            className="btn-stop" 
                            onClick={onStop} 
                            title="生成を停止"
                            type="button"
                        >
                            <Square size={16} fill="currentColor" />
                        </button>
                    ) : (
                        <button 
                            className="btn-send" 
                            onClick={onSend}
                            disabled={disabled || !value.trim()}
                            title="送信"
                            type="button"
                        >
                            <Send size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
