import { useState } from 'react';
import { MessageSquare, Settings as SettingsIcon, Zap } from 'lucide-react';
import { AiSettings } from 'restar-ai-ts';
import { useSettings } from './hooks/useSettings';
import Chat from './components/Chat';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'settings'>('chat');
  const { provider, setProvider, settings, updateProviderSettings } = useSettings();

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">
          <Zap size={24} className="logo-icon" />
          <span>ReSTAR AI</span>
        </div>
        <nav>
          <button 
            className={activeTab === 'chat' ? 'active' : ''} 
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare size={20} />
            <span>Chat</span>
          </button>
          <button 
            className={activeTab === 'settings' ? 'active' : ''} 
            onClick={() => setActiveTab('settings')}
          >
            <SettingsIcon size={20} />
            <span>Settings</span>
          </button>
        </nav>
      </aside>
      
      <main className="content">
        {activeTab === 'chat' ? (
          <Chat provider={provider} settings={settings} />
        ) : (
          <div className="settings-wrapper">
            <AiSettings 
              provider={provider}
              settings={settings}
              onProviderChange={setProvider}
              onSettingsChange={updateProviderSettings}
            />
            <div className="settings-info">
              <h3>設定の永続化</h3>
              <p>このサンプルでは localStorage を使用して設定を保存しています。</p>
              <p>ライブラリ本体には保存ロジックを含まず、利用側で自由に実装できるようになっています。</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
