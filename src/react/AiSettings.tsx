import { useState } from 'react';
import { Settings, RefreshCw, CheckCircle2, AlertCircle, Cpu } from 'lucide-react';
import type { AiProvider, ProviderSettings } from '../ai/types';
import { createAiDriver } from '../ai/registry';
import './AiSettings.css';

interface AiSettingsProps {
    provider: AiProvider;
    settings: ProviderSettings;
    onProviderChange: (provider: AiProvider) => void;
    onSettingsChange: (settings: ProviderSettings) => void;
    customFetch?: typeof fetch;
}

export function AiSettings({
    provider,
    settings,
    onProviderChange,
    onSettingsChange,
    customFetch
}: AiSettingsProps) {
    const [testStatus, setTestStatus] = useState<{ success: boolean; message: string } | null>(null);
    const [isTesting, setIsTesting] = useState(false);
    const [isFetchingModels, setIsFetchingModels] = useState(false);
    const [availableModels, setAvailableModels] = useState<string[]>([]);

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestStatus(null);
        try {
            const driver = createAiDriver(provider, settings, { fetch: customFetch });
            const result = await driver.testConnection();
            setTestStatus(result);
        } catch (error: any) {
            setTestStatus({ success: false, message: error.message || 'Unknown error' });
        } finally {
            setIsTesting(false);
        }
    };

    const handleFetchModels = async () => {
        setIsFetchingModels(true);
        try {
            const driver = createAiDriver(provider, settings, { fetch: customFetch });
            const models = await driver.fetchModels();
            setAvailableModels(models);
        } catch (error) {
            console.error('Failed to fetch models', error);
        } finally {
            setIsFetchingModels(false);
        }
    };

    const updateField = (field: keyof ProviderSettings, value: string) => {
        onSettingsChange({ ...settings, [field]: value });
    };

    const handleProviderChange = (newProvider: AiProvider) => {
        onProviderChange(newProvider);
        setAvailableModels([]);
        setTestStatus(null);
    };

    return (
        <div className="restar-ai-settings">
            <h2><Settings size={24} /> AI 設定</h2>
            
            <div className="field-group">
                <label>AI プロバイダー</label>
                <div className="field-control">
                    <select 
                        value={provider} 
                        onChange={(e) => handleProviderChange(e.target.value as AiProvider)}
                    >
                        <option value="gemini">Google Gemini</option>
                        <option value="openai">OpenAI</option>
                        <option value="lmstudio">LM Studio (OpenAI 互換)</option>
                    </select>
                </div>
            </div>

            <div className="field-group">
                <label>API キー</label>
                <div className="field-control">
                    <input 
                        type="password" 
                        value={settings.apiKey} 
                        onChange={(e) => updateField('apiKey', e.target.value)}
                        placeholder={provider === 'lmstudio' ? '不要' : 'API キーを入力'}
                    />
                </div>
            </div>

            {(provider === 'openai' || provider === 'lmstudio') && (
                <div className="field-group">
                    <label>エンドポイント</label>
                    <div className="field-control">
                        <input 
                            type="text" 
                            value={settings.endpoint} 
                            onChange={(e) => updateField('endpoint', e.target.value)}
                            placeholder={provider === 'lmstudio' ? 'http://localhost:1234/v1' : 'https://api.openai.com/v1'}
                        />
                    </div>
                </div>
            )}

            <div className="field-group" style={{ alignItems: 'flex-start', paddingTop: '0.5rem' }}>
                <label>モデル</label>
                <div className="field-control">
                    <div className="input-with-action">
                        <input 
                            type="text" 
                            value={settings.model} 
                            onChange={(e) => updateField('model', e.target.value)}
                            placeholder="使用するモデル名を入力"
                        />
                        <button 
                            className="btn-secondary" 
                            onClick={handleFetchModels} 
                            disabled={isFetchingModels}
                            style={{ padding: '0.25rem 0.75rem', height: 'auto', flex: 'none' }}
                            title="モデル一覧を取得"
                        >
                            <RefreshCw size={14} className={isFetchingModels ? 'spin' : ''} />
                            {isFetchingModels ? '取得中' : '一覧取得'}
                        </button>
                    </div>
                    
                    {availableModels.length > 0 && (
                        <div className="model-chips">
                            {availableModels.map(m => (
                                <button 
                                    key={m}
                                    className={`chip ${settings.model === m ? 'active' : ''}`}
                                    onClick={() => updateField('model', m)}
                                >
                                    <Cpu size={10} style={{ marginRight: '4px' }} />
                                    {m}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="actions">
                <button 
                    className="btn-primary" 
                    onClick={handleTestConnection} 
                    disabled={isTesting}
                >
                    {isTesting ? <RefreshCw size={18} className="spin" /> : '接続テスト'}
                </button>
            </div>

            {testStatus && (
                <div className={`test-result ${testStatus.success ? 'success' : 'error'}`}>
                    {testStatus.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <div>
                        <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
                            {testStatus.success ? '接続成功' : '接続失敗'}
                        </strong>
                        <span>{testStatus.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

// Simple spin animation (injected if not present)
if (!document.getElementById('restar-ai-style')) {
    const style = document.createElement('style');
    style.id = 'restar-ai-style';
    style.textContent = `
        @keyframes restar-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .restar-ai-settings .spin {
            animation: restar-spin 1s linear infinite;
        }
    `;
    document.head.appendChild(style);
}
