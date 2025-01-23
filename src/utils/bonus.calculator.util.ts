export const calculateBonus = (rank: number): number => {
  if (rank === 1) return 100;
  if (rank <= 3) return 50;
  if (rank <= 10) return 20;
  return 0;
};
