import type { AiProvider, ProviderSettings } from '../ai/types';
import './AiSettings.css';
/**
 * AiSettings コンポーネントのプロパティ
 */
export interface AiSettingsProps {
    /** 現在選択されているプロバイダー */
    provider: AiProvider;
    /** 現在の設定情報 */
    settings: ProviderSettings;
    /** プロバイダーが変更された時のコールバック */
    onProviderChange: (provider: AiProvider) => void;
    /** 設定が変更された時のコールバック */
    onSettingsChange: (settings: ProviderSettings) => void;
    /** カスタム fetch 関数 (オプション) */
    customFetch?: typeof fetch;
}
/**
 * AI 設定を管理するためのUIコンポーネント
 *
 * プロバイダーの選択、APIキーの設定、接続テスト、モデル一覧の取得などの機能を提供します。
 */
export declare function AiSettings({ provider, settings, onProviderChange, onSettingsChange, customFetch }: AiSettingsProps): import("react/jsx-runtime").JSX.Element;
