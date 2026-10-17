import { create } from 'zustand';
import {
  ALL_DOMESTIC_TEAMS,
  MUMBAI_STRIKERS,
  DELHI_TITANS,
  PITCH_PRESETS,
} from '../data/sampleTeams';
import {
  generateInitialNPCDatabase,
  NPCPlayer,
  CAREER_STAGES_CONFIG,
  TRAINING_CATEGORIES,
  SPECIALIZATION_PATHS,
  SPECIALIST_COACHES,
  BRAND_ENDORSEMENTS,
  PRESS_CONFERENCE_QUESTIONS,
  NARRATIVE_CHOICE_EVENTS,
  PressQuestion,
  NarrativeChoiceEvent,
  SelectorPersonality,
  CoachPersonality,
  IPL_FRANCHISES,
} from '../data/npcDatabase';
import { getPlayerPortraitUri } from '../assets/nanoBananaAssets';
import { MatchEngine } from '../engine/MatchEngine';
import { sqliteDb } from '../database/sqliteService';

export type PlayingRole =
  | 'Specialist Batter'
  | 'Specialist Pace Bowler'
  | 'Specialist Spin Bowler'
  | 'Batting Allrounder'
  | 'Bowling Allrounder'
  | 'Wicketkeeper-Batter';

export type BattingStyle =
  | 'Aggressive Opener'
  | 'Classic Technique Opener'
  | 'Number 3 Anchor'
  | 'Middle Order Accumulator'
  | 'Middle Order Aggressor'
  | 'Finisher / Death Batter'
  | 'Tail End Slogger';

export type BowlingStyle =
  | 'Express Pace (145+ kmph)'
  | 'Fast Medium (130-145 kmph)'
  | 'Medium Pace (115-130 kmph, heavy on swing/seam)'
  | 'Off Spin (right arm)'
  | 'Left Arm Orthodox'
  | 'Leg Spin / Googly'
  | 'Left Arm Wrist Spin (Chinaman)'
  | 'None';

export type ControlMode = 'Full Control' | 'Captain Mode' | 'Career Focus';

export type WeekLoopPhase =
  | 'PRE_MATCH'
  | 'POST_MATCH_MEDIA'
  | 'TRAINING_WEEK'
  | 'SELECTION_REVIEW';

export interface BattingAttributes {
  technique: number;
  power: number;
  timing: number;
  consistency: number;
  aggression: number;
  vsSpin: number;
  vsPace: number;
  pressureHandling: number;
  runningBetweenWickets: number;
}

export interface BowlingAttributes {
  primarySkill: number;
  accuracy: number;
  variation: number;
  movement: number;
  deathBowling: number;
  powerplayBowling: number;
  wicketTaking: number;
  economyControl: number;
  fitnessStamina: number;
}

export interface FieldingAttributes {
  catching: number;
  groundFielding: number;
  throwing: number;
  athleticism: number;
  keeping: number;
}

export interface MentalPhysicalAttributes {
  bigMatchTemperament: number;
  leadership: number;
  fitnessLevel: number;
  recoveryRate: number;
  form: number;
  confidence: number;
}

export interface CareerPlayerProfile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  age: number;
  hometown: string;
  homeState: string;
  homeTeamId: string;
  iplFranchiseId: string | null;
  iplContractLakhs: number;
  jerseyNumber: string;
  battingHand: 'Right' | 'Left';
  bowlingHand: 'Right' | 'Left';
  role: PlayingRole;
  battingStyle: BattingStyle;
  bowlingType: 'pace' | 'spin' | 'none';
  bowlingStyle: BowlingStyle;
  portraitUri: string;
  overallRating: number;
  potentialRating: number;
  peakOverallReached: number;
  batting: BattingAttributes;
  bowling: BowlingAttributes;
  fielding: FieldingAttributes;
  mental: MentalPhysicalAttributes;
}

export interface SocialMediaPost {
  id: string;
  handle: string;
  authorName: string;
  authorRole: 'Fan' | 'Journalist' | 'Former Legend' | 'Rival Watch' | 'Brand Deal' | 'Official Board';
  content: string;
  likes: string;
  reposts: string;
  sentiment: 'positive' | 'critical' | 'milestone';
}

export interface RecentMatchPerformance {
  matchId: string;
  week: number;
  format: 'T20' | 'ODI' | 'TEST';
  opponentShort: string;
  opponentName: string;
  runs: number;
  balls: number;
  notOut: boolean;
  wickets: number;
  runsConceded: number;
  oversBowled: string;
  matchRating: number;
  teamResult: 'W' | 'L';
  reputationDelta: number;
}

export interface FormatStats {
  matches: number;
  inningsBatted: number;
  notOuts: number;
  runs: number;
  ballsFaced: number;
  highestScore: number;
  highestNotOut: boolean;
  fifties: number;
  hundreds: number;
  fours: number;
  sixes: number;
  ballsBowled: number;
  runsConceded: number;
  wickets: number;
  bestBowlingWickets: number;
  bestBowlingRuns: number;
  fiveWicketHauls: number;
  catches: number;
}

export interface ScheduledFixture {
  week: number;
  format: 'T20' | 'ODI' | 'TEST';
  tournament: string;
  stageLabel: string;
  opponentTeamId: string;
  pitchPresetId: string;
  isHome: boolean;
}

export interface SelectorEvaluationReport {
  recentFormScore: number;
  reputationComponent: number;
  skillComponent: number;
  ageFactorScore: number;
  politicalFactorScore: number;
  finalSelectionScore: number;
  thresholdRequired: number;
  selectedForNextTier: boolean;
  selectorVerdict: string;
  rivalSelectionScore: number;
}

const clampAttr = (val: number) => Math.max(15, Math.min(99, Math.round(val)));
const randVar = (range = 4) => Math.floor(Math.random() * (range * 2 + 1)) - range;

export function createEmptyFormatStats(): FormatStats {
  return {
    matches: 0,
    inningsBatted: 0,
    notOuts: 0,
    runs: 0,
    ballsFaced: 0,
    highestScore: 0,
    highestNotOut: false,
    fifties: 0,
    hundreds: 0,
    fours: 0,
    sixes: 0,
    ballsBowled: 0,
    runsConceded: 0,
    wickets: 0,
    bestBowlingWickets: 0,
    bestBowlingRuns: 0,
    fiveWicketHauls: 0,
    catches: 0,
  };
}

export function generateStartingAttributes(
  role: PlayingRole,
  battingStyle: BattingStyle,
  bowlingStyle: BowlingStyle,
  dynastyBonus = 0
): {
  batting: BattingAttributes;
  bowling: BowlingAttributes;
  fielding: FieldingAttributes;
  mental: MentalPhysicalAttributes;
  overallRating: number;
  potentialRating: number;
} {
  let batBase = 68 + dynastyBonus;
  let bowlBase = 30 + Math.round(dynastyBonus * 0.5);
  let keepBase = 22;

  switch (role) {
    case 'Specialist Batter':
      batBase = 74 + dynastyBonus;
      bowlBase = 26;
      break;
    case 'Specialist Pace Bowler':
      batBase = 38;
      bowlBase = 75 + dynastyBonus;
      break;
    case 'Specialist Spin Bowler':
      batBase = 40;
      bowlBase = 75 + dynastyBonus;
      break;
    case 'Batting Allrounder':
      batBase = 71 + dynastyBonus;
      bowlBase = 65 + Math.round(dynastyBonus * 0.8);
      break;
    case 'Bowling Allrounder':
      batBase = 63 + Math.round(dynastyBonus * 0.8);
      bowlBase = 72 + dynastyBonus;
      break;
    case 'Wicketkeeper-Batter':
      batBase = 72 + dynastyBonus;
      bowlBase = 18;
      keepBase = 79 + dynastyBonus;
      break;
  }

  let techMod = 0;
  let powerMod = 0;
  let aggMod = 0;
  let pressMod = 0;

  if (battingStyle === 'Aggressive Opener') {
    powerMod = 6;
    aggMod = 10;
    techMod = -2;
  } else if (battingStyle === 'Classic Technique Opener') {
    techMod = 8;
    aggMod = -5;
    pressMod = 4;
  } else if (battingStyle === 'Number 3 Anchor') {
    techMod = 7;
    pressMod = 6;
  } else if (battingStyle === 'Middle Order Accumulator') {
    techMod = 5;
    pressMod = 5;
    powerMod = -2;
  } else if (battingStyle === 'Middle Order Aggressor') {
    powerMod = 7;
    aggMod = 9;
  } else if (battingStyle === 'Finisher / Death Batter') {
    powerMod = 9;
    aggMod = 11;
    pressMod = 8;
  } else if (battingStyle === 'Tail End Slogger') {
    powerMod = 8;
    aggMod = 12;
    techMod = -8;
  }

  let varMod = 0;
  let moveMod = 0;
  let accMod = 0;
  let deathMod = 0;
  let ppMod = 0;

  if (bowlingStyle.includes('Express Pace')) {
    ppMod = 6;
    deathMod = 5;
    accMod = -3;
  } else if (bowlingStyle.includes('Fast Medium')) {
    ppMod = 5;
    accMod = 4;
    moveMod = 4;
  } else if (bowlingStyle.includes('Medium Pace')) {
    moveMod = 8;
    accMod = 6;
    ppMod = 6;
  } else if (bowlingStyle.includes('Off Spin') || bowlingStyle.includes('Orthodox')) {
    accMod = 7;
    varMod = 4;
  } else if (bowlingStyle.includes('Leg Spin') || bowlingStyle.includes('Chinaman')) {
    varMod = 9;
    moveMod = 7;
    accMod = -2;
  }

  const batting: BattingAttributes = {
    technique: clampAttr(batBase + techMod + randVar(3)),
    power: clampAttr(batBase + powerMod + randVar(4)),
    timing: clampAttr(batBase + 2 + randVar(3)),
    consistency: clampAttr(batBase - 1 + randVar(3)),
    aggression: clampAttr(batBase + aggMod + randVar(4)),
    vsSpin: clampAttr(batBase + randVar(4)),
    vsPace: clampAttr(batBase + 1 + randVar(4)),
    pressureHandling: clampAttr(batBase + pressMod + randVar(3)),
    runningBetweenWickets: clampAttr(74 + randVar(4)),
  };

  const bowling: BowlingAttributes = {
    primarySkill: clampAttr(bowlBase + 3 + randVar(3)),
    accuracy: clampAttr(bowlBase + accMod + randVar(3)),
    variation: clampAttr(bowlBase + varMod + randVar(4)),
    movement: clampAttr(bowlBase + moveMod + randVar(4)),
    deathBowling: clampAttr(bowlBase + deathMod + randVar(4)),
    powerplayBowling: clampAttr(bowlBase + ppMod + randVar(4)),
    wicketTaking: clampAttr(bowlBase + 2 + randVar(4)),
    economyControl: clampAttr(bowlBase + accMod + randVar(3)),
    fitnessStamina: clampAttr(78 + randVar(4)),
  };

  const fielding: FieldingAttributes = {
    catching: clampAttr(73 + randVar(4)),
    groundFielding: clampAttr(75 + randVar(4)),
    throwing: clampAttr(72 + randVar(4)),
    athleticism: clampAttr(77 + randVar(4)),
    keeping: clampAttr(keepBase + randVar(3)),
  };

  const mental: MentalPhysicalAttributes = {
    bigMatchTemperament: clampAttr(74 + randVar(5)),
    leadership: clampAttr(66 + randVar(5)),
    fitnessLevel: clampAttr(84 + randVar(3)),
    recoveryRate: clampAttr(85 + randVar(3)),
    form: 78,
    confidence: 76,
  };

  const overallRating = calculateOverallRating(role, batting, bowling, fielding);
  const potentialRating = Math.min(98, Math.max(89, overallRating + 16 + randVar(2)));

  return {
    batting,
    bowling,
    fielding,
    mental,
    overallRating,
    potentialRating,
  };
}

export function calculateOverallRating(
  role: PlayingRole,
  batting: BattingAttributes,
  bowling: BowlingAttributes,
  fielding: FieldingAttributes
): number {
  const batAvg =
    batting.technique * 0.25 +
    batting.timing * 0.2 +
    batting.power * 0.18 +
    batting.consistency * 0.15 +
    batting.vsPace * 0.11 +
    batting.vsSpin * 0.11;

  const bowlAvg =
    bowling.primarySkill * 0.3 +
    bowling.accuracy * 0.2 +
    bowling.wicketTaking * 0.18 +
    bowling.variation * 0.16 +
    bowling.movement * 0.16;

  const fieldAvg =
    (fielding.catching + fielding.groundFielding + fielding.athleticism) / 3;

  if (role === 'Specialist Batter') {
    return Math.round(batAvg * 0.88 + fieldAvg * 0.12);
  }
  if (role === 'Specialist Pace Bowler' || role === 'Specialist Spin Bowler') {
    return Math.round(bowlAvg * 0.88 + fieldAvg * 0.12);
  }
  if (role === 'Batting Allrounder') {
    return Math.round(batAvg * 0.58 + bowlAvg * 0.34 + fieldAvg * 0.08);
  }
  if (role === 'Bowling Allrounder') {
    return Math.round(bowlAvg * 0.58 + batAvg * 0.34 + fieldAvg * 0.08);
  }
  return Math.round(batAvg * 0.68 + fielding.keeping * 0.24 + fieldAvg * 0.08);
}

export function getReputationTier(score: number): {
  tierName: string;
  description: string;
  nextThreshold: number;
} {
  if (score < 100) {
    return {
      tierName: 'Unknown (0–100)',
      description: 'Club level — not yet on state selectors radar.',
      nextThreshold: 100,
    };
  }
  if (score < 250) {
    return {
      tierName: 'Emerging (100–250)',
      description: 'Watched closely by State Under-19 & Ranji selectors.',
      nextThreshold: 250,
    };
  }
  if (score < 400) {
    return {
      tierName: 'Promising (250–400)',
      description: 'In IPL Franchise Auction & India A conversations.',
      nextThreshold: 400,
    };
  }
  if (score < 600) {
    return {
      tierName: 'Established (400–600)',
      description: 'Senior National Selection discussions active.',
      nextThreshold: 600,
    };
  }
  if (score < 800) {
    return {
      tierName: 'International Star (600–800)',
      description: 'Automatic national selection across formats when fit.',
      nextThreshold: 800,
    };
  }
  return {
    tierName: 'All-Time Legend (800–1000)',
    description: 'Iconic status — farewell match & Hall of Fame guaranteed.',
    nextThreshold: 1000,
  };
}

/**
 * Exact Section 10 Selector AI Evaluation Formula:
 * Selection Score =
 *   Recent form (last 5 matches) * 0.40 +
 *   Reputation score (normalized 0-100) * 0.25 +
 *   Skill rating (role specific) * 0.20 +
 *   Age factor (prefer 22-28) * 0.10 +
 *   State political factor * 0.05
 */
export function evaluateSelectorFormula(
  player: CareerPlayerProfile,
  reputationScore: number,
  selectorPersonality: SelectorPersonality,
  selectorRespect: number,
  stageIndex: number,
  rival: NPCPlayer
): SelectorEvaluationReport {
  const recentFormScore = player.mental.form;
  const reputationNormalized = Math.min(100, reputationScore / 10);
  const skillComponent = player.overallRating;

  // Age factor: prefer 22-28 (95), 18-21 (82), 16-17 (74), 29-32 (85), 33+ (65)
  let ageFactorScore = 76;
  if (player.age >= 22 && player.age <= 28) ageFactorScore = 96;
  else if (player.age >= 18 && player.age <= 21) ageFactorScore = 84;
  else if (player.age >= 29 && player.age <= 32) ageFactorScore = 85;
  else if (player.age >= 33) ageFactorScore = 64;

  // Selector personality adjustments (Section 10 Table)
  if (selectorPersonality === 'Development Focused' && player.age <= 21) {
    ageFactorScore = 96;
  } else if (selectorPersonality === 'Conservative' && player.age < 20) {
    ageFactorScore -= 8;
  }

  // Political & Board Respect Factor (0-100)
  let politicalFactorScore = Math.min(100, Math.max(20, selectorRespect));
  if (selectorPersonality === 'Political') {
    politicalFactorScore =
      player.homeTeamId === 'MUM' || player.homeTeamId === 'DEL'
        ? Math.min(100, politicalFactorScore + 15)
        : Math.max(30, politicalFactorScore - 10);
  }

  let finalSelectionScore =
    recentFormScore * 0.40 +
    reputationNormalized * 0.25 +
    skillComponent * 0.20 +
    ageFactorScore * 0.10 +
    politicalFactorScore * 0.05;

  if (selectorPersonality === 'Form Based') {
    finalSelectionScore =
      recentFormScore * 0.55 +
      reputationNormalized * 0.15 +
      skillComponent * 0.20 +
      ageFactorScore * 0.05 +
      politicalFactorScore * 0.05;
  }

  finalSelectionScore = +finalSelectionScore.toFixed(1);

  const rivalSelectionScore = +(
    rival.form * 0.40 +
    Math.min(100, rival.reputation / 10) * 0.25 +
    rival.overall * 0.20 +
    80 * 0.10 +
    75 * 0.05
  ).toFixed(1);

  const nextStageConfig =
    CAREER_STAGES_CONFIG[Math.min(CAREER_STAGES_CONFIG.length - 1, stageIndex + 1)];
  const thresholdRequired = nextStageConfig.selectionThreshold;
  const selectedForNextTier =
    finalSelectionScore >= thresholdRequired &&
    reputationScore >= nextStageConfig.minRepRequired;

  let selectorVerdict = '';
  if (selectedForNextTier) {
    selectorVerdict = `APPROVED FOR PROMOTION: Your Selection Score (${finalSelectionScore}) & Reputation (${reputationScore}) meet the criteria for ${nextStageConfig.title}!`;
  } else {
    selectorVerdict = `RETAINED IN CURRENT SQUAD: Need Selection Score ≥ ${thresholdRequired} (Current: ${finalSelectionScore}) and Reputation ≥ ${nextStageConfig.minRepRequired} (Current: ${reputationScore}) to unlock ${nextStageConfig.title}.`;
  }

  return {
    recentFormScore,
    reputationComponent: +reputationNormalized.toFixed(1),
    skillComponent,
    ageFactorScore,
    politicalFactorScore,
    finalSelectionScore,
    thresholdRequired,
    selectedForNextTier,
    selectorVerdict,
    rivalSelectionScore,
  };
}

/**
 * Generates 6 contextual Post-Match Social Media Posts (Section 11)
 */
function buildPostMatchSocialFeed(
  player: CareerPlayerProfile,
  perf: RecentMatchPerformance,
  rival: NPCPlayer,
  reputationScore: number
): SocialMediaPost[] {
  const posts: SocialMediaPost[] = [];
  const isGreatBat = perf.runs >= 50;
  const isCentury = perf.runs >= 100;
  const isGreatBowl = perf.wickets >= 3;
  const isPoor = perf.matchRating < 6.0;

  if (isCentury) {
    posts.push({
      id: `soc-1-${Date.now()}`,
      handle: '@CricTrackerIND',
      authorName: 'CricTracker India',
      authorRole: 'Journalist',
      content: `TRENDING #1 IN INDIA: Take a bow, ${player.fullName}! A breathtaking ${perf.runs}${perf.notOut ? '*' : ''} off ${perf.balls} balls against ${perf.opponentName}. A star is born!`,
      likes: '48.2K',
      reposts: '9.4K',
      sentiment: 'milestone',
    });
  } else if (isGreatBat || isGreatBowl) {
    posts.push({
      id: `soc-1-${Date.now()}`,
      handle: '@HarshaVoice',
      authorName: 'Harsha Sengupta',
      authorRole: 'Journalist',
      content: `What stands out about ${player.fullName} (${perf.runs}${perf.notOut ? '*' : ''} off ${perf.balls}b, ${perf.wickets} wkts) is the composure under pressure. The selectors cannot ignore these numbers much longer.`,
      likes: '19.4K',
      reposts: '2.8K',
      sentiment: 'positive',
    });
  } else if (isPoor) {
    posts.push({
      id: `soc-1-${Date.now()}`,
      handle: '@IndianCricketFanClub',
      authorName: 'Maidan Ultrasound',
      authorRole: 'Fan',
      content: `Tough outing for ${player.fullName} today (${perf.runs} off ${perf.balls}b). With ${rival.name} scoring heavily in the other group, the pressure for that spot is heating up.`,
      likes: '4.1K',
      reposts: '612',
      sentiment: 'critical',
    });
  } else {
    posts.push({
      id: `soc-1-${Date.now()}`,
      handle: '@DomesticWatchIN',
      authorName: 'Domestic Cricket Radar',
      authorRole: 'Journalist',
      content: `Solid contribution from ${player.fullName} (${perf.runs} runs, ${perf.wickets} wkts, Rating ${perf.matchRating}) vs ${perf.opponentName}. Building steady momentum this season.`,
      likes: '6.8K',
      reposts: '540',
      sentiment: 'positive',
    });
  }

  // Former player pundit quote
  posts.push({
    id: `soc-2-${Date.now()}`,
    handle: '@WasimPunditry',
    authorName: 'Wasim Jaffer-Roy',
    authorRole: 'Former Legend',
    content:
      perf.matchRating >= 7.5
        ? `At age ${player.age}, ${player.fullName}'s balance at the crease reminds me of the classic Mumbai school of batting. Special ceiling.`
        : `Young players like ${player.fullName} will have days where the ball doesn't middle. How he responds in the nets this week will define him.`,
    likes: '14.2K',
    reposts: '1.5K',
    sentiment: perf.matchRating >= 7.5 ? 'positive' : 'critical',
  });

  // Rival watch post
  posts.push({
    id: `soc-3-${Date.now()}`,
    handle: '@RivalryRadar',
    authorName: 'Youth Selection Insider',
    authorRole: 'Rival Watch',
    content: `RIVALRY UPDATE: ${player.fullName} (Form ${player.mental.form}) vs ${rival.name} (Form ${rival.form}). Only one slot is open in the chief selector's notebook this month!`,
    likes: '8.9K',
    reposts: '1.1K',
    sentiment: 'milestone',
  });

  // Brand endorsement hint if reputation > 180
  if (reputationScore >= 180) {
    posts.push({
      id: `soc-4-${Date.now()}`,
      handle: '@BizOfCricket',
      authorName: 'Sports Commercial Weekly',
      authorRole: 'Brand Deal',
      content: `With ${player.fullName}'s reputation crossing ${reputationScore}, commercial agencies are lining up sponsorship packages for the youngster.`,
      likes: '5.3K',
      reposts: '420',
      sentiment: 'positive',
    });
  }

  return posts;
}

const INITIAL_SCHEDULE: ScheduledFixture[] = [
  {
    week: 1,
    format: 'T20',
    tournament: 'Syed Mushtaq Ali T20 Trophy',
    stageLabel: 'Group Stage · Round 1',
    opponentTeamId: 'DEL',
    pitchPresetId: 'balanced-turf',
    isHome: true,
  },
  {
    week: 2,
    format: 'T20',
    tournament: 'Syed Mushtaq Ali T20 Trophy',
    stageLabel: 'Group Stage · Round 2',
    opponentTeamId: 'BLR',
    pitchPresetId: 'batting-belter',
    isHome: false,
  },
  {
    week: 3,
    format: 'ODI',
    tournament: 'Vijay Hazare 50-Over Trophy',
    stageLabel: 'Zonal Round · Match 3',
    opponentTeamId: 'CHE',
    pitchPresetId: 'spin-turner',
    isHome: false,
  },
  {
    week: 4,
    format: 'TEST',
    tournament: 'Ranji Trophy First-Class',
    stageLabel: 'Elite Group · 4-Day Fixture',
    opponentTeamId: 'DEL',
    pitchPresetId: 'green-seamer',
    isHome: true,
  },
  {
    week: 5,
    format: 'T20',
    tournament: 'Championship Showdown',
    stageLabel: 'Season Finale',
    opponentTeamId: 'BLR',
    pitchPresetId: 'balanced-turf',
    isHome: true,
  },
];

const defaultStartingAttrs = generateStartingAttributes(
  'Batting Allrounder',
  'Number 3 Anchor',
  'Fast Medium (130-145 kmph)'
);

const DEFAULT_PROTAGONIST: CareerPlayerProfile = {
  id: 'user-protagonist',
  firstName: 'Aarav',
  lastName: 'Sharma',
  fullName: 'Aarav Sharma',
  age: 16,
  hometown: 'Shivaji Park, Mumbai',
  homeState: 'Maharashtra',
  homeTeamId: 'MUM',
  iplFranchiseId: null,
  iplContractLakhs: 0,
  jerseyNumber: '18',
  battingHand: 'Right',
  bowlingHand: 'Right',
  role: 'Batting Allrounder',
  battingStyle: 'Number 3 Anchor',
  bowlingType: 'pace',
  bowlingStyle: 'Fast Medium (130-145 kmph)',
  portraitUri: getPlayerPortraitUri('Aarav Sharma', '#F59E0B', '18'),
  overallRating: defaultStartingAttrs.overallRating,
  potentialRating: defaultStartingAttrs.potentialRating,
  peakOverallReached: defaultStartingAttrs.overallRating,
  batting: defaultStartingAttrs.batting,
  bowling: defaultStartingAttrs.bowling,
  fielding: defaultStartingAttrs.fielding,
  mental: defaultStartingAttrs.mental,
};

interface CareerStoreState {
  hasCompletedCreation: boolean;
  player: CareerPlayerProfile;
  stageIndex: number; // 0 to 9 (10 stages in Section 6)
  careerStage: string;
  currentWeek: number;
  currentSeason: number;
  weekPhase: WeekLoopPhase;
  reputationScore: number;
  selectorRespect: number;
  selectorPersonality: SelectorPersonality;
  coachPersonality: CoachPersonality;
  careerFundsLakhs: number;
  controlMode: ControlMode;
  dynastyGeneration: number;
  parentLegacyName: string | null;

  // Training & Specializations (Section 9)
  weeklyTrainingHours: Record<string, number>;
  trainingCompletedThisWeek: boolean;
  lastTrainingSummary: string[];
  activeSpecializationId: string | null;
  hiredCoachIds: string[];
  activeEndorsementIds: string[];

  // Media, Press & Narrative Events (Sections 11 & 12)
  socialFeed: SocialMediaPost[];
  activePressQuestion: PressQuestion | null;
  pressAnsweredThisWeek: boolean;
  activeChoiceEvent: NarrativeChoiceEvent | null;
  choiceEventResolvedThisWeek: boolean;

  // Statistics, Milestones & NPCs (Sections 8 & 13)
  recentPerformances: RecentMatchPerformance[];
  careerStats: FormatStats;
  formatStatsMap: Record<'DOMESTIC' | 'IPL' | 'T20I' | 'ODI' | 'TEST', FormatStats>;
  milestonesUnlocked: string[];
  npcDatabase: NPCPlayer[];
  schedule: ScheduledFixture[];
  lastSimulatedMatch: any | null;

  // Actions
  createCareerPlayer: (payload: {
    firstName: string;
    lastName: string;
    hometown: string;
    homeState: string;
    homeTeamId: string;
    jerseyNumber: string;
    battingHand: 'Right' | 'Left';
    bowlingHand: 'Right' | 'Left';
    role: PlayingRole;
    battingStyle: BattingStyle;
    bowlingStyle: BowlingStyle;
    generatedAttributes: ReturnType<typeof generateStartingAttributes>;
  }) => void;
  setControlMode: (mode: ControlMode) => void;
  setWeekPhase: (phase: WeekLoopPhase) => void;
  setSelectorPersonality: (p: SelectorPersonality) => void;
  simulateNextCareerMatch: (options?: {
    tacticalStance?: 'conservative' | 'balanced' | 'aggressive';
    dewPresent?: boolean;
    formatOverride?: 'T20' | 'ODI' | 'TEST';
  }) => any;
  answerPressConference: (optionIndex: number) => void;
  resolveChoiceEvent: (choiceIndex: number) => void;
  setTrainingHourAllocation: (categoryId: string, hours: number) => void;
  commitWeeklyTraining: () => void;
  selectSpecialization: (specId: string) => void;
  hireSpecialistCoach: (coachId: string) => void;
  signBrandEndorsement: (endorsementId: string) => void;
  runIPLAuctionBid: () => string;
  advanceToNextWeekOrStage: () => void;
  startDynastyChildCareer: (childFirstName: string) => void;
  saveToSQLiteSlot: (slotId: string) => void;
  loadFromSQLiteSlot: (slotId: string) => boolean;
}

const initialNpcs = generateInitialNPCDatabase();

export const useCareerStore = create<CareerStoreState>((set, get) => ({
  hasCompletedCreation: false,
  player: DEFAULT_PROTAGONIST,
  stageIndex: 1, // Starts at Stage 2 — State U19 / Domestic T20
  careerStage: CAREER_STAGES_CONFIG[1].title,
  currentWeek: 1,
  currentSeason: 2026,
  weekPhase: 'PRE_MATCH',
  reputationScore: 145,
  selectorRespect: 68,
  selectorPersonality: 'Form Based',
  coachPersonality: 'Development Focused',
  careerFundsLakhs: 15,
  controlMode: 'Captain Mode',
  dynastyGeneration: 1,
  parentLegacyName: null,

  weeklyTrainingHours: {
    batting_nets: 10,
    power_hitting: 5,
    bowling_workouts: 8,
    bowling_variations: 4,
    fitness_training: 6,
    fielding_drills: 3,
    mental_coaching: 2,
    leadership_sessions: 2,
  },
  trainingCompletedThisWeek: false,
  lastTrainingSummary: [],
  activeSpecializationId: null,
  hiredCoachIds: [],
  activeEndorsementIds: [],

  socialFeed: [
    {
      id: 'init-1',
      handle: '@MumbaiMaidanScout',
      authorName: 'Mumbai Cricket Observer',
      authorRole: 'Journalist',
      content:
        'Keep an eye on 16-year-old Aarav Sharma entering the domestic season. Smooth high-elbow technique and brisk medium pace.',
      likes: '3.2K',
      reposts: '410',
      sentiment: 'positive',
    },
    {
      id: 'init-2',
      handle: '@RivalryRadar',
      authorName: 'Youth Selection Insider',
      authorRole: 'Rival Watch',
      content:
        'Delhi prodigy Vikramaditya Rao (#07) vs Mumbai’s Aarav Sharma (#18) is shaping up as the defining youth rivalry of the 2026 season.',
      likes: '5.1K',
      reposts: '780',
      sentiment: 'milestone',
    },
  ],
  activePressQuestion: PRESS_CONFERENCE_QUESTIONS[0],
  pressAnsweredThisWeek: false,
  activeChoiceEvent: NARRATIVE_CHOICE_EVENTS[0],
  choiceEventResolvedThisWeek: false,

  recentPerformances: [
    {
      matchId: 'youth-1',
      week: 0,
      format: 'T20',
      opponentShort: 'PUN',
      opponentName: 'Punjab Colts',
      runs: 42,
      balls: 29,
      notOut: false,
      wickets: 1,
      runsConceded: 24,
      oversBowled: '3.0',
      matchRating: 7.8,
      teamResult: 'W',
      reputationDelta: 15,
    },
    {
      matchId: 'youth-2',
      week: 0,
      format: 'T20',
      opponentShort: 'GUJ',
      opponentName: 'Gujarat XI',
      runs: 68,
      balls: 44,
      notOut: true,
      wickets: 2,
      runsConceded: 19,
      oversBowled: '4.0',
      matchRating: 9.1,
      teamResult: 'W',
      reputationDelta: 28,
    },
    {
      matchId: 'youth-3',
      week: 0,
      format: 'T20',
      opponentShort: 'VID',
      opponentName: 'Vidarbha Youth',
      runs: 14,
      balls: 12,
      notOut: false,
      wickets: 0,
      runsConceded: 28,
      oversBowled: '2.0',
      matchRating: 5.9,
      teamResult: 'L',
      reputationDelta: -8,
    },
  ],
  careerStats: {
    matches: 3,
    inningsBatted: 3,
    notOuts: 1,
    runs: 124,
    ballsFaced: 85,
    highestScore: 68,
    highestNotOut: true,
    fifties: 1,
    hundreds: 0,
    fours: 13,
    sixes: 5,
    ballsBowled: 54,
    runsConceded: 71,
    wickets: 3,
    bestBowlingWickets: 2,
    bestBowlingRuns: 19,
    fiveWicketHauls: 0,
    catches: 2,
  },
  formatStatsMap: {
    DOMESTIC: {
      matches: 3,
      inningsBatted: 3,
      notOuts: 1,
      runs: 124,
      ballsFaced: 85,
      highestScore: 68,
      highestNotOut: true,
      fifties: 1,
      hundreds: 0,
      fours: 13,
      sixes: 5,
      ballsBowled: 54,
      runsConceded: 71,
      wickets: 3,
      bestBowlingWickets: 2,
      bestBowlingRuns: 19,
      fiveWicketHauls: 0,
      catches: 2,
    },
    IPL: createEmptyFormatStats(),
    T20I: createEmptyFormatStats(),
    ODI: createEmptyFormatStats(),
    TEST: createEmptyFormatStats(),
  },
  milestonesUnlocked: [
    'Age 16 State Youth Contract Signed',
    'Maiden Domestic Half-Century (68* vs Gujarat XI)',
  ],
  npcDatabase: initialNpcs,
  schedule: INITIAL_SCHEDULE,
  lastSimulatedMatch: null,

  createCareerPlayer: (payload) => {
    const fullName = `${payload.firstName.trim()} ${payload.lastName.trim()}`.trim();
    const bowlingType: 'pace' | 'spin' | 'none' =
      payload.role === 'Wicketkeeper-Batter' || payload.bowlingStyle === 'None'
        ? 'none'
        : payload.bowlingStyle.includes('Spin') ||
          payload.bowlingStyle.includes('Orthodox') ||
          payload.bowlingStyle.includes('Chinaman')
        ? 'spin'
        : 'pace';

    const homeTeam =
      ALL_DOMESTIC_TEAMS.find((t) => t.id === payload.homeTeamId) || MUMBAI_STRIKERS;

    const newPlayer: CareerPlayerProfile = {
      id: 'user-protagonist',
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      fullName,
      age: 16,
      hometown: payload.hometown.trim() || homeTeam.homeGround,
      homeState: payload.homeState,
      homeTeamId: homeTeam.id,
      iplFranchiseId: null,
      iplContractLakhs: 0,
      jerseyNumber: payload.jerseyNumber || '18',
      battingHand: payload.battingHand,
      bowlingHand: payload.bowlingHand,
      role: payload.role,
      battingStyle: payload.battingStyle,
      bowlingType,
      bowlingStyle: payload.bowlingStyle,
      portraitUri: getPlayerPortraitUri(
        fullName,
        homeTeam.accentColor,
        payload.jerseyNumber || '18'
      ),
      overallRating: payload.generatedAttributes.overallRating,
      potentialRating: payload.generatedAttributes.potentialRating,
      peakOverallReached: payload.generatedAttributes.overallRating,
      batting: payload.generatedAttributes.batting,
      bowling: payload.generatedAttributes.bowling,
      fielding: payload.generatedAttributes.fielding,
      mental: payload.generatedAttributes.mental,
    };

    set({
      hasCompletedCreation: true,
      player: newPlayer,
      stageIndex: 0,
      careerStage: CAREER_STAGES_CONFIG[0].title,
      currentWeek: 1,
      weekPhase: 'PRE_MATCH',
      reputationScore: 95,
      milestonesUnlocked: [`Age 16 Career Initiated: ${fullName} (${payload.role})`],
    });
  },

  setControlMode: (mode) => set({ controlMode: mode }),
  setWeekPhase: (phase) => set({ weekPhase: phase }),
  setSelectorPersonality: (p) => set({ selectorPersonality: p }),

  simulateNextCareerMatch: (options = {}) => {
    const state = get();
    const {
      player,
      currentWeek,
      schedule,
      recentPerformances,
      careerStats,
      reputationScore,
      npcDatabase,
      activeEndorsementIds,
      careerFundsLakhs,
      milestonesUnlocked,
      stageIndex,
    } = state;

    const fixtureIdx = (currentWeek - 1) % schedule.length;
    const activeFixture = schedule[fixtureIdx];
    const matchFormat = options.formatOverride || activeFixture.format || 'T20';

    const rawHomeTeam =
      ALL_DOMESTIC_TEAMS.find((t) => t.id === player.homeTeamId) || MUMBAI_STRIKERS;
    const rawOpponentTeam =
      ALL_DOMESTIC_TEAMS.find((t) => t.id === activeFixture.opponentTeamId) ||
      DELHI_TITANS;

    let targetSlotIndex = 2;
    if (
      player.battingStyle === 'Aggressive Opener' ||
      player.battingStyle === 'Classic Technique Opener'
    ) {
      targetSlotIndex = 0;
    } else if (player.battingStyle === 'Number 3 Anchor') {
      targetSlotIndex = 2;
    } else if (
      player.battingStyle === 'Middle Order Accumulator' ||
      player.battingStyle === 'Middle Order Aggressor'
    ) {
      targetSlotIndex = 3;
    } else if (player.battingStyle === 'Finisher / Death Batter') {
      targetSlotIndex = 4;
    } else if (player.battingStyle === 'Tail End Slogger') {
      targetSlotIndex = 7;
    }

    const customizedPlayers = rawHomeTeam.players.map((p) => ({
      ...p,
      isUserPlayer: false,
    }));

    customizedPlayers[targetSlotIndex] = {
      id: player.id,
      name: player.fullName,
      jersey: player.jerseyNumber,
      age: player.age,
      role: player.role,
      battingStyle: player.battingStyle,
      bowlingType: player.bowlingType,
      bowlingStyle: player.bowlingStyle,
      isUserPlayer: true,
      isRival: false,
      isCaptain: state.controlMode === 'Captain Mode' || state.controlMode === 'Full Control',
      isWicketkeeper: player.role === 'Wicketkeeper-Batter',
      portraitUri: player.portraitUri,
      batting: { ...player.batting },
      bowling: { ...player.bowling },
      fielding: { ...player.fielding },
      mental: { ...player.mental },
    };

    const userTeamWithProtagonist = {
      ...rawHomeTeam,
      players: customizedPlayers,
    };

    const pitchPreset =
      PITCH_PRESETS.find((p) => p.id === activeFixture.pitchPresetId) ||
      PITCH_PRESETS[0];

    const engine = new MatchEngine(
      userTeamWithProtagonist,
      rawOpponentTeam,
      matchFormat,
      pitchPreset,
      {
        dewPresent: options.dewPresent ?? pitchPreset.dewPresent,
        crowdAdvantage: activeFixture.isHome ? 'home' : 'away',
        userTacticalStance: options.tacticalStance ?? 'balanced',
      }
    );

    const matchResult = engine.simulateMatch();

    const userBattingInnings =
      matchResult.innings1.battingTeamId === userTeamWithProtagonist.id
        ? matchResult.innings1
        : matchResult.innings2;
    const userBowlingInnings =
      matchResult.innings1.bowlingTeamId === userTeamWithProtagonist.id
        ? matchResult.innings1
        : matchResult.innings2;

    const batterRecord = userBattingInnings.batters.find(
      (b: any) => b.id === player.id || b.isUserPlayer
    );
    const bowlerRecord = userBowlingInnings.bowlers.find(
      (b: any) => b.id === player.id || b.isUserPlayer
    );

    const runs = batterRecord ? batterRecord.runs : 0;
    const balls = batterRecord ? batterRecord.balls : 0;
    const notOut = batterRecord ? batterRecord.status === 'not out' : false;
    const didBat = batterRecord ? batterRecord.status !== 'dnb' : false;
    const fours = batterRecord ? batterRecord.fours : 0;
    const sixes = batterRecord ? batterRecord.sixes : 0;

    const wickets = bowlerRecord ? bowlerRecord.wickets : 0;
    const runsConceded = bowlerRecord ? bowlerRecord.runsConceded : 0;
    const ballsBowled = bowlerRecord ? bowlerRecord.ballsBowled : 0;
    const oversBowled = bowlerRecord ? bowlerRecord.oversDisplay : '0.0';

    const teamWon = matchResult.result.winnerId === userTeamWithProtagonist.id;

    let ratingScore = 6.2;
    if (didBat) {
      ratingScore += runs / 22 + fours * 0.1 + sixes * 0.2;
      if (runs < 10 && !notOut) ratingScore -= 0.9;
    }
    if (ballsBowled > 0) {
      ratingScore += wickets * 1.1;
      if (bowlerRecord.economy < 7.0) ratingScore += 0.5;
      else if (bowlerRecord.economy > 10.0) ratingScore -= 0.5;
    }
    if (teamWon) ratingScore += 0.4;
    const matchRating = +Math.max(4.0, Math.min(9.9, ratingScore)).toFixed(1);

    // Section 10 Reputation Multipliers (IPL x1.5, Test x1.3)
    let rawRepDelta = teamWon ? 8 : -4;
    if (runs >= 100) rawRepDelta += 42;
    else if (runs >= 50) rawRepDelta += 24;
    else if (runs >= 30) rawRepDelta += 12;
    else if (didBat && runs < 8 && !notOut) rawRepDelta -= 8;

    if (wickets >= 5) rawRepDelta += 40;
    else if (wickets >= 3) rawRepDelta += 24;
    else if (wickets >= 2) rawRepDelta += 14;
    else if (wickets === 1) rawRepDelta += 6;

    const repMultiplier =
      stageIndex === 3 ? 1.5 : matchFormat === 'TEST' ? 1.3 : 1.0;
    const repDelta = Math.round(rawRepDelta * repMultiplier);

    const newPerformance: RecentMatchPerformance = {
      matchId: matchResult.id,
      week: currentWeek,
      format: matchFormat,
      opponentShort: rawOpponentTeam.shortName,
      opponentName: rawOpponentTeam.name,
      runs,
      balls,
      notOut,
      wickets,
      runsConceded,
      oversBowled,
      matchRating,
      teamResult: teamWon ? 'W' : 'L',
      reputationDelta: repDelta,
    };

    const updatedRecent = [...recentPerformances, newPerformance].slice(-5);
    const avgRating =
      updatedRecent.reduce((acc, item) => acc + item.matchRating, 0) /
      updatedRecent.length;
    const updatedForm = clampAttr(Math.round(avgRating * 10.5));
    const updatedConfidence = clampAttr(
      player.mental.confidence + (teamWon ? 4 : -3) + (matchRating >= 7.5 ? 4 : -2)
    );

    // In-match attribute growth (Section 9: Test cricket gives more growth than T20)
    const growthBonus = matchFormat === 'TEST' ? 2 : 1;
    const updatedBatting = { ...player.batting };
    const updatedBowling = { ...player.bowling };
    if (runs >= 40) {
      updatedBatting.timing = clampAttr(updatedBatting.timing + growthBonus);
      updatedBatting.technique = clampAttr(updatedBatting.technique + growthBonus);
    }
    if (wickets >= 2) {
      updatedBowling.primarySkill = clampAttr(updatedBowling.primarySkill + growthBonus);
      updatedBowling.wicketTaking = clampAttr(updatedBowling.wicketTaking + growthBonus);
    }

    const updatedOvr = calculateOverallRating(
      player.role,
      updatedBatting,
      updatedBowling,
      player.fielding
    );

    const isNewHigh =
      runs > careerStats.highestScore ||
      (runs === careerStats.highestScore && notOut && !careerStats.highestNotOut);

    const isNewBestBowl =
      wickets > careerStats.bestBowlingWickets ||
      (wickets === careerStats.bestBowlingWickets &&
        wickets > 0 &&
        runsConceded < careerStats.bestBowlingRuns);

    const updatedStats: FormatStats = {
      matches: careerStats.matches + 1,
      inningsBatted: careerStats.inningsBatted + (didBat ? 1 : 0),
      notOuts: careerStats.notOuts + (didBat && notOut ? 1 : 0),
      runs: careerStats.runs + runs,
      ballsFaced: careerStats.ballsFaced + balls,
      highestScore: isNewHigh ? runs : careerStats.highestScore,
      highestNotOut: isNewHigh ? notOut : careerStats.highestNotOut,
      fifties: careerStats.fifties + (runs >= 50 && runs < 100 ? 1 : 0),
      hundreds: careerStats.hundreds + (runs >= 100 ? 1 : 0),
      fours: careerStats.fours + fours,
      sixes: careerStats.sixes + sixes,
      ballsBowled: careerStats.ballsBowled + ballsBowled,
      runsConceded: careerStats.runsConceded + runsConceded,
      wickets: careerStats.wickets + wickets,
      bestBowlingWickets: isNewBestBowl ? wickets : careerStats.bestBowlingWickets,
      bestBowlingRuns: isNewBestBowl ? runsConceded : careerStats.bestBowlingRuns,
      fiveWicketHauls: careerStats.fiveWicketHauls + (wickets >= 5 ? 1 : 0),
      catches: careerStats.catches + (Math.random() < 0.35 ? 1 : 0),
    };

    const nextRep = Math.max(0, Math.min(1000, reputationScore + repDelta));

    // Update Rival & NPCs in background (Section 8: If you succeed, rival feels pressure)
    const updatedNpcs = npcDatabase.map((npc) => {
      if (npc.isRival) {
        const rivalRuns = Math.floor(Math.random() * 68) + 8;
        const rivalWkts = Math.random() < 0.45 ? 1 : 0;
        const nextForm = clampAttr(npc.form + (rivalRuns >= 40 ? 3 : -2));
        return {
          ...npc,
          form: nextForm,
          reputation: Math.min(1000, npc.reputation + (rivalRuns >= 45 ? 14 : 4)),
          careerRuns: npc.careerRuns + rivalRuns,
          careerWickets: npc.careerWickets + rivalWkts,
          careerMatches: npc.careerMatches + 1,
        };
      }
      return npc;
    });

    const rivalObj = updatedNpcs.find((n) => n.isRival) || updatedNpcs[0];

    // Check milestones
    const nextMilestones = [...milestonesUnlocked];
    if (runs >= 100 && !nextMilestones.some((m) => m.includes('Century'))) {
      nextMilestones.unshift(
        `Maiden Career Century (${runs}${notOut ? '*' : ''} off ${balls}b vs ${rawOpponentTeam.name})`
      );
    }
    if (wickets >= 5 && !nextMilestones.some((m) => m.includes('5-Wicket'))) {
      nextMilestones.unshift(
        `Maiden 5-Wicket Haul (${wickets}/${runsConceded} vs ${rawOpponentTeam.name})`
      );
    }

    // Calculate Brand Endorsement Payouts
    const endorsementIncome = BRAND_ENDORSEMENTS.filter((e) =>
      activeEndorsementIds.includes(e.id)
    ).reduce((sum, e) => sum + e.payoutPerMatchLakhs, 0);
    const matchFeeLakhs = 2 + stageIndex * 2;

    const updatedPlayer: CareerPlayerProfile = {
      ...player,
      overallRating: updatedOvr,
      peakOverallReached: Math.max(player.peakOverallReached, updatedOvr),
      batting: updatedBatting,
      bowling: updatedBowling,
      mental: {
        ...player.mental,
        form: updatedForm,
        confidence: updatedConfidence,
      },
    };

    const newSocialPosts = buildPostMatchSocialFeed(
      updatedPlayer,
      newPerformance,
      rivalObj,
      nextRep
    );

    const nextPressQ =
      PRESS_CONFERENCE_QUESTIONS[currentWeek % PRESS_CONFERENCE_QUESTIONS.length];
    const nextChoiceEvt =
      NARRATIVE_CHOICE_EVENTS[currentWeek % NARRATIVE_CHOICE_EVENTS.length];

    set({
      player: updatedPlayer,
      weekPhase: 'POST_MATCH_MEDIA',
      reputationScore: nextRep,
      careerFundsLakhs: careerFundsLakhs + matchFeeLakhs + endorsementIncome,
      recentPerformances: updatedRecent,
      careerStats: updatedStats,
      npcDatabase: updatedNpcs,
      socialFeed: newSocialPosts,
      activePressQuestion: nextPressQ,
      pressAnsweredThisWeek: false,
      activeChoiceEvent: nextChoiceEvt,
      choiceEventResolvedThisWeek: false,
      trainingCompletedThisWeek: false,
      milestonesUnlocked: nextMilestones,
      lastSimulatedMatch: matchResult,
    });

    sqliteDb.saveCareerSlot('slot_1', get());
    return matchResult;
  },

  answerPressConference: (optionIndex) => {
    const state = get();
    const { activePressQuestion, reputationScore, selectorRespect, player } = state;
    if (!activePressQuestion || state.pressAnsweredThisWeek) return;

    const chosen = activePressQuestion.options[optionIndex];
    if (!chosen) return;

    set({
      reputationScore: Math.max(0, Math.min(1000, reputationScore + chosen.repDelta)),
      selectorRespect: Math.max(
        0,
        Math.min(100, selectorRespect + chosen.selectorRespectDelta)
      ),
      player: {
        ...player,
        mental: {
          ...player.mental,
          confidence: clampAttr(player.mental.confidence + chosen.confidenceDelta),
        },
      },
      pressAnsweredThisWeek: true,
    });
  },

  resolveChoiceEvent: (choiceIndex) => {
    const state = get();
    const {
      activeChoiceEvent,
      reputationScore,
      careerFundsLakhs,
      selectorRespect,
      player,
    } = state;
    if (!activeChoiceEvent || state.choiceEventResolvedThisWeek) return;

    const chosen = activeChoiceEvent.choices[choiceIndex];
    if (!chosen) return;

    set({
      reputationScore: Math.max(0, Math.min(1000, reputationScore + chosen.repDelta)),
      careerFundsLakhs: Math.max(0, careerFundsLakhs + chosen.fundsDeltaLakhs),
      selectorRespect: Math.max(
        0,
        Math.min(100, selectorRespect + chosen.selectorRespectDelta)
      ),
      player: {
        ...player,
        mental: {
          ...player.mental,
          fitnessLevel: clampAttr(player.mental.fitnessLevel + chosen.fitnessDelta),
          confidence: clampAttr(player.mental.confidence + chosen.confidenceDelta),
        },
      },
      choiceEventResolvedThisWeek: true,
    });
  },

  setTrainingHourAllocation: (categoryId, hours) => {
    const state = get();
    const current = { ...state.weeklyTrainingHours };
    const otherHoursTotal = Object.entries(current)
      .filter(([k]) => k !== categoryId)
      .reduce((acc, [, v]) => acc + v, 0);

    const maxAllowed = Math.max(0, 40 - otherHoursTotal);
    current[categoryId] = Math.min(maxAllowed, Math.max(0, hours));
    set({ weeklyTrainingHours: current });
  },

  commitWeeklyTraining: () => {
    const state = get();
    if (state.trainingCompletedThisWeek) return;

    const {
      player,
      weeklyTrainingHours,
      activeSpecializationId,
      hiredCoachIds,
    } = state;

    const updatedBatting = { ...player.batting };
    const updatedBowling = { ...player.bowling };
    const updatedFielding = { ...player.fielding };
    const updatedMental = { ...player.mental };
    const summaryLogs: string[] = [];

    // Age Curve multiplier (Section 4: 16-20 rapid, 21-24 ascent, 24-30 peak, 33+ decline)
    const ageMultiplier =
      player.age <= 20
        ? 1.35
        : player.age <= 24
        ? 1.15
        : player.age <= 30
        ? 0.9
        : 0.55;

    const hasBatCoach = hiredCoachIds.includes('batting_coach');
    const hasBowlCoach = hiredCoachIds.includes('bowling_coach');
    const hasFitTrainer = hiredCoachIds.includes('fitness_trainer');
    const hasMentalCoach = hiredCoachIds.includes('mental_coach');

    let maxSingleCategoryHours = 0;

    TRAINING_CATEGORIES.forEach((cat) => {
      const hrs = weeklyTrainingHours[cat.id] || 0;
      if (hrs > maxSingleCategoryHours) maxSingleCategoryHours = hrs;
      if (hrs < 3) return;

      let eff = (hrs / 5) * ageMultiplier;
      if (cat.pillar === 'batting' && hasBatCoach) eff *= 1.2;
      if (cat.pillar === 'bowling' && hasBowlCoach) eff *= 1.2;
      if (cat.pillar === 'mental' && hasMentalCoach) eff *= 1.25;

      if (activeSpecializationId === 'power_hitter' && cat.id === 'power_hitting') {
        eff *= 1.5;
      } else if (
        activeSpecializationId === 'technical_anchor' &&
        cat.id === 'batting_nets'
      ) {
        eff *= 1.5;
      } else if (
        activeSpecializationId === 'death_bowler' &&
        cat.id === 'bowling_variations'
      ) {
        eff *= 1.5;
      }

      const primaryGain = Math.max(1, Math.round(eff));
      const secondaryGain = hrs >= 6 ? 1 : 0;

      if (cat.pillar === 'batting') {
        (updatedBatting as any)[cat.primaryKey] = clampAttr(
          (updatedBatting as any)[cat.primaryKey] + primaryGain
        );
        if (secondaryGain > 0) {
          (updatedBatting as any)[cat.secondaryKey] = clampAttr(
            (updatedBatting as any)[cat.secondaryKey] + secondaryGain
          );
        }
      } else if (cat.pillar === 'bowling') {
        (updatedBowling as any)[cat.primaryKey] = clampAttr(
          (updatedBowling as any)[cat.primaryKey] + primaryGain
        );
        if (secondaryGain > 0) {
          (updatedBowling as any)[cat.secondaryKey] = clampAttr(
            (updatedBowling as any)[cat.secondaryKey] + secondaryGain
          );
        }
      } else if (cat.pillar === 'fielding') {
        (updatedFielding as any)[cat.primaryKey] = clampAttr(
          (updatedFielding as any)[cat.primaryKey] + primaryGain
        );
        if (secondaryGain > 0) {
          (updatedFielding as any)[cat.secondaryKey] = clampAttr(
            (updatedFielding as any)[cat.secondaryKey] + secondaryGain
          );
        }
      } else if (cat.pillar === 'mental') {
        if (cat.primaryKey === 'pressureHandling') {
          updatedBatting.pressureHandling = clampAttr(
            updatedBatting.pressureHandling + primaryGain
          );
        } else {
          (updatedMental as any)[cat.primaryKey] = clampAttr(
            (updatedMental as any)[cat.primaryKey] + primaryGain
          );
        }
      }

      summaryLogs.push(`${cat.name} (${hrs}h): +${primaryGain} ${cat.primaryGainLabel}`);
    });

    // Section 9 Constraints: Ignoring fitness causes decline; >35h in one category risks strain
    const fitHours = weeklyTrainingHours.fitness_training || 0;
    if (fitHours === 0) {
      updatedMental.fitnessLevel = clampAttr(updatedMental.fitnessLevel - 3);
      summaryLogs.push('Fitness Warning: 0h allocated to Fitness Conditioning (-3 Fitness Level)');
    }

    if (maxSingleCategoryHours > 35 && !hasFitTrainer) {
      updatedMental.fitnessLevel = clampAttr(updatedMental.fitnessLevel - 8);
      summaryLogs.push(
        'Overtraining Strain (>35h in single drill): Minor muscle strain (-8 Fitness Level)'
      );
    }

    const updatedOvr = calculateOverallRating(
      player.role,
      updatedBatting,
      updatedBowling,
      updatedFielding
    );

    set({
      player: {
        ...player,
        overallRating: updatedOvr,
        peakOverallReached: Math.max(player.peakOverallReached, updatedOvr),
        batting: updatedBatting,
        bowling: updatedBowling,
        fielding: updatedFielding,
        mental: updatedMental,
      },
      trainingCompletedThisWeek: true,
      lastTrainingSummary: summaryLogs,
      weekPhase: 'SELECTION_REVIEW',
    });

    sqliteDb.saveCareerSlot('slot_1', get());
  },

  selectSpecialization: (specId) => set({ activeSpecializationId: specId }),

  hireSpecialistCoach: (coachId) => {
    const state = get();
    const coach = SPECIALIST_COACHES.find((c) => c.id === coachId);
    if (!coach) return;
    if (state.hiredCoachIds.includes(coachId)) return;
    if (state.careerFundsLakhs < coach.costLakhs) return;

    set({
      careerFundsLakhs: state.careerFundsLakhs - coach.costLakhs,
      hiredCoachIds: [...state.hiredCoachIds, coachId],
    });
  },

  signBrandEndorsement: (endorsementId) => {
    const state = get();
    if (state.activeEndorsementIds.includes(endorsementId)) return;
    set({
      activeEndorsementIds: [...state.activeEndorsementIds, endorsementId],
    });
  },

  runIPLAuctionBid: () => {
    const state = get();
    const { player, reputationScore, careerFundsLakhs, milestonesUnlocked } = state;
    const baseBidLakhs = Math.max(20, Math.round((player.overallRating - 60) * 6 + reputationScore * 0.15));
    const winningFranchise =
      IPL_FRANCHISES[Math.floor(Math.random() * IPL_FRANCHISES.length)];

    set({
      player: {
        ...player,
        iplFranchiseId: winningFranchise.id,
        iplContractLakhs: baseBidLakhs,
      },
      careerFundsLakhs: careerFundsLakhs + baseBidLakhs,
      milestonesUnlocked: [
        `IPL Auction Sold to ${winningFranchise.name} for ₹${baseBidLakhs} Lakhs!`,
        ...milestonesUnlocked,
      ],
    });

    return `Sold to ${winningFranchise.name} (${winningFranchise.short}) for ₹${baseBidLakhs} Lakhs!`;
  },

  advanceToNextWeekOrStage: () => {
    const state = get();
    const {
      player,
      stageIndex,
      currentWeek,
      currentSeason,
      reputationScore,
      selectorPersonality,
      selectorRespect,
      npcDatabase,
      milestonesUnlocked,
    } = state;

    const rival = npcDatabase.find((n) => n.isRival) || npcDatabase[0];
    const evalReport = evaluateSelectorFormula(
      player,
      reputationScore,
      selectorPersonality,
      selectorRespect,
      stageIndex,
      rival
    );

    let nextStageIdx = stageIndex;
    const nextMilestones = [...milestonesUnlocked];

    if (evalReport.selectedForNextTier && stageIndex < CAREER_STAGES_CONFIG.length - 1) {
      nextStageIdx = stageIndex + 1;
      const promotedStage = CAREER_STAGES_CONFIG[nextStageIdx];
      nextMilestones.unshift(`Promoted to ${promotedStage.title} (Age ${player.age})`);
    }

    // Every 4 weeks advances 1 calendar year of the career arc so player experiences the full age curve 16 -> 36+
    const nextWeek = currentWeek + 1;
    const shouldAgeUp = nextWeek % 4 === 1;
    const nextAge = shouldAgeUp ? player.age + 1 : player.age;
    const nextSeason = shouldAgeUp ? currentSeason + 1 : currentSeason;

    // Age Curve Decline check (Section 4: Age 33+ attributes slowly decrease unless Fitness Machine)
    const updatedBatting = { ...player.batting };
    const updatedMental = { ...player.mental };
    if (shouldAgeUp && nextAge >= 33 && state.activeSpecializationId !== 'fitness_machine') {
      updatedBatting.power = clampAttr(updatedBatting.power - 1);
      updatedMental.fitnessLevel = clampAttr(updatedMental.fitnessLevel - 2);
    }

    set({
      player: {
        ...player,
        age: nextAge,
        batting: updatedBatting,
        mental: updatedMental,
      },
      stageIndex: nextStageIdx,
      careerStage: CAREER_STAGES_CONFIG[nextStageIdx].title,
      currentWeek: nextWeek,
      currentSeason: nextSeason,
      weekPhase: 'PRE_MATCH',
      milestonesUnlocked: nextMilestones,
    });

    sqliteDb.saveCareerSlot('slot_1', get());
  },

  startDynastyChildCareer: (childFirstName) => {
    const state = get();
    const parent = state.player;
    const cleanFirst = childFirstName.trim() || 'Vivaan';
    const fullName = `${cleanFirst} ${parent.lastName}`;

    // Section 13 Dynasty Mode: Child inherits 20% of parent's peak attributes as starting bonus (+5 to +8)
    const inheritedBonus = Math.max(4, Math.round((parent.peakOverallReached - 65) * 0.2));
    const childAttrs = generateStartingAttributes(
      parent.role,
      parent.battingStyle,
      parent.bowlingStyle,
      inheritedBonus
    );

    const childProfile: CareerPlayerProfile = {
      ...parent,
      firstName: cleanFirst,
      fullName,
      age: 16,
      iplFranchiseId: null,
      iplContractLakhs: 0,
      portraitUri: getPlayerPortraitUri(fullName, '#10B981', parent.jerseyNumber),
      overallRating: childAttrs.overallRating,
      potentialRating: childAttrs.potentialRating,
      peakOverallReached: childAttrs.overallRating,
      batting: childAttrs.batting,
      bowling: childAttrs.bowling,
      fielding: childAttrs.fielding,
      mental: childAttrs.mental,
    };

    set({
      player: childProfile,
      stageIndex: 0,
      careerStage: CAREER_STAGES_CONFIG[0].title,
      currentWeek: 1,
      currentSeason: state.currentSeason + 1,
      weekPhase: 'PRE_MATCH',
      // Starts with higher reputation due to famous parent (Section 13)
      reputationScore: 185,
      dynastyGeneration: state.dynastyGeneration + 1,
      parentLegacyName: parent.fullName,
      careerStats: createEmptyFormatStats(),
      milestonesUnlocked: [
        `Dynasty Gen #${state.dynastyGeneration + 1}: ${fullName} begins career carrying legacy of ${parent.fullName} (+${inheritedBonus} Inherited Bonus)`,
      ],
    });

    sqliteDb.saveCareerSlot('slot_1', get());
  },

  saveToSQLiteSlot: (slotId) => {
    sqliteDb.saveCareerSlot(slotId, get());
  },

  loadFromSQLiteSlot: (slotId) => {
    const saved = sqliteDb.loadCareerSlot(slotId);
    if (!saved) return false;
    set({ ...saved });
    return true;
  },
}));
