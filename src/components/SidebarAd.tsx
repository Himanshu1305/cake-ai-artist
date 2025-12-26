import { AdSlot } from "./AdSlot";
import { cn } from "@/lib/utils";

interface SidebarAdProps {
  className?: string;
  slotId?: string;
}

export const SidebarAd = ({ className, slotId }: SidebarAdProps) => {
  return (
    <aside
      className={cn(
        "hidden lg:block sticky top-24 w-[300px] shrink-0",
        className
      )}
    >
      <AdSlot size="rectangle" slotId={slotId} className="w-[300px]" />
    </aside>
  );
};
