import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from '../components/rn-primitives';
import {
  useCareerStore,
  getReputationTier,
  evaluateSelectorFormula,
  ControlMode,
  WeekLoopPhase,
} from '../store/useCareerStore';
import {
  ALL_DOMESTIC_TEAMS,
  MUMBAI_STRIKERS,
  DELHI_TITANS,
  PITCH_PRESETS,
} from '../data/sampleTeams';
import {
  CAREER_STAGES_CONFIG,
  TRAINING_CATEGORIES,
  SPECIALIZATION_PATHS,
  SPECIALIST_COACHES,
  BRAND_ENDORSEMENTS,
  IPL_FRANCHISES,
  SelectorPersonality,
} from '../data/npcDatabase';
import {
  STADIUM_BACKGROUNDS,
  ROLE_ICON_METADATA,
} from '../assets/nanoBananaAssets';
import {
  Play,
  ChevronRight,
  Award,
  Dumbbell,
  MessageSquare,
  Users,
  ShieldAlert,
  Briefcase,
  Check,
  FileSpreadsheet,
  Sliders,
} from 'lucide-react';

interface DashboardScreenProps {
  onNavigateToScorecard: () => void;
  onNavigateToCreation: () => void;
  onNavigateToRecords: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateToScorecard,
  onNavigateToCreation,
  onNavigateToRecords,
}) => {
  const {
    player,
    stageIndex,
    careerStage,
    currentWeek,
    currentSeason,
    weekPhase,
    reputationScore,
    selectorRespect,
    selectorPersonality,
    careerFundsLakhs,
    controlMode,
    dynastyGeneration,
    parentLegacyName,
    weeklyTrainingHours,
    trainingCompletedThisWeek,
    lastTrainingSummary,
    activeSpecializationId,
    hiredCoachIds,
    activeEndorsementIds,
    socialFeed,
    activePressQuestion,
    pressAnsweredThisWeek,
    activeChoiceEvent,
    choiceEventResolvedThisWeek,
    recentPerformances,
    careerStats,
    npcDatabase,
    schedule,
    lastSimulatedMatch,
    setControlMode,
    setWeekPhase,
    setSelectorPersonality,
    simulateNextCareerMatch,
    answerPressConference,
    resolveChoiceEvent,
    setTrainingHourAllocation,
    commitWeeklyTraining,
    selectSpecialization,
    hireSpecialistCoach,
    signBrandEndorsement,
    runIPLAuctionBid,
    advanceToNextWeekOrStage,
  } = useCareerStore();

  const [tacticalStance, setTacticalStance] = useState<
    'conservative' | 'balanced' | 'aggressive'
  >('balanced');
  const [selectedFormatOverride, setSelectedFormatOverride] = useState<
    'T20' | 'ODI' | 'TEST' | null
  >(null);
  const [activeAttributeCategory, setActiveAttributeCategory] = useState<
    'batting' | 'bowling' | 'fielding' | 'mental'
  >('batting');
  const [auctionBannerMsg, setAuctionBannerMsg] = useState<string | null>(null);

  const homeTeam =
    ALL_DOMESTIC_TEAMS.find((t) => t.id === player.homeTeamId) || MUMBAI_STRIKERS;

  const activeFixture =
    schedule[(currentWeek - 1) % schedule.length] || schedule[0];

  const opponentTeam =
    ALL_DOMESTIC_TEAMS.find((t) => t.id === activeFixture.opponentTeamId) ||
    DELHI_TITANS;

  const upcomingPitch =
    PITCH_PRESETS.find((p) => p.id === activeFixture.pitchPresetId) ||
    PITCH_PRESETS[0];

  const matchFormat = selectedFormatOverride || activeFixture.format || 'T20';

  const rivalNpc =
    npcDatabase.find((n) => n.isRival) || npcDatabase[0];

  const selectorReport = evaluateSelectorFormula(
    player,
    reputationScore,
    selectorPersonality,
    selectorRespect,
    stageIndex,
    rivalNpc
  );

  const repTier = getReputationTier(reputationScore);
  const roleMeta = ROLE_ICON_METADATA[player.role] || {
    code: 'PRO',
    accent: '#F59E0B',
  };

  const totalAllocatedHours = Object.values(weeklyTrainingHours).reduce(
    (sum, h) => sum + h,
    0
  );
  const maxSingleDrillHours = Math.max(...Object.values(weeklyTrainingHours), 0);

  // Career batting & bowling averages
  const dismissals = Math.max(1, careerStats.inningsBatted - careerStats.notOuts);
  const battingAverage =
    careerStats.inningsBatted > 0
      ? (careerStats.runs / dismissals).toFixed(2)
      : '0.00';
  const battingStrikeRate =
    careerStats.ballsFaced > 0
      ? ((careerStats.runs / careerStats.ballsFaced) * 100).toFixed(1)
      : '0.0';

  const handleSimulateMatch = () => {
    simulateNextCareerMatch({
      tacticalStance,
      dewPresent: upcomingPitch.dewPresent,
      formatOverride: matchFormat,
    });
  };

  const iplClub = IPL_FRANCHISES.find((f) => f.id === player.iplFranchiseId);

  const LOOP_STEPS: { phase: WeekLoopPhase; stepNum: string; label: string; sub: string }[] = [
    {
      phase: 'PRE_MATCH',
      stepNum: '01',
      label: 'Pre-Match & Tactics',
      sub: `Week ${currentWeek} vs ${opponentTeam.shortName}`,
    },
    {
      phase: 'POST_MATCH_MEDIA',
      stepNum: '02',
      label: 'Media, Press & Events',
      sub: pressAnsweredThisWeek && choiceEventResolvedThisWeek ? 'Completed' : 'Action Pending',
    },
    {
      phase: 'TRAINING_WEEK',
      stepNum: '03',
      label: 'Training Week (40h)',
      sub: trainingCompletedThisWeek ? 'Completed' : `${totalAllocatedHours}/40 hrs set`,
    },
    {
      phase: 'SELECTION_REVIEW',
      stepNum: '04',
      label: 'Selection & Advance',
      sub: `Score ${selectorReport.finalSelectionScore}`,
    },
  ];

  return (
    <View className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* =====================================================================
          PLAYER EXECUTIVE HEADER STRIP (FLAT EDITORIAL ARCHITECTURE)
          ===================================================================== */}
      <section className="bg-[#0C1018] border border-slate-800/90 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800/90">
        {/* Col 1-5: Protagonist Identity & Age Curve */}
        <View className="lg:col-span-5 p-5 flex items-center justify-between gap-4">
          <View className="flex items-center gap-4 min-w-0">
            {/*
              [NANOBANA.NET / NANAIMG.IO ASSET SLOT]: Player Portrait
              Use Nanobana platform (nanobana.net) or Nano Bana (nanaimg.io)
              for character consistency across the player's career age curve.
            */}
            <Image
              source={{ uri: player.portraitUri }}
              alt={player.fullName}
              className="w-16 h-16 border border-slate-700 shrink-0"
            />
            <View className="min-w-0">
              <Text className="text-xs text-amber-400 font-semibold block truncate">
                {careerStage}
                {dynastyGeneration > 1 ? ` · Gen #${dynastyGeneration} (${parentLegacyName} Legacy)` : ''}
              </Text>
              <Text className="font-display text-3xl font-bold tracking-wide text-white block truncate">
                {player.fullName}
              </Text>
              <Text className="text-xs text-slate-400 block truncate">
                Age {player.age} · {player.role} · #{player.jerseyNumber} · {homeTeam.name}
                {iplClub ? ` · ${iplClub.short}` : ''}
              </Text>
            </View>
          </View>

          <View className="text-right shrink-0">
            <Text className="font-mono-tabular text-4xl font-bold text-amber-400 block leading-none">
              {player.overallRating}
            </Text>
            <Text className="font-mono-tabular text-[11px] text-slate-400 mt-1 block">
              OVR / {player.potentialRating} POT
            </Text>
          </View>
        </View>

        {/* Col 6-9: Core Telemetry Metrics (Reputation, Form, Fitness, Earnings) */}
        <View className="lg:col-span-4 p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
          <View>
            <Text className="text-[11px] text-slate-400 block">Reputation</Text>
            <Text className="font-mono-tabular text-xl font-bold text-emerald-400 mt-0.5 block">
              {reputationScore}
            </Text>
            <Text className="text-[11px] text-slate-500 block truncate">
              {repTier.tierName.split(' ')[0]}
            </Text>
          </View>
          <View>
            <Text className="text-[11px] text-slate-400 block">Form / Conf</Text>
            <Text className="font-mono-tabular text-xl font-bold text-white mt-0.5 block">
              {player.mental.form} / {player.mental.confidence}
            </Text>
            <Text className="text-[11px] text-slate-500 block">Last 5 Avg</Text>
          </View>
          <View>
            <Text className="text-[11px] text-slate-400 block">Fitness</Text>
            <Text className="font-mono-tabular text-xl font-bold text-sky-400 mt-0.5 block">
              {player.mental.fitnessLevel}%
            </Text>
            <Text className="text-[11px] text-slate-500 block">
              Rec {player.mental.recoveryRate}
            </Text>
          </View>
          <View>
            <Text className="text-[11px] text-slate-400 block">Earnings</Text>
            <Text className="font-mono-tabular text-xl font-bold text-amber-400 mt-0.5 block">
              ₹{careerFundsLakhs}L
            </Text>
            <Text className="text-[11px] text-slate-500 block">
              Season {currentSeason}
            </Text>
          </View>
        </View>

        {/* Col 10-12: Control Style Switcher (Section 2) */}
        <View className="lg:col-span-3 p-5 flex flex-col justify-between">
          <View className="flex items-center justify-between text-xs mb-2">
            <Text className="text-slate-400">Control Mode</Text>
            <TouchableOpacity
              onPress={onNavigateToCreation}
              className="text-amber-400 hover:underline text-xs"
            >
              Edit Pro
            </TouchableOpacity>
          </View>
          <View className="grid grid-cols-3 gap-1 bg-[#07090E] p-1 border border-slate-800">
            {(['Full Control', 'Captain Mode', 'Career Focus'] as ControlMode[]).map(
              (mode) => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setControlMode(mode)}
                  className={`py-1.5 px-1 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                    controlMode === mode
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode.split(' ')[0]}
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      </section>

      {/* =====================================================================
          CHRONOLOGICAL WEEKLY CAREER LOOP STEPPER (SECTION 2 CORE LOOP)
          Pre-Match -> Post-Match Media & Events -> Weekly Training -> Selection
          ===================================================================== */}
      <nav
        aria-label="Weekly Career Loop"
        className="grid grid-cols-2 lg:grid-cols-4 bg-[#0C1018] border border-slate-800/90 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/90"
      >
        {LOOP_STEPS.map((step) => {
          const isActive = weekPhase === step.phase;
          return (
            <TouchableOpacity
              key={step.phase}
              onPress={() => setWeekPhase(step.phase)}
              className={`p-4 text-left transition-colors flex items-center justify-between ${
                isActive
                  ? 'bg-amber-400/[0.08] text-white'
                  : 'hover:bg-slate-900/60 text-slate-400'
              }`}
            >
              <View className="min-w-0">
                <View className="flex items-center gap-2">
                  <Text
                    className={`font-mono-tabular text-xs font-bold ${
                      isActive ? 'text-amber-400' : 'text-slate-500'
                    }`}
                  >
                    {step.stepNum}.
                  </Text>
                  <Text
                    className={`font-display text-lg font-bold tracking-wide truncate ${
                      isActive ? 'text-amber-400' : 'text-slate-200'
                    }`}
                  >
                    {step.label}
                  </Text>
                </View>
                <Text className="text-xs text-slate-400 mt-0.5 block truncate">
                  {step.sub}
                </Text>
              </View>
              <ChevronRight
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-amber-400' : 'text-slate-600'
                }`}
              />
            </TouchableOpacity>
          );
        })}
      </nav>

      {/* =====================================================================
          STEP 01: PRE-MATCH & TACTICAL BRIEFING VIEW
          ===================================================================== */}
      {weekPhase === 'PRE_MATCH' && (
        <View className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 8 Columns: Broadcast Fixture Arena + Tactical Setup */}
          <View className="lg:col-span-8 space-y-6">
            <View className="relative bg-[#0C1018] border border-slate-800/90 overflow-hidden">
              {/*
                ===============================================================
                [NANO BANANA PRO ASSET INSERTION POINT — STADIUM BACKDROP]
                Generate high-resolution 16:9 stadium backgrounds using
                **Nano Banana Pro** for demanding architectural detail.
                ===============================================================
              */}
              <Image
                source={{ uri: STADIUM_BACKGROUNDS.wankhedeNight }}
                alt="Stadium Night View"
                className="absolute inset-0 w-full h-full object-cover opacity-45 pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0C1018] via-[#0C1018]/85 to-[#0C1018]/50 pointer-events-none" />

              <View className="relative p-6 space-y-6">
                <View className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 border-b border-slate-800/80 pb-3">
                  <Text>
                    <strong className="text-amber-400">Week {currentWeek} Fixture</strong> · {activeFixture.tournament} · {activeFixture.stageLabel}
                  </Text>
                  <Text className="font-mono-tabular text-slate-400">
                    Format: {matchFormat} ({matchFormat === 'T20' ? '20 Overs' : matchFormat === 'ODI' ? '50 Overs' : 'First-Class 4-Day'})
                  </Text>
                </View>

                {/* Matchup Lockup */}
                <View className="grid grid-cols-1 sm:grid-cols-11 gap-4 items-center py-2">
                  <View className="sm:col-span-5 flex items-center gap-4">
                    {/*
                      [NANO BANANA PRO ASSET INSERTION POINT — HOME TEAM CREST]
                      Generate polished metallic team crests with Nano Banana Pro.
                    */}
                    <Image
                      source={{ uri: homeTeam.crestUri }}
                      alt={homeTeam.name}
                      className="w-16 h-16 shrink-0"
                    />
                    <View className="min-w-0">
                      <Text className="text-xs text-amber-400 block">
                        Home Club · {homeTeam.stateRegion}
                      </Text>
                      <Text className="font-display text-3xl font-bold text-white block truncate">
                        {homeTeam.name}
                      </Text>
                      <Text className="text-xs text-slate-400 block">
                        {player.fullName} (#{player.jerseyNumber}) Starting XI
                      </Text>
                    </View>
                  </View>

                  <View className="sm:col-span-1 text-center">
                    <Text className="font-display text-xl font-bold text-slate-500">
                      VS
                    </Text>
                  </View>

                  <View className="sm:col-span-5 flex items-center sm:justify-end gap-4">
                    <View className="min-w-0 sm:text-right">
                      <Text className="text-xs text-slate-400 block">
                        Opposition · {opponentTeam.stateRegion}
                      </Text>
                      <Text className="font-display text-3xl font-bold text-white block truncate">
                        {opponentTeam.name}
                      </Text>
                      <Text className="text-xs text-rose-400 block">
                        {opponentTeam.id === 'DEL'
                          ? `Rival: ${rivalNpc.name} (${rivalNpc.overall} OVR)`
                          : opponentTeam.homeGround}
                      </Text>
                    </View>
                    {/*
                      [NANO BANANA PRO ASSET INSERTION POINT — AWAY TEAM CREST]
                    */}
                    <Image
                      source={{ uri: opponentTeam.crestUri }}
                      alt={opponentTeam.name}
                      className="w-16 h-16 shrink-0"
                    />
                  </View>
                </View>

                {/* Pre-Match Tactical Controls & Format Selector */}
                <View className="pt-5 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-4">
                  <View className="flex flex-wrap items-center gap-4">
                    <View>
                      <Text className="text-[11px] text-slate-400 block mb-1">
                        Batting & Bowling Approach
                      </Text>
                      <View className="flex items-center gap-1 bg-[#07090E] p-1 border border-slate-800">
                        {(['conservative', 'balanced', 'aggressive'] as const).map(
                          (stance) => (
                            <TouchableOpacity
                              key={stance}
                              onPress={() => setTacticalStance(stance)}
                              className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors whitespace-nowrap shrink-0 ${
                                tacticalStance === stance
                                  ? 'bg-slate-800 text-amber-400 font-semibold'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {stance}
                            </TouchableOpacity>
                          )
                        )}
                      </View>
                    </View>

                    <View>
                      <Text className="text-[11px] text-slate-400 block mb-1">
                        Match Format (Section 7)
                      </Text>
                      <View className="flex items-center gap-1 bg-[#07090E] p-1 border border-slate-800">
                        {(['T20', 'ODI', 'TEST'] as const).map((fmt) => (
                          <TouchableOpacity
                            key={fmt}
                            onPress={() => setSelectedFormatOverride(fmt)}
                            className={`px-3 py-1.5 text-xs font-mono-tabular font-semibold transition-colors whitespace-nowrap shrink-0 ${
                              matchFormat === fmt
                                ? 'bg-slate-800 text-emerald-400'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {fmt}
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={handleSimulateMatch}
                    className="px-6 py-3 text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Play Week {currentWeek} Match</span>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Rolling 5-Match Performance Ledger Table */}
            <View className="bg-[#0C1018] border border-slate-800/90">
              <View className="px-5 py-3.5 border-b border-slate-800/90 flex items-center justify-between">
                <Text className="font-display text-lg font-bold tracking-wide text-white">
                  Last 5 Matches (Drives Rolling Form: {player.mental.form}/100)
                </Text>
                {lastSimulatedMatch && (
                  <TouchableOpacity
                    onPress={onNavigateToScorecard}
                    className="text-xs text-amber-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Open Full Match Scorecard</span>
                  </TouchableOpacity>
                )}
              </View>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-[#07090E]">
                      <th className="py-2.5 pl-5 pr-3">Opponent</th>
                      <th className="py-2.5 px-3">Format</th>
                      <th className="py-2.5 px-3 text-right font-mono-tabular">Batting</th>
                      <th className="py-2.5 px-3 text-right font-mono-tabular">Bowling</th>
                      <th className="py-2.5 px-3 text-right font-mono-tabular">Rating</th>
                      <th className="py-2.5 px-3 text-right font-mono-tabular">Rep Change</th>
                      <th className="py-2.5 pl-3 pr-5 text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {recentPerformances.map((perf, idx) => (
                      <tr key={`${perf.matchId}-${idx}`} className="hover:bg-slate-900/50">
                        <td className="py-3 pl-5 pr-3 font-semibold text-slate-100">
                          vs {perf.opponentName}
                        </td>
                        <td className="py-3 px-3 font-mono-tabular text-slate-400">
                          {perf.format || 'T20'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono-tabular font-bold text-white">
                          {perf.runs}
                          {perf.notOut ? '*' : ''} ({perf.balls}b)
                        </td>
                        <td className="py-3 px-3 text-right font-mono-tabular text-slate-300">
                          {perf.wickets}/{perf.runsConceded} ({perf.oversBowled})
                        </td>
                        <td className="py-3 px-3 text-right font-mono-tabular font-bold text-amber-400">
                          {perf.matchRating.toFixed(1)}
                        </td>
                        <td
                          className={`py-3 px-3 text-right font-mono-tabular ${
                            perf.reputationDelta >= 0
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {perf.reputationDelta >= 0
                            ? `+${perf.reputationDelta}`
                            : perf.reputationDelta}
                        </td>
                        <td
                          className={`py-3 pl-3 pr-5 text-right font-mono-tabular font-bold ${
                            perf.teamResult === 'W'
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {perf.teamResult}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </View>
          </View>

          {/* Right 4 Columns: Live Attribute Matrix & Rival Comparison */}
          <View className="lg:col-span-4 space-y-6">
            {/* Rival Head-to-Head Ledger */}
            <View className="bg-[#0C1018] border border-slate-800/90 p-5 space-y-4">
              <View className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <Text className="font-display text-lg font-bold text-white">
                  Rival Comparison (Section 8)
                </Text>
                <Text className="text-xs text-rose-400 font-mono-tabular">
                  {rivalNpc.name} (#07)
                </Text>
              </View>

              <View className="space-y-2.5 text-xs font-mono-tabular">
                <View className="flex items-center justify-between">
                  <Text className="text-amber-400 font-bold">
                    You: {player.overallRating} OVR
                  </Text>
                  <Text className="text-slate-500">OVERALL</Text>
                  <Text className="text-rose-400 font-bold">
                    Rival: {rivalNpc.overall} OVR
                  </Text>
                </View>
                <View className="flex items-center justify-between">
                  <Text className="text-white">{careerStats.runs} Runs</Text>
                  <Text className="text-slate-500">CAREER RUNS</Text>
                  <Text className="text-slate-300">{rivalNpc.careerRuns} Runs</Text>
                </View>
                <View className="flex items-center justify-between">
                  <Text className="text-white">{careerStats.wickets} Wkts</Text>
                  <Text className="text-slate-500">WICKETS</Text>
                  <Text className="text-slate-300">{rivalNpc.careerWickets} Wkts</Text>
                </View>
                <View className="flex items-center justify-between">
                  <Text className="text-emerald-400">
                    {selectorReport.finalSelectionScore}
                  </Text>
                  <Text className="text-slate-500">SELECTOR SCORE</Text>
                  <Text className="text-rose-400">
                    {selectorReport.rivalSelectionScore}
                  </Text>
                </View>
              </View>
            </View>

            {/* Section 4 Attributes Inspector */}
            <View className="bg-[#0C1018] border border-slate-800/90 p-5 space-y-4">
              <View className="flex items-center justify-between">
                <Text className="font-display text-lg font-bold text-white">
                  Player Attributes (1–100)
                </Text>
                <Text className="text-xs text-slate-400 font-mono-tabular">
                  Avg {battingAverage} · SR {battingStrikeRate}
                </Text>
              </View>

              <View className="grid grid-cols-4 gap-1 bg-[#07090E] p-1 border border-slate-800">
                {(
                  [
                    ['batting', 'Bat'],
                    ['bowling', 'Bowl'],
                    ['fielding', 'Field'],
                    ['mental', 'Mental'],
                  ] as const
                ).map(([cat, label]) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setActiveAttributeCategory(cat)}
                    className={`py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      activeAttributeCategory === cat
                        ? 'bg-slate-800 text-amber-400 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {label}
                  </TouchableOpacity>
                ))}
              </View>

              <View className="space-y-2">
                {Object.entries(player[activeAttributeCategory]).map(([k, val]) => {
                  const label = k
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (s) => s.toUpperCase());
                  const num = Number(val);
                  return (
                    <View key={k} className="space-y-1">
                      <View className="flex items-center justify-between text-xs">
                        <Text className="text-slate-300">{label}</Text>
                        <Text className="font-mono-tabular font-bold text-white">
                          {num}
                        </Text>
                      </View>
                      <View className="w-full h-1 bg-slate-800 overflow-hidden">
                        <div
                          style={{ width: `${num}%` }}
                          className={`h-full ${
                            num >= 80
                              ? 'bg-emerald-400'
                              : num >= 65
                              ? 'bg-amber-400'
                              : 'bg-sky-400'
                          }`}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      )}

      {/* =====================================================================
          STEP 02: POST-MATCH SOCIAL FEED, PRESS CONFERENCE & CHOICE EVENTS
          (Implements Sections 11 & 12)
          ===================================================================== */}
      {weekPhase === 'POST_MATCH_MEDIA' && (
        <View className="space-y-6">
          {/* Top Action Bar to View Match Scorecard or Proceed to Training */}
          <View className="bg-[#0C1018] border border-slate-800/90 p-4 flex flex-wrap items-center justify-between gap-4">
            <View>
              <Text className="text-xs text-emerald-400 font-semibold block">
                Step 02 · Post-Match Media & Narrative Decisions
              </Text>
              <Text className="text-sm text-slate-200">
                {lastSimulatedMatch
                  ? `Latest Result: ${lastSimulatedMatch.result.marginText} — Review media reaction & resolve your press/career choices below.`
                  : 'Review media reaction, answer the press conference, and resolve your career dilemma.'}
              </Text>
            </View>
            <View className="flex items-center gap-3">
              {lastSimulatedMatch && (
                <TouchableOpacity
                  onPress={onNavigateToScorecard}
                  className="px-4 py-2 text-xs font-semibold bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700"
                >
                  Inspect Match Scorecard
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setWeekPhase('TRAINING_WEEK')}
                className="px-5 py-2 text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 flex items-center gap-1.5"
              >
                <span>Proceed to Step 03: Training Week</span>
                <ChevronRight className="w-4 h-4" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 6 Columns: Section 11 Post-Match Social Media Feed */}
            <View className="lg:col-span-6 bg-[#0C1018] border border-slate-800/90 divide-y divide-slate-800/80">
              <View className="p-4 flex items-center justify-between">
                <View className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                  <Text className="font-display text-xl font-bold text-white">
                    Post-Match Social Pulse (Section 11)
                  </Text>
                </View>
                <Text className="text-xs text-slate-400">
                  {socialFeed.length} Verified Reactions
                </Text>
              </View>

              {socialFeed.map((post) => (
                <View key={post.id} className="p-4 space-y-2">
                  <View className="flex items-center justify-between text-xs">
                    <View className="flex items-center gap-2">
                      <Text className="font-bold text-white">{post.authorName}</Text>
                      <Text className="text-slate-500">{post.handle}</Text>
                      <Text aria-hidden="true" className="text-slate-600">·</Text>
                      <Text
                        className={
                          post.sentiment === 'milestone'
                            ? 'text-amber-400 font-semibold'
                            : post.sentiment === 'critical'
                            ? 'text-rose-400'
                            : 'text-emerald-400'
                        }
                      >
                        {post.authorRole}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-sm text-slate-200 leading-relaxed block">
                    {post.content}
                  </Text>
                  <View className="flex items-center gap-4 text-[11px] font-mono-tabular text-slate-500">
                    <Text>Likes {post.likes}</Text>
                    <Text>·</Text>
                    <Text>Reposts {post.reposts}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Right 6 Columns: Press Conference + Section 12 Choice Event */}
            <View className="lg:col-span-6 space-y-6">
              {/* Press Conference System */}
              {activePressQuestion && (
                <View className="bg-[#0C1018] border border-slate-800/90 p-5 space-y-4">
                  <View className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <View>
                      <Text className="text-xs text-amber-400 font-semibold block">
                        Post-Match Press Conference (Section 11)
                      </Text>
                      <Text className="font-display text-xl font-bold text-white">
                        {activePressQuestion.reporter} · {activePressQuestion.outlet}
                      </Text>
                    </View>
                    <Text className="text-xs font-mono-tabular text-slate-400">
                      {pressAnsweredThisWeek ? 'ANSWERED' : 'AWAITING RESPONSE'}
                    </Text>
                  </View>

                  <Text className="text-sm text-slate-100 italic block">
                    "{activePressQuestion.question}"
                  </Text>

                  <View className="space-y-2">
                    {activePressQuestion.options.map((opt, idx) => (
                      <TouchableOpacity
                        key={idx}
                        disabled={pressAnsweredThisWeek}
                        onPress={() => answerPressConference(idx)}
                        className={`w-full p-3 text-left border transition-colors ${
                          pressAnsweredThisWeek
                            ? 'bg-slate-950/50 border-slate-800/60 opacity-60 cursor-default'
                            : 'bg-[#07090E] border-slate-800 hover:border-amber-400'
                        }`}
                      >
                        <Text className="text-xs font-semibold text-slate-100 block">
                          {String.fromCharCode(65 + idx)}) {opt.label}
                        </Text>
                        <Text className="text-[11px] font-mono-tabular text-amber-400 mt-1 block">
                          Effect: {opt.effectSummary}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Section 12 Interesting Choice Event */}
              {activeChoiceEvent && (
                <View className="bg-[#0C1018] border border-slate-800/90 p-5 space-y-4">
                  <View className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <View className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <View>
                        <Text className="text-xs text-rose-400 font-semibold block">
                          Section 12 Narrative Event · {activeChoiceEvent.category}
                        </Text>
                        <Text className="font-display text-xl font-bold text-white">
                          {activeChoiceEvent.title}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-xs font-mono-tabular text-slate-400">
                      {choiceEventResolvedThisWeek ? 'RESOLVED' : 'DECISION REQUIRED'}
                    </Text>
                  </View>

                  <Text className="text-sm text-slate-200 leading-relaxed block">
                    {activeChoiceEvent.description}
                  </Text>

                  <View className="space-y-2">
                    {activeChoiceEvent.choices.map((ch, idx) => (
                      <TouchableOpacity
                        key={idx}
                        disabled={choiceEventResolvedThisWeek}
                        onPress={() => resolveChoiceEvent(idx)}
                        className={`w-full p-3.5 text-left border transition-colors ${
                          choiceEventResolvedThisWeek
                            ? 'bg-slate-950/50 border-slate-800/60 opacity-60 cursor-default'
                            : 'bg-[#07090E] border-slate-800 hover:border-emerald-400'
                        }`}
                      >
                        <Text className="text-xs font-bold text-white block">
                          Option {idx + 1}: {ch.label}
                        </Text>
                        <Text className="text-[11px] font-mono-tabular text-emerald-400 mt-1 block">
                          {ch.consequenceText}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {/* =====================================================================
          STEP 03: WEEKLY TRAINING ALLOCATION (40 HOURS), SPECIALIZATION & COACHES
          (Implements Section 9)
          ===================================================================== */}
      {weekPhase === 'TRAINING_WEEK' && (
        <View className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 Columns: 40-Hour Weekly Training Allocator */}
          <View className="lg:col-span-7 bg-[#0C1018] border border-slate-800/90 p-5 space-y-5">
            <View className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <View>
                <View className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-amber-400" />
                  <Text className="font-display text-2xl font-bold text-white">
                    Weekly Training Allocation (Section 9)
                  </Text>
                </View>
                <Text className="text-xs text-slate-400 mt-0.5 block">
                  Allocate up to 40 hours across 8 drills. Over 35h in a single drill risks muscle strain; 0h in Fitness causes stamina decline.
                </Text>
              </View>

              <View className="text-right font-mono-tabular">
                <Text className="text-xl font-bold text-amber-400 block">
                  {totalAllocatedHours} / 40 hrs
                </Text>
                <Text className="text-xs text-slate-400 block">
                  {maxSingleDrillHours > 35
                    ? 'WARNING: Overtraining Risk (>35h)'
                    : 'Load Balanced'}
                </Text>
              </View>
            </View>

            <View className="divide-y divide-slate-800/70">
              {TRAINING_CATEGORIES.map((cat) => {
                const hrs = weeklyTrainingHours[cat.id] || 0;
                return (
                  <View
                    key={cat.id}
                    className="py-3 flex flex-wrap items-center justify-between gap-4"
                  >
                    <View className="min-w-0">
                      <Text className="text-sm font-semibold text-white block">
                        {cat.name}
                      </Text>
                      <Text className="text-xs text-slate-400 block">
                        Primary: <strong className="text-emerald-400">{cat.primaryGainLabel}</strong> · Secondary: {cat.secondaryGainLabel}
                      </Text>
                    </View>

                    <View className="flex items-center gap-2 shrink-0">
                      {[0, 4, 8, 12, 16].map((presetHrs) => (
                        <TouchableOpacity
                          key={presetHrs}
                          disabled={trainingCompletedThisWeek}
                          onPress={() => setTrainingHourAllocation(cat.id, presetHrs)}
                          className={`w-9 h-8 font-mono-tabular text-xs font-bold border transition-colors ${
                            hrs === presetHrs
                              ? 'bg-amber-400 text-slate-950 border-amber-400'
                              : 'bg-[#07090E] text-slate-300 border-slate-800 hover:border-slate-600'
                          }`}
                        >
                          {presetHrs}h
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>

            <View className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <Text className="text-xs text-slate-400">
                Age {player.age} Curve Multiplier:{' '}
                <strong className="text-emerald-400">
                  {player.age <= 20
                    ? '1.35x (Rapid Development)'
                    : player.age <= 24
                    ? '1.15x (Ascent Phase)'
                    : 'Peak Maintenance'}
                </strong>
              </Text>

              <TouchableOpacity
                disabled={trainingCompletedThisWeek}
                onPress={commitWeeklyTraining}
                className={`px-6 py-2.5 text-xs font-bold transition-colors ${
                  trainingCompletedThisWeek
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                    : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                }`}
              >
                {trainingCompletedThisWeek
                  ? 'Training Session Completed'
                  : 'Execute 40-Hour Training Week & Proceed'}
              </TouchableOpacity>
            </View>

            {lastTrainingSummary.length > 0 && (
              <View className="bg-[#07090E] border border-slate-800 p-3.5 space-y-1">
                <Text className="text-xs font-semibold text-emerald-400 block">
                  Latest Training Gains Applied:
                </Text>
                {lastTrainingSummary.map((line, i) => (
                  <Text key={i} className="text-xs font-mono-tabular text-slate-300 block">
                    · {line}
                  </Text>
                ))}
              </View>
            )}
          </View>

          {/* Right 5 Columns: Specializations & Specialist Coaching Staff */}
          <View className="lg:col-span-5 space-y-6">
            {/* Specialization Paths */}
            <View className="bg-[#0C1018] border border-slate-800/90 p-5 space-y-3">
              <Text className="font-display text-xl font-bold text-white block">
                Specialization Paths (+50% Bonus)
              </Text>
              <Text className="text-xs text-slate-400 block">
                Commit to a signature career archetype to supercharge specific training drills.
              </Text>

              <View className="space-y-2 pt-1">
                {SPECIALIZATION_PATHS.map((spec) => {
                  const isSelected = activeSpecializationId === spec.id;
                  return (
                    <TouchableOpacity
                      key={spec.id}
                      onPress={() => selectSpecialization(spec.id)}
                      className={`w-full p-3 text-left border transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-400/10 border-amber-400 text-white'
                          : 'bg-[#07090E] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <View>
                        <Text className="text-xs font-bold text-white block">
                          {spec.name}
                        </Text>
                        <Text className="text-[11px] text-slate-400 block">
                          {spec.bonusText}
                        </Text>
                      </View>
                      <Text className="font-mono-tabular text-xs text-amber-400 font-bold">
                        {isSelected ? 'ACTIVE' : 'SELECT'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Specialist Coach Hires */}
            <View className="bg-[#0C1018] border border-slate-800/90 p-5 space-y-3">
              <View className="flex items-center justify-between">
                <Text className="font-display text-xl font-bold text-white">
                  Hire Specialist Coaches
                </Text>
                <Text className="font-mono-tabular text-xs text-amber-400">
                  Available: ₹{careerFundsLakhs} Lakhs
                </Text>
              </View>

              <View className="space-y-2">
                {SPECIALIST_COACHES.map((coach) => {
                  const isHired = hiredCoachIds.includes(coach.id);
                  const canAfford = careerFundsLakhs >= coach.costLakhs;
                  return (
                    <View
                      key={coach.id}
                      className="p-3 bg-[#07090E] border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <View className="min-w-0">
                        <Text className="text-xs font-bold text-white block truncate">
                          {coach.name}
                        </Text>
                        <Text className="text-[11px] text-emerald-400 block">
                          {coach.benefit}
                        </Text>
                      </View>

                      <TouchableOpacity
                        disabled={isHired || !canAfford}
                        onPress={() => hireSpecialistCoach(coach.id)}
                        className={`px-3 py-1.5 text-xs font-mono-tabular font-bold shrink-0 ${
                          isHired
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : canAfford
                            ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {isHired ? 'HIRED' : `₹${coach.costLakhs}L`}
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      )}

      {/* =====================================================================
          STEP 04: SELECTOR AI BOARD ROOM, IPL AUCTION & STAGE PROGRESSION
          (Implements Sections 6, 10, and 11 Brand Endorsements)
          ===================================================================== */}
      {weekPhase === 'SELECTION_REVIEW' && (
        <View className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 Columns: Section 10 Selector AI Evaluation & 10-Stage Ladder */}
          <View className="lg:col-span-7 space-y-6">
            <View className="bg-[#0C1018] border border-slate-800/90 p-5 space-y-5">
              <View className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <View>
                  <Text className="text-xs text-amber-400 font-semibold block">
                    Section 10 · National & State Selection Committee
                  </Text>
                  <Text className="font-display text-2xl font-bold text-white">
                    Selector AI Weighted Evaluation
                  </Text>
                </View>

                {/* Selector Personality Switcher */}
                <View className="flex items-center gap-1 bg-[#07090E] p-1 border border-slate-800">
                  {(
                    [
                      'Form Based',
                      'Conservative',
                      'Development Focused',
                      'Political',
                    ] as SelectorPersonality[]
                  ).map((pers) => (
                    <TouchableOpacity
                      key={pers}
                      onPress={() => setSelectorPersonality(pers)}
                      className={`px-2 py-1 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                        selectorPersonality === pers
                          ? 'bg-slate-800 text-amber-400 font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {pers.split(' ')[0]}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Exact Section 10 Formula Breakdown Grid */}
              <View className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-mono-tabular">
                <View className="bg-[#07090E] border border-slate-800 p-3">
                  <Text className="text-[10px] text-slate-400 block">
                    Form (×0.40)
                  </Text>
                  <Text className="text-lg font-bold text-white mt-0.5 block">
                    {selectorReport.recentFormScore}
                  </Text>
                </View>
                <View className="bg-[#07090E] border border-slate-800 p-3">
                  <Text className="text-[10px] text-slate-400 block">
                    Rep (×0.25)
                  </Text>
                  <Text className="text-lg font-bold text-emerald-400 mt-0.5 block">
                    {selectorReport.reputationComponent}
                  </Text>
                </View>
                <View className="bg-[#07090E] border border-slate-800 p-3">
                  <Text className="text-[10px] text-slate-400 block">
                    Skill (×0.20)
                  </Text>
                  <Text className="text-lg font-bold text-amber-400 mt-0.5 block">
                    {selectorReport.skillComponent}
                  </Text>
                </View>
                <View className="bg-[#07090E] border border-slate-800 p-3">
                  <Text className="text-[10px] text-slate-400 block">
                    Age (×0.10)
                  </Text>
                  <Text className="text-lg font-bold text-sky-400 mt-0.5 block">
                    {selectorReport.ageFactorScore}
                  </Text>
                </View>
                <View className="bg-[#07090E] border border-slate-800 p-3">
                  <Text className="text-[10px] text-slate-400 block">
                    Board (×0.05)
                  </Text>
                  <Text className="text-lg font-bold text-slate-200 mt-0.5 block">
                    {selectorReport.politicalFactorScore}
                  </Text>
                </View>
              </View>

              <View className="bg-[#07090E] border border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4">
                <View className="max-w-lg">
                  <Text className="text-xs font-bold text-white block">
                    Committee Verdict ({selectorPersonality} Chief Selector):
                  </Text>
                  <Text className="text-xs text-slate-300 mt-1 block">
                    {selectorReport.selectorVerdict}
                  </Text>
                </View>

                <View className="text-right font-mono-tabular">
                  <Text className="text-2xl font-bold text-amber-400 block">
                    {selectorReport.finalSelectionScore} / {selectorReport.thresholdRequired}
                  </Text>
                  <Text className="text-[11px] text-slate-400 block">
                    Rival Score: {selectorReport.rivalSelectionScore}
                  </Text>
                </View>
              </View>

              <View className="flex items-center justify-between pt-2">
                <TouchableOpacity
                  onPress={onNavigateToRecords}
                  className="text-xs text-amber-400 hover:underline font-semibold"
                >
                  View 100 NPC Roster, Records & Dynasty Mode →
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={advanceToNextWeekOrStage}
                  className="px-6 py-3 text-xs font-bold bg-emerald-400 text-slate-950 hover:bg-emerald-300 transition-colors flex items-center gap-2"
                >
                  <span>Advance to Week {currentWeek + 1}</span>
                  <ChevronRight className="w-4 h-4" />
                </TouchableOpacity>
              </View>
            </View>

            {/* 10-Stage Career Progression Ladder (Section 6) */}
            <View className="bg-[#0C1018] border border-slate-800/90 p-5 space-y-3">
              <Text className="font-display text-xl font-bold text-white block">
                10-Stage Career Progression Ladder (Section 6)
              </Text>
              <View className="divide-y divide-slate-800/70 text-xs">
                {CAREER_STAGES_CONFIG.map((stg, idx) => {
                  const isCurrent = idx === stageIndex;
                  const isUnlocked = idx <= stageIndex;
                  return (
                    <View
                      key={stg.id}
                      className={`py-2.5 flex items-center justify-between gap-4 ${
                        isCurrent
                          ? 'text-amber-400 font-bold'
                          : isUnlocked
                          ? 'text-emerald-400'
                          : 'text-slate-500'
                      }`}
                    >
                      <View>
                        <Text className="block">{stg.title}</Text>
                        <Text className="text-[11px] text-slate-500 block">
                          {stg.tournamentName} · Ages {stg.ageRange}
                        </Text>
                      </View>
                      <Text className="font-mono-tabular shrink-0">
                        {isCurrent
                          ? 'CURRENT STAGE'
                          : isUnlocked
                          ? 'COMPLETED'
                          : `Req ${stg.minRepRequired} REP`}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Right 5 Columns: IPL Auction Room & Brand Endorsements */}
          <View className="lg:col-span-5 space-y-6">
            {/* Stage 4 IPL Auction Room */}
            <View className="bg-[#0C1018] border border-slate-800/90 p-5 space-y-4">
              <View className="flex items-center justify-between">
                <Text className="font-display text-xl font-bold text-white">
                  IPL Franchise Auction Room (Stage 4)
                </Text>
                <Text className="font-mono-tabular text-xs text-amber-400">
                  {iplClub ? `${iplClub.short} (₹${player.iplContractLakhs}L)` : 'Uncontracted'}
                </Text>
              </View>
              <Text className="text-xs text-slate-400 block">
                Enter the IPL Auction bidding pool to secure a franchise contract and 1.5x Reputation visibility multiplier.
              </Text>
              {auctionBannerMsg && (
                <Text className="text-xs font-mono-tabular text-emerald-400 bg-[#07090E] p-3 border border-emerald-500/40 block">
                  {auctionBannerMsg}
                </Text>
              )}
              <TouchableOpacity
                onPress={() => {
                  const res = runIPLAuctionBid();
                  setAuctionBannerMsg(res);
                }}
                className="w-full py-2.5 text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 text-center"
              >
                {iplClub ? 'Enter IPL Mega Auction / Renegotiate Contract' : 'Enter IPL Auction Bidding Pool'}
              </TouchableOpacity>
            </View>

            {/* Section 11 Brand Endorsements */}
            <View className="bg-[#0C1018] border border-slate-800/90 p-5 space-y-3">
              <View className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <Text className="font-display text-xl font-bold text-white">
                  Brand Endorsements (Section 11)
                </Text>
              </View>

              <View className="space-y-2.5">
                {BRAND_ENDORSEMENTS.map((brand) => {
                  const isSigned = activeEndorsementIds.includes(brand.id);
                  const eligible = reputationScore >= brand.minRep;
                  return (
                    <View
                      key={brand.id}
                      className="p-3 bg-[#07090E] border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <View className="min-w-0">
                        <Text className="text-xs font-bold text-white block">
                          {brand.brandName} ({brand.tier})
                        </Text>
                        <Text className="text-[11px] text-slate-400 block">
                          +₹{brand.payoutPerMatchLakhs}L per match · Req {brand.minRep} REP
                        </Text>
                      </View>
                      <TouchableOpacity
                        disabled={isSigned || !eligible}
                        onPress={() => signBrandEndorsement(brand.id)}
                        className={`px-3 py-1.5 text-xs font-mono-tabular font-bold shrink-0 ${
                          isSigned
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : eligible
                            ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {isSigned ? 'ACTIVE' : eligible ? 'SIGN DEAL' : 'LOCKED'}
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default DashboardScreen;
