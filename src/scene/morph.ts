export const MORPH_DURATION = 1.3;

export type MorphState = {
  weights: Float32Array;
  from: Float32Array;
  target: number;
  elapsed: number;
};

export function createMorphState(initial = 0): MorphState {
  const weights = new Float32Array(3);
  weights[initial] = 1;
  return {
    weights,
    from: weights.slice(),
    target: initial,
    elapsed: MORPH_DURATION,
  };
}

export function retargetMorph(state: MorphState, target: number) {
  if (
    !Number.isInteger(target) ||
    target < 0 ||
    target > 2 ||
    target === state.target
  )
    return;
  state.from.set(state.weights);
  state.target = target;
  state.elapsed = 0;
}

/** Mutates three weights in place; GPU interpolates the actual vertex buffers. */
export function advanceMorph(
  state: MorphState,
  delta: number,
  reduced = false,
) {
  state.elapsed = reduced
    ? MORPH_DURATION
    : Math.min(MORPH_DURATION, state.elapsed + Math.max(0, delta));
  const t = state.elapsed / MORPH_DURATION;
  const ease = t * t * t * (t * (t * 6 - 15) + 10);
  for (let i = 0; i < 3; i++) {
    state.weights[i] =
      state.from[i] * (1 - ease) + (i === state.target ? ease : 0);
  }
  return state.elapsed < MORPH_DURATION;
}
