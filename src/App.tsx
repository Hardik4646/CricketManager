import React, { useState } from 'react';
import { SafeAreaView, TouchableOpacity } from './components/rn-primitives';
import { DashboardScreen } from './screens/DashboardScreen';
import { PlayerCreationScreen } from './screens/PlayerCreationScreen';
import { MatchScorecardScreen } from './screens/MatchScorecardScreen';
import { WorldAndRecordsScreen } from './screens/WorldAndRecordsScreen';
import { useCareerStore } from './store/useCareerStore';
import { Play } from 'lucide-react';

type AppRoute = 'dashboard' | 'creation' | 'scorecard' | 'world';

export function App() {
  const [route, setRoute] = useState<AppRoute>('dashboard');
  const { simulateNextCareerMatch, currentWeek } = useCareerStore();

  const handleQuickPlayMatch = () => {
    simulateNextCareerMatch();
    setRoute('dashboard');
  };

  return (
    <SafeAreaView className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col">
      {/* =====================================================================
          TOP BAR CONTRACT (3 Zones: Brand Wordmark | 4 Nav Links | 1 Primary CTA)
          ===================================================================== */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-[#07090E]/95 backdrop-blur-md border-b border-slate-800/90">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#hub"
          onClick={(e) => {
            e.preventDefault();
            setRoute('dashboard');
          }}
          className="font-display text-2xl font-bold tracking-wider text-slate-100 whitespace-nowrap shrink-0"
        >
          PITCHSIDE FC 26
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
          <button
            type="button"
            onClick={() => setRoute('dashboard')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              route === 'dashboard'
                ? 'text-amber-400 border-amber-400'
                : 'border-transparent hover:text-slate-100'
            }`}
          >
            Career Hub
          </button>
          <button
            type="button"
            onClick={() => setRoute('scorecard')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              route === 'scorecard'
                ? 'text-amber-400 border-amber-400'
                : 'border-transparent hover:text-slate-100'
            }`}
          >
            Match Scorecard
          </button>
          <button
            type="button"
            onClick={() => setRoute('world')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              route === 'world'
                ? 'text-amber-400 border-amber-400'
                : 'border-transparent hover:text-slate-100'
            }`}
          >
            World & Records
          </button>
          <button
            type="button"
            onClick={() => setRoute('creation')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              route === 'creation'
                ? 'text-amber-400 border-amber-400'
                : 'border-transparent hover:text-slate-100'
            }`}
          >
            Create Pro
          </button>
        </nav>

        {/* Zone 3: 1 primary action button */}
        <div className="flex items-center gap-3 shrink-0">
          <TouchableOpacity
            onPress={handleQuickPlayMatch}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>Play Week {currentWeek} Match</span>
          </TouchableOpacity>
        </div>
      </header>

      {/* Mobile Navigation Bar (for narrow viewports) */}
      <div className="flex md:hidden items-center justify-around px-4 py-2 bg-[#0C1018] border-b border-slate-800 text-xs font-medium">
        {(
          [
            ['dashboard', 'Career Hub'],
            ['scorecard', 'Scorecard'],
            ['world', 'World & DB'],
            ['creation', 'Create Pro'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setRoute(key)}
            className={`px-3 py-1.5 whitespace-nowrap shrink-0 ${
              route === key ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1">
        {route === 'dashboard' && (
          <DashboardScreen
            onNavigateToScorecard={() => setRoute('scorecard')}
            onNavigateToCreation={() => setRoute('creation')}
            onNavigateToRecords={() => setRoute('world')}
          />
        )}
        {route === 'creation' && (
          <PlayerCreationScreen
            onComplete={() => setRoute('dashboard')}
          />
        )}
        {route === 'scorecard' && (
          <MatchScorecardScreen initialSubTab="scorecard" />
        )}
        {route === 'world' && <WorldAndRecordsScreen />}
      </main>
    </SafeAreaView>
  );
}

export default App;
