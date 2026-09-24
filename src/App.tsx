import { useState } from 'react'
import { HistoryView } from './components/HistoryView'
import { SettingsView } from './components/SettingsView'
import { StatsView } from './components/StatsView'
import { TodayView } from './components/TodayView'
import { useAppData, useNow } from './lib/useAppData'

type Tab = 'today' | 'history' | 'stats' | 'settings'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'today', label: 'Today', icon: '🕌' },
  { id: 'history', label: 'History', icon: '📅' },
  { id: 'stats', label: 'Stats', icon: '📊' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

export default function App() {
  const { data, setData, setPrayer, updateSettings } = useAppData()
  const now = useNow()
  const [tab, setTab] = useState<Tab>(data.settings.location ? 'today' : 'settings')

  return (
    <div className="app">
      <header className="topbar">
        <h1>Salah Tracker</h1>
      </header>
      <main>
        {tab === 'today' && (
          <TodayView data={data} now={now} setPrayer={setPrayer} goToSettings={() => setTab('settings')} />
        )}
        {tab === 'history' && <HistoryView data={data} now={now} setPrayer={setPrayer} />}
        {tab === 'stats' && <StatsView data={data} now={now} />}
        {tab === 'settings' && <SettingsView data={data} updateSettings={updateSettings} replaceData={setData} />}
      </main>
      <nav className="tabbar">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
            <span aria-hidden>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
