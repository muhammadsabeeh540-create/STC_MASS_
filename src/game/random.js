// Seeded random generator for STORM WATCH

export function createRandom(seed = 12345) {
  let state = seed >>> 0;

  return function random() {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function randomInt(random, min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}

export function randomChoice(random, items) {
  return items[Math.floor(random() * items.length)];
}

export function shuffle(random, items) {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}