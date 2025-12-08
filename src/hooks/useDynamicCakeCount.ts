/**
 * Hook to calculate a dynamic, realistic cake count that grows throughout the month.
 * Starts at ~100-200 on day 1 and grows to ~4,800-5,500 by month end.
 * Uses seeded randomness for consistency within the same month.
 */
export const useDynamicCakeCount = (): number => {
  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  
  // Seeded random function for consistency within same month
  const seededRandom = (seed: number): number => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  // Seed based on month/year for monthly consistency
  const monthSeed = now.getFullYear() * 12 + now.getMonth();
  
  // Target between 4,800 and 5,500 based on month seed
  const targetMax = 4800 + Math.floor(seededRandom(monthSeed) * 700);
  
  // Base count between 100 and 200 at start of month
  const baseCount = 100 + Math.floor(seededRandom(monthSeed + 1) * 100);
  
  // Calculate progress through the month (0 to 1)
  const progress = dayOfMonth / daysInMonth;
  
  // Add small daily variance for realism (-25 to +25)
  const dailyVariance = Math.floor(seededRandom(monthSeed + dayOfMonth) * 50) - 25;
  
  // Linear growth with variance
  const count = Math.floor(baseCount + (targetMax - baseCount) * progress + dailyVariance);
  
  // Ensure we never go below the base count
  return Math.max(baseCount, count);
};
