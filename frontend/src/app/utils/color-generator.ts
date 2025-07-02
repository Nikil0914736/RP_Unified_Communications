const COLORS = [
  '#7E57C2', // Deep Purple
  '#5C6BC0', // Indigo
  '#42A5F5', // Blue
  '#26A69A', // Teal
  '#66BB6A', // Green
  '#FFA726', // Orange
  '#FF7043', // Deep Orange
  '#EC407A', // Pink
  '#8D6E63', // Brown
  '#78909C'  // Blue Grey
];

export function generateColor(str: string): string {
  if (!str) {
    return COLORS[0];
  }

  /* tslint:disable:no-bitwise */
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  /* tslint:enable:no-bitwise */

  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
}
