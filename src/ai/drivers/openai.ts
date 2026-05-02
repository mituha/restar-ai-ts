import { generateText, streamText, jsonSchema, stepCountIs } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import type { AiDriver, GenerationOptions, ProviderSettings, AiMessage, AiStreamChunk } from '../types';

/**
 * OpenAI API および互換 API (LM Studio 等) を使用するためのドライバー実装
 */
export class OpenAiDriver implements AiDriver {
    private openai: any;
    private settings: ProviderSettings;
    private isLmStudio: boolean;
    private customFetch?: typeof fetch;
    private resolvedApiKey: string;

    /**
     * OpenAiDriver を初期化します
     * @param settings プロバイダー設定
     * @param isLmStudio LM Studio 等のローカル互換サーバーかどうか
     * @param customFetch カスタムfetch関数
     */
    constructor(settings: ProviderSettings, isLmStudio: boolean = false, customFetch?: typeof fetch) {
        this.settings = settings;
        this.isLmStudio = isLmStudio;
        this.customFetch = customFetch;

        // APIキーの決定（引数 > process.env > import.meta.env）
        let apiKey = settings.apiKey;
        if (!apiKey || apiKey === '') {
            const g = globalThis as any;
            if (typeof g.process !== 'undefined' && g.process.env) {
                apiKey = g.process.env.OPENAI_API_KEY || '';
            }
            // @ts-ignore
            if (!apiKey && typeof import.meta !== 'undefined' && import.meta.env) {
                // @ts-ignore
                apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
            }
        }
        this.resolvedApiKey = apiKey;

        this.openai = createOpenAI({
            apiKey: apiKey || (isLmStudio ? 'not-needed' : 'missing-key'),
            baseURL: settings.endpoint || (isLmStudio ? 'http://localhost:1234/v1' : 'https://api.openai.com/v1'),
            fetch: customFetch as any
        });
    }

    private getModelInstance() {
        return this.openai(this.settings.model || (this.isLmStudio ? 'local-model' : 'gpt-4o'));
    }

    /**
     * AiMessage 配列を SDK が期待する形式に変換します
     */
    private mapMessages(messages: AiMessage[]): any[] {
        return messages.map(msg => {
            const { role, content } = msg;

            // ツール結果メッセージの特殊な変換
            if (role === 'tool') {
                return {
                    role: 'tool',
                    content: [
                        {
                            type: 'tool-result',
                            toolCallId: msg.toolCallId || 'unknown',
                            toolName: 'unknown', // SDK側で要求される場合があるが、特定困難な場合は unknown
                            result: content,
                        }
                    ]
                };
            }

            // アシスタントメッセージでツール呼び出しを含む場合の変換
            if (role === 'assistant' && msg.toolCalls && msg.toolCalls.length > 0) {
                return {
                    role: 'assistant',
                    content: [
                        { type: 'text', text: typeof content === 'string' ? content : '' },
                        ...msg.toolCalls.map(tc => ({
                            type: 'tool-call',
                            toolCallId: tc.id,
                            toolName: tc.name,
                            args: tc.args
                        }))
                    ]
                };
            }

            // マルチモーダルコンテンツの変換
            if (Array.isArray(content)) {
                return {
                    role,
                    content: content.map(part => {
                        if (part.type === 'text') return { type: 'text', text: part.text };
                        if (part.type === 'image') return { type: 'image', image: part.image, mimeType: part.mimeType };
                        return part;
                    })
                };
            }

            return { role, content };
        });
    }

    /**
     * 指定されたオプションでテキストを生成します
     * @param options 生成オプション
     * @returns 生成されたメッセージ
     */
    async generateText(options: GenerationOptions): Promise<AiMessage> {
        const tools = options.tools?.reduce((acc, tool) => {
            acc[tool.name] = {
                description: tool.description,
                parameters: jsonSchema(tool.parameters),
                execute: tool.execute,
            };
            return acc;
        }, {} as any);

        const args: any = {
            model: this.getModelInstance(),
            temperature: options.temperature,
            maxOutputTokens: options.maxTokens,
            tools: tools,
            stopWhen: tools ? stepCountIs(5) : undefined,
        };

        if (options.messages) {
            args.messages = this.mapMessages(options.messages);
        } else {
            args.system = options.system;
            args.prompt = options.prompt;
        }

        const result: any = await generateText(args);
        const { text, toolCalls, usage, finishReason, responseMessages } = result;

        // 最後の応答メッセージから情報を抽出
        const lastMsg = responseMessages ? responseMessages[responseMessages.length - 1] : undefined;
        
        // 思考プロセスの抽出（SDK/モデルがサポートしている場合）
        let thought: string | undefined = undefined;
        if (lastMsg && lastMsg.content && Array.isArray(lastMsg.content)) {
            const thoughtPart = lastMsg.content.find((p: any) => p.type === 'thought' || p.type === 'reasoning');
            if (thoughtPart) thought = thoughtPart.text || thoughtPart.thought;
        }

        return {
            id: (crypto as any).randomUUID?.() || Math.random().toString(36).substring(2),
            role: 'assistant',
            content: text,
            thought,
            timestamp: Date.now(),
            toolCalls: toolCalls?.map((tc: any) => ({
                id: tc.toolCallId || tc.id,
                name: tc.toolName || tc.name,
                args: tc.args
            })),
            metadata: {
                model: this.settings.model,
                usage: usage ? {
                    promptTokens: usage.promptTokens || usage.prompt_tokens || 0,
                    completionTokens: usage.completionTokens || usage.completion_tokens || 0,
                    totalTokens: usage.totalTokens || usage.total_tokens || 0
                } : undefined,
                finishReason
            }
        };
    }

    /**
     * 指定されたオプションでテキストをストリーミング生成します
     * @param options 生成オプション
     * @returns チャンクのストリーム
     */
    async streamText(options: GenerationOptions): Promise<ReadableStream<AiStreamChunk>> {
        const tools = options.tools?.reduce((acc, tool) => {
            acc[tool.name] = {
                description: tool.description,
                parameters: jsonSchema(tool.parameters),
                execute: tool.execute,
            };
            return acc;
        }, {} as any);

        const args: any = {
            model: this.getModelInstance(),
            temperature: options.temperature,
            maxOutputTokens: options.maxTokens,
            tools: tools,
            stopWhen: tools ? stepCountIs(5) : undefined,
        };

        if (options.messages) {
            args.messages = this.mapMessages(options.messages);
        } else {
            args.system = options.system;
            args.prompt = options.prompt;
        }

        const { fullStream } = await streamText(args);

        return fullStream.pipeThrough(new TransformStream({
            transform(chunk: any, controller) {
                switch (chunk.type) {
                    case 'text-delta':
                        controller.enqueue({ type: 'text', content: chunk.textDelta || chunk.text || '' });
                        break;
                    case 'reasoning-delta':
                        controller.enqueue({ type: 'thought', content: chunk.reasoningDelta || chunk.reasoning || '' });
                        break;
                    case 'thought-delta': // Fallback for some models/versions
                        controller.enqueue({ type: 'thought', content: chunk.thoughtDelta || chunk.thought || '' });
                        break;
                    case 'tool-call':
                        controller.enqueue({ type: 'tool-call', content: '', metadata: chunk });
                        break;
                    case 'error':
                        controller.enqueue({ type: 'error', content: String(chunk.error) });
                        break;
                }
            }
        })) as ReadableStream<AiStreamChunk>;
    }

    /**
     * APIへの接続テストを行います
     * @returns テスト結果
     */
    async testConnection(): Promise<{ success: boolean; message: string }> {
        try {
            if (!this.isLmStudio && !this.resolvedApiKey) {
                return { success: false, message: 'APIキーが設定されていません。' };
            }

            const message = await this.generateText({
                prompt: 'Hi! Connection test. Reply with "SUCCESS".'
            });

            const text = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);

            if (text && text.length > 0) {
                return { success: true, message: `接続成功: ${text}` };
            } else {
                return { success: false, message: '接続は成功しましたが、空の応答が返されました。' };
            }
        } catch (error: any) {
            console.error("OpenAI/LMStudio Connection test failed:", error);
            return { success: false, message: `接続エラー: ${error.message || String(error)}` };
        }
    }

    /**
     * OpenAI 互換 API から利用可能なモデル一覧を取得します
     * @returns モデル名の配列
     */
    async fetchModels(): Promise<string[]> {
        const baseUrl = this.settings.endpoint || (this.isLmStudio ? 'http://localhost:1234/v1' : 'https://api.openai.com/v1');
        const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
        const fetchFn = this.customFetch || fetch;

        try {
            const response = await fetchFn(`${normalizedBaseUrl}/models`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.resolvedApiKey || 'not-needed'}`,
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json() as { data: { id: string }[] };
            return data.data.map(m => m.id);
        } catch (error) {
            console.error('Failed to fetch OpenAI models:', error);
            return this.isLmStudio ? ['local-model'] : ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'];
        }
    }
}
