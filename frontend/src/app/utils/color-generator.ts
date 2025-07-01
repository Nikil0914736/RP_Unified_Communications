const COLORS = [
  '#5856d6', '#ff9500', '#ff2d55', '#5ac8fa', '#ffcc00', '#4cd964', '#007aff', '#ff3b30',
  '#a2845e', '#63c9a8', '#8e8e93'
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
