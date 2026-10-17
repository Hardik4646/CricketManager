import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from '../components/rn-primitives';
import { MatchEngine } from '../engine/MatchEngine';
import {
  ALL_DOMESTIC_TEAMS,
  MUMBAI_STRIKERS,
  DELHI_TITANS,
  PITCH_PRESETS,
} from '../data/sampleTeams';
import {
  STADIUM_BACKGROUNDS,
  ROLE_ICON_METADATA,
} from '../assets/nanoBananaAssets';
import { useCareerStore } from '../store/useCareerStore';
import {
  Play,
  Award,
  Sliders,
  ChevronRight,
  Search,
  FileCode,
  Sparkles,
} from 'lucide-react';

export type ScorecardSubTab = 'scorecard' | 'commentary' | 'analytics' | 'engine';
type BatterFilterMode = 'all' | 'spotlight' | 'boundaries';
type OverPhaseFilter = 'all' | 'powerplay' | 'middle' | 'death' | 'key' | 'protagonist';

interface MatchScorecardScreenProps {
  initialSubTab?: ScorecardSubTab;
}

export const MatchScorecardScreen: React.FC<MatchScorecardScreenProps> = ({
  initialSubTab = 'scorecard',
}) => {
  const {
    player,
    lastSimulatedMatch,
    simulateNextCareerMatch,
  } = useCareerStore();

  const [selectedPitchId, setSelectedPitchId] = useState<string>(PITCH_PRESETS[0].id);
  const [dewPresent, setDewPresent] = useState<boolean>(true);
  const [tacticalStance, setTacticalStance] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');
  const [standaloneMatch, setStandaloneMatch] = useState<any | null>(null);

  const [activeTab, setActiveTab] = useState<ScorecardSubTab>(initialSubTab);
  const [selectedInningsNum, setSelectedInningsNum] = useState<1 | 2>(1);
  const [batterFilter, setBatterFilter] = useState<BatterFilterMode>('all');
  const [overPhaseFilter, setOverPhaseFilter] = useState<OverPhaseFilter>('key');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBallIndex, setSelectedBallIndex] = useState<number>(0);

  useEffect(() => {
    setActiveTab(initialSubTab);
  }, [initialSubTab]);

  const activePitch = useMemo(
    () => PITCH_PRESETS.find((p) => p.id === selectedPitchId) || PITCH_PRESETS[0],
    [selectedPitchId]
  );

  // Use the latest career match if available, or generate an exhibition match with the user's custom player
  const matchData = useMemo(() => {
    if (standaloneMatch) return standaloneMatch;
    if (lastSimulatedMatch) return lastSimulatedMatch;

    const engine = new MatchEngine(
      MUMBAI_STRIKERS,
      DELHI_TITANS,
      'T20',
      activePitch,
      {
        dewPresent,
        crowdAdvantage: activePitch.crowdAdvantage,
        userTacticalStance: tacticalStance,
      }
    );
    return engine.simulateMatch();
  }, [standaloneMatch, lastSimulatedMatch, activePitch, dewPresent, tacticalStance]);

  const activeInnings =
    selectedInningsNum === 1 ? matchData.innings1 : matchData.innings2;

  const teamMap = useMemo(() => {
    const map: Record<string, typeof MUMBAI_STRIKERS> = {};
    ALL_DOMESTIC_TEAMS.forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, []);

  const firstBatTeam = teamMap[matchData.firstBattingTeamId] || MUMBAI_STRIKERS;
  const secondBatTeam = teamMap[matchData.secondBattingTeamId] || DELHI_TITANS;

  // Filtered batters for scorecard view
  const filteredBatters = useMemo(() => {
    return activeInnings.batters.filter((b: any) => {
      if (
        searchQuery.trim() &&
        !b.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      ) {
        return false;
      }
      if (batterFilter === 'spotlight') {
        return b.isUserPlayer || b.isRival || b.runs >= 30;
      }
      if (batterFilter === 'boundaries') {
        return b.fours > 0 || b.sixes > 0;
      }
      return true;
    });
  }, [activeInnings, batterFilter, searchQuery]);

  // Filtered balls for Ball-by-Ball Commentary view
  const filteredBalls = useMemo(() => {
    const list = activeInnings.ballLog || [];
    return list.filter((ball: any) => {
      if (
        searchQuery.trim() &&
        !ball.strikerName.toLowerCase().includes(searchQuery.trim().toLowerCase()) &&
        !ball.bowlerName.toLowerCase().includes(searchQuery.trim().toLowerCase()) &&
        !ball.commentary.toLowerCase().includes(searchQuery.trim().toLowerCase())
      ) {
        return false;
      }
      if (overPhaseFilter === 'powerplay') return ball.overNumber <= 6;
      if (overPhaseFilter === 'middle') return ball.overNumber >= 7 && ball.overNumber <= 15;
      if (overPhaseFilter === 'death') return ball.overNumber >= 16;
      if (overPhaseFilter === 'key') return ball.isKeyMoment;
      if (overPhaseFilter === 'protagonist') {
        return (
          ball.strikerName === player.fullName ||
          ball.bowlerName === player.fullName ||
          ball.strikerName === 'Vikramaditya Rao'
        );
      }
      return true;
    });
  }, [activeInnings, overPhaseFilter, searchQuery, player.fullName]);

  // Selected delivery for Section 5 Formula Breakdown
  const inspectedBall = useMemo(() => {
    const log = activeInnings.ballLog || [];
    if (log.length === 0) return null;
    const safeIdx = Math.min(selectedBallIndex, log.length - 1);
    return log[safeIdx];
  }, [activeInnings, selectedBallIndex]);

  // Phase splits for Over Analytics view
  const phaseComparison = useMemo(() => {
    const computePhase = (innings: any, startOver: number, endOver: number) => {
      const overs = innings.overSummaries.filter(
        (o: any) => o.overNumber >= startOver && o.overNumber <= endOver
      );
      const runs = overs.reduce((acc: number, o: any) => acc + o.runsThisOver, 0);
      const wickets = overs.reduce((acc: number, o: any) => acc + o.wicketsThisOver, 0);
      const count = overs.length || 1;
      return {
        runs,
        wickets,
        runRate: +(runs / count).toFixed(2),
      };
    };

    return [
      {
        label: 'Powerplay (Overs 1–6)',
        modifierNote: '+15% Boundary probability · Fielding restrictions active',
        inn1: computePhase(matchData.innings1, 1, 6),
        inn2: computePhase(matchData.innings2, 1, 6),
      },
      {
        label: 'Middle Overs (Overs 7–15)',
        modifierNote: 'Spin & economy control · Partnership building bonus (50+ / 100+)',
        inn1: computePhase(matchData.innings1, 7, 15),
        inn2: computePhase(matchData.innings2, 7, 15),
      },
      {
        label: 'Death Overs (Overs 16–20)',
        modifierNote: '+20% Six probability · Elevated aggression & pressure index',
        inn1: computePhase(matchData.innings1, 16, 20),
        inn2: computePhase(matchData.innings2, 16, 20),
      },
    ];
  }, [matchData]);

  const handleSimulateCareerMatch = () => {
    const res = simulateNextCareerMatch({
      tacticalStance,
      dewPresent,
    });
    setStandaloneMatch(res);
    setSelectedBallIndex(0);
  };

  return (
    <View className="flex flex-col">
      {/* =====================================================================
          EA FC MANAGER BROADCAST SCOREBOARD HERO
          Uses Nano Banana Pro Stadium Backdrop + Team Crests + Nanobana Portrait
          ===================================================================== */}
      <section className="relative overflow-hidden border-b border-slate-800/80">
        {/*
          [NANO BANANA PRO ASSET SLOT]: High-Resolution Stadium Night Background
          Recommend generating a 16:9 floodlit stadium render using Nano Banana Pro
          and replacing STADIUM_BACKGROUNDS.wankhedeNight in nanoBananaAssets.js.
        */}
        <Image
          source={{ uri: STADIUM_BACKGROUNDS.wankhedeNight }}
          alt="Floodlit Cricket Stadium Backdrop"
          className="absolute inset-0 w-full h-full object-cover opacity-55 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/80 to-[#0B0F17]/55 pointer-events-none" />

        <View className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-6">
          {/* Quiet unboxed metadata line with typographic separators */}
          <View className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 mb-5">
            <View className="flex flex-wrap items-center gap-2">
              <Text className="text-amber-400 font-semibold">Syed Mushtaq Ali T20 Trophy</Text>
              <Text aria-hidden="true">·</Text>
              <Text>{matchData.pitch.venue}</Text>
              <Text aria-hidden="true">·</Text>
              <Text>Pitch: {matchData.pitch.name}</Text>
              <Text aria-hidden="true">·</Text>
              <Text>{dewPresent ? 'Evening Dew Present' : 'Dry Evening Conditions'}</Text>
            </View>
            <Text className="font-mono-tabular text-slate-400">
              Protagonist: {player.fullName} (#{player.jerseyNumber})
            </Text>
          </View>

          {/* Main 12-Column Broadcast Grid: Scoreline (8 cols) + Player of the Match Card (4 cols) */}
          <View className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left 8 Columns: Team vs Team Scoreboard */}
            <View className="lg:col-span-8 bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <View className="grid grid-cols-1 sm:grid-cols-11 gap-4 items-center">
                {/* Team 1 (1st Innings Batting Team) */}
                <View className="sm:col-span-5 flex items-center gap-4">
                  {/*
                    [NANO BANANA PRO ASSET SLOT]: Team 1 Crest
                    Generate metallic vector team shields via Nano Banana Pro.
                  */}
                  <Image
                    source={{ uri: firstBatTeam.crestUri }}
                    alt={firstBatTeam.name}
                    className="w-16 h-16 rounded-xl shrink-0"
                  />
                  <View className="min-w-0">
                    <Text className="text-xs text-slate-400 block">
                      1st Innings · RR {matchData.innings1.runRate.toFixed(2)}
                    </Text>
                    <Text className="font-display text-2xl font-bold tracking-wide text-slate-100 block truncate">
                      {firstBatTeam.name}
                    </Text>
                    <View className="flex items-baseline gap-2 mt-0.5">
                      <Text className="font-mono-tabular text-3xl sm:text-4xl font-bold text-white">
                        {matchData.innings1.totalRuns}/{matchData.innings1.wickets}
                      </Text>
                      <Text className="font-mono-tabular text-xs text-slate-400">
                        ({matchData.innings1.oversFormatted} ov)
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Center Divider */}
                <View className="sm:col-span-1 flex flex-col items-center justify-center py-1">
                  <Text className="font-display text-sm font-semibold text-slate-500">
                    VS
                  </Text>
                </View>

                {/* Team 2 (2nd Innings Batting Team) */}
                <View className="sm:col-span-5 flex items-center sm:justify-end gap-4">
                  <View className="min-w-0 sm:text-right">
                    <Text className="text-xs text-slate-400 block">
                      2nd Innings · Target {matchData.target} · RR {matchData.innings2.runRate.toFixed(2)}
                    </Text>
                    <Text className="font-display text-2xl font-bold tracking-wide text-slate-100 block truncate">
                      {secondBatTeam.name}
                    </Text>
                    <View className="flex items-baseline sm:justify-end gap-2 mt-0.5">
                      <Text className="font-mono-tabular text-3xl sm:text-4xl font-bold text-amber-400">
                        {matchData.innings2.totalRuns}/{matchData.innings2.wickets}
                      </Text>
                      <Text className="font-mono-tabular text-xs text-slate-400">
                        ({matchData.innings2.oversFormatted} ov)
                      </Text>
                    </View>
                  </View>
                  {/*
                    [NANO BANANA PRO ASSET SLOT]: Team 2 Crest
                    Generate metallic vector team shields via Nano Banana Pro.
                  */}
                  <Image
                    source={{ uri: secondBatTeam.crestUri }}
                    alt={secondBatTeam.name}
                    className="w-16 h-16 rounded-xl shrink-0"
                  />
                </View>
              </View>

              {/* Result & Toss Footer Strip */}
              <View className="mt-5 pt-4 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-3 text-xs">
                <Text className="font-semibold text-emerald-400">
                  {matchData.result.marginText}
                </Text>
                <Text className="text-slate-400">{matchData.tossSummary}</Text>
              </View>
            </View>

            {/* Right 4 Columns: EA FC Manager Style Player of the Match Card */}
            <View className="lg:col-span-4 bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <View className="flex items-center justify-between gap-2">
                <View className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
                  <Award className="w-4 h-4 shrink-0" />
                  <Text>Player of the Match</Text>
                </View>
                <Text className="font-mono-tabular text-xs text-slate-400">
                  Match Rating{' '}
                  <strong className="text-emerald-400 font-bold">
                    {matchData.playerOfTheMatch.impactRating}
                  </strong>
                </Text>
              </View>

              <View className="flex items-center gap-4 my-3">
                {/*
                  [NANOBANA.NET / NANAIMG.IO ASSET SLOT]: Consistent Player Portrait
                  Use Nanobana platform (nanobana.net) or Nano Bana (nanaimg.io)
                  for character-consistent player portraits across career stages.
                */}
                <Image
                  source={{ uri: matchData.playerOfTheMatch.portraitUri }}
                  alt={matchData.playerOfTheMatch.name}
                  className="w-16 h-16 rounded-xl border border-slate-700 shrink-0"
                />
                <View className="min-w-0">
                  <Text className="font-display text-2xl font-bold text-white block truncate">
                    {matchData.playerOfTheMatch.name}
                  </Text>
                  <Text className="text-xs text-slate-400 block">
                    {matchData.playerOfTheMatch.role} · #{matchData.playerOfTheMatch.jersey}
                    {matchData.playerOfTheMatch.isUserPlayer ? ' · Career Protagonist' : ''}
                    {matchData.playerOfTheMatch.isRival ? ' · Career Rival' : ''}
                  </Text>
                </View>
              </View>

              <View className="pt-3 border-t border-slate-800/90 flex items-center justify-between text-xs">
                <Text className="text-slate-400">Key Figures</Text>
                <Text className="font-mono-tabular font-semibold text-slate-100">
                  {matchData.playerOfTheMatch.performanceSummary}
                </Text>
              </View>
            </View>
          </View>

          {/* Interactive Match Engine Tactical & Pitch Controller Bar */}
          <View className="mt-4 bg-slate-900/75 border border-slate-800/90 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-4">
            <View className="flex flex-wrap items-center gap-3">
              <View className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <Text>Pitch Condition:</Text>
              </View>
              <View className="flex flex-wrap items-center gap-1 bg-slate-950/90 p-1 rounded-lg border border-slate-800">
                {PITCH_PRESETS.map((preset) => (
                  <TouchableOpacity
                    key={preset.id}
                    onPress={() => {
                      setSelectedPitchId(preset.id);
                      setStandaloneMatch(null);
                    }}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      selectedPitchId === preset.id
                        ? 'bg-amber-400 text-slate-950 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {preset.name}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="flex flex-wrap items-center gap-3">
              {/* Tactical Aggression Stance Selector */}
              <View className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-lg border border-slate-800">
                {(['conservative', 'balanced', 'aggressive'] as const).map((stance) => (
                  <TouchableOpacity
                    key={stance}
                    onPress={() => setTacticalStance(stance)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors whitespace-nowrap shrink-0 ${
                      tacticalStance === stance
                        ? 'bg-slate-800 text-amber-400 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {stance}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Dew Toggle */}
              <TouchableOpacity
                onPress={() => setDewPresent((prev) => !prev)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                  dewPresent
                    ? 'bg-sky-950/50 border-sky-700/60 text-sky-300'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Dew: {dewPresent ? 'Active' : 'Off'}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSimulateCareerMatch}
                className="px-3.5 py-1.5 text-xs font-semibold bg-amber-400 text-slate-950 rounded-lg hover:bg-amber-300 flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Simulate Next Career Match</span>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </section>

      {/* =====================================================================
          MAIN SCORECARD WORKSPACE CONTAINER
          ===================================================================== */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Shared Innings Selector, Sub-View Switcher & Search Toolbar */}
        <View className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* Segmented Innings Switcher */}
          <View className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <TouchableOpacity
              onPress={() => {
                setSelectedInningsNum(1);
                setSelectedBallIndex(0);
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedInningsNum === 1
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              1st Innings · {matchData.innings1.battingTeamShort} ({matchData.innings1.totalRuns}/{matchData.innings1.wickets})
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSelectedInningsNum(2);
                setSelectedBallIndex(0);
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedInningsNum === 2
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              2nd Innings · {matchData.innings2.battingTeamShort} ({matchData.innings2.totalRuns}/{matchData.innings2.wickets})
            </TouchableOpacity>
          </View>

          {/* Scorecard Sub-View Switcher */}
          <View className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            {(
              [
                ['scorecard', 'Scorecard Tables'],
                ['commentary', 'Ball-by-Ball Feed'],
                ['analytics', 'Manhattan & Phases'],
                ['engine', 'Section 5 Math'],
              ] as const
            ).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                onPress={() => setActiveTab(key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === key
                    ? 'bg-slate-800 text-amber-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </TouchableOpacity>
            ))}
          </View>

          {/* Live Player / Commentary Search Input */}
          <View className="relative flex items-center w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter player or bowler..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </View>
        </View>

        {/* ===================================================================
            TAB 1: FIFA-STYLE MATCH SCORECARD VIEW
            =================================================================== */}
        {activeTab === 'scorecard' && (
          <View className="space-y-8">
            <View className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
              <View className="px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <View>
                  <Text className="font-display text-xl font-bold tracking-wide text-white block">
                    {activeInnings.battingTeamName} Batting Scorecard
                  </Text>
                  <Text className="text-xs text-slate-400">
                    Run Rate {activeInnings.runRate.toFixed(2)} · Overs {activeInnings.oversFormatted} · Extras {activeInnings.extras.total} (wd {activeInnings.extras.wides}, nb {activeInnings.extras.noBalls})
                  </Text>
                </View>

                <View className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
                  {(
                    [
                      ['all', 'All Batters'],
                      ['spotlight', 'Protagonist & Key'],
                      ['boundaries', 'Boundary Hitters'],
                    ] as const
                  ).map(([mode, label]) => (
                    <TouchableOpacity
                      key={mode}
                      onPress={() => setBatterFilter(mode)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        batterFilter === mode
                          ? 'bg-slate-800 text-amber-400'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {label}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 bg-slate-950/50">
                      <th className="py-3 pl-5 pr-3">Batter</th>
                      <th className="py-3 px-3">Dismissal</th>
                      <th className="py-3 px-3 text-right font-mono-tabular">R</th>
                      <th className="py-3 px-3 text-right font-mono-tabular">B</th>
                      <th className="py-3 px-3 text-right font-mono-tabular">4s</th>
                      <th className="py-3 px-3 text-right font-mono-tabular">6s</th>
                      <th className="py-3 px-3 text-right font-mono-tabular">Dots</th>
                      <th className="py-3 pl-3 pr-5 text-right font-mono-tabular">SR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-sm">
                    {filteredBatters.map((batter: any) => {
                      const sr =
                        batter.balls > 0
                          ? ((batter.runs / batter.balls) * 100).toFixed(1)
                          : '0.0';
                      const isNotOut = batter.status === 'not out';
                      const didNotBat = batter.status === 'dnb';
                      const roleMeta =
                        ROLE_ICON_METADATA[
                          batter.role as keyof typeof ROLE_ICON_METADATA
                        ] || { code: 'CRK', accent: '#94A3B8' };

                      return (
                        <tr
                          key={batter.id}
                          className={`transition-colors hover:bg-slate-800/40 ${
                            batter.isUserPlayer
                              ? 'bg-amber-500/[0.07]'
                              : batter.isRival
                              ? 'bg-rose-500/[0.05]'
                              : ''
                          }`}
                        >
                          <td className="py-3 pl-5 pr-3">
                            <View className="flex items-center gap-3">
                              <Image
                                source={{ uri: batter.portraitUri }}
                                alt={batter.name}
                                className="w-8 h-8 rounded-lg shrink-0 border border-slate-700"
                              />
                              <View className="min-w-0">
                                <View className="flex items-center gap-1.5">
                                  <Text
                                    className={`font-semibold truncate ${
                                      batter.isUserPlayer
                                        ? 'text-amber-400'
                                        : batter.isRival
                                        ? 'text-rose-300'
                                        : 'text-slate-100'
                                    }`}
                                  >
                                    {batter.name}
                                    {isNotOut && !didNotBat ? '*' : ''}
                                  </Text>
                                  {batter.isCaptain && (
                                    <Text className="text-xs text-slate-400">(c)</Text>
                                  )}
                                  {batter.isWicketkeeper && (
                                    <Text className="text-xs text-slate-400">†</Text>
                                  )}
                                </View>
                                <Text className="text-[11px] text-slate-400 block">
                                  {roleMeta.code} · {batter.battingStyle}
                                  {batter.isUserPlayer ? ' · Career Protagonist' : ''}
                                  {batter.isRival ? ' · Career Rival' : ''}
                                </Text>
                              </View>
                            </View>
                          </td>
                          <td className="py-3 px-3 text-xs text-slate-400">
                            {didNotBat ? (
                              <span className="text-slate-600">did not bat</span>
                            ) : isNotOut ? (
                              <span className="text-emerald-400 font-medium">not out</span>
                            ) : (
                              batter.dismissalText
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-mono-tabular font-bold text-slate-100">
                            {didNotBat ? '—' : batter.runs}
                          </td>
                          <td className="py-3 px-3 text-right font-mono-tabular text-slate-300">
                            {didNotBat ? '—' : batter.balls}
                          </td>
                          <td className="py-3 px-3 text-right font-mono-tabular text-slate-300">
                            {didNotBat ? '—' : batter.fours}
                          </td>
                          <td className="py-3 px-3 text-right font-mono-tabular text-slate-300">
                            {didNotBat ? '—' : batter.sixes}
                          </td>
                          <td className="py-3 px-3 text-right font-mono-tabular text-slate-400">
                            {didNotBat ? '—' : batter.dots}
                          </td>
                          <td className="py-3 pl-3 pr-5 text-right font-mono-tabular text-slate-200">
                            {didNotBat ? '—' : sr}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <View className="px-5 py-3.5 bg-slate-950/60 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                <Text className="text-slate-400">
                  Extras: <strong className="font-mono-tabular text-slate-200">{activeInnings.extras.total}</strong> (Wides {activeInnings.extras.wides}, No Balls {activeInnings.extras.noBalls})
                </Text>
                <Text className="font-mono-tabular text-sm font-bold text-white">
                  TOTAL: {activeInnings.totalRuns}/{activeInnings.wickets} ({activeInnings.oversFormatted} Overs, RR {activeInnings.runRate.toFixed(2)})
                </Text>
              </View>
            </View>

            {/* Bowling & Fall of Wickets 2-Column Split */}
            <View className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <View className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
                <View className="px-5 py-4 border-b border-slate-800">
                  <Text className="font-display text-xl font-bold tracking-wide text-white block">
                    {activeInnings.bowlingTeamName} Bowling Figures
                  </Text>
                  <Text className="text-xs text-slate-400">
                    Includes Section 5 spell fatigue accumulation & accuracy degradation
                  </Text>
                </View>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 bg-slate-950/50">
                        <th className="py-3 pl-5 pr-3">Bowler</th>
                        <th className="py-3 px-2 text-right font-mono-tabular">O</th>
                        <th className="py-3 px-2 text-right font-mono-tabular">M</th>
                        <th className="py-3 px-2 text-right font-mono-tabular">R</th>
                        <th className="py-3 px-2 text-right font-mono-tabular">W</th>
                        <th className="py-3 px-2 text-right font-mono-tabular">Dots</th>
                        <th className="py-3 px-2 text-right font-mono-tabular">ECON</th>
                        <th className="py-3 pl-2 pr-5 text-right font-mono-tabular">Fatigue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 text-sm">
                      {activeInnings.bowlers.map((bowler: any) => (
                        <tr
                          key={bowler.id}
                          className={`hover:bg-slate-800/40 ${
                            bowler.isUserPlayer ? 'bg-amber-500/[0.07]' : ''
                          }`}
                        >
                          <td className="py-3 pl-5 pr-3">
                            <View className="flex items-center gap-2.5">
                              <Image
                                source={{ uri: bowler.portraitUri }}
                                alt={bowler.name}
                                className="w-7 h-7 rounded-lg shrink-0 border border-slate-700"
                              />
                              <View className="min-w-0">
                                <Text
                                  className={`font-semibold block truncate ${
                                    bowler.isUserPlayer ? 'text-amber-400' : 'text-slate-100'
                                  }`}
                                >
                                  {bowler.name}
                                </Text>
                                <Text className="text-[11px] text-slate-400 block truncate">
                                  {bowler.bowlingStyle}
                                </Text>
                              </View>
                            </View>
                          </td>
                          <td className="py-3 px-2 text-right font-mono-tabular text-slate-200">
                            {bowler.oversDisplay}
                          </td>
                          <td className="py-3 px-2 text-right font-mono-tabular text-slate-400">
                            {bowler.maidens}
                          </td>
                          <td className="py-3 px-2 text-right font-mono-tabular text-slate-200">
                            {bowler.runsConceded}
                          </td>
                          <td className="py-3 px-2 text-right font-mono-tabular font-bold text-amber-400">
                            {bowler.wickets}
                          </td>
                          <td className="py-3 px-2 text-right font-mono-tabular text-slate-400">
                            {bowler.dotsBowled}
                          </td>
                          <td className="py-3 px-2 text-right font-mono-tabular text-slate-200">
                            {bowler.economy.toFixed(2)}
                          </td>
                          <td className="py-3 pl-2 pr-5 text-right font-mono-tabular text-xs text-slate-400">
                            {bowler.fatigue}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </View>

              <View className="lg:col-span-5 space-y-6">
                <View className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
                  <Text className="font-display text-lg font-bold tracking-wide text-white block mb-1">
                    Batting Partnerships
                  </Text>
                  <Text className="text-xs text-slate-400 block mb-4">
                    50+ and 100+ stands trigger Section 5 partnershipConfidence bonuses
                  </Text>

                  <View className="space-y-3">
                    {activeInnings.partnerships.slice(0, 6).map((p: any, idx: number) => {
                      const widthPct = Math.min(100, Math.max(8, (p.runs / 120) * 100));
                      return (
                        <View key={idx} className="space-y-1">
                          <View className="flex items-center justify-between text-xs">
                            <Text className="text-slate-300 truncate">
                              {p.wicketNumber}
                              {p.wicketNumber === 1
                                ? 'st'
                                : p.wicketNumber === 2
                                ? 'nd'
                                : p.wicketNumber === 3
                                ? 'rd'
                                : 'th'}{' '}
                              Wicket · {p.batter1Name} & {p.batter2Name}
                            </Text>
                            <Text className="font-mono-tabular font-semibold text-amber-400 shrink-0">
                              {p.runs}{p.unbroken ? '*' : ''} ({p.balls}b)
                            </Text>
                          </View>
                          <View className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${widthPct}%` }}
                              className={`h-full rounded-full ${
                                p.runs >= 50 ? 'bg-amber-400' : 'bg-sky-500'
                              }`}
                            />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>

                <View className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
                  <Text className="font-display text-lg font-bold tracking-wide text-white block mb-3">
                    Fall of Wickets
                  </Text>
                  {activeInnings.fallOfWickets.length === 0 ? (
                    <Text className="text-xs text-slate-400">
                      No wickets fell in this innings.
                    </Text>
                  ) : (
                    <View className="divide-y divide-slate-800/70">
                      {activeInnings.fallOfWickets.map((fow: any) => (
                        <View
                          key={fow.wicketNumber}
                          className="py-2 flex items-center justify-between text-xs"
                        >
                          <Text className="text-slate-300">
                            <strong className="font-mono-tabular text-slate-100">
                              {fow.wicketNumber}-{fow.score}
                            </strong>{' '}
                            · {fow.batterName} ({fow.batterRuns} off {fow.batterBalls}b)
                          </Text>
                          <Text className="font-mono-tabular text-slate-400">
                            {fow.overs} ov
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ===================================================================
            TAB 2: BALL-BY-BALL COMMENTARY & LIVE TELEMETRY LOG
            =================================================================== */}
        {activeTab === 'commentary' && (
          <View className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
            <View className="px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <View>
                <Text className="font-display text-xl font-bold tracking-wide text-white block">
                  Ball-by-Ball Simulation Feed ({activeInnings.battingTeamShort})
                </Text>
                <Text className="text-xs text-slate-400">
                  Click any delivery to inspect its exact Section 5 formula calculation in the Engine Math tab
                </Text>
              </View>

              <View className="flex flex-wrap items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
                {(
                  [
                    ['key', 'Highlights (W / 4 / 6)'],
                    ['protagonist', 'Protagonist & Rival'],
                    ['powerplay', 'Powerplay (1–6)'],
                    ['middle', 'Middle (7–15)'],
                    ['death', 'Death (16–20)'],
                    ['all', 'All Balls'],
                  ] as const
                ).map(([phase, label]) => (
                  <TouchableOpacity
                    key={phase}
                    onPress={() => setOverPhaseFilter(phase)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      overPhaseFilter === phase
                        ? 'bg-slate-800 text-amber-400'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {label}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <ScrollView className="max-h-[600px] divide-y divide-slate-800/70">
              {filteredBalls.length === 0 ? (
                <View className="p-8 text-center">
                  <Text className="text-sm text-slate-400 block mb-3">
                    No deliveries match the current filter.
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setOverPhaseFilter('all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 text-xs font-semibold bg-slate-800 text-amber-400 rounded-lg"
                  >
                    Show All Deliveries
                  </TouchableOpacity>
                </View>
              ) : (
                filteredBalls.map((ball: any, idx: number) => {
                  const isWicket = ball.outcome === 'WICKET';
                  const isSix = ball.outcome === 6;
                  const isFour = ball.outcome === 4;

                  return (
                    <TouchableOpacity
                      key={`${ball.notation}-${idx}`}
                      onPress={() => {
                        const originalIdx = activeInnings.ballLog.indexOf(ball);
                        if (originalIdx >= 0) setSelectedBallIndex(originalIdx);
                        setActiveTab('engine');
                      }}
                      className="w-full text-left px-5 py-3.5 hover:bg-slate-800/40 transition-colors flex items-start justify-between gap-4"
                    >
                      <View className="flex items-start gap-4 min-w-0">
                        <View className="w-12 shrink-0 pt-0.5">
                          <Text className="font-mono-tabular text-xs font-bold text-slate-300 block">
                            {ball.notation}
                          </Text>
                          <Text className="font-mono-tabular text-[11px] text-slate-500 block">
                            {ball.scoreAfterBall}
                          </Text>
                        </View>

                        <View
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono-tabular text-xs font-bold shrink-0 ${
                            isWicket
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : isSix
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                              : isFour
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {ball.displayBadge}
                        </View>

                        <View className="min-w-0">
                          <Text className="text-sm text-slate-100 block">
                            {ball.commentary}
                          </Text>
                          <Text className="text-xs text-slate-400 font-mono-tabular mt-1 block">
                            Bowler Threat {ball.bowlerThreat} · Batter Response {ball.batsmanResponse} · Dominance {ball.dominance > 0 ? `+${ball.dominance}` : ball.dominance} · Seed {ball.seed}
                          </Text>
                        </View>
                      </View>

                      <View className="hidden sm:flex items-center gap-1 text-xs text-slate-500 shrink-0 pt-1">
                        <Text>Inspect Math</Text>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        )}

        {/* ===================================================================
            TAB 3: OVER-BY-OVER MANHATTAN & PHASE ANALYTICS
            =================================================================== */}
        {activeTab === 'analytics' && (
          <View className="space-y-6">
            <View className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {phaseComparison.map((phase) => (
                <View
                  key={phase.label}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-5"
                >
                  <Text className="font-display text-lg font-bold text-white block">
                    {phase.label}
                  </Text>
                  <Text className="text-xs text-slate-400 block mb-4">
                    {phase.modifierNote}
                  </Text>

                  <View className="space-y-2.5 pt-2 border-t border-slate-800/80 text-xs">
                    <View className="flex items-center justify-between">
                      <Text className="text-slate-300 font-medium">
                        {matchData.innings1.battingTeamName}
                      </Text>
                      <Text className="font-mono-tabular font-bold text-white">
                        {phase.inn1.runs}/{phase.inn1.wickets} (RR {phase.inn1.runRate})
                      </Text>
                    </View>
                    <View className="flex items-center justify-between">
                      <Text className="text-slate-300 font-medium">
                        {matchData.innings2.battingTeamName}
                      </Text>
                      <Text className="font-mono-tabular font-bold text-amber-400">
                        {phase.inn2.runs}/{phase.inn2.wickets} (RR {phase.inn2.runRate})
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <View className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
              <View className="flex flex-wrap items-center justify-between gap-2 mb-6">
                <View>
                  <Text className="font-display text-xl font-bold text-white block">
                    Over-by-Over Manhattan Comparison (20 Overs)
                  </Text>
                  <Text className="text-xs text-slate-400">
                    Runs scored per over for {matchData.innings1.battingTeamShort} vs {matchData.innings2.battingTeamShort}
                  </Text>
                </View>
                <View className="flex items-center gap-5 text-xs">
                  <View className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-sky-500 inline-block" />
                    <Text className="text-slate-300">{matchData.innings1.battingTeamShort}</Text>
                  </View>
                  <View className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />
                    <Text className="text-slate-300">{matchData.innings2.battingTeamShort}</Text>
                  </View>
                </View>
              </View>

              <View className="grid grid-cols-10 sm:grid-cols-20 gap-2 items-end h-48 pt-6 pb-2 px-2 bg-slate-950/60 rounded-lg border border-slate-800/80">
                {Array.from({ length: 20 }, (_, i) => {
                  const overNum = i + 1;
                  const o1 = matchData.innings1.overSummaries.find(
                    (o: any) => o.overNumber === overNum
                  );
                  const o2 = matchData.innings2.overSummaries.find(
                    (o: any) => o.overNumber === overNum
                  );
                  const r1 = o1 ? o1.runsThisOver : 0;
                  const r2 = o2 ? o2.runsThisOver : 0;
                  const h1 = Math.min(100, Math.max(4, (r1 / 26) * 100));
                  const h2 = Math.min(100, Math.max(4, (r2 / 26) * 100));

                  return (
                    <View
                      key={overNum}
                      className="flex flex-col items-center justify-end h-full gap-1"
                    >
                      <View className="flex items-end gap-0.5 w-full justify-center h-32">
                        <div
                          style={{ height: `${h1}%` }}
                          title={`Over ${overNum} (${matchData.innings1.battingTeamShort}): ${r1} runs`}
                          className="w-2 bg-sky-500 rounded-t-sm"
                        />
                        <div
                          style={{ height: `${h2}%` }}
                          title={`Over ${overNum} (${matchData.innings2.battingTeamShort}): ${r2} runs`}
                          className="w-2 bg-amber-400 rounded-t-sm"
                        />
                      </View>
                      <Text className="font-mono-tabular text-[10px] text-slate-400">
                        {overNum}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* ===================================================================
            TAB 4: SECTION 5 ENGINE MATH & NANO BANANA ARCHITECTURE INSPECTOR
            =================================================================== */}
        {activeTab === 'engine' && (
          <View className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <View className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5">
              <View className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <View>
                  <Text className="font-display text-xl font-bold text-white block">
                    Section 5 Ball Calculation Formula Inspector
                  </Text>
                  <Text className="text-xs text-slate-400">
                    Exact mathematical trace from src/engine/MatchEngine.js
                  </Text>
                </View>

                <View className="flex items-center gap-2">
                  <TouchableOpacity
                    onPress={() =>
                      setSelectedBallIndex((prev) => Math.max(0, prev - 1))
                    }
                    className="px-2.5 py-1 text-xs bg-slate-800 text-slate-200 rounded hover:bg-slate-700"
                  >
                    Prev Ball
                  </TouchableOpacity>
                  <Text className="font-mono-tabular text-xs text-amber-400">
                    Ball #{selectedBallIndex + 1} / {activeInnings.ballLog.length}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setSelectedBallIndex((prev) =>
                        Math.min(activeInnings.ballLog.length - 1, prev + 1)
                      )
                    }
                    className="px-2.5 py-1 text-xs bg-slate-800 text-slate-200 rounded hover:bg-slate-700"
                  >
                    Next Ball
                  </TouchableOpacity>
                </View>
              </View>

              {inspectedBall && (
                <View className="space-y-4">
                  <View className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
                    <View>
                      <Text className="text-xs text-slate-400 block">
                        Over {inspectedBall.notation} · {inspectedBall.strikerName} vs {inspectedBall.bowlerName}
                      </Text>
                      <Text className="text-sm font-semibold text-white mt-0.5 block">
                        {inspectedBall.commentary}
                      </Text>
                    </View>
                    <Text className="font-mono-tabular text-lg font-bold text-amber-400">
                      Outcome: {inspectedBall.displayBadge}
                    </Text>
                  </View>

                  <View className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <View className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                      <Text className="text-[11px] text-slate-400 block">
                        Step 1: Bowler Threat
                      </Text>
                      <Text className="font-mono-tabular text-xl font-bold text-rose-400 mt-1 block">
                        {inspectedBall.bowlerThreat}
                      </Text>
                    </View>
                    <View className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                      <Text className="text-[11px] text-slate-400 block">
                        Step 2: Batter Response
                      </Text>
                      <Text className="font-mono-tabular text-xl font-bold text-emerald-400 mt-1 block">
                        {inspectedBall.batsmanResponse}
                      </Text>
                    </View>
                    <View className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                      <Text className="text-[11px] text-slate-400 block">
                        Step 3: Random Seed
                      </Text>
                      <Text className="font-mono-tabular text-xl font-bold text-sky-400 mt-1 block">
                        {inspectedBall.seed}
                      </Text>
                    </View>
                    <View className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                      <Text className="text-[11px] text-slate-400 block">
                        Step 4: Net Dominance
                      </Text>
                      <Text className="font-mono-tabular text-xl font-bold text-amber-400 mt-1 block">
                        {inspectedBall.dominance > 0
                          ? `+${inspectedBall.dominance}`
                          : inspectedBall.dominance}
                      </Text>
                    </View>
                  </View>

                  <View className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-2.5">
                    <Text className="text-xs font-semibold text-slate-200 block">
                      Step 5: Dynamic Cumulative Thresholds (0 – 100 Scale)
                    </Text>
                    <View className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-tabular">
                      <Text className="text-rose-400">
                        WICKET &lt; {inspectedBall.thresholds.wicketThreshold}
                      </Text>
                      <Text className="text-slate-300">
                        DOT &lt; {inspectedBall.thresholds.dotThreshold}
                      </Text>
                      <Text className="text-sky-300">
                        1 RUN &lt; {inspectedBall.thresholds.oneRunThreshold}
                      </Text>
                      <Text className="text-sky-400">
                        2 RUNS &lt; {inspectedBall.thresholds.twoRunThreshold}
                      </Text>
                      <Text className="text-indigo-300">
                        3 RUNS &lt; {inspectedBall.thresholds.threeRunThreshold}
                      </Text>
                      <Text className="text-emerald-400">
                        FOUR &lt; {inspectedBall.thresholds.fourThreshold}
                      </Text>
                      <Text className="text-amber-400">
                        SIX &lt; {inspectedBall.thresholds.sixThreshold}
                      </Text>
                      <Text className="text-purple-300">
                        EXTRA ≥ {inspectedBall.thresholds.sixThreshold}
                      </Text>
                    </View>
                    <Text className="text-xs text-slate-400 pt-1 block">
                      Active Context Modifiers:{' '}
                      {inspectedBall.modifiersApplied.length > 0
                        ? inspectedBall.modifiersApplied.join(' · ')
                        : 'Standard T20 Conditions'}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View className="lg:col-span-5 space-y-5">
              <View className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
                <View className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-2">
                  <FileCode className="w-4 h-4" />
                  <Text>Phase 1 & 2 Project Structure</Text>
                </View>
                <pre className="text-xs font-mono-tabular bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-slate-300 overflow-x-auto leading-relaxed">
{`├── app.json                       # Expo Dark-Mode Config
├── babel.config.js                # Expo + NativeWind Babel
├── tailwind.config.js             # EA FC Dark Theme Palette
├── src/
│   ├── assets/
│   │   └── nanoBananaAssets.js    # Nano Banana Asset Manifest
│   ├── components/
│   │   └── rn-primitives.tsx      # React Native Web Bridge
│   ├── data/
│   │   └── sampleTeams.js         # 4 Domestic Squads & Presets
│   ├── engine/
│   │   └── MatchEngine.js         # Pure JS Sec. 5 Match Engine
│   ├── store/
│   │   └── useCareerStore.ts      # Zustand Player & Career Store
│   └── screens/
│       ├── PlayerCreationScreen.tsx
│       ├── DashboardScreen.tsx
│       └── MatchScorecardScreen.tsx`}
                </pre>
              </View>

              <View className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
                <View className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <Text>Nano Banana Visual Asset Pipeline</Text>
                </View>
                <Text className="text-xs text-slate-300 leading-relaxed block">
                  1. <strong>Nano Banana Pro</strong>: Recommended for demanding detail, high-resolution work, and polished metallic team crests (<em>TEAM_CRESTS</em>) & floodlit stadium backgrounds (<em>STADIUM_BACKGROUNDS</em>).
                </Text>
                <Text className="text-xs text-slate-300 leading-relaxed block">
                  2. <strong>Nanobana platform (nanobana.net) / Nano Bana (nanaimg.io)</strong>: Recommended for strict character consistency when generating player portraits across age curves (Age 16 Club Youth to Age 35 Veteran).
                </Text>
                <Text className="text-xs text-slate-300 leading-relaxed block">
                  3. <strong>Nano Banana 2</strong>: Recommended for fast creation of UI role icons and tactical pitch condition indicators.
                </Text>
              </View>
            </View>
          </View>
        )}
      </div>
    </View>
  );
};

export default MatchScorecardScreen;
