export interface VendorCategory {
  id: string;
  label: string;
  searchTerm: string;
  icon: string;
  description: string;
}

export const VENDOR_CATEGORIES: VendorCategory[] = [
  { id: "bakery", label: "Cake & Bakery", searchTerm: "custom cake bakery", icon: "🎂", description: "Custom celebration cakes" },
  { id: "caterer", label: "Caterer", searchTerm: "party catering service", icon: "🍽️", description: "Food and buffet service" },
  { id: "decorator", label: "Event Decorator", searchTerm: "event decorator balloon decoration", icon: "🎈", description: "Venue decoration & balloons" },
  { id: "photographer", label: "Photographer", searchTerm: "event photographer", icon: "📸", description: "Photo & video coverage" },
  { id: "venue", label: "Party Venue", searchTerm: "party hall event venue", icon: "🏛️", description: "Halls and event spaces" },
  { id: "entertainment", label: "Entertainment", searchTerm: "kids party entertainer magician", icon: "🎪", description: "Performers, magicians, games" },
  { id: "flower", label: "Florist", searchTerm: "florist flower arrangements", icon: "💐", description: "Floral arrangements" },
  { id: "transport", label: "Transport", searchTerm: "event party bus limousine", icon: "🚌", description: "Transportation & limos" },
];

export const OCCASION_VENDOR_DEFAULTS: Record<string, string[]> = {
  birthday: ["bakery", "caterer", "decorator", "photographer", "entertainment"],
  wedding: ["bakery", "caterer", "decorator", "photographer", "flower", "venue", "transport"],
  anniversary: ["bakery", "caterer", "flower", "photographer", "venue"],
  graduation: ["bakery", "caterer", "photographer", "venue"],
  baby_shower: ["bakery", "caterer", "decorator", "flower"],
  housewarming: ["caterer", "flower", "decorator"],
  engagement: ["bakery", "caterer", "flower", "decorator", "photographer"],
  default: ["bakery", "caterer", "decorator", "photographer"],
};

export function getDefaultVendorCategories(occasion?: string): VendorCategory[] {
  const occasionKey = (occasion || "default").toLowerCase().replace(/\s+/g, "_");
  const ids = OCCASION_VENDOR_DEFAULTS[occasionKey] ?? OCCASION_VENDOR_DEFAULTS.default;
  return VENDOR_CATEGORIES.filter((c) => ids.includes(c.id));
}
