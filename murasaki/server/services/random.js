/**
 * Small deterministic PRNG (mulberry32). Passing `?seed=` to the lessons API
 * makes a quiz reproducible, which the tests rely on.
 * @param {number} seed
 * @returns {() => number} function returning floats in [0, 1)
 */
export function createRng(seed) {
  let a = seed >>> 0;
  return function mulberry32() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates shuffle into a new array. */
export function shuffle(list, rng = Math.random) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Up to `n` random elements, without repeats. */
export function sample(list, n, rng = Math.random) {
  return shuffle(list, rng).slice(0, Math.max(0, n));
}

/** One random element. */
export function pick(list, rng = Math.random) {
  return list[Math.floor(rng() * list.length)];
}
