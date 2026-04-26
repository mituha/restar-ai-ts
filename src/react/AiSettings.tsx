import { useState } from 'react';
import { Settings, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import type { AiProvider, ProviderSettings } from '../ai/types';
import { createAiDriver } from '../ai/registry';
import './AiSettings.css';

interface AiSettingsProps {
    provider: AiProvider;
    settings: ProviderSettings;
    onProviderChange: (provider: AiProvider) => void;
    onSettingsChange: (settings: ProviderSettings) => void;
}

export function AiSettings({
    provider,
    settings,
    onProviderChange,
    onSettingsChange
}: AiSettingsProps) {
    const [testStatus, setTestStatus] = useState<{ success: boolean; message: string } | null>(null);
    const [isTesting, setIsTesting] = useState(false);
    const [availableModels, setAvailableModels] = useState<string[]>([]);

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestStatus(null);
        try {
            const driver = createAiDriver(provider, settings);
            const result = await driver.testConnection();
            setTestStatus(result);
        } catch (error: any) {
            setTestStatus({ success: false, message: error.message || 'Unknown error' });
        } finally {
            setIsTesting(false);
        }
    };

    const handleFetchModels = async () => {
        try {
            const driver = createAiDriver(provider, settings);
            const models = await driver.fetchModels();
            setAvailableModels(models);
        } catch (error) {
            console.error('Failed to fetch models', error);
        }
    };

    const updateField = (field: keyof ProviderSettings, value: string) => {
        onSettingsChange({ ...settings, [field]: value });
    };

    return (
        <div className="restar-ai-settings">
            <h2><Settings size={20} /> AI設定</h2>
            
            <div className="field-group">
                <label>プロバイダー</label>
                <select 
                    value={provider} 
                    onChange={(e) => onProviderChange(e.target.value as AiProvider)}
                >
                    <option value="gemini">Google Gemini</option>
                    <option value="openai">OpenAI</option>
                    <option value="lmstudio">LM Studio (OpenAI 互換)</option>
                </select>
            </div>

            <div className="field-group">
                <label>API キー</label>
                <input 
                    type="password" 
                    value={settings.apiKey} 
                    onChange={(e) => updateField('apiKey', e.target.value)}
                    placeholder={provider === 'lmstudio' ? '不要' : 'API キーを入力'}
                />
            </div>

            {(provider === 'openai' || provider === 'lmstudio') && (
                <div className="field-group">
                    <label>エンドポイント</label>
                    <input 
                        type="text" 
                        value={settings.endpoint} 
                        onChange={(e) => updateField('endpoint', e.target.value)}
                        placeholder={provider === 'lmstudio' ? 'http://localhost:1234/v1' : 'https://api.openai.com/v1'}
                    />
                </div>
            )}

            <div className="field-group">
                <label>モデル</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                        type="text" 
                        value={settings.model} 
                        onChange={(e) => updateField('model', e.target.value)}
                        placeholder="使用するモデル名"
                    />
                    <button className="btn-secondary" onClick={handleFetchModels} title="モデル一覧を取得">
                        <RefreshCw size={14} />
                    </button>
                </div>
                {availableModels.length > 0 && (
                    <select 
                        style={{ marginTop: '0.5rem' }}
                        onChange={(e) => updateField('model', e.target.value)}
                        value={settings.model}
                    >
                        <option value="">モデルを選択...</option>
                        {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                )}
            </div>

            <div className="actions">
                <button 
                    className="btn-primary" 
                    onClick={handleTestConnection} 
                    disabled={isTesting}
                >
                    {isTesting ? <RefreshCw size={14} className="spin" /> : '接続テスト'}
                </button>
            </div>

            {testStatus && (
                <div className={`test-result ${testStatus.success ? 'success' : 'error'}`}>
                    {testStatus.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    <span>{testStatus.message}</span>
                </div>
            )}
        </div>
    );
}

// Simple spin animation
const style = document.createElement('style');
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
