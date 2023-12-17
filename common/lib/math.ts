export const roundNumber = (num: number, precision: number = 0) =>
  Math.round(num * 10 ** precision) / 10 ** precision
