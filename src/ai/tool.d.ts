import type { AiTool } from './types';
/**
 * ツールを定義するためのヘルパー関数です。
 * 型推論を効かせつつツールオブジェクトを作成します。
 *
 * @param tool ツール定義
 * @returns AiTool インターフェースを実装したオブジェクト
 */
export declare function defineTool(tool: AiTool): AiTool;
/**
 * 非同期関数をツールとしてラップします。
 *
 * @param name ツール名
 * @param description 説明
 * @param parameters パラメータ定義（JSON Schema）
 * @param fn 実行する関数
 * @returns AiTool インターフェースを実装したオブジェクト
 */
export declare function createToolFromFunction<T = any, R = any>(name: string, description: string, parameters: Record<string, any>, fn: (args: T) => Promise<R>): AiTool;
