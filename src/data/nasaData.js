
/*
 * STORM WATCH — JEZERO OUTPOST
 * Archived NASA educational data
 *
 * IMPORTANT:
 * These are archived observations, not live data.
 * ISS radiation readings are NOT direct Mars readings.
 */

export const DATA_STATUS = "ARCHIVED NASA DATA (NOT LIVE)";

export const MISSION_LENGTH = 30;

export const INITIAL_GAME_STATE = {
  day: 1,
  mode: "real",
  seed: 12345,
  power: 80,
  oxygen: 80,
  health: 100,
  science: 0,
  skipExerciseStreak: 0,
  log: [],
  pendingHits: [],
  flags: {}
};

/* =========================================
   NASA RADIATION SAMPLE
========================================= */

// NASA OSDR RadLab
// ISS DosTel1 and DosTel2
// 1 April 2022, 23:00 – 2 April 2022, 01:05 UTC
// Absorbed dose rate: microGray/hour
// ISS reference values, NOT Mars measurements.

export const RAD_SAMPLE = [
  9.82,
  1.80,
  7.25,
  11.46,
  4.35,
  1.87,
  2.10,
  9.31,
  10.40,
  7.04,
  2.51,
  3.21
];

/* =========================================
   REAL STORM MODE
   Archived event timeline
========================================= */

export const REAL_EVENTS = [
  {
    id: "cme-oct-25",
    day: 10,
    date: "2026-10-25",
    time: "19:24 UTC",
    type: "CME",
    title: "Coronal Mass Ejection Detected",
    speed: 275,
    source: "S10W60",
    halfAngle: 27,
    warningDays: 3,
    hitDay: 13,
    radiationBonus: 2,
    description:
      "A slow-moving cloud of solar material was detected. Its estimated arrival is three days later."
  },
  {
    id: "cme-oct-26",
    day: 11,
    date: "2026-10-26",
    time: "20:48 UTC",
    type: "CME",
    title: "Second CME Detected",
    speed: 479,
    source: null,
    halfAngle: 35,
    warningDays: 2,
    hitDay: 13,
    radiationBonus: 4,
    description:
      "Another coronal mass ejection was detected. Its estimated arrival overlaps with the earlier CME."
  },
  {
    id: "kp6-oct-31",
    day: 16,
    date: "2026-10-31",
    time: "18:00 UTC",
    type: "GEOMAGNETIC_STORM",
    kp: 6,
    stormLevel: "G2",
    eventId: "GST49348",
    scienceBonus: 5,
    title: "Earth Signal Disturbance",
    description:
      "A Kp6 geomagnetic storm affects Earth's magnetic environment. Messages from Earth may be delayed. This is not a Mars radiation event."
  },
  {
    id: "flare-nov-5",
    day: 21,
    date: "2026-11-05",
    time: "18:33 UTC peak",
    type: "FLARE",
    flareClass: "M3.5",
    source: "S08E35",
    region: "14566",
    radiationBonus: 5,
    title: "M3.5 Solar Flare",
    description:
      "An M-class solar flare was recorded from active region 14566. The event adds radiation to today's simplified game model."
  },
  {
    id: "cme-nov-6",
    day: 22,
    date: "2026-11-06",
    time: "16:15 UTC",
    type: "CME_DECISION",
    leadingEdgeSpeed: 476,
    shockSpeed: 902,
    source: "N35W140",
    warningDays: 1,
    hitDay: 23,
    radiationBonus: 6,
    title: "Fast CME Shock Detected",
    description:
      "A CME with a fast shock was recorded. The crew must decide whether to brace the outpost or accept the risk."
  },
  {
    id: "flare-nov-8",
    day: 24,
    date: "2026-11-08",
    time: "18:27 UTC peak",
    type: "FLARE",
    flareClass: "M-class",
    source: "S07W04",
    region: "14566",
    radiationBonus: 4,
    title: "Solar Flare from Region 14566",
    description:
      "Another M-class flare was recorded from active region 14566. The exact flare number is not included because it was not confirmed in the source notes."
  },
  {
    id: "flare-nov-11",
    day: 27,
    date: "2026-11-11",
    time: "21:21 UTC peak",
    type: "FLARE",
    flareClass: "M1.7",
    source: "S07W46",
    region: "14566",
    radiationBonus: 3,
    title: "M1.7 Solar Flare",
    description:
      "A further M-class flare from active region 14566 was recorded."
  }
];

/* =========================================
   RANDOM MODE EVENT SETTINGS
========================================= */

export const RANDOM_EVENT_SETTINGS = {
  minimumEvents: 6,
  maximumEvents: 9,

  flareClasses: [
    { class: "C", minimumBonus: 1, maximumBonus: 3 },
    { class: "M", minimumBonus: 3, maximumBonus: 6 },
    { class: "X", minimumBonus: 5, maximumBonus: 8 }
  ],

  cmeSpeed: {
    minimum: 275,
    maximum: 902
  },

  dustStorm: {
    solarIncome: 25,
    durationDays: 1
  },

  decisionCards: 1
};

/* =========================================
   SPACE BIOLOGY RESEARCH
   NASA OSDR animal studies
========================================= */

export const BIOLOGY_STUDIES = {
  OSD477: {
    id: "OSD-477",
    subject: "Rats",
    topic: "Gravity and leg bone density",
    duration: "1, 2 and 4 weeks",
    gravityLevels: ["20%", "40%", "70%", "100%"],
    fact:
      "NASA scientists studied rats at different gravity levels. Leg bone density decreased more at lower gravity and continued changing during the four-week study.",
    trigger: "exercise-skipped"
  },

  OSD471: {
    id: "OSD-471",
    subject: "Mice",
    topic: "Spaceflight and spine bone strength",
    duration: "30 days",
    fact:
      "In the Bion-M1 study, mice spent 30 days in orbit. Their spine bones showed 17% lower bending strength after spaceflight.",
    trigger: "low-health"
  },

  OSD351: {
    id: "OSD-351",
    subject: "Growing female rats",
    topic: "Bone development in space",
    duration: "14 days",
    fact:
      "NASA scientists studied growing female rats during a 14-day Shuttle mission. The study found changes in spongy bone volume in back and thigh bones.",
    trigger: "bone-fact"
  },

  OSD653: {
    id: "OSD-653",
    subject: "Rats",
    topic: "Muscle health at different gravity levels",
    duration: "28 days",
    fact:
      "NASA scientists studied rats at zero gravity and Mars-like 0.4g for 28 days. Even Mars-level gravity changed muscle and body health.",
    trigger: "day-15"
  },

  OSD486: {
    id: "OSD-486",
    subject: "Mice",
    topic: "Skull bone changes after spaceflight",
    duration: "15 days",
    skullBoneVolume: {
      spaceflight: 1.904,
      comparison: 1.758,
      unit: "cubic millimetres"
    },
    fact:
      "NASA scientists studied mice after a 15-day Shuttle mission. The study measured different skull bone volumes and explored how body fluids shifting toward the head may play a role.",
    trigger: "mission-complete"
  }
};

/* =========================================
   SCIENCE GLOSSARY
========================================= */

export const GLOSSARY = {
  radiation:
    "Invisible energy from the Sun and space. Too much can hurt the body.",

  microGray:
    "How much radiation the body absorbs each hour. A bigger number means more radiation.",

  solarFlare:
    "A sudden flash of energy from the Sun. Classes go C (small), M (medium), X (huge). Each class is 10 times stronger than the one before.",

  cme:
    "Coronal Mass Ejection: a giant cloud of gas and magnetism thrown out by the Sun. It takes days to travel and can raise radiation.",

  kpIndex:
    "A 0 to 9 score for how strongly a space storm shakes Earth's magnetic field. 6 is a medium-strong storm called G2.",

  microgravity:
    "Almost no weight, like floating. It can make bones and muscles weaker if astronauts do not exercise.",

  sol:
    "A day on Mars. It lasts about 24 hours and 40 minutes.",

  shielding:
    "Material that blocks some radiation. Heavier shielding blocks more."
};

/* =========================================
   RADIATION ZONES
========================================= */

export const RADIATION_ZONES = [
  {
    name: "Safe",
    minimum: 1,
    maximum: 4,
    color: "green"
  },
  {
    name: "Careful",
    minimum: 5,
    maximum: 8,
    color: "yellow"
  },
  {
    name: "Danger",
    minimum: 9,
    maximum: Infinity,
    color: "red"
  }
];

/* =========================================
   NASA DATA SOURCES
========================================= */

export const DATA_SOURCES = [
  {
    name: "NASA DONKI",
    category: "Space Weather",
    url: "https://ccmc.gsfc.nasa.gov/tools/DONKI"
  },
  {
    name: "NASA OSDR RadLab",
    category: "Radiation",
    url: "https://visualization.osdr.nasa.gov/radlab"
  },
  {
    name: "NASA Open Science Data Repository",
    category: "Space Biology",
    url: "https://osdr.nasa.gov/bio/repo"
  }
];

export const DATA_CREDITS =
  "Space weather: NASA DONKI (CCMC). Radiation: NASA OSDR RadLab, ISS DosTel instruments. Space biology: NASA Open Science Data Repository (OSD-477, OSD-471, OSD-351, OSD-653, OSD-486). Archived snapshot, not live. Studies used mice and rats. Game numbers (power, oxygen, effects) are simplified for learning.";
