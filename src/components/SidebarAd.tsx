import { AdSlot } from "./AdSlot";
import { cn } from "@/lib/utils";
import { AD_SLOTS } from "@/config/adSlots";

interface SidebarAdProps {
  className?: string;
  slotId?: string;
}

export const SidebarAd = ({ className, slotId }: SidebarAdProps) => {
  // Use provided slotId or default to sidebar_rectangle
  const effectiveSlotId = slotId || AD_SLOTS.sidebar_rectangle;
  
  // Don't render if no slot ID is configured
  if (!effectiveSlotId) {
    return null;
  }
  
  return (
    <aside
      className={cn(
        "hidden lg:block sticky top-24 w-[300px] shrink-0",
        className
      )}
    >
      <AdSlot size="rectangle" slotId={effectiveSlotId} className="w-[300px]" />
    </aside>
  );
};
