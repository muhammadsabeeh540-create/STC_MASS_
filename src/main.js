
import "./style.css";

import {
  createGame,
  prepareDay,
  previewDay,
  endDay,
  getMissionStars,
} from "./game/engine.js";

import { createMarsColony } from "./3d/colony.js";
// =====================================
// APPLICATION STATE
// =====================================

let gameState = null;

const $ = (id) => document.getElementById(id);

const elements = {
  startPanel: $("game-start-panel"),
  dashboard: $("game-dashboard"),
  report: $("mission-report"),
  reportTitle: $("report-title"),
  reportContent: $("report-content"),
  missionDay: $("mission-day"),
  power: $("power-value"),
  oxygen: $("oxygen-value"),
  health: $("health-value"),
  science: $("science-value"),
  powerMeter: $("power-meter"),
  oxygenMeter: $("oxygen-meter"),
  healthMeter: $("health-meter"),
  powerStatus: $("power-status"),
  oxygenStatus: $("oxygen-status"),
  healthStatus: $("health-status"),
  powerCost: $("planned-power-cost"),
  planningMessage: $("planning-message"),
  missionLog: $("mission-log"),
  controlStatus: $("control-status"),
  controlDay: $("control-day"),
  controlMode: $("control-mode"),
  controlScience: $("control-science"),
  controlMessages: $("control-messages"),
};

// =====================================
// NAVIGATION
// =====================================

const menuButton = $("mobile-menu-toggle");
const navigation = $("primary-navigation");

menuButton?.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("is-open");

  menuButton.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    navigation?.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");

    document.querySelectorAll(".nav-link").forEach(item => {
      item.classList.remove("active");
    });

    link.classList.add("active");
  });
});

// =====================================
// SETTINGS
// =====================================

$("open-settings")?.addEventListener("click", () => {
  $("settings")?.scrollIntoView({ behavior: "smooth" });
});

$("motion-setting")?.addEventListener("change", event => {
  document.body.classList.toggle(
    "reduced-motion",
    event.target.checked
  );
});

$("graphics-setting")?.addEventListener("change", event => {
  const scene = $("colony-canvas");

  if (scene) {
    scene.dataset.graphicsEnabled = String(event.target.checked);
  }
});

// =====================================
// HOW TO PLAY
// =====================================

const howToPlayDialog = $("how-to-play-dialog");

$("open-how-to-play")?.addEventListener("click", () => {
  howToPlayDialog?.showModal();
});

document.querySelectorAll("[data-close-dialog]").forEach(button => {
  button.addEventListener("click", () => {
    howToPlayDialog?.close();
  });
});

// =====================================
// COLONY FACILITIES
// =====================================

const facilities = {
  habitat: {
    title: "Habitat",
    description: "The main living area where the four crew members sleep, work and stay protected.",
    details: "Purpose: Crew accommodation and life support."
  },
  solar: {
    title: "Solar Array",
    description: "Solar panels collect sunlight and generate electrical power for the outpost.",
    details: "Purpose: Generate electrical energy."
  },
  laboratory: {
    title: "Laboratory",
    description: "The science laboratory is used to study Mars samples and conduct research.",
    details: "Purpose: Scientific experiments."
  },
  greenhouse: {
    title: "Greenhouse",
    description: "A controlled growing area for studying plants and future food production.",
    details: "Purpose: Plant research and food experiments."
  },
  rover: {
    title: "Rover",
    description: "The rover helps explore the surrounding Martian terrain and collect samples.",
    details: "Purpose: Surface exploration."
  }
};

document.querySelectorAll("[data-facility]").forEach(button => {
  button.addEventListener("click", () => {
    const facility = facilities[button.dataset.facility];

    if (!facility) return;

    $("facility-title").textContent = facility.title;
    $("facility-description").textContent = facility.description;
    $("facility-details").textContent = facility.details;

    document.querySelectorAll("[data-facility]").forEach(item => {
      item.classList.remove("active");
    });

    button.classList.add("active");
  });
});

// =====================================
// GAME ACTIONS
// =====================================

function getActions() {
  return {
    oxygenMaker: $("action-oxygen").checked,
    exercise: $("action-exercise").checked,
    scienceMission: $("action-science").checked,
    shield: $("shield-setting").value,
    decision: $("mission-decision")?.value || null,
  };
}

function getMissionDecisionControl() {
  let container = $("mission-decision-container");

  if (!container) {
    container = document.createElement("div");
    container.id = "mission-decision-container";
    container.className = "shield-selection";

    $("daily-action-list").after(container);
  }

  const events = gameState?.flags?.todayEvents || [];

  const isRealDecision =
    gameState?.mode === "real" &&
    gameState?.day === 22;

  const isRandomDecision = events.some(
    event => event.type === "DECISION"
  );

  if (!isRealDecision && !isRandomDecision) {
    container.innerHTML = "";
    return;
  }

  if (isRealDecision) {
    container.innerHTML = `
      <label for="mission-decision">Day 22 CME Decision</label>
      <select id="mission-decision">
        <option value="">Choose an option</option>
        <option value="brace">Brace - spend 15 power</option>
        <option value="gamble">Gamble - risk extra radiation</option>
      </select>
    `;
  } else {
    container.innerHTML = `
      <p>Random mission decision card detected. Follow the event instructions in Mission Control.</p>
    `;
  }

  $("mission-decision")?.addEventListener("change", updatePreview);
}

// =====================================
// RESOURCE METER HELPERS
// =====================================

function getResourceStatus(value) {
  if (value >= 60) return "Safe";
  if (value >= 30) return "Careful";
  return "Danger";
}

function updateMeter(value, numberElement, meterElement, statusElement) {
  numberElement.textContent = Math.round(value);
  meterElement.style.width = `${Math.max(0, Math.min(100, value))}%`;

  const status = getResourceStatus(value);
  statusElement.textContent = status;

  statusElement.dataset.status = status.toLowerCase();
}

// =====================================
// MISSION CONTROL
// =====================================

function addMissionMessage(message) {
  const paragraph = document.createElement("p");
  paragraph.textContent = message;

  elements.controlMessages.prepend(paragraph);
}

function addGameLog(message) {
  const paragraph = document.createElement("p");
  paragraph.textContent = message;

  elements.missionLog.prepend(paragraph);
}

// =====================================
// DISPLAY CURRENT GAME STATE
// =====================================

function renderGame() {
  if (!gameState) return;

  elements.missionDay.textContent =
    `DAY ${String(Math.min(gameState.day, 30)).padStart(2, "0")} / 30`;

  updateMeter(
    gameState.power,
    elements.power,
    elements.powerMeter,
    elements.powerStatus
  );

  updateMeter(
    gameState.oxygen,
    elements.oxygen,
    elements.oxygenMeter,
    elements.oxygenStatus
  );

  updateMeter(
    gameState.health,
    elements.health,
    elements.healthMeter,
    elements.healthStatus
  );

  elements.science.textContent = gameState.science;

  elements.controlStatus.textContent =
    gameState.status === "playing"
      ? "ACTIVE"
      : gameState.status.toUpperCase();

  elements.controlDay.textContent =
    `${Math.min(gameState.day, 30)} / 30`;

  elements.controlMode.textContent =
    gameState.mode === "real" ? "REAL STORM" : "RANDOM";

  elements.controlScience.textContent = gameState.science;

  updatePreview();
}

// =====================================
// ACTION PREVIEW
// =====================================

function updatePreview() {
  if (!gameState || gameState.status !== "playing") return;

  const actions = getActions();
  const preview = previewDay(gameState, actions);

  elements.powerCost.textContent = preview.costs;

  if (!preview.valid) {
    elements.planningMessage.textContent = preview.reason;
    elements.planningMessage.dataset.status = "error";
    return;
  }

  elements.planningMessage.textContent =
    `After today's plan: Power ${preview.power}, Oxygen ${preview.oxygen}, Health ${preview.health.toFixed(1)}.`;

  elements.planningMessage.dataset.status = "success";
}

// =====================================
// DAILY ACTION LISTENERS
// =====================================

[
  "action-oxygen",
  "action-exercise",
  "action-science",
  "shield-setting",
].forEach(id => {
  $(id)?.addEventListener("change", updatePreview);
});

// =====================================
// START A NEW MISSION
// =====================================

function startMission(mode) {
  gameState = prepareDay(createGame(mode));

  elements.startPanel.hidden = true;
  elements.dashboard.hidden = false;
  elements.report.hidden = true;

  $("action-oxygen").checked = false;
  $("action-exercise").checked = false;
  $("action-science").checked = false;
  $("shield-setting").value = "off";

  elements.missionLog.innerHTML = "";
  elements.controlMessages.innerHTML = "";

  addGameLog(`${mode === "real" ? "Real Storm" : "Random"} mission initialized.`);
  addMissionMessage("Mission started. Crew systems are online.");

  showTodayEvents();
  getMissionDecisionControl();
  renderGame();

  $("game").scrollIntoView({ behavior: "smooth" });
}

$("start-real-mission")?.addEventListener("click", () => {
  startMission("real");
});

$("start-random-mission")?.addEventListener("click", () => {
  startMission("random");
});

// =====================================
// TODAY'S EVENT MESSAGES
// =====================================

function showTodayEvents() {
  const events = gameState?.flags?.todayEvents || [];

  if (!events.length) {
    addGameLog("No major archived space-weather event today.");
    return;
  }

  events.forEach(event => {
    let message = `${event.title || "Mission event"} detected.`;

    if (event.type === "CME") {
      message += ` Speed: ${event.speed} km/s. Estimated arrival: Day ${event.hitDay}.`;
    }

    if (event.type === "FLARE") {
      message += ` Radiation bonus: ${event.radiationBonus}.`;
    }

    if (event.type === "GEOMAGNETIC_STORM") {
      message += " Earth communication disturbance. Science Mission earns fewer points today.";
    }

    if (event.type === "DUST") {
      message += " Solar power income reduced to 25 today.";
    }

    if (event.type === "CME_DECISION") {
      message += " Prepare for the Day 22 CME decision.";
    }

    addGameLog(message);
    addMissionMessage(message);
  });

  const hits = gameState.pendingHits.filter(
    hit => hit.day === gameState.day
  );

  hits.forEach(hit => {
    addGameLog(`Incoming CME impact: ${hit.source}. Radiation bonus ${hit.radiationBonus}.`);
  });
}

// =====================================
// END THE CURRENT DAY
// =====================================

$("end-day")?.addEventListener("click", () => {
  if (!gameState || gameState.status !== "playing") return;

  const actions = getActions();

  if (
    gameState.mode === "real" &&
    gameState.day === 22 &&
    !actions.decision
  ) {
    elements.planningMessage.textContent =
      "Choose Brace or Gamble before ending Day 22.";
    elements.planningMessage.dataset.status = "error";
    return;
  }

  const result = endDay(gameState, actions);

  if (!result.success) {
    elements.planningMessage.textContent = result.reason;
    elements.planningMessage.dataset.status = "error";
    return;
  }

  const report = result.report;

  addGameLog(
    `Day ${report.day}: Power ${report.power}, Oxygen ${report.oxygen}, Health ${report.health.toFixed(1)}, Radiation ${report.radiation.toFixed(2)}, Science +${report.scienceGain}.`
  );

  addMissionMessage(
    `Day ${report.day} completed. Radiation: ${report.radiation.toFixed(2)}.`
  );

  if (report.decisionResult) {
    addMissionMessage(report.decisionResult);
  }

  gameState = result.state;

  if (gameState.status === "playing") {
    gameState = prepareDay(gameState);

    $("action-oxygen").checked = false;
    $("action-exercise").checked = false;
    $("action-science").checked = false;
    $("shield-setting").value = "off";

    getMissionDecisionControl();
    showTodayEvents();
    renderGame();
  } else {
    renderGame();
    showMissionReport();
  }
});

// =====================================
// MISSION REPORT
// =====================================

function showMissionReport() {
  elements.dashboard.hidden = true;
  elements.report.hidden = false;

  if (gameState.status === "won") {
    const stars = getMissionStars(gameState);

    elements.reportTitle.textContent = "MISSION COMPLETE";

    elements.reportContent.innerHTML = `
      <h2>${"★".repeat(stars)}${"☆".repeat(3 - stars)}</h2>
      <p>The crew survived the full 30-day mission.</p>
      <p>Final health: ${gameState.health.toFixed(1)}</p>
      <p>Final oxygen: ${gameState.oxygen}</p>
      <p>Science points: ${gameState.science}</p>
      <p>Mission stars: ${stars} / 3</p>
      <p>NASA science fact: Scientists have studied mice and rats to understand how spaceflight and different gravity levels affect bones and muscles.</p>
    `;
  } else {
    elements.reportTitle.textContent = "MISSION ENDED";

    const reason = gameState.failureReason === "oxygen"
      ? "The oxygen supply reached zero."
      : "Crew health reached zero.";

    elements.reportContent.innerHTML = `
      <p>${reason}</p>
      <p>The crew could not complete the 30-day mission.</p>
      <p>Days completed: ${gameState.log.length}</p>
      <p>Science points earned: ${gameState.science}</p>
      <p>Try balancing life support, shielding and exercise in your next mission.</p>
    `;
  }

  addMissionMessage(
    gameState.status === "won"
      ? "Mission completed successfully."
      : "Mission ended. Review the debrief."
  );

  $("mission-report").scrollIntoView({ behavior: "smooth" });
}

// =====================================
// PLAY AGAIN
// =====================================

$("play-again")?.addEventListener("click", () => {
  gameState = null;

  elements.report.hidden = true;
  elements.dashboard.hidden = true;
  elements.startPanel.hidden = false;

  $("game").scrollIntoView({ behavior: "smooth" });
});


// =====================================
// 3D MARS COLONY INITIALIZATION
// =====================================

let destroyMarsColony = null;

function initializeMarsColony() {
  const container = document.getElementById("colony-canvas");

  if (!container) {
    console.error("Colony canvas not found!");
    return;
  }

  if (destroyMarsColony) return;

  try {
    destroyMarsColony = createMarsColony();
    console.log("SUCCESS: 3D Mars Colony initialized!");
  } catch (error) {
    console.error("3D Colony failed:", error);
  }
}

// Initialize after the page loads
window.addEventListener("load", () => {
  initializeMarsColony();
});

// Initialize again when Colony Explorer is opened
document.querySelectorAll('a[href="#colony"], .nav-link').forEach(link => {
  link.addEventListener("click", () => {
    setTimeout(initializeMarsColony, 300);
  });
});
