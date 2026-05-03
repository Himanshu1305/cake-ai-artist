// Spot caps removed in 3-tier pricing migration. Component kept as no-op
// so existing imports continue to compile during a gradual cleanup.
interface SpotsRemainingCounterProps {
  tier?: string;
  className?: string;
}
export const SpotsRemainingCounter = (_: SpotsRemainingCounterProps) => null;
export default SpotsRemainingCounter;
