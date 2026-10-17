/**
 * ============================================================================
 * COMPLETE NPC ROSTER (100 PLAYERS), TOURNAMENTS, LEGENDS & NARRATIVE EVENTS
 * Implements Sections 6, 7, 8, 9, 10, 11, 12, and 13 of the Design Document.
 * ============================================================================
 */

import { getPlayerPortraitUri, TEAM_CRESTS } from '../assets/nanoBananaAssets';
import type { PlayingRole, BattingStyle, BowlingStyle } from '../store/useCareerStore';

export type NPCArchetype =
  | 'The Prodigy'
  | 'The Late Bloomer'
  | 'The Journeyman'
  | 'The Legend'
  | 'The One Format Wonder'
  | 'The Injury Prone';

export type SelectorPersonality =
  | 'Conservative'
  | 'Form Based'
  | 'Development Focused'
  | 'Political';

export type CoachPersonality =
  | 'Aggressive Tactician'
  | 'Defensive'
  | 'Development Focused';

export interface NPCPlayer {
  id: string;
  name: string;
  age: number;
  nation: string;
  stateTeamId: string;
  iplTeamId: string;
  role: PlayingRole;
  archetype: NPCArchetype;
  battingStyle: BattingStyle;
  bowlingStyle: BowlingStyle;
  overall: number;
  battingSkill: number;
  bowlingSkill: number;
  fieldingSkill: number;
  form: number;
  reputation: number;
  isRival?: boolean;
  jersey: string;
  portraitUri: string;
  careerRuns: number;
  careerWickets: number;
  careerMatches: number;
}

export const INTERNATIONAL_NATIONS = [
  { id: 'IND', name: 'India', color: '#1D4ED8', accent: '#F59E0B', rank: 1 },
  { id: 'AUS', name: 'Australia', color: '#CA8A04', accent: '#15803D', rank: 2 },
  { id: 'ENG', name: 'England', color: '#1E3A8A', accent: '#EF4444', rank: 3 },
  { id: 'RSA', name: 'South Africa', color: '#15803D', accent: '#FACC15', rank: 4 },
  { id: 'NZL', name: 'New Zealand', color: '#111827', accent: '#E2E8F0', rank: 5 },
  { id: 'PAK', name: 'Pakistan', color: '#065F46', accent: '#34D399', rank: 6 },
  { id: 'WI', name: 'West Indies', color: '#7F1D1D', accent: '#FBBF24', rank: 7 },
  { id: 'SL', name: 'Sri Lanka', color: '#1E40AF', accent: '#F59E0B', rank: 8 },
  { id: 'AFG', name: 'Afghanistan', color: '#1D4ED8', accent: '#DC2626', rank: 9 },
  { id: 'BAN', name: 'Bangladesh', color: '#064E3B', accent: '#EF4444', rank: 10 },
  { id: 'ZIM', name: 'Zimbabwe', color: '#991B1B', accent: '#FACC15', rank: 11 },
  { id: 'IRE', name: 'Ireland', color: '#047857', accent: '#A7F3D0', rank: 12 },
  { id: 'SCO', name: 'Scotland', color: '#1E1B4B', accent: '#A855F7', rank: 13 },
];

export const IPL_FRANCHISES = [
  { id: 'MUM_IPL', name: 'Mumbai Indians XI', short: 'MI', color: '#1D4ED8', budgetCr: 95 },
  { id: 'CHE_IPL', name: 'Chennai Super Kings XI', short: 'CSK', color: '#D97706', budgetCr: 90 },
  { id: 'BLR_IPL', name: 'Royal Challengers Bengaluru', short: 'RCB', color: '#991B1B', budgetCr: 92 },
  { id: 'DEL_IPL', name: 'Delhi Capitals XI', short: 'DC', color: '#DC2626', budgetCr: 88 },
  { id: 'KOL_IPL', name: 'Kolkata Knight Riders', short: 'KKR', color: '#4C1D95', budgetCr: 91 },
  { id: 'RAJ_IPL', name: 'Rajasthan Royals XI', short: 'RR', color: '#BE185D', budgetCr: 86 },
  { id: 'HYD_IPL', name: 'Sunrisers Hyderabad', short: 'SRH', color: '#EA580C', budgetCr: 89 },
  { id: 'GUJ_IPL', name: 'Gujarat Titans XI', short: 'GT', color: '#0F172A', budgetCr: 94 },
];

export const CAREER_STAGES_CONFIG = [
  {
    stageNumber: 1,
    id: 'STAGE_1_CLUB',
    title: 'Stage 1 — District & Club Cricket',
    ageRange: '16–17',
    format: 'T20' as const,
    tournamentName: 'Mumbai Giles Shield & District Club T20',
    minRepRequired: 0,
    selectionThreshold: 45,
    description: 'Small maidan crowds and basic facilities. Catch the eye of State Under-19 scouts.',
  },
  {
    stageNumber: 2,
    id: 'STAGE_2_U19_STATE',
    title: 'Stage 2 — State Under-19',
    ageRange: '16–18',
    format: 'ODI' as const,
    tournamentName: 'Vinoo Mankad U19 State One-Day Trophy',
    minRepRequired: 110,
    selectionThreshold: 52,
    description: 'First representative state jersey. Direct competition with your career rival begins.',
  },
  {
    stageNumber: 3,
    id: 'STAGE_3_DOMESTIC',
    title: 'Stage 3 — Ranji Trophy & Syed Mushtaq Ali',
    ageRange: '17–22',
    format: 'TEST' as const,
    tournamentName: 'Ranji Trophy First-Class & Syed Mushtaq Ali T20',
    minRepRequired: 200,
    selectionThreshold: 60,
    description: 'The hardest domestic grind. Multi-day red-ball technique and T20 consistency tested.',
  },
  {
    stageNumber: 4,
    id: 'STAGE_4_IPL',
    title: 'Stage 4 — IPL Franchise League',
    ageRange: '18+',
    format: 'T20' as const,
    tournamentName: 'Indian Premier League (IPL)',
    minRepRequired: 280,
    selectionThreshold: 66,
    description: 'High-visibility franchise T20 under floodlights. 1.5x Reputation multiplier.',
  },
  {
    stageNumber: 5,
    id: 'STAGE_5_U19_WC',
    title: 'Stage 5 — ICC Under-19 World Cup',
    ageRange: '17–19',
    format: 'ODI' as const,
    tournamentName: 'ICC Under-19 Cricket World Cup',
    minRepRequired: 330,
    selectionThreshold: 68,
    description: 'Once-in-a-lifetime youth global tournament. Success fast-tracks India A call-up.',
  },
  {
    stageNumber: 6,
    id: 'STAGE_6_INDIA_A',
    title: 'Stage 6 — India A Shadow Squad',
    ageRange: '19–24',
    format: 'ODI' as const,
    tournamentName: 'India A Overseas Tri-Series & Shadow Tour',
    minRepRequired: 420,
    selectionThreshold: 72,
    description: 'The final stepping stone before the senior national cap.',
  },
  {
    stageNumber: 7,
    id: 'STAGE_7_INTL_DEBUT',
    title: 'Stage 7 — International Debut',
    ageRange: '20–26',
    format: 'T20' as const,
    tournamentName: 'Bilateral International Series (T20I / ODI / Test)',
    minRepRequired: 520,
    selectionThreshold: 76,
    description: 'Pulling on the senior national jersey for the first time.',
  },
  {
    stageNumber: 8,
    id: 'STAGE_8_ESTABLISHED_INTL',
    title: 'Stage 8 — Established International & ICC Events',
    ageRange: '22–32',
    format: 'ODI' as const,
    tournamentName: 'ICC Cricket World Cup & World Test Championship',
    minRepRequired: 650,
    selectionThreshold: 80,
    description: 'Global tournaments, bilateral marathons, and national vice-captaincy.',
  },
  {
    stageNumber: 9,
    id: 'STAGE_9_PEAK_LEGACY',
    title: 'Stage 9 — Career Peak & National Captaincy',
    ageRange: '25–32',
    format: 'TEST' as const,
    tournamentName: 'Border-Gavaskar & ICC Champions Trophy',
    minRepRequired: 780,
    selectionThreshold: 82,
    description: 'Chasing all-time records and leading the nation in World Cup finals.',
  },
  {
    stageNumber: 10,
    id: 'STAGE_10_DECLINE_DYNASTY',
    title: 'Stage 10 — Twilight, Farewell & Dynasty',
    ageRange: '33+',
    format: 'TEST' as const,
    tournamentName: 'Farewell Test Series & Hall of Fame Induction',
    minRepRequired: 850,
    selectionThreshold: 78,
    description: 'Managing fitness decline, choosing your retirement moment, and passing the torch.',
  },
];

// Deterministic procedural generator for 100 localized NPC players (Section 8 & Phase 5)
const INDIAN_FIRST_NAMES = [
  'Vikramaditya', 'Prithvi', 'Ishan', 'Surya', 'Hardik', 'Rohan', 'Krunal', 'Mayank',
  'Jasprit', 'Arjun', 'Kartikeya', 'Yashasvi', 'Shikhar', 'Rishabh', 'Axar', 'Dhruv',
  'Lalit', 'Kuldeep', 'Avesh', 'Khaleel', 'Ishant', 'Devdutt', 'Rajat', 'Karthik',
  'Mahipal', 'Shreyas', 'Prasidh', 'Ruturaj', 'Sai', 'Washington', 'Varun', 'Sandeep',
  'Shubman', 'Abhishek', 'Rinku', 'Tilak', 'Nitish', 'Harshit', 'Arshdeep', 'Ravi',
  'Sarfaraz', 'Musheer', 'Tanush', 'Tushar', 'stranger', 'Yash', 'Akash', 'Mukesh',
  'vesh', 'Cheteshwar', 'Ajinkya',
].map((n) => (n === 'stranger' ? 'angkrish' : n === 'vesh' ? 'Devesh' : n));

const INDIAN_LAST_NAMES = [
  'Rao', 'Deshmukh', 'Kulkarni', 'Vaze', 'Tambe', 'Jadhav', 'Gokhale', 'Markande',
  'Salvi', 'Kamat', 'Sawant', 'Sehgal', 'Bedi', 'Verma', 'Bakshi', 'Gill',
  'Chauhan', 'Rathi', 'Sangwan', 'Kapil', 'Hegde', 'Kadam', 'Gowda', 'Lomror',
  'Cariappa', 'Sundar', 'Iyer', 'Natarajan', 'Chakravarthy', 'Warrier', 'Bishnoi',
  'Nayar', 'Raghuvanshi', 'Porel', 'Jurel', 'wadhera', 'Kotian', 'Dayal', 'Deep',
  'Pujara', 'Rahane', 'Gaikwad', 'Sudharsan', 'Patel', 'Siraj', 'Shami', 'Thakur',
  'Chahar', 'Tripathi', 'Hooda',
].map((n) => n.charAt(0).toUpperCase() + n.slice(1));

const OVERSEAS_PLAYERS: { name: string; nation: string; role: PlayingRole; ovr: number }[] = [
  { name: 'Pat Cummins-watt', nation: 'AUS', role: 'Bowling Allrounder', ovr: 91 },
  { name: 'Travis Head-Clarke', nation: 'AUS', role: 'Specialist Batter', ovr: 90 },
  { name: 'Mitchell Starc-Lee', nation: 'AUS', role: 'Specialist Pace Bowler', ovr: 89 },
  { name: 'Adam Zampa-Hogg', nation: 'AUS', role: 'Specialist Spin Bowler', ovr: 87 },
  { name: 'Harry Brook-Root', nation: 'ENG', role: 'Specialist Batter', ovr: 89 },
  { name: 'Jos Buttler-Stewart', nation: 'ENG', role: 'Wicketkeeper-Batter', ovr: 90 },
  { name: 'Jofra Archer-Wood', nation: 'ENG', role: 'Specialist Pace Bowler', ovr: 89 },
  { name: 'Adil Rashid-Swann', nation: 'ENG', role: 'Specialist Spin Bowler', ovr: 86 },
  { name: 'Kagiso Rabada-Steyn', nation: 'RSA', role: 'Specialist Pace Bowler', ovr: 91 },
  { name: 'Heinrich Klaasen-Boucher', nation: 'RSA', role: 'Wicketkeeper-Batter', ovr: 90 },
  { name: 'Aiden Markram-Kallis', nation: 'RSA', role: 'Batting Allrounder', ovr: 86 },
  { name: 'Kane Williamson-Crowe', nation: 'NZL', role: 'Specialist Batter', ovr: 90 },
  { name: 'Trent Boult-Hadlee', nation: 'NZL', role: 'Specialist Pace Bowler', ovr: 88 },
  { name: 'Rachin Ravindra-Vettori', nation: 'NZL', role: 'Batting Allrounder', ovr: 85 },
  { name: 'Babar Azam-Inzamam', nation: 'PAK', role: 'Specialist Batter', ovr: 88 },
  { name: 'Shaheen Afridi-Akram', nation: 'PAK', role: 'Specialist Pace Bowler', ovr: 89 },
  { name: 'Nicholas Pooran-Lara', nation: 'WI', role: 'Wicketkeeper-Batter', ovr: 88 },
  { name: 'Andre Russell-Garner', nation: 'WI', role: 'Bowling Allrounder', ovr: 87 },
  { name: 'Wanindu Hasaranga-Murali', nation: 'SL', role: 'Bowling Allrounder', ovr: 87 },
  { name: 'Matheesha Pathirana-Vaas', nation: 'SL', role: 'Specialist Pace Bowler', ovr: 85 },
  { name: 'Rashid Khan-Nabi', nation: 'AFG', role: 'Bowling Allrounder', ovr: 92 },
  { name: 'Rahmanullah Gurbaz', nation: 'AFG', role: 'Wicketkeeper-Batter', ovr: 84 },
  { name: 'Shakib Al-Hasan', nation: 'BAN', role: 'Batting Allrounder', ovr: 85 },
  { name: 'Mustafizur Rahman', nation: 'BAN', role: 'Specialist Pace Bowler', ovr: 83 },
  { name: 'Sikandar Raza-Flower', nation: 'ZIM', role: 'Batting Allrounder', ovr: 84 },
  { name: 'Josh Little-O’Brien', nation: 'IRE', role: 'Specialist Pace Bowler', ovr: 81 },
  { name: 'Brandon McMullen', nation: 'SCO', role: 'Batting Allrounder', ovr: 79 },
];

const ARCHETYPES: NPCArchetype[] = [
  'The Prodigy',
  'The Late Bloomer',
  'The Journeyman',
  'The Legend',
  'The One Format Wonder',
  'The Injury Prone',
];

const ROLES_LIST: PlayingRole[] = [
  'Specialist Batter',
  'Specialist Pace Bowler',
  'Specialist Spin Bowler',
  'Batting Allrounder',
  'Bowling Allrounder',
  'Wicketkeeper-Batter',
];

const STATE_IDS = ['MUM', 'DEL', 'BLR', 'CHE'];

export function generateInitialNPCDatabase(): NPCPlayer[] {
  const npcs: NPCPlayer[] = [];

  // #1: The Primary Career Rival (Vikramaditya Rao)
  npcs.push({
    id: 'npc-rival-1',
    name: 'Vikramaditya Rao',
    age: 16,
    nation: 'IND',
    stateTeamId: 'DEL',
    iplTeamId: 'DEL_IPL',
    role: 'Batting Allrounder',
    archetype: 'The Prodigy',
    battingStyle: 'Number 3 Anchor',
    bowlingStyle: 'Off Spin (right arm)',
    overall: 78,
    battingSkill: 81,
    bowlingSkill: 66,
    fieldingSkill: 79,
    form: 85,
    reputation: 155,
    isRival: true,
    jersey: '07',
    portraitUri: getPlayerPortraitUri('Vikramaditya Rao', '#EF4444', '07'),
    careerRuns: 148,
    careerWickets: 4,
    careerMatches: 3,
  });

  // #2 to #73: 72 Indian Domestic & International NPCs
  for (let i = 1; i <= 72; i++) {
    const fName = INDIAN_FIRST_NAMES[i % INDIAN_FIRST_NAMES.length];
    const lName = INDIAN_LAST_NAMES[(i * 7 + 3) % INDIAN_LAST_NAMES.length];
    const fullName = `${fName} ${lName}`;
    const role = ROLES_LIST[i % ROLES_LIST.length];
    const archetype = ARCHETYPES[i % ARCHETYPES.length];
    const stateTeamId = STATE_IDS[i % STATE_IDS.length];
    const iplTeamId = IPL_FRANCHISES[i % IPL_FRANCHISES.length].id;
    const age = 16 + ((i * 3) % 20); // Spread ages 16-35

    const baseOvr =
      archetype === 'The Legend'
        ? 85 + (i % 8)
        : archetype === 'The Prodigy'
        ? 76 + (i % 10)
        : 66 + (i % 16);

    const isBatter =
      role === 'Specialist Batter' ||
      role === 'Batting Allrounder' ||
      role === 'Wicketkeeper-Batter';
    const isBowler =
      role === 'Specialist Pace Bowler' ||
      role === 'Specialist Spin Bowler' ||
      role === 'Bowling Allrounder';

    const battingSkill = isBatter ? baseOvr + 3 : Math.max(32, baseOvr - 24);
    const bowlingSkill = isBowler
      ? baseOvr + 3
      : role === 'Batting Allrounder'
      ? baseOvr - 6
      : 28;

    const jersey = String(10 + (i % 89));

    npcs.push({
      id: `npc-ind-${i + 1}`,
      name: fullName,
      age,
      nation: 'IND',
      stateTeamId,
      iplTeamId,
      role,
      archetype,
      battingStyle: isBatter ? 'Middle Order Aggressor' : 'Tail End Slogger',
      bowlingStyle:
        role === 'Specialist Spin Bowler'
          ? 'Leg Spin / Googly'
          : isBowler
          ? 'Fast Medium (130-145 kmph)'
          : 'None',
      overall: baseOvr,
      battingSkill,
      bowlingSkill,
      fieldingSkill: 70 + (i % 18),
      form: 62 + ((i * 5) % 34),
      reputation: age * 18 + (baseOvr - 60) * 12,
      isRival: false,
      jersey,
      portraitUri: getPlayerPortraitUri(fullName, '#3B82F6', jersey),
      careerRuns: (age - 15) * (isBatter ? 410 : 85),
      careerWickets: (age - 15) * (isBowler ? 24 : 2),
      careerMatches: (age - 15) * 14,
    });
  }

  // #74 to #100: 27 International Star NPCs across all 13 nations
  OVERSEAS_PLAYERS.forEach((op, idx) => {
    const num = 74 + idx;
    const isBatter =
      op.role === 'Specialist Batter' ||
      op.role === 'Batting Allrounder' ||
      op.role === 'Wicketkeeper-Batter';
    const isBowler =
      op.role === 'Specialist Pace Bowler' ||
      op.role === 'Specialist Spin Bowler' ||
      op.role === 'Bowling Allrounder';
    const jersey = String(11 + (idx * 3) % 85);

    npcs.push({
      id: `npc-intl-${num}`,
      name: op.name,
      age: 23 + (idx % 10),
      nation: op.nation,
      stateTeamId: 'INTL',
      iplTeamId: IPL_FRANCHISES[idx % IPL_FRANCHISES.length].id,
      role: op.role,
      archetype: idx % 3 === 0 ? 'The Legend' : 'The Prodigy',
      battingStyle: isBatter ? 'Aggressive Opener' : 'Tail End Slogger',
      bowlingStyle: isBowler ? 'Express Pace (145+ kmph)' : 'None',
      overall: op.ovr,
      battingSkill: isBatter ? op.ovr + 2 : 45,
      bowlingSkill: isBowler ? op.ovr + 2 : 35,
      fieldingSkill: 82,
      form: 75 + (idx % 20),
      reputation: 680 + (idx % 250),
      isRival: false,
      jersey,
      portraitUri: getPlayerPortraitUri(op.name, '#10B981', jersey),
      careerRuns: isBatter ? 3400 + idx * 190 : 540,
      careerWickets: isBowler ? 145 + idx * 9 : 12,
      careerMatches: 95 + idx * 4,
    });
  });

  return npcs;
}

// Section 9: 8 Weekly Training Categories
export interface TrainingCategoryConfig {
  id: string;
  name: string;
  primaryGainLabel: string;
  secondaryGainLabel: string;
  primaryKey: string;
  secondaryKey: string;
  pillar: 'batting' | 'bowling' | 'fielding' | 'mental';
}

export const TRAINING_CATEGORIES: TrainingCategoryConfig[] = [
  {
    id: 'batting_nets',
    name: 'Batting Nets',
    primaryGainLabel: 'Technique & Timing',
    secondaryGainLabel: 'Consistency',
    primaryKey: 'technique',
    secondaryKey: 'consistency',
    pillar: 'batting',
  },
  {
    id: 'power_hitting',
    name: 'Power Hitting Drills',
    primaryGainLabel: 'Power',
    secondaryGainLabel: 'Aggression',
    primaryKey: 'power',
    secondaryKey: 'aggression',
    pillar: 'batting',
  },
  {
    id: 'bowling_workouts',
    name: 'Bowling Workouts',
    primaryGainLabel: 'Primary Bowling Skill',
    secondaryGainLabel: 'Accuracy',
    primaryKey: 'primarySkill',
    secondaryKey: 'accuracy',
    pillar: 'bowling',
  },
  {
    id: 'bowling_variations',
    name: 'Bowling Variations',
    primaryGainLabel: 'Variation & Movement',
    secondaryGainLabel: 'Wicket Taking',
    primaryKey: 'variation',
    secondaryKey: 'wicketTaking',
    pillar: 'bowling',
  },
  {
    id: 'fitness_training',
    name: 'Fitness Conditioning',
    primaryGainLabel: 'Fitness Level',
    secondaryGainLabel: 'Recovery Rate & Stamina',
    primaryKey: 'fitnessLevel',
    secondaryKey: 'recoveryRate',
    pillar: 'mental',
  },
  {
    id: 'fielding_drills',
    name: 'Fielding Drills',
    primaryGainLabel: 'Catching & Ground Fielding',
    secondaryGainLabel: 'Athleticism',
    primaryKey: 'catching',
    secondaryKey: 'athleticism',
    pillar: 'fielding',
  },
  {
    id: 'mental_coaching',
    name: 'Mental Conditioning',
    primaryGainLabel: 'Pressure Handling',
    secondaryGainLabel: 'Confidence',
    primaryKey: 'pressureHandling',
    secondaryKey: 'confidence',
    pillar: 'mental',
  },
  {
    id: 'leadership_sessions',
    name: 'Tactical & Leadership',
    primaryGainLabel: 'Leadership',
    secondaryGainLabel: 'Big Match Temperament',
    primaryKey: 'leadership',
    secondaryKey: 'bigMatchTemperament',
    pillar: 'mental',
  },
];

// Section 9: Mid-Career Specialization Paths
export const SPECIALIZATION_PATHS = [
  {
    id: 'power_hitter',
    name: 'Power Hitter',
    bonusText: '+50% Power & Aggression training efficiency',
    minAge: 18,
  },
  {
    id: 'technical_anchor',
    name: 'Technical Anchor',
    bonusText: '+50% Technique & Consistency training efficiency',
    minAge: 18,
  },
  {
    id: 'death_bowler',
    name: 'Death Over Specialist',
    bonusText: '+50% Death Bowling & Variation training efficiency',
    minAge: 18,
  },
  {
    id: 'spinners_nightmare',
    name: "Spinner's Nightmare",
    bonusText: '+50% Vs Spin & Timing development speed',
    minAge: 18,
  },
  {
    id: 'fitness_machine',
    name: 'Fitness Machine',
    bonusText: 'Maintains physical peak past Age 32 & +50% Fitness efficiency',
    minAge: 18,
  },
];

// Section 9: Specialist Coaching Staff Hires
export const SPECIALIST_COACHES = [
  {
    id: 'batting_coach',
    name: 'Wasim Jaffer-Roy (Batting Consultant)',
    role: 'Batting Coach',
    benefit: '+20% Batting training efficiency',
    costLakhs: 12,
    minRep: 150,
  },
  {
    id: 'bowling_coach',
    name: 'Zaheer Agarkar (Pace & Spin Guru)',
    role: 'Bowling Coach',
    benefit: '+20% Bowling training efficiency',
    costLakhs: 12,
    minRep: 150,
  },
  {
    id: 'fitness_trainer',
    name: 'Shankar Basu-K (High Performance)',
    role: 'Fitness Trainer',
    benefit: 'Reduces overtraining injury risk by 30%',
    costLakhs: 10,
    minRep: 120,
  },
  {
    id: 'mental_coach',
    name: 'Paddy Upton-Sen (Mindset Coach)',
    role: 'Mental Coach',
    benefit: 'Pressure handling & confidence develop 25% faster',
    costLakhs: 15,
    minRep: 220,
  },
];

// Section 11: Brand Endorsement Tiers
export const BRAND_ENDORSEMENTS = [
  {
    id: 'local_blade',
    brandName: 'Shivaji Willow Works',
    tier: 'Local Sports Brand',
    minRep: 200,
    payoutPerMatchLakhs: 2,
    description: 'Local bat sticker sponsorship for emerging state players.',
  },
  {
    id: 'national_energy',
    brandName: 'BharatStride Athletics',
    tier: 'National Brand',
    minRep: 400,
    payoutPerMatchLakhs: 6,
    description: 'National television campaign and footwear deal.',
  },
  {
    id: 'major_beverage',
    brandName: 'Apex Volt Beverages',
    tier: 'Major Brand Deal',
    minRep: 600,
    payoutPerMatchLakhs: 15,
    description: 'Prime-time IPL commercial billboards across India.',
  },
  {
    id: 'global_luxury',
    brandName: 'Chronos Geneva & Global',
    tier: 'Global Brand Icon',
    minRep: 800,
    payoutPerMatchLakhs: 35,
    description: 'Global ambassador contract reserved for generational legends.',
  },
];

// Section 11: Press Conference Question Bank
export interface PressQuestion {
  id: string;
  reporter: string;
  outlet: string;
  question: string;
  options: {
    label: string;
    effectSummary: string;
    repDelta: number;
    confidenceDelta: number;
    selectorRespectDelta: number;
  }[];
}

export const PRESS_CONFERENCE_QUESTIONS: PressQuestion[] = [
  {
    id: 'pc-1',
    reporter: 'Harsha Sengupta',
    outlet: 'CricPulse India',
    question:
      'Selectors are watching every innings closely this season. How are you approaching the competition with Vikramaditya Rao for the next squad call-up?',
    options: [
      {
        label: '"I am focused strictly on my own process and putting runs on the board for my team."',
        effectSummary: '+8 Reputation · +5 Selector Respect',
        repDelta: 8,
        confidenceDelta: 3,
        selectorRespectDelta: 5,
      },
      {
        label: '"My strike rate and match impact speak louder than anyone else in the domestic circuit."',
        effectSummary: '+12 Confidence · -4 Selector Respect (Bold)',
        repDelta: 4,
        confidenceDelta: 12,
        selectorRespectDelta: -4,
      },
      {
        label: '"Vikramaditya is a fine player; healthy competition pushes Indian cricket forward."',
        effectSummary: '+6 Reputation · +8 Selector Respect',
        repDelta: 6,
        confidenceDelta: 2,
        selectorRespectDelta: 8,
      },
      {
        label: 'Decline to comment and walk past the mixed zone.',
        effectSummary: 'Neutral (0 change)',
        repDelta: 0,
        confidenceDelta: 0,
        selectorRespectDelta: 0,
      },
    ],
  },
  {
    id: 'pc-2',
    reporter: 'Vikrant Chopra',
    outlet: 'SportsDesk Live',
    question:
      'Critics on social media questioned your shot selection under pressure today. What is your response?',
    options: [
      {
        label: '"I agree there are areas to tighten up. I will be in the nets first thing tomorrow."',
        effectSummary: '+10 Selector Respect · +4 Reputation',
        repDelta: 4,
        confidenceDelta: 2,
        selectorRespectDelta: 10,
      },
      {
        label: '"I would like to see the armchair critics face 145 kmph under floodlights."',
        effectSummary: '-12 Reputation · +10 Fan Entertainment & Confidence',
        repDelta: -12,
        confidenceDelta: 10,
        selectorRespectDelta: -8,
      },
      {
        label: '"Modern cricket demands fearless intent. I back my natural game 100 percent."',
        effectSummary: '+6 Reputation · +6 Confidence',
        repDelta: 6,
        confidenceDelta: 6,
        selectorRespectDelta: 2,
      },
      {
        label: '"No comment on outside noise."',
        effectSummary: 'Neutral',
        repDelta: 0,
        confidenceDelta: 0,
        selectorRespectDelta: 0,
      },
    ],
  },
];

// Section 12: Interesting Choice Events (Career Defining, Personal Life & Controversy)
export interface NarrativeChoiceEvent {
  id: string;
  category: 'Career Defining' | 'Personal Life' | 'Controversy';
  title: string;
  description: string;
  choices: {
    label: string;
    consequenceText: string;
    repDelta: number;
    fundsDeltaLakhs: number;
    fitnessDelta: number;
    confidenceDelta: number;
    selectorRespectDelta: number;
  }[];
}

export const NARRATIVE_CHOICE_EVENTS: NarrativeChoiceEvent[] = [
  {
    id: 'evt-corrupt-approach',
    category: 'Controversy',
    title: 'Suspicious Bookmaker Approach in Team Hotel',
    description:
      'A stranger claiming to be a "private sports investor" approaches you in the hotel lobby before a televised T20 match, offering ₹25 Lakhs solely to bowl or bat a predetermined slow over.',
    choices: [
      {
        label: 'Refuse immediately and report to the Anti-Corruption Unit',
        consequenceText: '+35 Reputation · +20 Selector Respect · Integrity praised nationwide',
        repDelta: 35,
        fundsDeltaLakhs: 0,
        fitnessDelta: 0,
        confidenceDelta: 8,
        selectorRespectDelta: 20,
      },
      {
        label: 'Refuse silently and cut off contact without filing a report',
        consequenceText: '-5 Confidence (Lingering stress) · 0 Reputation change',
        repDelta: 0,
        fundsDeltaLakhs: 0,
        fitnessDelta: 0,
        confidenceDelta: -5,
        selectorRespectDelta: -2,
      },
    ],
  },
  {
    id: 'evt-ipl-vs-national',
    category: 'Career Defining',
    title: 'Franchise Camp vs India A Red-Ball Conditioning',
    description:
      'Your IPL franchise requests you attend a high-paying promotional & T20 power-hitting camp during the exact week the National Cricket Academy is holding a red-ball shadow camp.',
    choices: [
      {
        label: 'Prioritize National Cricket Academy Red-Ball Camp',
        consequenceText: '+22 Selector Respect · +15 Reputation · National selectors impressed',
        repDelta: 15,
        fundsDeltaLakhs: 0,
        fitnessDelta: -4,
        confidenceDelta: 6,
        selectorRespectDelta: 22,
      },
      {
        label: 'Attend the IPL Franchise Commercial & T20 Camp',
        consequenceText: '+18 Lakhs Earnings · +8 Reputation · -10 Selector Respect',
        repDelta: 8,
        fundsDeltaLakhs: 18,
        fitnessDelta: 2,
        confidenceDelta: 5,
        selectorRespectDelta: -10,
      },
    ],
  },
  {
    id: 'evt-senior-mentor',
    category: 'Career Defining',
    title: 'Veteran International Offers 1-on-1 Mentorship',
    description:
      'A retired Indian Test legend visiting the dressing room notices your footwork and invites you for an intensive private week of technical adjustments.',
    choices: [
      {
        label: 'Accept the Senior Legend’s Mentorship wholeheartedly',
        consequenceText: '+12 Confidence · +10 Reputation · +8 Selector Respect',
        repDelta: 10,
        fundsDeltaLakhs: 0,
        fitnessDelta: -3,
        confidenceDelta: 12,
        selectorRespectDelta: 8,
      },
      {
        label: 'Politely decline and stick to your own natural technique',
        consequenceText: '+5 Confidence (Self-belief) · -3 Selector Respect',
        repDelta: 0,
        fundsDeltaLakhs: 0,
        fitnessDelta: 4,
        confidenceDelta: 5,
        selectorRespectDelta: -3,
      },
    ],
  },
  {
    id: 'evt-injury-crunch',
    category: 'Personal Life',
    title: 'Hamstring Tightness Before Crucial Knockout Fixture',
    description:
      'The team physio warns that your hamstring load is in the red zone. Playing through the pain could cement your spot, or risk a tear.',
    choices: [
      {
        label: 'Take a Painkiller Injection & Play Through the Pain',
        consequenceText: '+15 Reputation · +10 Selector Respect · -14 Fitness Level',
        repDelta: 15,
        fundsDeltaLakhs: 0,
        fitnessDelta: -14,
        confidenceDelta: 6,
        selectorRespectDelta: 10,
      },
      {
        label: 'Follow Physio Protocol & Rest Recovery Week',
        consequenceText: '+16 Fitness Level · -5 Reputation (Rival gets extra limelight)',
        repDelta: -5,
        fundsDeltaLakhs: 0,
        fitnessDelta: 16,
        confidenceDelta: 0,
        selectorRespectDelta: 2,
      },
    ],
  },
  {
    id: 'evt-charity-gala',
    category: 'Personal Life',
    title: 'Grassroots Maidan Cricket Foundation Gala',
    description:
      'You are invited to sponsor kit bags for under-privileged U14 club cricketers at your childhood maidan.',
    choices: [
      {
        label: 'Donate ₹5 Lakhs and host a youth clinic',
        consequenceText: '+24 Reputation · +8 Confidence · -5 Lakhs Funds',
        repDelta: 24,
        fundsDeltaLakhs: -5,
        fitnessDelta: 0,
        confidenceDelta: 8,
        selectorRespectDelta: 6,
      },
      {
        label: 'Send signed bats and stay focused on recovery',
        consequenceText: '+6 Reputation · +4 Fitness Level',
        repDelta: 6,
        fundsDeltaLakhs: 0,
        fitnessDelta: 4,
        confidenceDelta: 2,
        selectorRespectDelta: 0,
      },
    ],
  },
];

// Section 13: Historical Legends Benchmarks for Career Comparison
export const HISTORICAL_LEGENDS = [
  {
    name: 'Sachin Tendulkar',
    era: '1989–2013',
    role: 'Specialist Batter',
    careerRuns: 34357,
    careerWickets: 201,
    centuries: 100,
    summary: 'The God of Cricket — unmatched longevity from age 16 to 40.',
  },
  {
    name: 'Virat Kohli',
    era: '2008–Present',
    role: 'Specialist Batter',
    careerRuns: 27000,
    careerWickets: 9,
    centuries: 80,
    summary: 'The ultimate modern run-chase master across all three formats.',
  },
  {
    name: 'MS Dhoni',
    era: '2004–2020',
    role: 'Wicketkeeper-Batter',
    careerRuns: 17266,
    careerWickets: 1,
    centuries: 16,
    summary: 'Ice-cold finisher and the only captain to win all three ICC white-ball trophies.',
  },
  {
    name: 'Kapil Dev',
    era: '1978–1994',
    role: 'Bowling Allrounder',
    careerRuns: 9031,
    careerWickets: 687,
    centuries: 9,
    summary: 'India’s greatest pace-bowling allrounder and 1983 World Cup winning captain.',
  },
  {
    name: 'Anil Kumble',
    era: '1990–2008',
    role: 'Specialist Spin Bowler',
    careerRuns: 3445,
    careerWickets: 956,
    centuries: 1,
    summary: 'Relentless leg-spinner who claimed 956 international wickets with pure grit.',
  },
  {
    name: 'Rahul Dravid',
    era: '1996–2012',
    role: 'Specialist Batter',
    careerRuns: 24208,
    careerWickets: 5,
    centuries: 48,
    summary: 'The Wall — 31,258 balls faced in Test cricket with supreme technique.',
  },
];
