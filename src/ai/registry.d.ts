import type { AiDriver, AiProvider, ProviderSettings } from './types';
/**
 * 指定されたプロバイダーと設定に基づいて AI ドライバーを生成します。
 *
 * @param provider AIプロバイダーの種類 ('gemini', 'openai', 'lmstudio')
 * @param settings APIキーやエンドポイントなどの設定
 * @param config 拡張設定（カスタムfetch関数など）
 * @returns プロバイダーに対応する AiDriver インスタンス
 * @throws サポートされていないプロバイダーが指定された場合にエラーを投げます
 */
export declare function createAiDriver(provider: AiProvider, settings: ProviderSettings, config?: {
    fetch?: typeof fetch;
}): AiDriver;
