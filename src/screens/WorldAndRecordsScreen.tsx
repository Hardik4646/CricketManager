import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from '../components/rn-primitives';
import { useCareerStore } from '../store/useCareerStore';
import {
  HISTORICAL_LEGENDS,
  INTERNATIONAL_NATIONS,
  NPCArchetype,
} from '../data/npcDatabase';
import {
  sqliteDb,
  SQLITE_DDL_SCHEMA,
} from '../database/sqliteService';
import {
  Database,
  Trophy,
  Users,
  Sparkles,
  Search,
  Save,
  RotateCcw,
} from 'lucide-react';

type WorldSubTab = 'npcs' | 'legends' | 'dynasty' | 'sqlite';

export const WorldAndRecordsScreen: React.FC = () => {
  const {
    player,
    reputationScore,
    careerStats,
    milestonesUnlocked,
    npcDatabase,
    dynastyGeneration,
    parentLegacyName,
    startDynastyChildCareer,
    saveToSQLiteSlot,
    loadFromSQLiteSlot,
  } = useCareerStore();

  const [subTab, setSubTab] = useState<WorldSubTab>('npcs');
  const [npcSearch, setNpcSearch] = useState<string>('');
  const [selectedNation, setSelectedNation] = useState<string>('ALL');
  const [selectedArchetype, setSelectedArchetype] = useState<string>('ALL');
  const [childFirstName, setChildFirstName] = useState<string>('Vivaan');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [slotTick, setSlotTick] = useState<number>(0);

  const filteredNpcs = useMemo(() => {
    return npcDatabase.filter((npc) => {
      if (selectedNation !== 'ALL' && npc.nation !== selectedNation) {
        return false;
      }
      if (selectedArchetype !== 'ALL' && npc.archetype !== selectedArchetype) {
        return false;
      }
      if (
        npcSearch.trim() &&
        !npc.name.toLowerCase().includes(npcSearch.trim().toLowerCase()) &&
        !npc.role.toLowerCase().includes(npcSearch.trim().toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [npcDatabase, selectedNation, selectedArchetype, npcSearch]);

  // Calculate Section 13 Legacy Rating
  const legacyRating = useMemo(() => {
    if (reputationScore >= 850 || careerStats.runs >= 10000) return 'All Time Great';
    if (reputationScore >= 700 || careerStats.runs >= 5000) return 'Legend';
    if (reputationScore >= 500 || careerStats.runs >= 2500) return 'Great International';
    if (reputationScore >= 350) return 'Good International';
    if (reputationScore >= 180) return 'Domestic Star';
    return 'Club & State Prospect';
  }, [reputationScore, careerStats.runs]);

  const savedSlots = useMemo(() => {
    return sqliteDb.listSaveSlots();
  }, [slotTick, player, reputationScore]);

  const handleSaveSlot = (slotId: string) => {
    saveToSQLiteSlot(slotId);
    setSlotTick((t) => t + 1);
    setSaveMessage(`Saved career state to SQLite ${slotId.toUpperCase()} (${new Date().toLocaleTimeString()}).`);
  };

  const handleLoadSlot = (slotId: string) => {
    const ok = loadFromSQLiteSlot(slotId);
    setSlotTick((t) => t + 1);
    setSaveMessage(
      ok
        ? `Loaded career state from SQLite ${slotId.toUpperCase()}.`
        : `No save data found in ${slotId.toUpperCase()}.`
    );
  };

  return (
    <View className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Sub-Navigation Header */}
      <View className="bg-[#0C1018] border border-slate-800/90 p-5 flex flex-wrap items-center justify-between gap-4">
        <View>
          <Text className="text-xs text-amber-400 font-semibold block">
            Sections 8, 13 & 15 · World Database, Records, Dynasty & SQLite Persistence
          </Text>
          <Text className="font-display text-3xl font-bold text-white mt-0.5 block">
            World Scouting, Hall of Fame & Career Database
          </Text>
        </View>

        <View className="flex flex-wrap items-center gap-1 bg-[#07090E] p-1 border border-slate-800">
          {(
            [
              ['npcs', `100 NPC Roster (${npcDatabase.length})`],
              ['legends', 'Records & Legends'],
              ['dynasty', `Dynasty Mode (Gen #${dynastyGeneration})`],
              ['sqlite', 'SQLite Save & Expo Go'],
            ] as const
          ).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setSubTab(key)}
              className={`px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                subTab === key
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {label}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* =====================================================================
          SUB-TAB 1: 100 LOCALIZED & INTERNATIONAL NPC PLAYERS (SECTION 8)
          ===================================================================== */}
      {subTab === 'npcs' && (
        <View className="bg-[#0C1018] border border-slate-800/90">
          <View className="p-4 border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-4">
            <View className="flex flex-wrap items-center gap-2">
              <Text className="text-xs text-slate-400">Filter Nation:</Text>
              <View className="flex flex-wrap items-center gap-1 bg-[#07090E] p-1 border border-slate-800">
                <TouchableOpacity
                  onPress={() => setSelectedNation('ALL')}
                  className={`px-2 py-1 text-xs font-mono-tabular ${
                    selectedNation === 'ALL'
                      ? 'bg-slate-800 text-amber-400 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  ALL (100)
                </TouchableOpacity>
                {INTERNATIONAL_NATIONS.slice(0, 8).map((nat) => (
                  <TouchableOpacity
                    key={nat.id}
                    onPress={() => setSelectedNation(nat.id)}
                    className={`px-2 py-1 text-xs font-mono-tabular ${
                      selectedNation === nat.id
                        ? 'bg-slate-800 text-amber-400 font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    {nat.id}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="flex flex-wrap items-center gap-3">
              <select
                value={selectedArchetype}
                onChange={(e) => setSelectedArchetype(e.target.value)}
                className="px-3 py-1.5 text-xs bg-[#07090E] border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">All 6 NPC Archetypes</option>
                <option value="The Prodigy">The Prodigy</option>
                <option value="The Late Bloomer">The Late Bloomer</option>
                <option value="The Journeyman">The Journeyman</option>
                <option value="The Legend">The Legend</option>
                <option value="The One Format Wonder">The One Format Wonder</option>
                <option value="The Injury Prone">The Injury Prone</option>
              </select>

              <View className="relative flex items-center w-56">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={npcSearch}
                  onChange={(e) => setNpcSearch(e.target.value)}
                  placeholder="Search 100 NPCs..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#07090E] border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </View>
            </View>
          </View>

          <ScrollView className="max-h-[540px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-[#07090E] border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-3 pl-5 pr-3">Player</th>
                  <th className="py-3 px-3">Nation / State</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Section 8 Archetype</th>
                  <th className="py-3 px-3 text-right font-mono-tabular">Age</th>
                  <th className="py-3 px-3 text-right font-mono-tabular">OVR</th>
                  <th className="py-3 px-3 text-right font-mono-tabular">Form</th>
                  <th className="py-3 px-3 text-right font-mono-tabular">Runs</th>
                  <th className="py-3 pl-3 pr-5 text-right font-mono-tabular">Wkts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredNpcs.map((npc) => (
                  <tr
                    key={npc.id}
                    className={`hover:bg-slate-900/60 ${
                      npc.isRival ? 'bg-rose-500/[0.07]' : ''
                    }`}
                  >
                    <td className="py-2.5 pl-5 pr-3">
                      <View className="flex items-center gap-2.5">
                        <Image
                          source={{ uri: npc.portraitUri }}
                          alt={npc.name}
                          className="w-7 h-7 border border-slate-700 shrink-0"
                        />
                        <Text
                          className={`font-semibold ${
                            npc.isRival ? 'text-rose-400 font-bold' : 'text-slate-100'
                          }`}
                        >
                          {npc.name} {npc.isRival ? '· RIVAL' : ''}
                        </Text>
                      </View>
                    </td>
                    <td className="py-2.5 px-3 font-mono-tabular text-slate-300">
                      {npc.nation} · {npc.stateTeamId}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{npc.role}</td>
                    <td className="py-2.5 px-3 text-amber-400">{npc.archetype}</td>
                    <td className="py-2.5 px-3 text-right font-mono-tabular text-slate-300">
                      {npc.age}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-tabular font-bold text-white">
                      {npc.overall}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-tabular text-emerald-400">
                      {npc.form}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-tabular text-slate-200">
                      {npc.careerRuns}
                    </td>
                    <td className="py-2.5 pl-3 pr-5 text-right font-mono-tabular text-slate-200">
                      {npc.careerWickets}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollView>
        </View>
      )}

      {/* =====================================================================
          SUB-TAB 2: HISTORICAL LEGENDS & MILESTONE ARCHIVE (SECTION 13)
          ===================================================================== */}
      {subTab === 'legends' && (
        <View className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 Columns: Historical Legends Comparison Table */}
          <View className="lg:col-span-7 bg-[#0C1018] border border-slate-800/90 p-5 space-y-4">
            <View className="flex items-center justify-between border-b border-slate-800 pb-3">
              <View>
                <Text className="font-display text-2xl font-bold text-white block">
                  Historical Legends Benchmark (Section 13)
                </Text>
                <Text className="text-xs text-slate-400">
                  Track your proximity to Indian cricket’s immortal records
                </Text>
              </View>
              <View className="text-right">
                <Text className="text-[11px] text-slate-400 block">Legacy Tier</Text>
                <Text className="font-display text-lg font-bold text-amber-400">
                  {legacyRating}
                </Text>
              </View>
            </View>

            <View className="divide-y divide-slate-800/80">
              {HISTORICAL_LEGENDS.map((leg) => {
                const runProgressPct = Math.min(
                  100,
                  (careerStats.runs / leg.careerRuns) * 100
                );
                return (
                  <View key={leg.name} className="py-3.5 space-y-1.5">
                    <View className="flex items-center justify-between text-xs">
                      <View>
                        <Text className="font-bold text-white text-sm">
                          {leg.name}
                        </Text>
                        <Text className="text-slate-400 ml-2">
                          ({leg.era} · {leg.role})
                        </Text>
                      </View>
                      <Text className="font-mono-tabular text-amber-400 font-semibold">
                        {leg.careerRuns.toLocaleString()} Runs · {leg.careerWickets} Wkts · {leg.centuries} 100s
                      </Text>
                    </View>
                    <Text className="text-xs text-slate-400 block">
                      {leg.summary}
                    </Text>
                    <View className="w-full h-1.5 bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${Math.max(2, runProgressPct)}%` }}
                        className="h-full bg-amber-400"
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Right 5 Columns: Career Milestones Log */}
          <View className="lg:col-span-5 bg-[#0C1018] border border-slate-800/90 p-5 space-y-4">
            <Text className="font-display text-2xl font-bold text-white border-b border-slate-800 pb-3 block">
              Career Milestone Log
            </Text>
            <View className="space-y-2.5">
              {milestonesUnlocked.map((m, idx) => (
                <View
                  key={idx}
                  className="p-3 bg-[#07090E] border border-slate-800 flex items-center gap-3 text-xs"
                >
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                  <Text className="text-slate-200">{m}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* =====================================================================
          SUB-TAB 3: DYNASTY MODE — PASS THE TORCH (SECTION 13)
          ===================================================================== */}
      {subTab === 'dynasty' && (
        <View className="bg-[#0C1018] border border-slate-800/90 p-6 max-w-3xl space-y-5">
          <View className="border-b border-slate-800 pb-4">
            <Text className="text-xs text-emerald-400 font-semibold block">
              Section 13 Special Feature · Multi-Generational Career Arc
            </Text>
            <Text className="font-display text-3xl font-bold text-white mt-0.5 block">
              Dynasty Mode — Pass the Torch to Your Child
            </Text>
            <Text className="text-xs text-slate-400 mt-1 block">
              Retire {player.fullName} (Peak OVR: {player.peakOverallReached}) and begin Generation #{dynastyGeneration + 1} as their 16-year-old child. Your child inherits 20% of your peak attribute bonus and starts with elevated famous-surname Reputation (185 REP).
            </Text>
          </View>

          <View className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <View>
              <label className="text-xs text-slate-400 block mb-1.5">
                Child’s First Name (Surname: {player.lastName})
              </label>
              <input
                type="text"
                value={childFirstName}
                onChange={(e) => setChildFirstName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[#07090E] border border-slate-800 text-white focus:outline-none focus:border-amber-400"
              />
            </View>

            <TouchableOpacity
              onPress={() => startDynastyChildCareer(childFirstName)}
              className="px-5 py-2.5 text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 text-center"
            >
              Retire {player.firstName} & Start {childFirstName} {player.lastName}'s Career
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* =====================================================================
          SUB-TAB 4: LOCAL SQLITE SAVE SLOTS & EXPO GO INSTRUCTIONS (PHASE 5)
          ===================================================================== */}
      {subTab === 'sqlite' && (
        <View className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 6 Columns: 3 Persistent Save Slots */}
          <View className="lg:col-span-6 bg-[#0C1018] border border-slate-800/90 p-5 space-y-4">
            <View className="flex items-center justify-between border-b border-slate-800 pb-3">
              <View className="flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                <Text className="font-display text-2xl font-bold text-white">
                  Local SQLite Save Slots (expo-sqlite)
                </Text>
              </View>
              <Text className="text-xs font-mono-tabular text-emerald-400">
                Auto-Save Active (SLOT_1)
              </Text>
            </View>

            {saveMessage && (
              <Text className="text-xs font-mono-tabular text-emerald-400 bg-[#07090E] p-3 border border-emerald-500/40 block">
                {saveMessage}
              </Text>
            )}

            <View className="space-y-3">
              {(['slot_1', 'slot_2', 'slot_3'] as const).map((slotId, idx) => {
                const existing = savedSlots.find((s) => s.slotId === slotId);
                return (
                  <View
                    key={slotId}
                    className="p-4 bg-[#07090E] border border-slate-800 flex flex-wrap items-center justify-between gap-3"
                  >
                    <View>
                      <Text className="font-mono-tabular text-xs font-bold text-amber-400 block">
                        DATABASE SLOT #{idx + 1} ({slotId.toUpperCase()})
                      </Text>
                      {existing ? (
                        <Text className="text-xs text-slate-200 mt-1 block">
                          {existing.playerName} · Age {existing.age} · {existing.overallRating} OVR · {existing.reputation} REP · Saved {existing.updatedAt}
                        </Text>
                      ) : (
                        <Text className="text-xs text-slate-500 mt-1 block">
                          Empty SQLite Career Slot
                        </Text>
                      )}
                    </View>

                    <View className="flex items-center gap-2">
                      <TouchableOpacity
                        onPress={() => handleSaveSlot(slotId)}
                        className="px-3 py-1.5 text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300"
                      >
                        Save
                      </TouchableOpacity>
                      <TouchableOpacity
                        disabled={!existing}
                        onPress={() => handleLoadSlot(slotId)}
                        className={`px-3 py-1.5 text-xs font-bold border ${
                          existing
                            ? 'bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700'
                            : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                        }`}
                      >
                        Load
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Right 6 Columns: SQLite Schema & Expo Go Compile Instructions */}
          <View className="lg:col-span-6 bg-[#0C1018] border border-slate-800/90 p-5 space-y-4">
            <Text className="font-display text-2xl font-bold text-white border-b border-slate-800 pb-3 block">
              Expo Go & EAS Build Instructions (Section 15)
            </Text>
            <Text className="text-xs text-slate-300 leading-relaxed block">
              To run on a physical Android/iOS device via Expo Go or compile an offline APK via EAS Build:
            </Text>
            <pre className="text-xs font-mono-tabular bg-[#07090E] border border-slate-800 p-3.5 text-emerald-400 overflow-x-auto leading-relaxed">
{`# 1. Install Expo & SQLite dependencies
npx expo install expo-sqlite zustand nativewind tailwindcss

# 2. Start Metro Bundler for Expo Go (low-RAM friendly)
npx expo start --tunnel

# 3. Build standalone Android APK via Expo EAS
npx eas-cli build -p android --profile preview`}
            </pre>

            <Text className="text-xs font-semibold text-slate-300 block pt-1">
              Active SQLite Table Schema (src/database/sqliteService.ts):
            </Text>
            <pre className="text-[11px] font-mono-tabular bg-[#07090E] border border-slate-800 p-3 text-slate-400 overflow-x-auto max-h-48">
              {SQLITE_DDL_SCHEMA.trim()}
            </pre>
          </View>
        </View>
      )}
    </View>
  );
};

export default WorldAndRecordsScreen;
