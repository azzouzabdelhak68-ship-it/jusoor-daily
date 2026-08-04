export const ROTATION = ['Push', 'Pull', 'Legs', 'Cardio'];

export function nextType(last) {
  if (!last) return ROTATION[0];
  const i = ROTATION.indexOf(last);
  return ROTATION[(i + 1) % ROTATION.length];
}

export const TYPE_COLORS = {
  Push: '#ef4444',
  Pull: '#f97316',
  Legs: '#eab308',
  Cardio: '#06b6d4',
};

export const TYPE_ICON = {
  Push: '🔥',
  Pull: '🏋️',
  Legs: '🦵',
  Cardio: '🏃',
};
