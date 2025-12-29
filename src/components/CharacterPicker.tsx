import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIOSScrollLock } from "@/hooks/useIOSScrollLock";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Character {
  value: string;
  label: string;
  emoji: string;
  premium?: boolean;
}

interface CharacterCategory {
  name: string;
  characters: Character[];
}

const CHARACTER_CATEGORIES: CharacterCategory[] = [
  {
    name: "🆓 Free Characters",
    characters: [
      { value: "mickey-minnie", label: "Mickey & Minnie", emoji: "🎭" },
      { value: "unicorn", label: "Unicorn", emoji: "🦄" },
      { value: "dinosaurs", label: "Dinosaurs", emoji: "🦕" },
    ]
  },
  {
    name: "🦸 Superheroes",
    characters: [
      { value: "spider-man", label: "Spider-Man", emoji: "🕷️", premium: true },
      { value: "hulk", label: "Hulk", emoji: "💪", premium: true },
      { value: "captain-america", label: "Captain America", emoji: "🛡️", premium: true },
      { value: "iron-man", label: "Iron Man", emoji: "⚡", premium: true },
      { value: "thor", label: "Thor", emoji: "⚡", premium: true },
      { value: "batman", label: "Batman", emoji: "🦇", premium: true },
      { value: "wonder-woman", label: "Wonder Woman", emoji: "⭐", premium: true },
    ]
  },
  {
    name: "👸 Disney Princesses",
    characters: [
      { value: "moana", label: "Moana", emoji: "🌊", premium: true },
      { value: "rapunzel", label: "Rapunzel", emoji: "👸", premium: true },
      { value: "cinderella", label: "Cinderella", emoji: "👸", premium: true },
      { value: "snow-white", label: "Snow White", emoji: "👸", premium: true },
      { value: "jasmine", label: "Jasmine", emoji: "👸", premium: true },
    ]
  },
  {
    name: "❄️ Frozen",
    characters: [
      { value: "anna", label: "Anna", emoji: "❄️", premium: true },
      { value: "elsa", label: "Elsa", emoji: "❄️", premium: true },
      { value: "olaf", label: "Olaf", emoji: "⛄", premium: true },
      { value: "sven", label: "Sven", emoji: "🦌", premium: true },
    ]
  },
  {
    name: "🎬 Disney/Pixar",
    characters: [
      { value: "simba", label: "Simba (Lion King)", emoji: "🦁", premium: true },
      { value: "nemo", label: "Nemo", emoji: "🐠", premium: true },
      { value: "dory", label: "Dory", emoji: "🐠", premium: true },
      { value: "aladdin", label: "Aladdin", emoji: "🧞", premium: true },
      { value: "genie", label: "Genie", emoji: "🧞", premium: true },
      { value: "zootopia", label: "Zootopia (Judy & Nick)", emoji: "🦊", premium: true },
      { value: "woody", label: "Woody (Toy Story)", emoji: "🤠", premium: true },
      { value: "buzz-lightyear", label: "Buzz Lightyear", emoji: "🚀", premium: true },
      { value: "winnie-the-pooh", label: "Winnie the Pooh", emoji: "🧸", premium: true },
    ]
  },
  {
    name: "⚡ Wizarding World",
    characters: [
      { value: "harry-potter", label: "Harry Potter", emoji: "⚡", premium: true },
      { value: "hermione-granger", label: "Hermione Granger", emoji: "🧙", premium: true },
    ]
  },
  {
    name: "🎃 Halloween/Spooky",
    characters: [
      { value: "jack-skellington", label: "Jack Skellington", emoji: "🎃", premium: true },
    ]
  },
  {
    name: "📺 Kids' TV Shows",
    characters: [
      { value: "paw-patrol", label: "PAW Patrol", emoji: "🐕", premium: true },
      { value: "peppa-pig", label: "Peppa Pig", emoji: "🐷", premium: true },
      { value: "masha-and-bear", label: "Masha and the Bear", emoji: "🐻", premium: true },
      { value: "doraemon", label: "Doraemon", emoji: "🤖", premium: true },
      { value: "shinchan", label: "Shinchan", emoji: "👦", premium: true },
    ]
  },
  {
    name: "🎬 Animation",
    characters: [
      { value: "minions", label: "Minions", emoji: "💛", premium: true },
      { value: "hello-kitty", label: "Hello Kitty", emoji: "🎀", premium: true },
      { value: "tom-and-jerry", label: "Tom and Jerry", emoji: "🐱", premium: true },
      { value: "barbie", label: "Barbie", emoji: "💖", premium: true },
    ]
  },
  {
    name: "🇮🇳 Indian Animation",
    characters: [
      { value: "chhota-bheem", label: "Chhota Bheem", emoji: "💪", premium: true },
      { value: "motu-patlu", label: "Motu Patlu", emoji: "🎭", premium: true },
    ]
  },
  {
    name: "🎌 Anime",
    characters: [
      { value: "pikachu", label: "Pikachu", emoji: "⚡", premium: true },
      { value: "totoro", label: "Totoro", emoji: "🌳", premium: true },
      { value: "sailor-moon", label: "Sailor Moon", emoji: "🌙", premium: true },
      { value: "gojo-satoru", label: "Gojo Satoru", emoji: "👁️", premium: true },
      { value: "inosuke", label: "Inosuke", emoji: "🐗", premium: true },
      { value: "zenitsu", label: "Zenitsu", emoji: "⚡", premium: true },
      { value: "todoroki-shoto", label: "Todoroki Shoto", emoji: "🔥", premium: true },
      { value: "anya-forger", label: "Anya Forger", emoji: "🥜", premium: true },
      { value: "loid-forger", label: "Loid Forger", emoji: "🕵️", premium: true },
      { value: "goku", label: "Goku", emoji: "🔥", premium: true },
      { value: "naruto", label: "Naruto", emoji: "🍥", premium: true },
    ]
  },
];

interface CharacterPickerProps {
  value: string;
  onValueChange: (value: string) => void;
  isPremium: boolean;
  disabled?: boolean;
  onPremiumBlock?: () => void;
}

export const CharacterPicker = ({
  value,
  onValueChange,
  isPremium,
  disabled = false,
  onPremiumBlock,
}: CharacterPickerProps) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const haptic = useHapticFeedback();
  
  useIOSScrollLock(open && isMobile);

  // Find selected character
  const selectedCharacter = React.useMemo(() => {
    for (const category of CHARACTER_CATEGORIES) {
      const found = category.characters.find(c => c.value === value);
      if (found) return found;
    }
    return null;
  }, [value]);

  const displayValue = selectedCharacter 
    ? `${selectedCharacter.emoji} ${selectedCharacter.label}` 
    : "Select character (optional)";

  const handleSelect = (characterValue: string, isPremiumChar: boolean) => {
    if (isPremiumChar && !isPremium) {
      haptic.error();
      onPremiumBlock?.();
      return;
    }
    haptic.light();
    onValueChange(characterValue);
    setOpen(false);
  };

  const CommandContent = () => (
    <Command className="rounded-lg">
      <CommandInput placeholder="Search characters..." className="h-11" />
      <CommandList className="max-h-[60vh] overflow-y-auto">
        <CommandEmpty>No character found.</CommandEmpty>
        {CHARACTER_CATEGORIES.map((category) => (
          <CommandGroup key={category.name} heading={category.name}>
            {category.characters.map((char) => {
              const isPremiumChar = char.premium && !isPremium;
              return (
                <CommandItem
                  key={char.value}
                  value={`${char.label} ${char.emoji}`}
                  onSelect={() => handleSelect(char.value, !!char.premium)}
                  className={cn(
                    "flex items-center justify-between cursor-pointer",
                    value === char.value && "bg-primary/10"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span>{char.emoji}</span>
                    <span>{char.label}</span>
                    {isPremiumChar && <span className="text-amber-500">👑</span>}
                  </span>
                  {value === char.value && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  );

  // Mobile: use bottom Sheet
  if (isMobile) {
    return (
      <Sheet 
        open={open} 
        onOpenChange={(isOpen) => {
          haptic.medium();
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
              "w-full justify-between font-normal bg-background border-border",
              !value && "text-muted-foreground"
            )}
          >
            {displayValue}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] flex flex-col">
          <SheetHeader>
            <SheetTitle>Select Character (Optional)</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden mt-4">
            <CommandContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: use Popover
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal bg-background border-border",
            !value && "text-muted-foreground"
          )}
        >
          {displayValue}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="start">
        <CommandContent />
      </PopoverContent>
    </Popover>
  );
};
