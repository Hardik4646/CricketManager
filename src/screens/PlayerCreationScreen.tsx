import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from '../components/rn-primitives';
import {
  useCareerStore,
  PlayingRole,
  BattingStyle,
  BowlingStyle,
  generateStartingAttributes,
} from '../store/useCareerStore';
import { ALL_DOMESTIC_TEAMS } from '../data/sampleTeams';
import {
  getPlayerPortraitUri,
  ROLE_ICON_METADATA,
} from '../assets/nanoBananaAssets';
import {
  Dices,
  CheckCircle2,
  Sliders,
  UserCheck,
  Shield,
} from 'lucide-react';

const ROLE_OPTIONS: { role: PlayingRole; desc: string }[] = [
  { role: 'Specialist Batter', desc: 'Pure batting focus, weak bowling' },
  { role: 'Specialist Pace Bowler', desc: 'Pure pace bowling, tail-end batter' },
  { role: 'Specialist Spin Bowler', desc: 'Pure spin bowling, tail-end batter' },
  { role: 'Batting Allrounder', desc: 'Strong batting, useful bowling' },
  { role: 'Bowling Allrounder', desc: 'Strong bowling, useful batting' },
  { role: 'Wicketkeeper-Batter', desc: 'Glove work + batting, no bowling' },
];

const BATTING_STYLES: BattingStyle[] = [
  'Aggressive Opener',
  'Classic Technique Opener',
  'Number 3 Anchor',
  'Middle Order Accumulator',
  'Middle Order Aggressor',
  'Finisher / Death Batter',
  'Tail End Slogger',
];

const PACE_BOWLING_STYLES: BowlingStyle[] = [
  'Express Pace (145+ kmph)',
  'Fast Medium (130-145 kmph)',
  'Medium Pace (115-130 kmph, heavy on swing/seam)',
];

const SPIN_BOWLING_STYLES: BowlingStyle[] = [
  'Off Spin (right arm)',
  'Left Arm Orthodox',
  'Leg Spin / Googly',
  'Left Arm Wrist Spin (Chinaman)',
];

const STATE_OPTIONS = [
  { state: 'Maharashtra', defaultCity: 'Shivaji Park, Mumbai', teamId: 'MUM' },
  { state: 'Delhi NCR', defaultCity: 'Feroz Shah Kotla, New Delhi', teamId: 'DEL' },
  { state: 'Karnataka', defaultCity: 'Indiranagar, Bengaluru', teamId: 'BLR' },
  { state: 'Tamil Nadu', defaultCity: 'Mylapore, Chennai', teamId: 'CHE' },
];

interface PlayerCreationScreenProps {
  onComplete: () => void;
}

export const PlayerCreationScreen: React.FC<PlayerCreationScreenProps> = ({
  onComplete,
}) => {
  const { player: existingPlayer, createCareerPlayer } = useCareerStore();

  const [firstName, setFirstName] = useState<string>(existingPlayer.firstName || 'Aarav');
  const [lastName, setLastName] = useState<string>(existingPlayer.lastName || 'Sharma');
  const [jerseyNumber, setJerseyNumber] = useState<string>(
    existingPlayer.jerseyNumber || '18'
  );
  const [selectedStateIdx, setSelectedStateIdx] = useState<number>(0);
  const [hometown, setHometown] = useState<string>(
    existingPlayer.hometown || 'Shivaji Park, Mumbai'
  );
  const [battingHand, setBattingHand] = useState<'Right' | 'Left'>(
    existingPlayer.battingHand || 'Right'
  );
  const [bowlingHand, setBowlingHand] = useState<'Right' | 'Left'>(
    existingPlayer.bowlingHand || 'Right'
  );

  const [role, setRole] = useState<PlayingRole>(
    existingPlayer.role || 'Batting Allrounder'
  );
  const [battingStyle, setBattingStyle] = useState<BattingStyle>(
    existingPlayer.battingStyle || 'Number 3 Anchor'
  );
  const [bowlingStyle, setBowlingStyle] = useState<BowlingStyle>(
    existingPlayer.bowlingStyle || 'Fast Medium (130-145 kmph)'
  );
  const [rollSeed, setRollSeed] = useState<number>(1);
  const [activeAttrTab, setActiveAttrTab] = useState<
    'batting' | 'bowling' | 'fielding' | 'mental'
  >('batting');

  const selectedStateInfo = STATE_OPTIONS[selectedStateIdx] || STATE_OPTIONS[0];
  const assignedTeam = useMemo(
    () =>
      ALL_DOMESTIC_TEAMS.find((t) => t.id === selectedStateInfo.teamId) ||
      ALL_DOMESTIC_TEAMS[0],
    [selectedStateInfo]
  );

  // Determine available bowling styles based on chosen role
  const availableBowlingStyles = useMemo<BowlingStyle[]>(() => {
    if (role === 'Wicketkeeper-Batter') return ['None'];
    if (role === 'Specialist Pace Bowler') return PACE_BOWLING_STYLES;
    if (role === 'Specialist Spin Bowler') return SPIN_BOWLING_STYLES;
    return [...PACE_BOWLING_STYLES, ...SPIN_BOWLING_STYLES];
  }, [role]);

  // Synchronize role selection with valid default styles
  const handleSelectRole = (nextRole: PlayingRole) => {
    setRole(nextRole);
    if (nextRole === 'Wicketkeeper-Batter') {
      setBowlingStyle('None');
      if (battingStyle === 'Tail End Slogger') {
        setBattingStyle('Middle Order Aggressor');
      }
    } else if (nextRole === 'Specialist Pace Bowler') {
      if (!PACE_BOWLING_STYLES.includes(bowlingStyle)) {
        setBowlingStyle('Express Pace (145+ kmph)');
      }
      setBattingStyle('Tail End Slogger');
    } else if (nextRole === 'Specialist Spin Bowler') {
      if (!SPIN_BOWLING_STYLES.includes(bowlingStyle)) {
        setBowlingStyle('Leg Spin / Googly');
      }
      setBattingStyle('Tail End Slogger');
    } else if (nextRole === 'Specialist Batter') {
      if (battingStyle === 'Tail End Slogger') {
        setBattingStyle('Number 3 Anchor');
      }
      if (bowlingStyle === 'None') {
        setBowlingStyle('Off Spin (right arm)');
      }
    } else {
      if (bowlingStyle === 'None') {
        setBowlingStyle('Fast Medium (130-145 kmph)');
      }
      if (battingStyle === 'Tail End Slogger') {
        setBattingStyle('Finisher / Death Batter');
      }
    }
  };

  // Generate starting attributes whenever Role, Styles, or Scout Roll Seed change
  const generatedAttributes = useMemo(() => {
    return generateStartingAttributes(role, battingStyle, bowlingStyle);
  }, [role, battingStyle, bowlingStyle, rollSeed]);

  const fullName = `${firstName.trim() || 'Player'} ${lastName.trim() || 'One'}`;
  const previewPortraitUri = useMemo(
    () =>
      getPlayerPortraitUri(
        fullName,
        assignedTeam.accentColor,
        jerseyNumber || '18'
      ),
    [fullName, assignedTeam.accentColor, jerseyNumber]
  );

  const roleMeta = ROLE_ICON_METADATA[role] || {
    code: 'PRO',
    accent: '#F59E0B',
  };

  const handleConfirmCareer = () => {
    createCareerPlayer({
      firstName: firstName.trim() || 'Aarav',
      lastName: lastName.trim() || 'Sharma',
      hometown: hometown.trim() || selectedStateInfo.defaultCity,
      homeState: selectedStateInfo.state,
      homeTeamId: assignedTeam.id,
      jerseyNumber: jerseyNumber.trim() || '18',
      battingHand,
      bowlingHand,
      role,
      battingStyle,
      bowlingStyle,
      generatedAttributes,
    });
    onComplete();
  };

  const renderAttributeRow = (label: string, value: number) => {
    const barColor =
      value >= 80
        ? 'bg-emerald-400'
        : value >= 65
        ? 'bg-amber-400'
        : value >= 45
        ? 'bg-sky-400'
        : 'bg-slate-600';

    return (
      <View key={label} className="space-y-1.5">
        <View className="flex items-center justify-between text-xs">
          <Text className="text-slate-300 font-medium">{label}</Text>
          <Text className="font-mono-tabular font-bold text-slate-100">
            {value}
          </Text>
        </View>
        <View className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            style={{ width: `${value}%` }}
            className={`h-full rounded-full ${barColor}`}
          />
        </View>
      </View>
    );
  };

  return (
    <View className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Studio Header Banner */}
      <View className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <View>
          <Text className="text-xs text-amber-400 font-semibold block">
            Stage 1 Intake · Youth Academy Player Creation (Section 3 & 4)
          </Text>
          <Text className="font-display text-3xl font-bold tracking-wide text-white mt-0.5 block">
            Create Your Cricketer Pro
          </Text>
          <Text className="text-xs text-slate-400 mt-1 block">
            Every career starts at Age 16. Select your hometown state, playing role, and tactical styles to generate your starting attributes.
          </Text>
        </View>

        <View className="flex items-center gap-3">
          <TouchableOpacity
            onPress={() => setRollSeed((prev) => prev + 1)}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-800 text-slate-100 border border-slate-700 rounded-lg hover:bg-slate-700 flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <Dices className="w-4 h-4 text-amber-400" />
            <span>Re-Roll Scout Variance</span>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleConfirmCareer}
            className="px-5 py-2.5 text-xs font-bold bg-amber-400 text-slate-950 rounded-lg hover:bg-amber-300 flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Sign Youth Contract & Enter Hub</span>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main 12-Column Creation Grid */}
      <View className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Columns: Identity, Role & Style Configuration */}
        <View className="lg:col-span-7 space-y-6">
          {/* Step 1: Personal Identity & Home State */}
          <View className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <View className="flex items-center justify-between border-b border-slate-800 pb-3">
              <View className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-400" />
                <Text className="font-display text-xl font-bold text-white">
                  01. Personal Profile & Domestic State
                </Text>
              </View>
              <Text className="font-mono-tabular text-xs text-emerald-400">
                Starting Age: 16 (Locked)
              </Text>
            </View>

            <View className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <View>
                <label className="text-xs text-slate-400 block mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </View>
              <View>
                <label className="text-xs text-slate-400 block mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </View>
              <View>
                <label className="text-xs text-slate-400 block mb-1.5">
                  Shirt Number
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={jerseyNumber}
                  onChange={(e) =>
                    setJerseyNumber(e.target.value.replace(/[^0-9]/g, ''))
                  }
                  className="w-full px-3 py-2 text-sm font-mono-tabular bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </View>
            </View>

            {/* Home State Selector (Determines Domestic Starting Team) */}
            <View>
              <label className="text-xs text-slate-400 block mb-2">
                Home State Association (Determines Domestic Starting Squad)
              </label>
              <View className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {STATE_OPTIONS.map((item, idx) => {
                  const team = ALL_DOMESTIC_TEAMS.find((t) => t.id === item.teamId);
                  const active = selectedStateIdx === idx;
                  return (
                    <TouchableOpacity
                      key={item.state}
                      onPress={() => {
                        setSelectedStateIdx(idx);
                        setHometown(item.defaultCity);
                      }}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        active
                          ? 'bg-amber-400/10 border-amber-400 text-white'
                          : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Text className="text-xs font-bold block text-slate-100 truncate">
                        {item.state}
                      </Text>
                      <Text className="text-[11px] text-amber-400 mt-0.5 block truncate">
                        {team?.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <View>
                <label className="text-xs text-slate-400 block mb-1.5">
                  Hometown / Ground
                </label>
                <input
                  type="text"
                  value={hometown}
                  onChange={(e) => setHometown(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </View>

              <View>
                <label className="text-xs text-slate-400 block mb-1.5">
                  Batting Hand
                </label>
                <View className="grid grid-cols-2 gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
                  {(['Right', 'Left'] as const).map((hand) => (
                    <TouchableOpacity
                      key={hand}
                      onPress={() => setBattingHand(hand)}
                      className={`py-1.5 text-xs font-medium rounded-md ${
                        battingHand === hand
                          ? 'bg-slate-800 text-amber-400 font-semibold'
                          : 'text-slate-400'
                      }`}
                    >
                      {hand}-Hand
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <label className="text-xs text-slate-400 block mb-1.5">
                  Bowling Arm
                </label>
                <View className="grid grid-cols-2 gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
                  {(['Right', 'Left'] as const).map((hand) => (
                    <TouchableOpacity
                      key={hand}
                      onPress={() => setBowlingHand(hand)}
                      className={`py-1.5 text-xs font-medium rounded-md ${
                        bowlingHand === hand
                          ? 'bg-slate-800 text-amber-400 font-semibold'
                          : 'text-slate-400'
                      }`}
                    >
                      {hand}-Arm
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Step 2: Playing Role & Style Archetypes */}
          <View className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5">
            <View className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-amber-400" />
              <Text className="font-display text-xl font-bold text-white">
                02. Playing Role & Tactical Archetype
              </Text>
            </View>

            {/* 6 Playing Roles Grid */}
            <View>
              <label className="text-xs text-slate-400 block mb-2">
                Primary Playing Role (Section 3)
              </label>
              <View className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ROLE_OPTIONS.map((item) => {
                  const isSelected = role === item.role;
                  return (
                    <TouchableOpacity
                      key={item.role}
                      onPress={() => handleSelectRole(item.role)}
                      className={`p-3.5 rounded-lg border text-left transition-colors ${
                        isSelected
                          ? 'bg-amber-400/10 border-amber-400'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <View className="flex items-center justify-between">
                        <Text
                          className={`text-sm font-semibold ${
                            isSelected ? 'text-amber-400' : 'text-slate-100'
                          }`}
                        >
                          {item.role}
                        </Text>
                        <Text className="font-mono-tabular text-xs text-slate-400">
                          {ROLE_ICON_METADATA[item.role]?.code}
                        </Text>
                      </View>
                      <Text className="text-xs text-slate-400 mt-1 block">
                        {item.desc}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Batting Style & Bowling Style Selectors */}
            <View className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <View>
                <label className="text-xs text-slate-400 block mb-2">
                  Batting Style
                </label>
                <View className="space-y-1.5">
                  {BATTING_STYLES.map((bStyle) => {
                    const active = battingStyle === bStyle;
                    return (
                      <TouchableOpacity
                        key={bStyle}
                        onPress={() => setBattingStyle(bStyle)}
                        className={`w-full px-3 py-2 rounded-lg border text-left text-xs font-medium transition-colors flex items-center justify-between ${
                          active
                            ? 'bg-slate-800 border-amber-400/80 text-amber-400 font-semibold'
                            : 'bg-slate-950/70 border-slate-800/90 text-slate-300 hover:text-white'
                        }`}
                      >
                        <Text>{bStyle}</Text>
                        {active && <span className="text-amber-400">●</span>}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View>
                <label className="text-xs text-slate-400 block mb-2">
                  Bowling Style ({role === 'Wicketkeeper-Batter' ? 'Disabled for WK' : 'Pace / Spin'})
                </label>
                <View className="space-y-1.5">
                  {availableBowlingStyles.map((bwStyle) => {
                    const active = bowlingStyle === bwStyle;
                    return (
                      <TouchableOpacity
                        key={bwStyle}
                        onPress={() => setBowlingStyle(bwStyle)}
                        className={`w-full px-3 py-2 rounded-lg border text-left text-xs font-medium transition-colors flex items-center justify-between ${
                          active
                            ? 'bg-slate-800 border-amber-400/80 text-amber-400 font-semibold'
                            : 'bg-slate-950/70 border-slate-800/90 text-slate-300 hover:text-white'
                        }`}
                      >
                        <Text className="truncate">{bwStyle}</Text>
                        {active && <span className="text-amber-400">●</span>}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Right 5 Columns: EA FC Pro Card Preview & Section 4 Attribute Breakdown */}
        <View className="lg:col-span-5 space-y-6">
          {/* EA FC Style Sleek Player Card */}
          <View className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-5 space-y-5">
            <View className="flex items-start justify-between gap-4">
              <View className="flex items-center gap-4">
                <View className="text-center">
                  <Text className="font-mono-tabular text-4xl font-bold text-amber-400 block leading-none">
                    {generatedAttributes.overallRating}
                  </Text>
                  <Text className="font-display text-sm font-bold tracking-wider text-slate-300 mt-1 block">
                    {roleMeta.code}
                  </Text>
                </View>

                {/*
                  [NANOBANA.NET / NANAIMG.IO ASSET SLOT]: Custom Pro Avatar
                  Use Nanobana platform (nanobana.net) or Nano Bana (nanaimg.io)
                  to generate a consistent portrait of your 16-year-old prospect.
                */}
                <Image
                  source={{ uri: previewPortraitUri }}
                  alt={fullName}
                  className="w-20 h-20 rounded-xl border border-slate-700 shrink-0"
                />

                <View className="min-w-0">
                  <Text className="font-display text-2xl font-bold text-white block truncate">
                    {fullName}
                  </Text>
                  <Text className="text-xs text-slate-400 block">
                    Age 16 · #{jerseyNumber || '18'} · {battingHand}HB
                  </Text>
                  <Text className="text-xs text-emerald-400 font-mono-tabular mt-1 block">
                    Potential Ceiling: {generatedAttributes.potentialRating} OVR
                  </Text>
                </View>
              </View>

              {/*
                [NANO BANANA PRO ASSET SLOT]: Assigned Domestic Team Crest
                Generate metallic team crest via Nano Banana Pro.
              */}
              <Image
                source={{ uri: assignedTeam.crestUri }}
                alt={assignedTeam.name}
                className="w-12 h-12 rounded-lg shrink-0"
              />
            </View>

            {/* 6 Key EA FC Card Face Attributes */}
            <View className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-4 border-t border-slate-800 text-center">
              <View className="bg-slate-950/80 rounded-lg py-2 px-1 border border-slate-800/80">
                <Text className="text-[10px] text-slate-400 block">TEC</Text>
                <Text className="font-mono-tabular text-sm font-bold text-white">
                  {generatedAttributes.batting.technique}
                </Text>
              </View>
              <View className="bg-slate-950/80 rounded-lg py-2 px-1 border border-slate-800/80">
                <Text className="text-[10px] text-slate-400 block">POW</Text>
                <Text className="font-mono-tabular text-sm font-bold text-white">
                  {generatedAttributes.batting.power}
                </Text>
              </View>
              <View className="bg-slate-950/80 rounded-lg py-2 px-1 border border-slate-800/80">
                <Text className="text-[10px] text-slate-400 block">BWL</Text>
                <Text className="font-mono-tabular text-sm font-bold text-white">
                  {generatedAttributes.bowling.primarySkill}
                </Text>
              </View>
              <View className="bg-slate-950/80 rounded-lg py-2 px-1 border border-slate-800/80">
                <Text className="text-[10px] text-slate-400 block">ACC</Text>
                <Text className="font-mono-tabular text-sm font-bold text-white">
                  {generatedAttributes.bowling.accuracy}
                </Text>
              </View>
              <View className="bg-slate-950/80 rounded-lg py-2 px-1 border border-slate-800/80">
                <Text className="text-[10px] text-slate-400 block">FLD</Text>
                <Text className="font-mono-tabular text-sm font-bold text-white">
                  {generatedAttributes.fielding.catching}
                </Text>
              </View>
              <View className="bg-slate-950/80 rounded-lg py-2 px-1 border border-slate-800/80">
                <Text className="text-[10px] text-slate-400 block">FIT</Text>
                <Text className="font-mono-tabular text-sm font-bold text-white">
                  {generatedAttributes.mental.fitnessLevel}
                </Text>
              </View>
            </View>
          </View>

          {/* Complete Section 4 Attributes Inspector (1-100) */}
          <View className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <View className="flex items-center justify-between">
              <Text className="font-display text-lg font-bold text-white">
                Section 4 Attributes (1–100)
              </Text>
              <Text className="text-xs text-slate-400">
                Scout Roll #{rollSeed}
              </Text>
            </View>

            {/* Pillar Switcher */}
            <View className="grid grid-cols-4 gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
              {(
                [
                  ['batting', 'Batting (9)'],
                  ['bowling', 'Bowling (9)'],
                  ['fielding', 'Fielding (5)'],
                  ['mental', 'Mental (6)'],
                ] as const
              ).map(([tabKey, label]) => (
                <TouchableOpacity
                  key={tabKey}
                  onPress={() => setActiveAttrTab(tabKey)}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    activeAttrTab === tabKey
                      ? 'bg-slate-800 text-amber-400 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {label}
                </TouchableOpacity>
              ))}
            </View>

            {activeAttrTab === 'batting' && (
              <View className="space-y-2.5 pt-1">
                {renderAttributeRow('Technique', generatedAttributes.batting.technique)}
                {renderAttributeRow('Power', generatedAttributes.batting.power)}
                {renderAttributeRow('Timing', generatedAttributes.batting.timing)}
                {renderAttributeRow('Consistency', generatedAttributes.batting.consistency)}
                {renderAttributeRow('Aggression', generatedAttributes.batting.aggression)}
                {renderAttributeRow('Vs Spin', generatedAttributes.batting.vsSpin)}
                {renderAttributeRow('Vs Pace', generatedAttributes.batting.vsPace)}
                {renderAttributeRow(
                  'Pressure Handling',
                  generatedAttributes.batting.pressureHandling
                )}
                {renderAttributeRow(
                  'Running Between Wickets',
                  generatedAttributes.batting.runningBetweenWickets
                )}
              </View>
            )}

            {activeAttrTab === 'bowling' && (
              <View className="space-y-2.5 pt-1">
                {renderAttributeRow(
                  'Primary Skill',
                  generatedAttributes.bowling.primarySkill
                )}
                {renderAttributeRow('Accuracy', generatedAttributes.bowling.accuracy)}
                {renderAttributeRow('Variation', generatedAttributes.bowling.variation)}
                {renderAttributeRow('Movement', generatedAttributes.bowling.movement)}
                {renderAttributeRow(
                  'Death Bowling',
                  generatedAttributes.bowling.deathBowling
                )}
                {renderAttributeRow(
                  'Powerplay Bowling',
                  generatedAttributes.bowling.powerplayBowling
                )}
                {renderAttributeRow(
                  'Wicket Taking',
                  generatedAttributes.bowling.wicketTaking
                )}
                {renderAttributeRow(
                  'Economy Control',
                  generatedAttributes.bowling.economyControl
                )}
                {renderAttributeRow(
                  'Fitness Stamina',
                  generatedAttributes.bowling.fitnessStamina
                )}
              </View>
            )}

            {activeAttrTab === 'fielding' && (
              <View className="space-y-2.5 pt-1">
                {renderAttributeRow('Catching', generatedAttributes.fielding.catching)}
                {renderAttributeRow(
                  'Ground Fielding',
                  generatedAttributes.fielding.groundFielding
                )}
                {renderAttributeRow('Throwing', generatedAttributes.fielding.throwing)}
                {renderAttributeRow(
                  'Athleticism',
                  generatedAttributes.fielding.athleticism
                )}
                {renderAttributeRow(
                  'Wicketkeeping',
                  generatedAttributes.fielding.keeping
                )}
              </View>
            )}

            {activeAttrTab === 'mental' && (
              <View className="space-y-2.5 pt-1">
                {renderAttributeRow(
                  'Big Match Temperament',
                  generatedAttributes.mental.bigMatchTemperament
                )}
                {renderAttributeRow('Leadership', generatedAttributes.mental.leadership)}
                {renderAttributeRow(
                  'Fitness Level',
                  generatedAttributes.mental.fitnessLevel
                )}
                {renderAttributeRow(
                  'Recovery Rate',
                  generatedAttributes.mental.recoveryRate
                )}
                {renderAttributeRow('Starting Form', generatedAttributes.mental.form)}
                {renderAttributeRow('Confidence', generatedAttributes.mental.confidence)}
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default PlayerCreationScreen;
