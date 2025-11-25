import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIOSScrollLock } from "@/hooks/useIOSScrollLock";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileSelectOption {
  value: string;
  label: string;
}

interface MobileSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: MobileSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  label?: string;
}

export const MobileSelect = ({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  className,
  triggerClassName,
  label,
}: MobileSelectProps) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const haptic = useHapticFeedback();
  
  // Apply custom scroll lock on mobile to prevent layout shifts
  useIOSScrollLock(open && isMobile);

  // Get the display label for selected value
  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  // On mobile portrait: use bottom Sheet for better UX with custom scroll lock
  if (isMobile) {
    return (
      <Sheet 
        open={open} 
        onOpenChange={(isOpen) => {
          haptic.medium(); // Haptic on sheet open/close
          setOpen(isOpen);
        }} 
        modal={false}
      >
        <SheetTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            className={cn(
              "w-full justify-between font-normal",
              !value && "text-muted-foreground",
              triggerClassName
            )}
          >
            {displayValue}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] flex flex-col">
          <SheetHeader>
            <SheetTitle>{label || placeholder}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto mt-4">
            <div className="space-y-1 pb-4">
              {options.map((option) => (
                <button
                  key={option.value}
                    onClick={() => {
                      haptic.light(); // Haptic on option selection
                      onValueChange(option.value);
                      setOpen(false);
                    }}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg transition-colors",
                    "hover:bg-accent active:bg-accent/80",
                    value === option.value && "bg-primary/10 text-primary font-medium"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // On desktop/tablet: use standard Select component
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={cn("w-full", triggerClassName)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={className}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
