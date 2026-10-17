/**
 * ============================================================================
 * MULTI-FORMAT MATCH SIMULATION ENGINE (Pure JavaScript Class)
 * Implements Section 5 & Section 15 of Cricket_Career_Game_Design_2.md
 * Supports:
 * - T20 (20 overs, 120 balls, high intent, Powerplay 1-6, Death 16-20)
 * - ODI (50 overs, 300 balls, Powerplay 1-10, Middle 11-40, Death 41-50)
 * - TEST / First-Class (Day 1-5 pitch deterioration, patience rewarded, Pink Ball)
 * ============================================================================
 */

export const OUTCOME = {
  WICKET: 'WICKET',
  DOT: 'DOT',
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  SIX: 6,
  EXTRA: 'EXTRA',
};

export class MatchEngine {
  /**
   * @param {Object} team1 - Home / First team object with 11 players
   * @param {Object} team2 - Away / Second team object with 11 players
   * @param {string} format - Match format ('T20' | 'ODI' | 'TEST')
   * @param {Object} pitch - Pitch characteristics (pitchFactor, spinAssist, paceAssist, venue, name)
   * @param {Object} conditions - Environmental & crowd modifiers (dewPresent, crowdAdvantage, userTacticalStance, pinkBall, testDay)
   */
  constructor(team1, team2, format = 'T20', pitch = {}, conditions = {}) {
    this.team1 = team1;
    this.team2 = team2;
    this.format = format;
    this.maxOvers = format === 'T20' ? 20 : format === 'ODI' ? 50 : 65;
    this.maxBowlerOvers = format === 'T20' ? 4 : format === 'ODI' ? 10 : 22;

    this.pitch = {
      name: pitch.name || 'Wankhede True Bounce',
      venue: pitch.venue || team1.homeGround || 'Wankhede Arena, Mumbai',
      pitchFactor: pitch.pitchFactor ?? 52,
      spinAssist: pitch.spinAssist ?? 48,
      paceAssist: pitch.paceAssist ?? 58,
    };

    this.conditions = {
      dewPresent: conditions.dewPresent ?? (format !== 'TEST'),
      pinkBall: conditions.pinkBall ?? false,
      crowdAdvantage: conditions.crowdAdvantage ?? 'home',
      userTacticalStance: conditions.userTacticalStance ?? 'balanced',
    };
  }

  /**
   * Simulates the toss with home advantage factor and returns full match result
   */
  simulateMatch() {
    const tossWinner = Math.random() < 0.52 ? this.team1 : this.team2;
    const tossLoser = tossWinner.id === this.team1.id ? this.team2 : this.team1;
    const electToBowl =
      this.format === 'TEST'
        ? Math.random() < 0.25
        : this.conditions.dewPresent
        ? Math.random() < 0.65
        : Math.random() < 0.45;

    const firstBattingTeam = electToBowl ? tossLoser : tossWinner;
    const firstBowlingTeam = electToBowl ? tossWinner : tossLoser;

    const tossSummary = `${tossWinner.name} won the toss and elected to ${
      electToBowl ? 'bowl' : 'bat'
    } first (${this.format} Format).`;

    const innings1 = this.simulateInnings(firstBattingTeam, firstBowlingTeam, null, 1);
    const target = innings1.totalRuns + 1;
    const innings2 = this.simulateInnings(firstBowlingTeam, firstBattingTeam, target, 2);

    const matchResult = this.evaluateMatchWinner(
      firstBattingTeam,
      firstBowlingTeam,
      innings1,
      innings2,
      target
    );

    const playerOfTheMatch = this.selectPlayerOfTheMatch(
      firstBattingTeam,
      firstBowlingTeam,
      innings1,
      innings2,
      matchResult.winnerId
    );

    return {
      id: `match-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      format: this.format,
      maxOvers: this.maxOvers,
      pitch: this.pitch,
      conditions: this.conditions,
      tossSummary,
      tossWinnerId: tossWinner.id,
      firstBattingTeamId: firstBattingTeam.id,
      secondBattingTeamId: firstBowlingTeam.id,
      innings1,
      innings2,
      target,
      result: matchResult,
      playerOfTheMatch,
    };
  }

  /**
   * Simulates a complete innings
   */
  simulateInnings(battingTeam, bowlingTeam, target = null, inningsNumber = 1) {
    const battingLineup = battingTeam.players.map((p, idx) => ({
      ...p,
      battingOrder: idx + 1,
      technique: p.batting.technique,
      power: p.batting.power,
      timing: p.batting.timing,
      consistency: p.batting.consistency,
      aggression: p.batting.aggression,
      vsSpin: p.batting.vsSpin,
      vsPace: p.batting.vsPace,
      pressureHandling: p.batting.pressureHandling,
      runningBetweenWickets: p.batting.runningBetweenWickets,
      form: p.mental.form,
      confidence: p.mental.confidence,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      dots: 0,
      status: idx < 2 ? 'not out' : 'dnb',
      dismissalText: idx < 2 ? 'not out' : 'did not bat',
      milestonesLogged: { fifty: false, hundred: false },
    }));

    const bowlingPool = bowlingTeam.players.map((p) => ({
      ...p,
      primarySkill: p.bowling.primarySkill,
      baseAccuracy: p.bowling.accuracy,
      accuracy: p.bowling.accuracy,
      variation: p.bowling.variation,
      baseMovement: p.bowling.movement,
      movement: p.bowling.movement,
      deathBowling: p.bowling.deathBowling,
      powerplayBowling: p.bowling.powerplayBowling,
      wicketTaking: p.bowling.wicketTaking,
      economyControl: p.bowling.economyControl,
      fitnessStamina: p.bowling.fitnessStamina,
      fatigue: 0,
      oversBowled: 0,
      ballsBowled: 0,
      maidens: 0,
      runsConceded: 0,
      wickets: 0,
      dotsBowled: 0,
      widesAndNoBalls: 0,
      lastOverBowled: -2,
    }));

    const matchState = {
      inningsNumber,
      battingTeam,
      bowlingTeam,
      battingLineup,
      bowlingPool,
      target,
      totalRuns: 0,
      wickets: 0,
      completedOvers: 0,
      ballsInCurrentOver: 0,
      totalLegalBalls: 0,
      extras: { total: 0, wides: 0, noBalls: 0, legByes: 0 },
      strikerIndex: 0,
      nonStrikerIndex: 1,
      nextBatterIndex: 2,
      currentPartnershipRuns: 0,
      currentPartnershipBalls: 0,
      partnerships: [],
      fallOfWickets: [],
      overSummaries: [],
      ballLog: [],
      keyCommentary: [],
      currentOverRuns: 0,
      currentOverWickets: 0,
      currentOverEvents: [],
    };

    for (let overIndex = 0; overIndex < this.maxOvers; overIndex++) {
      if (matchState.wickets >= 10) break;
      if (target !== null && matchState.totalRuns >= target) break;

      const currentOverNumber = overIndex + 1;
      const bowler = this.selectBowlerForOver(bowlingPool, currentOverNumber);
      this.recoverRestingBowlersFatigue(bowlingPool, bowler.id);

      matchState.currentOverNumber = currentOverNumber;
      matchState.currentBowler = bowler;
      matchState.ballsInCurrentOver = 0;
      matchState.currentOverRuns = 0;
      matchState.currentOverWickets = 0;
      matchState.currentOverEvents = [];

      let safetyGuard = 0;
      while (matchState.ballsInCurrentOver < 6 && safetyGuard < 14) {
        safetyGuard++;
        if (matchState.wickets >= 10) break;
        if (target !== null && matchState.totalRuns >= target) break;

        const striker = battingLineup[matchState.strikerIndex];
        const ballEvent = this.simulateBall(striker, bowler, matchState);
        this.updateMatchState(ballEvent, matchState);
      }

      bowler.oversBowled += matchState.ballsInCurrentOver === 6 ? 1 : 0;
      bowler.lastOverBowled = currentOverNumber;
      if (matchState.ballsInCurrentOver === 6 && matchState.currentOverRuns === 0) {
        bowler.maidens += 1;
      }

      this.applyBowlerOverFatigue(bowler);

      if (matchState.ballsInCurrentOver === 6) {
        matchState.completedOvers += 1;
        const temp = matchState.strikerIndex;
        matchState.strikerIndex = matchState.nonStrikerIndex;
        matchState.nonStrikerIndex = temp;
      }

      matchState.overSummaries.push({
        overNumber: currentOverNumber,
        bowlerName: bowler.name,
        runsThisOver: matchState.currentOverRuns,
        wicketsThisOver: matchState.currentOverWickets,
        cumulativeRuns: matchState.totalRuns,
        cumulativeWickets: matchState.wickets,
        events: [...matchState.currentOverEvents],
      });
    }

    if (matchState.currentPartnershipBalls > 0 || matchState.currentPartnershipRuns > 0) {
      const s = battingLineup[matchState.strikerIndex];
      const ns = battingLineup[matchState.nonStrikerIndex];
      if (s && ns) {
        matchState.partnerships.push({
          wicketNumber: matchState.wickets + 1,
          unbroken: true,
          batter1Name: s.name,
          batter2Name: ns.name,
          runs: matchState.currentPartnershipRuns,
          balls: matchState.currentPartnershipBalls,
        });
      }
    }

    const oversFormatted =
      matchState.ballsInCurrentOver === 6 || matchState.ballsInCurrentOver === 0
        ? `${matchState.completedOvers}.0`
        : `${matchState.completedOvers}.${matchState.ballsInCurrentOver}`;

    const totalOversDecimal =
      matchState.totalLegalBalls > 0 ? matchState.totalLegalBalls / 6 : 1;
    const runRate = +(matchState.totalRuns / totalOversDecimal).toFixed(2);

    return {
      inningsNumber,
      battingTeamId: battingTeam.id,
      battingTeamName: battingTeam.name,
      battingTeamShort: battingTeam.shortName,
      bowlingTeamId: bowlingTeam.id,
      bowlingTeamName: bowlingTeam.name,
      bowlingTeamShort: bowlingTeam.shortName,
      totalRuns: matchState.totalRuns,
      wickets: matchState.wickets,
      oversFormatted,
      totalLegalBalls: matchState.totalLegalBalls,
      runRate,
      extras: matchState.extras,
      batters: battingLineup,
      bowlers: bowlingPool
        .filter((b) => b.ballsBowled > 0)
        .map((b) => {
          const fullOvers = Math.floor(b.ballsBowled / 6);
          const remBalls = b.ballsBowled % 6;
          const decOvers = b.ballsBowled / 6;
          return {
            ...b,
            oversDisplay: `${fullOvers}.${remBalls}`,
            economy: decOvers > 0 ? +(b.runsConceded / decOvers).toFixed(2) : 0,
            strikeRate: b.wickets > 0 ? +(b.ballsBowled / b.wickets).toFixed(1) : null,
          };
        }),
      fallOfWickets: matchState.fallOfWickets,
      partnerships: matchState.partnerships,
      overSummaries: matchState.overSummaries,
      ballLog: matchState.ballLog,
      keyCommentary: matchState.keyCommentary,
    };
  }

  /**
   * Simulates a single delivery using the exact 5-step formula from Section 5
   */
  simulateBall(batsman, bowler, matchState) {
    const overNum = matchState.currentOverNumber;
    const isPowerplay =
      this.format === 'T20'
        ? overNum <= 6
        : this.format === 'ODI'
        ? overNum <= 10
        : false;
    const isDeathOvers =
      this.format === 'T20'
        ? overNum >= 16
        : this.format === 'ODI'
        ? overNum >= 41
        : false;

    // Test Day simulation (Section 5: Day 1 batting easier, Day 3-4 spin increases, Day 5 crumbling)
    const testDay =
      this.format === 'TEST'
        ? matchState.inningsNumber === 1
          ? overNum <= 30
            ? 1
            : 2
          : overNum <= 30
          ? 3
          : 5
        : null;

    let requiredRate = null;
    if (matchState.target !== null) {
      const runsNeeded = Math.max(0, matchState.target - matchState.totalRuns);
      const ballsRemaining = Math.max(1, this.maxOvers * 6 - matchState.totalLegalBalls);
      requiredRate = (runsNeeded / ballsRemaining) * 6;
    }

    let pressureIndex = 45;
    if (isDeathOvers) pressureIndex += 18;
    if (matchState.wickets >= 5) pressureIndex += 14;
    if (requiredRate !== null) {
      if (requiredRate > 12) pressureIndex += 22;
      else if (requiredRate > 9.5) pressureIndex += 10;
      else if (requiredRate < 6) pressureIndex -= 15;
    }
    pressureIndex = Math.max(10, Math.min(100, pressureIndex));

    let effectivePitchFactor = this.pitch.pitchFactor;
    if (bowler.bowlingType === 'spin') {
      effectivePitchFactor = this.pitch.pitchFactor * 0.5 + this.pitch.spinAssist * 0.5;
      // Section 5 Test Pitch Deterioration: Day 3-4 & Day 5 spin lethal
      if (testDay === 3) effectivePitchFactor += 12;
      if (testDay === 5) effectivePitchFactor += 22;
    } else if (bowler.bowlingType === 'pace') {
      effectivePitchFactor = this.pitch.pitchFactor * 0.5 + this.pitch.paceAssist * 0.5;
      if (this.conditions.pinkBall) effectivePitchFactor += 10;
    }

    if (testDay === 1) {
      effectivePitchFactor = Math.max(25, effectivePitchFactor - 8);
    }

    if (this.conditions.dewPresent && (matchState.inningsNumber === 2 || overNum > 10)) {
      effectivePitchFactor = Math.max(25, effectivePitchFactor - 10);
    }

    let situationalSkill = bowler.primarySkill;
    if (isPowerplay) {
      situationalSkill = bowler.primarySkill * 0.75 + bowler.powerplayBowling * 0.25;
    } else if (isDeathOvers) {
      situationalSkill = bowler.primarySkill * 0.70 + bowler.deathBowling * 0.30;
    }

    // ========================================================================
    // STEP 1: Calculate bowler threat (Exact Section 5 Formula)
    // ========================================================================
    const bowlerThreat =
      situationalSkill * 0.35 +
      bowler.accuracy * 0.20 +
      bowler.variation * 0.15 +
      effectivePitchFactor * 0.15 +
      (100 - bowler.fatigue) * 0.10 +
      pressureIndex * 0.05;

    let partnershipConfidence = Math.min(
      95,
      55 + Math.floor(matchState.currentPartnershipRuns * 0.4)
    );
    if (matchState.currentPartnershipRuns >= 100) {
      partnershipConfidence = Math.min(100, partnershipConfidence + 15);
    } else if (matchState.currentPartnershipRuns >= 50) {
      partnershipConfidence = Math.min(100, partnershipConfidence + 8);
    }

    const isHomeBatter = matchState.battingTeam.id === this.team1.id;
    if (this.conditions.crowdAdvantage === 'home' && isHomeBatter) {
      partnershipConfidence = Math.min(100, partnershipConfidence + 5);
    } else if (this.conditions.crowdAdvantage === 'away' && isHomeBatter) {
      partnershipConfidence = Math.max(25, partnershipConfidence - 5);
    }

    const vsSpinOrPace =
      bowler.bowlingType === 'spin' ? batsman.vsSpin : batsman.vsPace;

    let aggressionMultiplier =
      this.format === 'T20' ? 0.16 : this.format === 'ODI' ? 0.11 : 0.06;
    if (isPowerplay) aggressionMultiplier += 0.03;
    if (isDeathOvers) aggressionMultiplier += 0.07;
    if (requiredRate !== null) {
      if (requiredRate > 12) aggressionMultiplier += 0.06;
      else if (requiredRate < 6) aggressionMultiplier -= 0.06;
    }
    if (this.conditions.userTacticalStance === 'aggressive') {
      aggressionMultiplier += 0.035;
    } else if (this.conditions.userTacticalStance === 'conservative') {
      aggressionMultiplier -= 0.035;
    }

    const isSettlingIn = batsman.balls < 5;
    const effectiveTechnique = isSettlingIn
      ? Math.max(25, batsman.technique - (5 - batsman.balls) * 2.2)
      : batsman.technique;

    // ========================================================================
    // STEP 2: Calculate batsman response (Exact Section 5 Formula)
    // ========================================================================
    const batsmanResponse =
      effectiveTechnique * 0.30 +
      vsSpinOrPace * 0.20 +
      batsman.consistency * 0.15 +
      batsman.pressureHandling * 0.15 +
      partnershipConfidence * 0.10 +
      batsman.form * 0.10 +
      batsman.aggression * aggressionMultiplier;

    // ========================================================================
    // STEP 3: Generate outcome seed
    // ========================================================================
    const seed = Math.random() * 100;

    // ========================================================================
    // STEP 4 & 5: Adjust thresholds based on net score & Determine outcome
    // ========================================================================
    const calcResult = this.calculateOutcome(
      batsmanResponse,
      bowlerThreat,
      seed,
      {
        isPowerplay,
        isDeathOvers,
        requiredRate,
        isSettlingIn,
        pressureIndex,
        dewPresent: this.conditions.dewPresent,
        testDay,
      },
      batsman,
      bowler
    );

    return {
      overNumber: overNum,
      ballInOver: matchState.ballsInCurrentOver + 1,
      notation: `${overNum - 1}.${matchState.ballsInCurrentOver + 1}`,
      strikerId: batsman.id,
      strikerName: batsman.name,
      bowlerId: bowler.id,
      bowlerName: bowler.name,
      outcome: calcResult.outcome,
      bowlerThreat: +bowlerThreat.toFixed(2),
      batsmanResponse: +batsmanResponse.toFixed(2),
      dominance: +calcResult.dominance.toFixed(2),
      seed: +seed.toFixed(2),
      thresholds: calcResult.thresholds,
      modifiersApplied: calcResult.modifiersApplied,
    };
  }

  /**
   * Step 4 & Step 5: Calculates probability thresholds from dominance and evaluates seed
   */
  calculateOutcome(batsmanResponse, bowlerThreat, seed, context, batsman, bowler) {
    const dominance = batsmanResponse - bowlerThreat;
    const modifiersApplied = [];

    let wicketProb =
      (this.format === 'TEST' ? 3.2 : this.format === 'ODI' ? 3.6 : 4.6) -
      dominance * 0.085;
    let dotProb =
      (this.format === 'TEST' ? 62.0 : this.format === 'ODI' ? 46.0 : 35.0) -
      dominance * 0.32;
    let oneProb =
      (this.format === 'TEST' ? 21.0 : this.format === 'ODI' ? 33.5 : 34.5) +
      dominance * 0.08;
    let twoProb = 6.5 + (batsman.runningBetweenWickets - 70) * 0.04;
    let threeProb = 0.6;
    let fourProb =
      (this.format === 'TEST' ? 8.2 : this.format === 'ODI' ? 8.8 : 11.2) +
      dominance * 0.18 +
      (batsman.timing - 70) * 0.05;
    let sixProb =
      (this.format === 'TEST' ? 1.1 : this.format === 'ODI' ? 2.8 : 5.1) +
      dominance * 0.12 +
      (batsman.power - 70) * 0.06;

    if (context.isPowerplay) {
      fourProb *= 1.15;
      sixProb *= 1.10;
      dotProb -= 2.2;
      modifiersApplied.push('Powerplay (+15% Boundary)');
    }

    if (context.isDeathOvers) {
      sixProb *= 1.20;
      fourProb *= 1.08;
      wicketProb += 1.15;
      dotProb -= 3.0;
      modifiersApplied.push('Death Overs (+20% Six)');
    }

    if (context.requiredRate !== null) {
      if (context.requiredRate > 12) {
        sixProb *= 1.18;
        fourProb *= 1.10;
        wicketProb += 1.65;
        modifiersApplied.push('RRR > 12 (High Risk)');
      } else if (context.requiredRate < 6) {
        dotProb += 4.5;
        wicketProb = Math.max(1.8, wicketProb - 1.2);
        sixProb *= 0.75;
        modifiersApplied.push('RRR < 6 (Conservative)');
      }
    }

    if (context.isSettlingIn) {
      wicketProb += 0.9;
      dotProb += 3.5;
      sixProb *= 0.72;
      modifiersApplied.push('New Batter (<5 balls)');
    }

    if (context.pressureIndex >= 75 && batsman.pressureHandling < 75) {
      wicketProb += (75 - batsman.pressureHandling) * 0.05;
      modifiersApplied.push('High Pressure Index');
    }

    if (context.testDay) {
      modifiersApplied.push(`Test Pitch Day ${context.testDay}`);
    } else if (context.dewPresent) {
      modifiersApplied.push('Dew Factor');
    }

    wicketProb = Math.max(1.2, Math.min(11.5, wicketProb));
    dotProb = Math.max(18.0, Math.min(72.0, dotProb));
    oneProb = Math.max(15.0, Math.min(44.0, oneProb));
    twoProb = Math.max(3.5, Math.min(11.0, twoProb));
    threeProb = Math.max(0.3, Math.min(1.5, threeProb));
    fourProb = Math.max(4.5, Math.min(22.0, fourProb));
    sixProb = Math.max(0.6, Math.min(14.5, sixProb));

    const extraProb = Math.max(1.2, Math.min(4.2, 2.6 - (bowler.accuracy - 75) * 0.04));

    const totalWeight =
      wicketProb + dotProb + oneProb + twoProb + threeProb + fourProb + sixProb + extraProb;
    const scale = 100 / totalWeight;

    const wicketThreshold = wicketProb * scale;
    const dotThreshold = wicketThreshold + dotProb * scale;
    const oneRunThreshold = dotThreshold + oneProb * scale;
    const twoRunThreshold = oneRunThreshold + twoProb * scale;
    const threeRunThreshold = twoRunThreshold + threeProb * scale;
    const fourThreshold = threeRunThreshold + fourProb * scale;
    const sixThreshold = fourThreshold + sixProb * scale;

    let outcome;
    if (seed < wicketThreshold) outcome = OUTCOME.WICKET;
    else if (seed < dotThreshold) outcome = OUTCOME.DOT;
    else if (seed < oneRunThreshold) outcome = OUTCOME.ONE;
    else if (seed < twoRunThreshold) outcome = OUTCOME.TWO;
    else if (seed < threeRunThreshold) outcome = OUTCOME.THREE;
    else if (seed < fourThreshold) outcome = OUTCOME.FOUR;
    else if (seed < sixThreshold) outcome = OUTCOME.SIX;
    else outcome = OUTCOME.EXTRA;

    return {
      outcome,
      dominance,
      modifiersApplied,
      thresholds: {
        wicketThreshold: +wicketThreshold.toFixed(2),
        dotThreshold: +dotThreshold.toFixed(2),
        oneRunThreshold: +oneRunThreshold.toFixed(2),
        twoRunThreshold: +twoRunThreshold.toFixed(2),
        threeRunThreshold: +threeRunThreshold.toFixed(2),
        fourThreshold: +fourThreshold.toFixed(2),
        sixThreshold: +sixThreshold.toFixed(2),
      },
    };
  }

  updateMatchState(ballEvent, matchState) {
    const striker = matchState.battingLineup[matchState.strikerIndex];
    const bowler = matchState.currentBowler;
    const { outcome } = ballEvent;

    let displayBadge = '0';
    let runsAdded = 0;
    let legalDelivery = true;

    if (outcome === OUTCOME.EXTRA) {
      const isWide = Math.random() < 0.72;
      legalDelivery = false;
      runsAdded = 1;
      matchState.totalRuns += 1;
      matchState.extras.total += 1;
      if (isWide) {
        matchState.extras.wides += 1;
        displayBadge = '1wd';
      } else {
        matchState.extras.noBalls += 1;
        displayBadge = '1nb';
      }
      bowler.runsConceded += 1;
      bowler.widesAndNoBalls += 1;
      matchState.currentOverRuns += 1;
      matchState.currentPartnershipRuns += 1;
    } else if (outcome === OUTCOME.WICKET) {
      legalDelivery = true;
      displayBadge = 'W';
      matchState.ballsInCurrentOver += 1;
      matchState.totalLegalBalls += 1;
      striker.balls += 1;
      bowler.ballsBowled += 1;
      bowler.dotsBowled += 1;
      matchState.wickets += 1;
      matchState.currentOverWickets += 1;
      matchState.currentPartnershipBalls += 1;

      const dismissalInfo = this.buildDismissalDetails(
        striker,
        bowler,
        matchState.bowlingTeam.players
      );
      striker.status = 'out';
      striker.dismissalText = dismissalInfo.text;
      if (dismissalInfo.bowlerCredited) {
        bowler.wickets += 1;
      }

      const oversAtFall = `${matchState.currentOverNumber - 1}.${matchState.ballsInCurrentOver}`;
      matchState.fallOfWickets.push({
        wicketNumber: matchState.wickets,
        score: matchState.totalRuns,
        overs: oversAtFall,
        batterName: striker.name,
        batterRuns: striker.runs,
        batterBalls: striker.balls,
      });

      const nonStriker = matchState.battingLineup[matchState.nonStrikerIndex];
      matchState.partnerships.push({
        wicketNumber: matchState.wickets,
        unbroken: false,
        batter1Name: striker.name,
        batter2Name: nonStriker ? nonStriker.name : '',
        runs: matchState.currentPartnershipRuns,
        balls: matchState.currentPartnershipBalls,
      });

      matchState.currentPartnershipRuns = 0;
      matchState.currentPartnershipBalls = 0;
    } else {
      legalDelivery = true;
      runsAdded = outcome === OUTCOME.DOT ? 0 : Number(outcome);
      displayBadge = outcome === OUTCOME.DOT ? '0' : String(runsAdded);

      matchState.ballsInCurrentOver += 1;
      matchState.totalLegalBalls += 1;
      matchState.totalRuns += runsAdded;
      matchState.currentOverRuns += runsAdded;
      matchState.currentPartnershipRuns += runsAdded;
      matchState.currentPartnershipBalls += 1;

      striker.runs += runsAdded;
      striker.balls += 1;
      if (runsAdded === 0) {
        striker.dots += 1;
        bowler.dotsBowled += 1;
      } else if (runsAdded === 4) {
        striker.fours += 1;
      } else if (runsAdded === 6) {
        striker.sixes += 1;
      }

      bowler.ballsBowled += 1;
      bowler.runsConceded += runsAdded;

      if (runsAdded % 2 === 1) {
        const temp = matchState.strikerIndex;
        matchState.strikerIndex = matchState.nonStrikerIndex;
        matchState.nonStrikerIndex = temp;
      }
    }

    matchState.currentOverEvents.push(displayBadge);

    const commentary = this.generateCommentary(ballEvent, matchState, striker, bowler, displayBadge);
    const enrichedBallEvent = {
      ...ballEvent,
      displayBadge,
      runsAdded,
      legalDelivery,
      scoreAfterBall: `${matchState.totalRuns}/${matchState.wickets}`,
      commentary,
      isKeyMoment:
        outcome === OUTCOME.WICKET ||
        outcome === OUTCOME.SIX ||
        outcome === OUTCOME.FOUR ||
        (striker.runs >= 50 && !striker.milestonesLogged.fifty) ||
        (striker.runs >= 100 && !striker.milestonesLogged.hundred),
    };

    if (striker.runs >= 50 && !striker.milestonesLogged.fifty) {
      striker.milestonesLogged.fifty = true;
    }
    if (striker.runs >= 100 && !striker.milestonesLogged.hundred) {
      striker.milestonesLogged.hundred = true;
    }

    matchState.ballLog.push(enrichedBallEvent);
    if (enrichedBallEvent.isKeyMoment) {
      matchState.keyCommentary.push(enrichedBallEvent);
    }

    if (outcome === OUTCOME.WICKET && matchState.wickets < 10) {
      matchState.strikerIndex = matchState.nextBatterIndex;
      matchState.nextBatterIndex += 1;
      const incoming = matchState.battingLineup[matchState.strikerIndex];
      if (incoming) {
        incoming.status = 'not out';
        incoming.dismissalText = 'not out';
      }
    }
  }

  generateCommentary(ballEvent, matchState, striker, bowler, displayBadge) {
    const { outcome } = ballEvent;

    if (outcome === OUTCOME.WICKET) {
      if (striker.isUserPlayer) {
        return `Gone! ${striker.name} departs for ${striker.runs} (${striker.balls}b) — ${striker.dismissalText}. The selectors watching from the stand will have notes on that dismissal.`;
      }
      if (striker.isRival) {
        return `Huge breakthrough! Rival ${striker.name} is sent packing for ${striker.runs} (${striker.balls}b) by ${bowler.name}!`;
      }
      return `WICKET! ${bowler.name} strikes — ${striker.name} departs for ${striker.runs} (${striker.balls}b). ${matchState.battingTeam.shortName} ${matchState.totalRuns}/${matchState.wickets}.`;
    }

    if (striker.runs >= 100 && !striker.milestonesLogged.hundred) {
      return `CENTURY! This could be the moment ${striker.name}'s career truly ascends — a sensational hundred off ${striker.balls} balls!`;
    }

    if (striker.runs >= 50 && !striker.milestonesLogged.fifty) {
      if (striker.isUserPlayer) {
        return `FIFTY for ${striker.name} (${striker.runs}* off ${striker.balls}b)! Vikramaditya Rao watching from the dugout as ${striker.name} reaches another milestone.`;
      }
      return `Half-century raised by ${striker.name} (${striker.runs}* off ${striker.balls}b) under pressure.`;
    }

    if (outcome === OUTCOME.SIX) {
      return `MAXIMUM! ${striker.name} launches ${bowler.name} high into the stands at ${this.pitch.venue}!`;
    }

    if (outcome === OUTCOME.FOUR) {
      return `A magnificent cover drive from ${striker.name} — pierces the infield for FOUR off ${bowler.name}!`;
    }

    if (outcome === OUTCOME.EXTRA) {
      return `Loose delivery from ${bowler.name} (${displayBadge}) — extra run added to the total.`;
    }

    if (outcome === OUTCOME.DOT) {
      return `Tight line from ${bowler.name} to ${striker.name}, defended solidly back down the pitch. Dot ball.`;
    }

    return `${striker.name} works ${bowler.name} into the gap for ${outcome} run${
      outcome > 1 ? 's' : ''
    }.`;
  }

  buildDismissalDetails(striker, bowler, fieldingPlayers) {
    const roll = Math.random();
    const wk = fieldingPlayers.find((p) => p.isWicketkeeper) || fieldingPlayers[0];
    const nonBowlerFielders = fieldingPlayers.filter((p) => p.id !== bowler.id);
    const randomFielder =
      nonBowlerFielders[Math.floor(Math.random() * nonBowlerFielders.length)] || wk;

    if (roll < 0.56) {
      return {
        text: `c ${randomFielder.name} b ${bowler.name}`,
        bowlerCredited: true,
      };
    }
    if (roll < 0.76) {
      return {
        text: `b ${bowler.name}`,
        bowlerCredited: true,
      };
    }
    if (roll < 0.90) {
      return {
        text: `lbw b ${bowler.name}`,
        bowlerCredited: true,
      };
    }
    if (roll < 0.96 && bowler.bowlingType === 'spin') {
      return {
        text: `st †${wk.name} b ${bowler.name}`,
        bowlerCredited: true,
      };
    }
    return {
      text: `run out (${randomFielder.name})`,
      bowlerCredited: false,
    };
  }

  applyBowlerOverFatigue(bowler) {
    const staminaFactor = (100 - (bowler.fitnessStamina || 75)) / 100;
    const baseFatigueGain = bowler.bowlingType === 'pace' ? 14 : 9;
    const fatigueAdded = Math.round(baseFatigueGain * (0.85 + staminaFactor * 0.6));

    bowler.fatigue = Math.min(85, bowler.fatigue + fatigueAdded);
    const penalty = Math.round(bowler.fatigue * 0.16);
    bowler.accuracy = Math.max(25, bowler.baseAccuracy - penalty);
    bowler.movement = Math.max(25, bowler.baseMovement - penalty);
  }

  recoverRestingBowlersFatigue(bowlingPool, activeBowlerId) {
    bowlingPool.forEach((b) => {
      if (b.id !== activeBowlerId && b.fatigue > 0) {
        b.fatigue = Math.max(0, b.fatigue - 4);
        const penalty = Math.round(b.fatigue * 0.16);
        b.accuracy = Math.max(25, b.baseAccuracy - penalty);
        b.movement = Math.max(25, b.baseMovement - penalty);
      }
    });
  }

  selectBowlerForOver(bowlingPool, overNumber) {
    const eligible = bowlingPool.filter(
      (b) =>
        b.oversBowled < this.maxBowlerOvers &&
        b.lastOverBowled !== overNumber - 1 &&
        b.primarySkill >= 50
    );

    const candidates =
      eligible.length > 0
        ? eligible
        : bowlingPool.filter(
            (b) => b.oversBowled < this.maxBowlerOvers && b.lastOverBowled !== overNumber - 1
          );

    const isPowerplay = overNumber <= 6;
    const isDeath = overNumber >= 16;

    const scored = candidates.map((b) => {
      let score = b.primarySkill * 0.5 + (100 - b.fatigue) * 0.2;
      if (isPowerplay) {
        score += b.powerplayBowling * 0.35;
      } else if (isDeath) {
        score += b.deathBowling * 0.4;
      } else {
        score += b.economyControl * 0.25 + (b.bowlingType === 'spin' ? 8 : 0);
      }
      return { bowler: b, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0].bowler;
  }

  evaluateMatchWinner(teamBatFirst, teamBatSecond, innings1, innings2, target) {
    if (innings2.totalRuns >= target) {
      const wicketsRemaining = 10 - innings2.wickets;
      const ballsRemaining = Math.max(0, this.maxOvers * 6 - innings2.totalLegalBalls);
      return {
        winnerId: teamBatSecond.id,
        winnerName: teamBatSecond.name,
        winnerShort: teamBatSecond.shortName,
        marginText: `${teamBatSecond.name} won by ${wicketsRemaining} wicket${
          wicketsRemaining > 1 ? 's' : ''
        } (${ballsRemaining} balls remaining)`,
        isTie: false,
      };
    }

    if (innings1.totalRuns > innings2.totalRuns) {
      const runMargin = innings1.totalRuns - innings2.totalRuns;
      return {
        winnerId: teamBatFirst.id,
        winnerName: teamBatFirst.name,
        winnerShort: teamBatFirst.shortName,
        marginText: `${teamBatFirst.name} won by ${runMargin} run${
          runMargin > 1 ? 's' : ''
        }`,
        isTie: false,
      };
    }

    return {
      winnerId: teamBatSecond.id,
      winnerName: teamBatSecond.name,
      winnerShort: teamBatSecond.shortName,
      marginText: `Match Tied (${teamBatSecond.name} won Super Over tiebreaker)`,
      isTie: true,
    };
  }

  selectPlayerOfTheMatch(team1, team2, innings1, innings2, winnerId) {
    const impactMap = new Map();

    const addImpact = (player, delta, summaryParts) => {
      const existing = impactMap.get(player.id) || {
        id: player.id,
        name: player.name,
        role: player.role,
        jersey: player.jersey,
        portraitUri: player.portraitUri,
        isUserPlayer: player.isUserPlayer,
        isRival: player.isRival,
        teamId: null,
        points: 0,
        highlights: [],
      };
      existing.points += delta;
      if (summaryParts) existing.highlights.push(summaryParts);
      impactMap.set(player.id, existing);
    };

    const processInnings = (innings, battingTeamId, bowlingTeamId) => {
      innings.batters.forEach((b) => {
        if (b.balls > 0) {
          const sr = (b.runs / b.balls) * 100;
          let pts = b.runs * 1.15 + b.fours * 1.5 + b.sixes * 3;
          if (b.runs >= 50) pts += 18;
          if (b.runs >= 30 && sr >= 150) pts += 12;
          if (battingTeamId === winnerId) pts += 10;
          addImpact(b, pts, `${b.runs}${b.status === 'not out' ? '*' : ''} (${b.balls}b)`);
          impactMap.get(b.id).teamId = battingTeamId;
        }
      });

      innings.bowlers.forEach((bw) => {
        let pts = bw.wickets * 26 + bw.dotsBowled * 1.2 + bw.maidens * 12;
        if (bw.oversBowled >= 2 && bw.economy <= 6.5) pts += 16;
        if (bw.wickets >= 3) pts += 18;
        if (bowlingTeamId === winnerId) pts += 10;
        addImpact(bw, pts, `${bw.wickets}/${bw.runsConceded} (${bw.oversDisplay} ov)`);
        impactMap.get(bw.id).teamId = bowlingTeamId;
      });
    };

    processInnings(innings1, innings1.battingTeamId, innings1.bowlingTeamId);
    processInnings(innings2, innings2.battingTeamId, innings2.bowlingTeamId);

    const allRanked = Array.from(impactMap.values()).sort((a, b) => b.points - a.points);
    const winner = allRanked[0];
    return {
      ...winner,
      impactRating: Math.min(9.9, +(6.5 + winner.points / 45).toFixed(1)),
      performanceSummary: winner.highlights.join(' · '),
    };
  }
}
