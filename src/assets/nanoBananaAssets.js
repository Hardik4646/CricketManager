/**
 * ============================================================================
 * VISUAL ASSET MANIFEST & NANO BANANA AI GENERATION GUIDE
 * ============================================================================
 *
 * When replacing the embedded vector data URIs below with custom raster assets
 * in your Expo / React Native build (`assets/images/`), follow these specific
 * Nano Banana AI generator recommendations:
 *
 * 1. STADIUM BACKGROUNDS & TEAM CRESTS -> Use **Nano Banana Pro**
 *    - Recommended for demanding detail, high-resolution work, and polished
 *      metallic team crests or floodlit stadium backgrounds.
 *    - Example Prompt (Stadium): "Floodlit Indian cricket stadium at night,
 *      packed lower and upper tiers, emerald turf pitch, dramatic broadcast
 *      atmosphere, 8k dark slate aesthetic."
 *
 * 2. PLAYER PORTRAITS (CAREER AVATARS & RIVAL NPCs) -> Use **Nanobana platform
 *    (nanobana.net)** or **Nano Bana (nanaimg.io)**
 *    - Recommended for strict character consistency when generating player
 *      portraits across age curves (Age 16 Club Youth -> Age 28 International
 *      Peak -> Age 35 Veteran) and across different kit jerseys.
 *
 * 3. UI ICONS, ROLE BADGES & PITCH INDICATORS -> Use **Nano Banana 2**
 *    - Recommended for fast creation of clean UI icons, cricket ball condition
 *      markers, and basic tactical references.
 * ============================================================================
 */

const createSvgDataUri = (svgString) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;

/**
 * [NANO BANANA PRO ASSET SLOT]: Stadium Header Background
 * Replace with high-resolution 16:9 stadium render generated via Nano Banana Pro.
 */
export const STADIUM_BACKGROUNDS = {
  wankhedeNight: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 480" width="1440" height="480">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#070B12"/>
          <stop offset="60%" stop-color="#0F172A"/>
          <stop offset="100%" stop-color="#06281E"/>
        </linearGradient>
        <radialGradient id="floodlightLeft" cx="18%" cy="15%" r="45%">
          <stop offset="0%" stop-color="#F8FAFC" stop-opacity="0.28"/>
          <stop offset="40%" stop-color="#38BDF8" stop-opacity="0.09"/>
          <stop offset="100%" stop-color="#0F172A" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="floodlightRight" cx="82%" cy="15%" r="45%">
          <stop offset="0%" stop-color="#F8FAFC" stop-opacity="0.28"/>
          <stop offset="40%" stop-color="#F59E0B" stop-opacity="0.09"/>
          <stop offset="100%" stop-color="#0F172A" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="turf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#064E3B" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#0B0F17" stop-opacity="0.95"/>
        </linearGradient>
      </defs>
      <rect width="1440" height="480" fill="url(#sky)"/>
      <rect width="1440" height="480" fill="url(#floodlightLeft)"/>
      <rect width="1440" height="480" fill="url(#floodlightRight)"/>
      <ellipse cx="720" cy="430" rx="680" ry="110" fill="url(#turf)"/>
      <path d="M 80 340 Q 720 260 1360 340 L 1440 410 L 0 410 Z" fill="#1E293B" fill-opacity="0.45"/>
      <ellipse cx="720" cy="425" rx="480" ry="60" fill="none" stroke="#10B981" stroke-opacity="0.22" stroke-width="1.5" stroke-dasharray="6 6"/>
      <rect x="695" y="395" width="50" height="60" rx="2" fill="#D97706" fill-opacity="0.22" stroke="#F59E0B" stroke-opacity="0.35"/>
    </svg>
  `),
};

/**
 * [NANO BANANA PRO ASSET SLOT]: Team Crests
 * Generate high-detail metallic vector shields in Nano Banana Pro (1:1 aspect ratio).
 */
export const TEAM_CRESTS = {
  MUM: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="mumShield" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1E3A8A"/>
          <stop offset="100%" stop-color="#0F172A"/>
        </linearGradient>
      </defs>
      <path d="M60 8 L104 24 L104 62 C104 88 84 106 60 114 C36 106 16 88 16 62 L16 24 Z" fill="url(#mumShield)" stroke="#F59E0B" stroke-width="4"/>
      <path d="M60 18 L94 31 L94 60 C94 81 78 96 60 103 C42 96 26 81 26 60 L26 31 Z" fill="none" stroke="#60A5FA" stroke-opacity="0.4" stroke-width="1.5"/>
      <polygon points="65,30 42,64 58,64 53,92 78,56 62,56" fill="#F59E0B"/>
    </svg>
  `),
  DEL: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="delShield" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#991B1B"/>
          <stop offset="100%" stop-color="#0F172A"/>
        </linearGradient>
      </defs>
      <path d="M60 8 L104 24 L104 62 C104 88 84 106 60 114 C36 106 16 88 16 62 L16 24 Z" fill="url(#delShield)" stroke="#E2E8F0" stroke-width="4"/>
      <path d="M60 18 L94 31 L94 60 C94 81 78 96 60 103 C42 96 26 81 26 60 L26 31 Z" fill="none" stroke="#F87171" stroke-opacity="0.4" stroke-width="1.5"/>
      <circle cx="60" cy="60" r="20" fill="#EF4444" stroke="#F8FAFC" stroke-width="2.5"/>
      <path d="M46 46 Q60 60 46 74 M74 46 Q60 60 74 74" fill="none" stroke="#F8FAFC" stroke-width="2" stroke-dasharray="3 2"/>
    </svg>
  `),
  BLR: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="blrShield" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#7F1D1D"/>
          <stop offset="100%" stop-color="#111827"/>
        </linearGradient>
      </defs>
      <path d="M60 8 L104 24 L104 62 C104 88 84 106 60 114 C36 106 16 88 16 62 L16 24 Z" fill="url(#blrShield)" stroke="#FBBF24" stroke-width="4"/>
      <polygon points="60,28 70,50 92,52 75,68 80,90 60,78 40,90 45,68 28,52 50,50" fill="#FBBF24"/>
    </svg>
  `),
  CHE: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="cheShield" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#B45309"/>
          <stop offset="100%" stop-color="#0F172A"/>
        </linearGradient>
      </defs>
      <path d="M60 8 L104 24 L104 62 C104 88 84 106 60 114 C36 106 16 88 16 62 L16 24 Z" fill="url(#cheShield)" stroke="#FDE047" stroke-width="4"/>
      <path d="M40 76 L46 44 L60 58 L74 44 L80 76 Z" fill="#FDE047"/>
    </svg>
  `),
};

/**
 * [NANOBANA.NET / NANAIMG.IO ASSET SLOT]: Player Portrait Generator
 * Use Nanobana platform (nanobana.net) or Nano Bana (nanaimg.io) to maintain
 * facial & character consistency for the user's custom career protagonist and
 * rival NPCs across seasons.
 */
export function getPlayerPortraitUri(name, primaryColor = '#3B82F6', jerseyNumber = '18') {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="18" fill="#0F172A"/>
      <circle cx="60" cy="44" r="22" fill="#334155" stroke="${primaryColor}" stroke-width="2"/>
      <path d="M22 112 C22 82 40 72 60 72 C80 72 98 82 98 112 Z" fill="${primaryColor}" fill-opacity="0.88"/>
      <text x="60" y="51" text-anchor="middle" fill="#F8FAFC" font-family="sans-serif" font-weight="700" font-size="16">${initials}</text>
      <text x="60" y="102" text-anchor="middle" fill="#0F172A" font-family="monospace" font-weight="700" font-size="13">#${jerseyNumber}</text>
    </svg>
  `);
}

/**
 * [NANO BANANA 2 ASSET SLOT]: Fast UI Icons & Tactical Role Reference Badges
 * Generate lightweight role icons and pitch weather glyphs using Nano Banana 2.
 */
export const ROLE_ICON_METADATA = {
  'Specialist Batter': { code: 'BAT', accent: '#38BDF8' },
  'Specialist Pace Bowler': { code: 'PACE', accent: '#F43F5E' },
  'Specialist Spin Bowler': { code: 'SPIN', accent: '#A855F7' },
  'Batting Allrounder': { code: 'B-AR', accent: '#10B981' },
  'Bowling Allrounder': { code: 'W-AR', accent: '#F59E0B' },
  'Wicketkeeper-Batter': { code: 'WK', accent: '#EAB308' },
};
