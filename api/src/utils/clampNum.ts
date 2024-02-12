export const clampNum = (n: number, low: number, high: number) => {
  return Math.max(Math.min(n, high), low);
};
