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
  /** Occasions this category is most relevant for. Used to pin matching groups to the top. */
  occasions?: string[];
  /** Mark as kid-focused so we can demote when an adult occasion is chosen. */
  kidsCategory?: boolean;
}

const CHARACTER_CATEGORIES: CharacterCategory[] = [
  {
    name: "🆓 Free Themes & Characters",
    characters: [
      { value: "mickey-minnie", label: "Mickey & Minnie", emoji: "🎭" },
      { value: "unicorn", label: "Unicorn", emoji: "🦄" },
      { value: "dinosaurs", label: "Dinosaurs", emoji: "🦕" },
      { value: "floral-elegance", label: "Floral Elegance", emoji: "🌸" },
      { value: "roses-and-hearts", label: "Roses & Hearts", emoji: "🌹" },
      { value: "teddy-bear", label: "Teddy Bear", emoji: "🧸" },
      { value: "pumpkin", label: "Pumpkin", emoji: "🎃" },
      { value: "christmas-tree", label: "Christmas Tree", emoji: "🎄" },
    ],
  },
  {
    name: "✨ Elegant Adult Themes",
    characters: [
      { value: "floral-cascade", label: "Floral Cascade", emoji: "💐" },
      { value: "minimalist-gold", label: "Minimalist Gold", emoji: "✨", premium: true },
      { value: "vintage-romance", label: "Vintage Romance", emoji: "🕰️", premium: true },
      { value: "modern-geometric", label: "Modern Geometric", emoji: "🔷", premium: true },
      { value: "watercolor-pastel", label: "Watercolor Pastel", emoji: "🎨", premium: true },
      { value: "lace-and-pearls", label: "Lace & Pearls", emoji: "🪡", premium: true },
    ],
    occasions: ["wedding", "anniversary", "valentines", "mothers-day", "baby-shower", "celebration", "congratulations"],
  },
  {
    name: "💍 Wedding & Engagement",
    characters: [
      { value: "wedding-floral-cascade", label: "Floral Cascade", emoji: "💐" },
      { value: "wedding-two-tier-classic", label: "Two-Tier Classic", emoji: "🎂" },
      { value: "wedding-monogram", label: "Elegant Monogram", emoji: "💌", premium: true },
      { value: "wedding-bride-groom-toppers", label: "Bride & Groom Toppers", emoji: "👰", premium: true },
      { value: "wedding-ring-and-doves", label: "Ring & Doves", emoji: "💍", premium: true },
      { value: "wedding-lace-and-pearls", label: "Lace & Pearls", emoji: "🪡", premium: true },
      { value: "wedding-gold-leaf", label: "Gold Leaf Elegance", emoji: "🥂", premium: true },
    ],
    occasions: ["wedding"],
  },
  {
    name: "❤️ Anniversary & Love",
    characters: [
      { value: "anniversary-roses-hearts", label: "Roses & Hearts", emoji: "🌹" },
      { value: "anniversary-mr-mrs", label: "Mr & Mrs", emoji: "💑" },
      { value: "anniversary-milestone-years", label: "Milestone Years (25/50)", emoji: "🎖️", premium: true },
      { value: "anniversary-champagne-toast", label: "Champagne Toast", emoji: "🥂", premium: true },
      { value: "anniversary-photo-memory", label: "Photo Memory", emoji: "🖼️", premium: true },
      { value: "anniversary-lock-and-key", label: "Lock & Key", emoji: "🔐", premium: true },
    ],
    occasions: ["anniversary", "valentines"],
  },
  {
    name: "👶 Baby Shower",
    characters: [
      { value: "baby-teddy-bear", label: "Teddy Bear", emoji: "🧸" },
      { value: "baby-booties-rattle", label: "Booties & Rattle", emoji: "👶" },
      { value: "baby-stork-delivery", label: "Stork Delivery", emoji: "🐦", premium: true },
      { value: "baby-its-a-boy", label: "It's a Boy (Blue)", emoji: "💙", premium: true },
      { value: "baby-its-a-girl", label: "It's a Girl (Pink)", emoji: "💗", premium: true },
      { value: "baby-clouds-neutral", label: "Clouds (Gender-Neutral)", emoji: "☁️", premium: true },
      { value: "baby-pram-and-moon", label: "Pram & Moon", emoji: "🌙", premium: true },
    ],
    occasions: ["baby-shower"],
  },
  {
    name: "💐 Valentine's & Romance",
    characters: [
      { value: "valentine-red-roses", label: "Red Roses", emoji: "🌹" },
      { value: "valentine-cupid", label: "Cupid", emoji: "🏹", premium: true },
      { value: "valentine-heart-bouquet", label: "Heart Bouquet", emoji: "💝", premium: true },
      { value: "valentine-love-letters", label: "Love Letters", emoji: "💌", premium: true },
    ],
    occasions: ["valentines", "anniversary"],
  },
  {
    name: "🌷 Mother's Day",
    characters: [
      { value: "mom-flower-bouquet", label: "Flower Bouquet for Mom", emoji: "💐" },
      { value: "mom-best-mom-elegant", label: "Best Mom Elegant", emoji: "🌷", premium: true },
      { value: "mom-tea-and-pearls", label: "Tea & Pearls", emoji: "🫖", premium: true },
    ],
    occasions: ["mothers-day"],
  },
  {
    name: "👔 Father's Day",
    characters: [
      { value: "dad-tie-moustache", label: "Tie & Moustache", emoji: "👔" },
      { value: "dad-tools-toolbox", label: "Tools & Toolbox", emoji: "🧰", premium: true },
      { value: "dad-best-dad-rustic", label: "Best Dad Rustic", emoji: "🪵", premium: true },
    ],
    occasions: ["fathers-day"],
  },
  {
    name: "🌙 Eid Mubarak",
    characters: [
      { value: "eid-crescent-lantern", label: "Crescent & Lantern", emoji: "🌙" },
      { value: "eid-mosque-silhouette", label: "Mosque Silhouette", emoji: "🕌", premium: true },
      { value: "eid-dates-and-henna", label: "Dates & Henna", emoji: "🌿", premium: true },
      { value: "eid-geometric-gold", label: "Geometric Gold", emoji: "✨", premium: true },
    ],
    occasions: ["eid"],
  },
  {
    name: "🪔 Diwali",
    characters: [
      { value: "diwali-diyas-rangoli", label: "Diyas & Rangoli", emoji: "🪔" },
      { value: "diwali-marigold-garland", label: "Marigold Garland", emoji: "🌼", premium: true },
      { value: "diwali-fireworks-night", label: "Fireworks Night", emoji: "🎆", premium: true },
      { value: "diwali-lakshmi-gold", label: "Lakshmi Gold", emoji: "🪙", premium: true },
    ],
    occasions: ["diwali"],
  },
  {
    name: "🎨 Holi",
    characters: [
      { value: "holi-color-splash", label: "Color Splash", emoji: "🎨" },
      { value: "holi-gulaal-swirl", label: "Gulaal Swirl", emoji: "🌈", premium: true },
      { value: "holi-pichkari-fun", label: "Pichkari Fun", emoji: "💦", premium: true },
    ],
    occasions: ["holi"],
  },
  {
    name: "🎄 Christmas",
    characters: [
      { value: "christmas-santa", label: "Santa", emoji: "🎅" },
      { value: "christmas-tree-classic", label: "Christmas Tree", emoji: "🎄" },
      { value: "christmas-reindeer-sleigh", label: "Reindeer & Sleigh", emoji: "🦌", premium: true },
      { value: "christmas-snowman", label: "Snowman", emoji: "⛄", premium: true },
      { value: "christmas-wreath", label: "Wreath", emoji: "🎁", premium: true },
      { value: "christmas-gingerbread-house", label: "Gingerbread House", emoji: "🍪", premium: true },
    ],
    occasions: ["christmas"],
  },
  {
    name: "🎃 Halloween",
    characters: [
      { value: "halloween-pumpkin-patch", label: "Pumpkin Patch", emoji: "🎃" },
      { value: "jack-skellington", label: "Jack Skellington", emoji: "💀", premium: true },
      { value: "halloween-ghost-spider", label: "Ghost & Spider", emoji: "👻", premium: true },
      { value: "halloween-witch-brew", label: "Witch's Brew", emoji: "🧙", premium: true },
      { value: "halloween-skull-roses", label: "Skull & Roses", emoji: "🥀", premium: true },
    ],
    occasions: ["halloween"],
  },
  {
    name: "🦃 Thanksgiving",
    characters: [
      { value: "thanksgiving-turkey-feast", label: "Turkey & Feast", emoji: "🦃" },
      { value: "thanksgiving-cornucopia", label: "Cornucopia", emoji: "🌽", premium: true },
      { value: "thanksgiving-autumn-leaves", label: "Autumn Leaves", emoji: "🍂", premium: true },
    ],
    occasions: ["thanksgiving"],
  },
  {
    name: "🎓 Graduation & Achievement",
    characters: [
      { value: "grad-cap-and-scroll", label: "Cap & Scroll", emoji: "🎓" },
      { value: "grad-trophy", label: "Trophy", emoji: "🏆", premium: true },
      { value: "grad-class-of-2026", label: "Class of 2026", emoji: "📜", premium: true },
      { value: "grad-books-and-apple", label: "Books & Apple", emoji: "📚", premium: true },
    ],
    occasions: ["graduation", "congratulations"],
  },
  {
    name: "✈️ Farewell & Congratulations",
    characters: [
      { value: "farewell-suitcase-globe", label: "Suitcase & Globe", emoji: "🧳" },
      { value: "farewell-bon-voyage", label: "Bon Voyage", emoji: "✈️", premium: true },
      { value: "congrats-banner", label: "Congrats Banner", emoji: "🎉", premium: true },
      { value: "congrats-champagne-celebration", label: "Champagne Celebration", emoji: "🥂", premium: true },
    ],
    occasions: ["farewell", "congratulations", "celebration"],
  },
  {
    name: "🎆 New Year",
    characters: [
      { value: "newyear-fireworks", label: "Fireworks", emoji: "🎆" },
      { value: "newyear-champagne-toast", label: "Champagne Toast", emoji: "🥂", premium: true },
      { value: "newyear-clock-midnight", label: "Clock at Midnight", emoji: "🕛", premium: true },
      { value: "newyear-gold-confetti", label: "Gold Confetti", emoji: "🎊", premium: true },
    ],
    occasions: ["new-year"],
  },
  {
    name: "🪢 Raksha Bandhan",
    characters: [
      { value: "rakhi-sibling", label: "Rakhi & Sibling", emoji: "🪢" },
      { value: "rakhi-sister-brother-bond", label: "Sister-Brother Bond", emoji: "💖", premium: true },
    ],
    occasions: ["raksha-bandhan"],
  },
  {
    name: "🏵️ Dussehra / Festive India",
    characters: [
      { value: "dussehra-marigold", label: "Marigold", emoji: "🌼" },
      { value: "dussehra-traditional-gold", label: "Traditional Gold", emoji: "🪙", premium: true },
      { value: "dussehra-festive-elegance", label: "Festive Elegance", emoji: "✨", premium: true },
    ],
    occasions: ["dussehra"],
  },
  {
    name: "🌸 Easter",
    characters: [
      { value: "easter-bunny-eggs", label: "Bunny & Eggs", emoji: "🐰" },
      { value: "easter-pastel-pastoral", label: "Pastel Pastoral", emoji: "🌷", premium: true },
      { value: "easter-spring-blooms", label: "Spring Blooms", emoji: "🌼", premium: true },
    ],
    occasions: ["easter"],
  },
  // ===== Kid-focused / pop-culture (preserved) =====
  {
    name: "🦸 Superheroes",
    kidsCategory: true,
    occasions: ["birthday"],
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
    kidsCategory: true,
    occasions: ["birthday"],
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
    kidsCategory: true,
    occasions: ["birthday"],
    characters: [
      { value: "anna", label: "Anna", emoji: "❄️", premium: true },
      { value: "elsa", label: "Elsa", emoji: "❄️", premium: true },
      { value: "olaf", label: "Olaf", emoji: "⛄", premium: true },
      { value: "sven", label: "Sven", emoji: "🦌", premium: true },
    ]
  },
  {
    name: "🎬 Disney/Pixar",
    kidsCategory: true,
    occasions: ["birthday"],
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
    kidsCategory: true,
    occasions: ["birthday"],
    characters: [
      { value: "harry-potter", label: "Harry Potter", emoji: "⚡", premium: true },
      { value: "hermione-granger", label: "Hermione Granger", emoji: "🧙", premium: true },
    ]
  },
  {
    name: "📺 Kids' TV Shows",
    kidsCategory: true,
    occasions: ["birthday"],
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
    kidsCategory: true,
    occasions: ["birthday"],
    characters: [
      { value: "minions", label: "Minions", emoji: "💛", premium: true },
      { value: "hello-kitty", label: "Hello Kitty", emoji: "🎀", premium: true },
      { value: "tom-and-jerry", label: "Tom and Jerry", emoji: "🐱", premium: true },
      { value: "barbie", label: "Barbie", emoji: "💖", premium: true },
    ]
  },
  {
    name: "🇮🇳 Indian Animation",
    kidsCategory: true,
    occasions: ["birthday"],
    characters: [
      { value: "chhota-bheem", label: "Chhota Bheem", emoji: "💪", premium: true },
      { value: "motu-patlu", label: "Motu Patlu", emoji: "🎭", premium: true },
    ]
  },
  {
    name: "🎌 Anime",
    kidsCategory: true,
    occasions: ["birthday"],
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

const ADULT_OCCASIONS = new Set([
  "wedding", "anniversary", "baby-shower", "valentines", "mothers-day", "fathers-day",
  "eid", "diwali", "holi", "christmas", "easter", "thanksgiving", "halloween",
  "dussehra", "raksha-bandhan", "new-year", "graduation", "farewell",
  "congratulations", "celebration",
]);

interface CharacterPickerProps {
  value: string;
  onValueChange: (value: string) => void;
  isPremium: boolean;
  disabled?: boolean;
  onPremiumBlock?: () => void;
  /** Currently selected occasion — used to pin matching theme categories to the top. */
  occasion?: string;
}

export const CharacterPicker = ({
  value,
  onValueChange,
  isPremium,
  disabled = false,
  onPremiumBlock,
  occasion,
}: CharacterPickerProps) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const [showAll, setShowAll] = React.useState(false);
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
    : "Select theme or character (optional)";

  // Sort & filter categories based on occasion.
  // - Pin categories whose `occasions` include the selected occasion.
  // - Always keep the Free group near the top.
  // - For adult occasions, demote kid categories behind a "Show all" toggle.
  const { primary, secondary } = React.useMemo(() => {
    const occ = (occasion || "").toLowerCase();
    const isAdult = ADULT_OCCASIONS.has(occ);

    if (!occ) {
      return { primary: CHARACTER_CATEGORIES, secondary: [] as CharacterCategory[] };
    }

    const matched: CharacterCategory[] = [];
    const free: CharacterCategory[] = [];
    const rest: CharacterCategory[] = [];
    const demoted: CharacterCategory[] = [];

    for (const cat of CHARACTER_CATEGORIES) {
      if (cat.name.startsWith("🆓")) { free.push(cat); continue; }
      if (cat.occasions?.includes(occ)) { matched.push(cat); continue; }
      if (isAdult && cat.kidsCategory) { demoted.push(cat); continue; }
      rest.push(cat);
    }

    return {
      primary: [...matched, ...free, ...rest],
      secondary: demoted,
    };
  }, [occasion]);

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

  const renderGroup = (category: CharacterCategory) => (
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
  );

  const CommandContent = () => (
    <Command className="rounded-lg">
      <CommandInput placeholder="Search themes & characters..." className="h-11" />
      <CommandList className="max-h-[60vh] overflow-y-auto">
        <CommandEmpty>No theme or character found.</CommandEmpty>
        {primary.map(renderGroup)}
        {secondary.length > 0 && (
          <>
            <CommandGroup heading="—">
              <CommandItem
                value="__toggle_show_all__"
                onSelect={() => setShowAll((v) => !v)}
                className="cursor-pointer text-primary justify-center"
              >
                {showAll ? "Hide kids' characters" : "Show all themes & kids' characters"}
              </CommandItem>
            </CommandGroup>
            {showAll && secondary.map(renderGroup)}
          </>
        )}
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
            <SheetTitle>Select Theme or Character (Optional)</SheetTitle>
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
