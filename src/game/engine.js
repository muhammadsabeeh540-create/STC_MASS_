
import {
  INITIAL_GAME_STATE,
  MISSION_LENGTH,
  RAD_SAMPLE,
  REAL_EVENTS,
} from "../data/nasaData.js";

import {
  createRandom,
  randomInt,
  randomChoice,
} from "./random.js";

// Create a fresh mission
export function createGame(mode = "real", seed = 12345) {
  return {
    ...INITIAL_GAME_STATE,
    mode,
    seed,
    log: [],
    pendingHits: [],
    flags: {
      radiationBonus: 0,
      dustStormToday: false,
      kp6Today: false,
      decision: null,
      randomEvents: [],
    },
    status: "playing",
  };
}

// Get repeatable radiation reading
export function getBaseRadiation(seed, day) {
  const random = createRandom(seed + day * 100);
  return RAD_SAMPLE[randomInt(random, 0, RAD_SAMPLE.length - 1)];
}

// Get real NASA events for a day
export function getTodayEvents(day) {
  return REAL_EVENTS.filter(event => event.day === day);
}

// Shield protection
export function getShieldMultiplier(shield = "off") {
  if (shield === "low") return 0.7;
  if (shield === "high") return 0.4;
  return 1;
}

// Generate repeatable random mission events
export function generateRandomEvents(seed = 12345) {
  const random = createRandom(seed + 9000);
  const count = randomInt(random, 6, 9);
  const days = [];

  while (days.length < count) {
    const day = randomInt(random, 2, 29);
    if (!days.includes(day)) days.push(day);
  }

  days.sort((a, b) => a - b);

  const events = days.map(day => {
    const type = randomChoice(random, ["flare", "cme", "dust"]);

    if (type === "flare") {
      const flareClass = randomChoice(random, ["C", "M", "X"]);
      const ranges = {
        C: [1, 3],
        M: [3, 6],
        X: [5, 8],
      };

      return {
        day,
        type: "FLARE",
        title: `${flareClass}-class Solar Flare`,
        radiationBonus: randomInt(random, ...ranges[flareClass]),
      };
    }

    if (type === "cme") {
      const speed = randomInt(random, 275, 902);

      return {
        day,
        type: "CME",
        title: "Coronal Mass Ejection",
        speed,
        warningDays: speed < 400 ? 3 : speed < 800 ? 2 : 1,
        hitDay: day + (speed < 400 ? 3 : speed < 800 ? 2 : 1),
      };
    }

    return {
      day,
      type: "DUST",
      title: "Dust Storm",
      solarIncome: 25,
    };
  });

  // One additional decision card
  const decisionDay = randomInt(random, 5, 25);
  events.push({
    day: decisionDay,
    type: "DECISION",
    title: "Emergency Supply Decision",
  });

  return events.sort((a, b) => a.day - b.day);
}

// Get events for the selected game mode
export function getGameEvents(state, day = state.day) {
  if (state.mode === "random") {
    const events = state.flags.randomEvents?.length
      ? state.flags.randomEvents
      : generateRandomEvents(state.seed);

    return events.filter(event => event.day === day);
  }

  return getTodayEvents(day);
}

// Prepare events at the start of a day
export function prepareDay(state) {
  const events = getGameEvents(state);

  const radiationBonus = events
    .filter(event => event.type === "FLARE")
    .reduce((total, event) => total + (event.radiationBonus || 0), 0);

  const cmeHits = state.pendingHits.filter(hit => hit.day === state.day);
  const hitBonus = cmeHits.reduce(
    (total, hit) => total + (hit.radiationBonus || 0),
    0
  );

  const dustStormToday = events.some(event => event.type === "DUST");

  const kp6Today = events.some(
    event => event.type === "GEOMAGNETIC_STORM"
  );

  return {
    ...state,
    pendingHits: state.pendingHits.filter(hit => hit.day !== state.day),
    flags: {
      ...state.flags,
      radiationBonus: radiationBonus + hitBonus,
      dustStormToday,
      kp6Today,
      todayEvents: events,
    },
  };
}

// Preview today's actions without changing the game
export function previewDay(state, actions = {}) {
  const oxygenMaker = Boolean(actions.oxygenMaker);
  const shield = actions.shield || "off";
  const exercise = Boolean(actions.exercise);
  const scienceMission = Boolean(actions.scienceMission);
  const decision = actions.decision || null;

  const decisionCost = decision === "brace" ? 15 : 0;

  const costs =
    (oxygenMaker ? 20 : 0) +
    (shield === "low" ? 10 : shield === "high" ? 25 : 0) +
    (exercise ? 10 : 0) +
    (scienceMission ? 15 : 0) +
    decisionCost;

  const solarIncome = state.flags.dustStormToday ? 25 : 50;
  const availablePower = Math.min(100, state.power + solarIncome);

  if (costs > availablePower) {
    return {
      valid: false,
      reason: "Not enough power for these actions.",
      costs,
      availablePower,
    };
  }

  const power = availablePower - costs;

  const oxygen = Math.max(
    0,
    Math.min(100, state.oxygen - 10 + (oxygenMaker ? 15 : 0))
  );

  const baseRadiation = getBaseRadiation(state.seed, state.day);
  const scienceRadiation = scienceMission ? 3 : 0;

  const radiation =
    (baseRadiation +
      (state.flags.radiationBonus || 0) +
      scienceRadiation) *
    getShieldMultiplier(shield);

  const radiationHealthLoss =
    Math.round((radiation / 4) * 10) / 10;

  const exerciseLoss = exercise ? 0 : 2;

  const health = Math.max(
    0,
    state.health - radiationHealthLoss - exerciseLoss
  );

  const scienceGain = scienceMission
    ? state.flags.kp6Today ? 5 : 10
    : 0;

  return {
    valid: true,
    costs,
    solarIncome,
    availablePower,
    power,
    oxygen,
    health,
    radiation,
    baseRadiation,
    radiationHealthLoss,
    exerciseLoss,
    scienceGain,
    shieldMultiplier: getShieldMultiplier(shield),
  };
}

// Process one complete mission day
export function endDay(state, actions = {}) {
  if (state.status !== "playing") {
    return {
      success: false,
      reason: "This mission has already ended.",
      state,
    };
  }

  const preview = previewDay(state, actions);

  if (!preview.valid) {
    return {
      success: false,
      reason: preview.reason,
      state,
    };
  }

  const todayEvents = state.flags.todayEvents || [];

  const nextPendingHits = [...state.pendingHits];

  // Schedule real and random CME arrivals
  for (const event of todayEvents) {
    if (event.type === "CME" && event.hitDay) {
      nextPendingHits.push({
        day: event.hitDay,
        radiationBonus: event.speed < 400 ? 2 : event.speed < 800 ? 4 : 6,
        source: event.title,
      });
    }
  }

  let decisionResult = null;

  // Real mission decision on Day 22
  if (state.mode === "real" && state.day === 22) {
    if (actions.decision === "brace") {
      for (let i = nextPendingHits.length - 1; i >= 0; i--) {
        if (nextPendingHits[i].day === 23) {
          nextPendingHits.splice(i, 1);
        }
      }
      decisionResult = "The outpost braced. The Day 23 hit was cancelled.";
    } else if (actions.decision === "gamble") {
      const random = createRandom(state.seed + 2222);
      const success = random() < 0.5;

      if (success) {
        nextPendingHits.push({
          day: 23,
          radiationBonus: 6,
          source: "Day 22 gamble",
        });
      }
      decisionResult = success
        ? "The gamble failed. Extra radiation is expected on Day 23."
        : "The gamble paid off. No extra radiation hit.";
    }
  }

  // Oxygen and health determine mission failure
  const lost = preview.oxygen <= 0 || preview.health <= 0;

  const logEntry = {
    day: state.day,
    power: preview.power,
    oxygen: preview.oxygen,
    health: preview.health,
    radiation: preview.radiation,
    science: preview.scienceGain,
    costs: preview.costs,
    events: todayEvents,
    decisionResult,
  };

  const nextState = {
    ...state,
    power: preview.power,
    oxygen: preview.oxygen,
    health: preview.health,
    science: state.science + preview.scienceGain,
    skipExerciseStreak: actions.exercise
      ? 0
      : state.skipExerciseStreak + 1,
    pendingHits: nextPendingHits,
    day: state.day + 1,
    log: [...state.log, logEntry],
    flags: {
      ...state.flags,
      radiationBonus: 0,
      dustStormToday: false,
      kp6Today: false,
      todayEvents: [],
    },
    status: lost
      ? "lost"
      : state.day === MISSION_LENGTH
        ? "won"
        : "playing",
    failureReason: preview.oxygen <= 0
      ? "oxygen"
      : preview.health <= 0
        ? "health"
        : null,
  };

  return {
    success: true,
    state: nextState,
    report: {
      ...preview,
      day: state.day,
      events: todayEvents,
      decisionResult,
    },
  };
}

// Stars for a completed mission
export function getMissionStars(state) {
  if (state.status !== "won") return 0;
  if (state.health >= 50 && state.science >= 150) return 3;
  if (state.health >= 50) return 2;
  return 1;
}
