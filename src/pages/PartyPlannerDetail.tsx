import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InvitePreview } from "@/components/InvitePreview";
import {
  Send,
  Sparkles,
  Plus,
  Trash2,
  Mail,
  Copy,
  Calendar as CalendarIcon,
  Users,
  MessageSquare,
  Save,
  Wand2,
  Ticket,
  ChevronDown,
  ChevronUp,
  Phone,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Themes grouped for the Select UI. Order within group matters; flatten preserves order.
const THEME_GROUPS: Array<{ label: string; themes: string[] }> = [
  {
    label: "Kids & Birthdays",
    themes: [
      "Barbie Pink",
      "Space / Astronaut",
      "Iron Man / Avengers",
      "Spider-Man",
      "Star Wars",
      "Frozen / Elsa",
      "Peppa Pig",
      "Paw Patrol",
      "Dinosaur / Jurassic",
      "Mermaid / Under the Sea",
      "Construction / Trucks",
      "Jungle Safari",
      "Pokemon",
      "Minecraft",
      "Princess / Royal",
      "Wonder Woman",
      "Hot Wheels",
      "Bluey",
      "Cocomelon",
      "Harry Potter",
      "Unicorn & Rainbow",
      "Carnival / Circus",
    ],
  },
  {
    label: "Romantic & Anniversary",
    themes: [
      "Romantic Rose Gold",
      "Candlelight & Champagne",
      "Vintage Sepia Romance",
      "Eternal Bond",
      "Moonlight & Stars",
    ],
  },
  {
    label: "Elegant & Soothing",
    themes: [
      "Floral Garden",
      "Boho Chic",
      "Pastel Minimal",
      "Black & Gold Elegance",
      "Garden Tea Party",
      "Ocean Breeze",
      "Lavender Fields",
      "Soft Sunrise",
    ],
  },
  {
    label: "Fun & Trendy",
    themes: [
      "Taylor Swift Eras",
      "Disco / Y2K",
      "Tropical Luau",
      "Retro 90s",
      "Sports / Football",
    ],
  },
  {
    label: "Spiritual",
    themes: ["Spiritual / ISKCON"],
  },
  {
    label: "Other",
    themes: ["Custom"],
  },
];

const TRENDING_THEMES = THEME_GROUPS.flatMap((g) => g.themes);

// Fuzzy match a saved theme string back to one of the trending entries.
const matchTrendingTheme = (raw?: string | null): string | null => {
  if (!raw) return null;
  const s = raw.toLowerCase().trim();
  const direct = TRENDING_THEMES.find((t) => t.toLowerCase() === s);
  if (direct) return direct;
  const aliases: Array<[string[], string]> = [
    [["iron", "avenger", "superhero", "marvel"], "Iron Man / Avengers"],
    [["spider"], "Spider-Man"],
    [["star wars", "jedi", "sith"], "Star Wars"],
    [["frozen", "elsa", "anna"], "Frozen / Elsa"],
    [["barbie", "pink doll"], "Barbie Pink"],
    [["bluey"], "Bluey"],
    [["taylor", "swift", "eras"], "Taylor Swift Eras"],
    [["cocomelon"], "Cocomelon"],
    [["harry potter", "hogwarts", "wizard"], "Harry Potter"],
    [["floral", "flower", "garden flower"], "Floral Garden"],
    [["boho"], "Boho Chic"],
    [["disco", "y2k"], "Disco / Y2K"],
    [["unicorn", "rainbow"], "Unicorn & Rainbow"],
    [["pastel", "minimal"], "Pastel Minimal"],
    [["luau", "tropical", "hawaii"], "Tropical Luau"],
    [["black & gold", "black and gold", "elegan"], "Black & Gold Elegance"],
    [["retro", "90s", "90's"], "Retro 90s"],
    [["football", "soccer", "sports"], "Sports / Football"],
    [["iskcon", "spiritual", "krishna", "hare", "religious"], "Spiritual / ISKCON"],
    [["tea party"], "Garden Tea Party"],
    [["carnival", "circus"], "Carnival / Circus"],
    [["space", "astronaut", "galaxy", "rocket", "cosmic"], "Space / Astronaut"],
    [["peppa"], "Peppa Pig"],
    [["paw patrol"], "Paw Patrol"],
    [["dinosaur", "dino", "jurassic"], "Dinosaur / Jurassic"],
    [["mermaid", "under the sea", "ocean theme"], "Mermaid / Under the Sea"],
    [["construction", "trucks", "digger"], "Construction / Trucks"],
    [["jungle", "safari", "lion"], "Jungle Safari"],
    [["pokemon", "pikachu"], "Pokemon"],
    [["minecraft"], "Minecraft"],
    [["princess", "royal"], "Princess / Royal"],
    [["wonder woman"], "Wonder Woman"],
    [["hot wheels"], "Hot Wheels"],
    [["rose gold", "romantic rose"], "Romantic Rose Gold"],
    [["candlelight", "champagne"], "Candlelight & Champagne"],
    [["vintage", "sepia"], "Vintage Sepia Romance"],
    [["eternal", "burgundy"], "Eternal Bond"],
    [["moonlight", "starry night"], "Moonlight & Stars"],
    [["ocean breeze", "coastal"], "Ocean Breeze"],
    [["lavender"], "Lavender Fields"],
    [["sunrise", "peach"], "Soft Sunrise"],
  ];
  for (const [keys, theme] of aliases) {
    if (keys.some((k) => s.includes(k))) return theme;
  }
  return null;
};

type Variant = { headline: string; message: string };
type ThemeInvite = { default: Variant[]; byOccasion?: Record<string, Variant[]> };

// Resolve a normalized occasion key from free-text occasion field.
const matchOccasionKey = (occasion?: string | null): string | null => {
  if (!occasion) return null;
  const s = occasion.toLowerCase();
  if (s.includes("anniversary") || s.includes("wedding ann")) return "anniversary";
  if (s.includes("wedding") || s.includes("marriage")) return "wedding";
  if (s.includes("engage")) return "engagement";
  if (s.includes("baby shower") || s.includes("baby")) return "baby_shower";
  if (s.includes("housewarming") || s.includes("house warming")) return "housewarming";
  if (s.includes("birthday")) return "birthday";
  if (s.includes("retire")) return "retirement";
  if (s.includes("graduat")) return "graduation";
  return null;
};

const INVITE_COPY: Record<string, ThemeInvite> = {
  "Iron Man / Avengers": {
    default: [
      { headline: "Suit up — the squad is assembling!", message: "Calling all heroes! Join us for an action-packed celebration with cake, games, big laughs, and a mission your little Avenger will never forget. Come ready for heroic photos and super-powered fun." },
      { headline: "Heroes wanted for one epic party!", message: "The celebration signal is on! We'd love you to join a red-and-gold day of surprises, cake, and mighty memories. Bring your best hero energy — this party needs the full team." },
    ],
  },
  "Space / Astronaut": {
    default: [
      { headline: "3... 2... 1... blast off to the party!", message: "You're invited on a mission to celebrate among stars, planets, cake, and cosmic fun. Pack your biggest smile — this launch window opens for one unforgettable celebration." },
    ],
  },
  Minecraft: {
    default: [
      { headline: "Build, play, celebrate — party mode is on!", message: "Join us for a block-by-block celebration filled with cake, games, and creative fun. Bring your explorer spirit and get ready to craft some brilliant memories together." },
    ],
  },
  "Spiritual / ISKCON": {
    default: [
      { headline: "A joyful celebration with blessings, cake, and love", message: "Please join us for a warm, soulful celebration filled with blessings, music, sweet moments, cake, and the company of people who make the day meaningful." },
      { headline: "Come share a blessed and beautiful celebration", message: "We'd love your presence for a peaceful, happy gathering with heartfelt wishes, delicious cake, and memories made together in a festive spiritual theme." },
    ],
  },
  "Retro 90s": {
    default: [
      { headline: "Pop in the cassette — it's a totally rad party!", message: "Neon, scrunchies, and a playlist that still slaps. Come dressed in your favorite 90s vibes for a night of nostalgia, cake, and unforgettable laughs." },
      { headline: "Rewind, replay, party on", message: "We're cranking the boombox and pulling out the polaroids. Join us for a colorful retro celebration packed with snacks, music, and old-school fun." },
    ],
    byOccasion: {
      anniversary: [
        { headline: "Pop in your scrunchies — we're celebrating years of cool", message: "Cassettes are rewound, the playlist is ready, and the love story is still our favorite single. Join us for a totally rad night of neon, nostalgia, cake, and the two people who proved good things never go out of style." },
        { headline: "All that and a bag of chips — and still in love", message: "From mixtapes to milestones, the journey has been one for the highlight reel. Come dressed in your favorite 90s look and help us celebrate another year of love, laughs, and great hair." },
      ],
      wedding: [
        { headline: "Two people, one playlist, forever pressed play", message: "Bring your boldest 90s outfit and your dancing shoes. We're making it official with neon lights, retro tunes, and the kind of party your future kids will ask about." },
      ],
    },
  },
  "Romantic Rose Gold": {
    default: [
      { headline: "An evening of soft light and sweet moments", message: "Candles, roses, a few favorite songs, and the people who make life feel warm. We'd love you to join us for a beautiful, heartfelt celebration." },
    ],
    byOccasion: {
      anniversary: [
        { headline: "Still each other's favorite story", message: "Soft candlelight, a few familiar songs, and a table set for the people who've cheered us on. Please join us as we celebrate another beautiful chapter together." },
        { headline: "Years later, still choosing each other", message: "We're raising a glass to the laughter, the quiet moments, and everyone who's been part of our story. Come share an evening of warmth, roses, and good company." },
      ],
      wedding: [
        { headline: "Two hearts, one beautiful day", message: "We can't imagine this day without you. Join us for a soft, romantic celebration filled with rose-gold light, warm wishes, and the start of forever." },
      ],
      engagement: [
        { headline: "She said yes — and we'd love you there", message: "A quiet candlelit evening, a few sparkling rings, and the people we love most. Come help us celebrate this beautiful new beginning." },
      ],
    },
  },
  "Candlelight & Champagne": {
    default: [
      { headline: "A warm, glowing evening just for you", message: "Soft candlelight, a flute of something bubbly, and the people we love most. Please join us for a graceful celebration filled with quiet joy." },
    ],
    byOccasion: {
      anniversary: [
        { headline: "Raising a glass to all the years", message: "Years of laughter, of small moments, of choosing each other again and again. Come help us toast another beautiful chapter — bring your favorite memory of us." },
      ],
      retirement: [
        { headline: "A quiet toast to a brilliant chapter", message: "After all the hard work, the long days, and the wins big and small — it's time to pour something gold and celebrate what comes next." },
      ],
    },
  },
  "Vintage Sepia Romance": {
    default: [
      { headline: "A timeless evening, beautifully celebrated", message: "Old photographs, soft music, and a room full of love. Join us for an elegant, classic celebration — the kind of night we'll talk about for years." },
    ],
    byOccasion: {
      anniversary: [
        { headline: "A love story written slowly, one day at a time", message: "Some stories only get richer with the years. Come help us turn another page — with warm light, soft music, and the people who've shared the journey." },
      ],
    },
  },
  "Moonlight & Stars": {
    default: [
      { headline: "Under a quiet sky, we celebrate", message: "Soft starlight, a calm evening, and the people who matter most. Please join us for a gentle, beautiful gathering you'll remember." },
    ],
    byOccasion: {
      anniversary: [
        { headline: "Still wishing on the same stars", message: "Years of nights like this one — the talks, the silences, the small moments. Come share a quiet, starlit evening as we celebrate another beautiful year together." },
      ],
    },
  },
  "Ocean Breeze": {
    default: [
      { headline: "Calm waves, warm hearts, simple joy", message: "A gentle breeze, the soft sound of the sea, and the people we love. Come share a peaceful, beautiful afternoon with us." },
    ],
    byOccasion: {
      anniversary: [
        { headline: "Years gone by like the tide — beautifully", message: "Through every season, the water still feels like home with you. Come share a soft, seaside evening as we celebrate another year of love." },
      ],
      wedding: [
        { headline: "Where the sea meets forever", message: "With waves at our back and sunlight on our faces, we're saying yes to a lifetime together. We can't wait to share this day with you." },
      ],
    },
  },
  "Lavender Fields": {
    default: [
      { headline: "A gentle, fragrant celebration", message: "Soft purples, garden light, and the people who make the day feel like home. Please join us for a calm, beautiful gathering." },
    ],
    byOccasion: {
      baby_shower: [
        { headline: "A sweet little someone is on the way 💜", message: "Sip something soft, share a gentle wish, and help us welcome the newest little soul to our family." },
      ],
    },
  },
  "Eternal Bond": {
    default: [
      { headline: "Years of love, beautifully celebrated", message: "Candlelight, deep red roses, and a heart full of gratitude. Please join us as we mark another meaningful chapter together." },
    ],
    byOccasion: {
      anniversary: [
        { headline: "Years of love — and still our favorite hello", message: "Through every season and every chapter, we keep choosing each other. Come help us celebrate the warmth, the laughter, and the love that's grown stronger with time." },
      ],
      wedding: [
        { headline: "Tied together, beautifully and forever", message: "With deep love and a few happy tears, we'd love you beside us as we promise the rest of our days to each other." },
      ],
    },
  },
  "Soft Sunrise": {
    default: [
      { headline: "New beginnings, warm welcomes", message: "A gentle morning, soft peach light, and the people we love. Come share a quiet, beautiful gathering with us." },
    ],
    byOccasion: {
      baby_shower: [
        { headline: "A tiny new sunrise is on the way 🌅", message: "Sip something sweet, share a wish, and help us welcome the newest little light into our family." },
      ],
      housewarming: [
        { headline: "New home, warm beginnings", message: "We've put down roots in a new place and we'd love to fill it with the people who matter. Drop in for cake, a hug, and the start of something lovely." },
      ],
      engagement: [
        { headline: "The start of forever 🌅", message: "Soft light, soft yes, soft beginning. Come share an early morning celebration with us as we step into this new chapter." },
      ],
    },
  },
  "Floral Garden": {
    default: [
      { headline: "A blooming celebration awaits", message: "Petals, sunlight, and a garden full of laughter. Please join us for a fresh, beautiful afternoon together." },
    ],
    byOccasion: {
      baby_shower: [
        { headline: "A tiny petal is on the way 🌸", message: "Sip something sweet, share a wish, and help us welcome the newest little blossom to our garden." },
      ],
      anniversary: [
        { headline: "Still blooming, year after year", message: "Some loves grow slowly and beautifully, like a well-tended garden. Come share an afternoon of flowers, cake, and warm company." },
      ],
    },
  },
  "Garden Tea Party": {
    default: [
      { headline: "Tea, treats, and lovely company", message: "A pot of something warm, a few favorite cakes, and a soft afternoon together. We'd love you to join us." },
    ],
    byOccasion: {
      baby_shower: [
        { headline: "A wee one is brewing 🫖", message: "Bring a soft wish for the little one and stay for tea, treats, and a slow, sweet afternoon." },
      ],
    },
  },
  "Black & Gold Elegance": {
    default: [
      { headline: "An elegant evening, just for you", message: "Black tie energy, golden light, and a room full of people we love. Please join us for a sophisticated celebration to remember." },
    ],
    byOccasion: {
      anniversary: [
        { headline: "Pouring gold for another year of love", message: "Dress sharp, smile wide, and join us for a glamorous evening as we toast another beautiful year together." },
      ],
    },
  },
  "Pastel Minimal": {
    default: [
      { headline: "Soft, simple, lovely", message: "Just the people we love and a few quietly beautiful moments. Please join us for a calm, lovely gathering." },
    ],
    byOccasion: {
      baby_shower: [
        { headline: "A small, sweet hello is coming", message: "Soft pastels, light bites, and warm wishes for the little one on the way. We'd love you there." },
      ],
    },
  },
  "Boho Chic": {
    default: [
      { headline: "Earthy, warm, and beautifully you", message: "Pampas, candles, and a relaxed celebration with the people who feel like home. Come as you are." },
    ],
  },
  "Disco / Y2K": {
    default: [
      { headline: "Get ready to groove", message: "Disco lights, sparkly outfits, and a playlist that won't quit. Come dance, celebrate, and have the time of your life." },
    ],
  },
  "Unicorn & Rainbow": {
    default: [
      { headline: "A magical, sparkly celebration awaits!", message: "Rainbows, glitter, cake, and unicorn smiles. Bring your most colorful self for a magical day full of laughter and sweet surprises." },
    ],
  },
  "Tropical Luau": {
    default: [
      { headline: "Aloha — let's party island style", message: "Grass skirts, fresh pineapple, and a playlist that feels like a vacation. Come join us for a sunny, laid-back celebration." },
    ],
  },
  "Barbie Pink": {
    default: [
      { headline: "Hi Barbie! Hi party!", message: "Pink everything, sparkle everywhere, and the brightest celebration of the year. Wear your boldest pink and come ready to dance." },
    ],
  },
  Bluey: {
    default: [
      { headline: "Wackadoo! It's party time", message: "Games, giggles, and a whole lot of Bluey magic. Bring your imagination and your best dance moves." },
    ],
  },
  "Frozen / Elsa": {
    default: [
      { headline: "Let it go and join the party", message: "Sparkles, snowflakes, and a celebration as magical as Arendelle. Come dressed as your favorite character." },
    ],
  },
  "Princess / Royal": {
    default: [
      { headline: "A royal invitation just for you", message: "Tiaras on, manners ready — a royal celebration awaits with cake, games, and majestic memories." },
    ],
  },
  "Star Wars": {
    default: [
      { headline: "May the party be with you", message: "Lightsabers ready, the Force is strong with this one. Join us across the galaxy for an unforgettable celebration." },
    ],
  },
  "Spider-Man": {
    default: [
      { headline: "Your friendly neighborhood party invite", message: "Web-slinging, wall-crawling fun awaits. Bring your spidey-sense and get ready for a heroic celebration." },
    ],
  },
  "Harry Potter": {
    default: [
      { headline: "Your Hogwarts letter has arrived", message: "Wands at the ready! Join us for a magical celebration filled with spells, sweets, and a little bit of mischief." },
    ],
  },
  "Carnival / Circus": {
    default: [
      { headline: "Step right up to the greatest party!", message: "Big top fun, popcorn, and games for everyone. Come ready for a colorful, joyful celebration like no other." },
    ],
  },
  "Sports / Football": {
    default: [
      { headline: "Game on — be there or be square", message: "Jerseys on, cheer ready! Join us for a winning celebration with your favorite team energy." },
    ],
  },
  "Taylor Swift Eras": {
    default: [
      { headline: "It's me, hi — you're invited, it's me", message: "Friendship bracelets, sparkly outfits, and an Eras-worthy celebration. Come ready to sing every word." },
    ],
  },
  Cocomelon: {
    default: [
      { headline: "Sing, dance, and celebrate together", message: "JJ and friends are ready to party! Join us for a sweet, sing-along celebration with all the fun." },
    ],
  },
  "Peppa Pig": {
    default: [
      { headline: "Snorts of joy — let's party!", message: "Muddy puddles and pink fun await. Come join Peppa and friends for a playful, sweet celebration." },
    ],
  },
  "Paw Patrol": {
    default: [
      { headline: "No job is too big — no pup is too small", message: "Suit up, pups! Join the rescue team for an action-packed celebration with cake and adventure." },
    ],
  },
  "Dinosaur / Jurassic": {
    default: [
      { headline: "A roaringly good celebration", message: "Stomp on over for a prehistoric party with dino games, cake, and Jurassic-sized fun." },
    ],
  },
  "Mermaid / Under the Sea": {
    default: [
      { headline: "Dive in — the party's making waves", message: "Shells, sparkle, and seaside magic. Come swim into a beautiful underwater celebration." },
    ],
  },
  "Construction / Trucks": {
    default: [
      { headline: "Hard hats on — celebration in progress", message: "Diggers, dumpers, and big builds await. Bring your hard hat for a hands-on, fun-filled party." },
    ],
  },
  "Jungle Safari": {
    default: [
      { headline: "Time for a wild adventure", message: "Lions, tigers, and cake — oh my! Join us for a roaring jungle celebration with games and surprises." },
    ],
  },
  Pokemon: {
    default: [
      { headline: "Gotta party 'em all", message: "Pokeballs ready! Join us for a Pokemon-themed celebration filled with games, prizes, and adventure." },
    ],
  },
  "Wonder Woman": {
    default: [
      { headline: "Calling all wonder women", message: "Strength, sparkle, and a celebration fit for a hero. Bring your power pose and your best smile." },
    ],
  },
  "Hot Wheels": {
    default: [
      { headline: "Start your engines — party time", message: "Vroom on over for a high-speed celebration with races, cake, and cars galore." },
    ],
  },
};

const getSuggestedInvite = (theme: string | null | undefined, occasion: string | null | undefined, title: string, index = 0): Variant => {
  const themeKey = matchTrendingTheme(theme);
  const occasionKey = matchOccasionKey(occasion);
  const themeEntry = themeKey ? INVITE_COPY[themeKey] : undefined;

  const occasionVariants = themeEntry?.byOccasion && occasionKey ? themeEntry.byOccasion[occasionKey] : undefined;
  const themeVariants = themeEntry?.default;

  const fallback: Variant[] = [
    { headline: `You're invited to ${title || "our celebration"}!`, message: `Join us for a warm, happy ${occasion || "celebration"} filled with cake, smiles, photos, and little surprises. We'd love to celebrate this special day with you.` },
    { headline: "Come celebrate, laugh, and make sweet memories!", message: `We're planning a joyful ${occasion || "party"} with a beautiful theme, delicious cake, and the people who make the day feel extra special. Hope you can be there!` },
  ];

  const options = (occasionVariants && occasionVariants.length)
    ? occasionVariants
    : (themeVariants && themeVariants.length)
      ? themeVariants
      : fallback;

  return options[((index % options.length) + options.length) % options.length];
};

export default function PartyPlannerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [party, setParty] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Event details form state
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined);
  const [eventTime, setEventTime] = useState("18:00");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [themePick, setThemePick] = useState<string>("");
  const [customTheme, setCustomTheme] = useState("");
  const [guestCount, setGuestCount] = useState<string>("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);
  const [partyTitle, setPartyTitle] = useState("");
  const [inviteHeadline, setInviteHeadline] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [savingInvite, setSavingInvite] = useState(false);
  const [inviteSuggestionIndex, setInviteSuggestionIndex] = useState(0);
  const [inviteEdited, setInviteEdited] = useState(false);
  const [inviteGenerating, setInviteGenerating] = useState(false);
  const [showSecondary, setShowSecondary] = useState(false);

  const loadAll = async () => {
    const { data: p } = await supabase.from("parties").select("*").eq("id", id!).maybeSingle();
    if (!p) {
      navigate("/party-planner");
      return;
    }
    setParty(p);
    setPartyTitle(p.title || "");
    const suggestedInvite = getSuggestedInvite(p.theme, p.occasion, p.title || "your party");
    // Detect stale ISKCON/spiritual copy that doesn't match the current theme and replace silently.
    const themeStr = (p.theme || "").toLowerCase();
    const themeIsSpiritual = /iskcon|spiritual|krishna|hare|religious|puja/.test(themeStr);
    const SPIRITUAL_RX = /(iskcon|spiritual|krishna|hare krishna|aarti|blessing|blessed|puja|prasad|soulful)/i;
    const savedHeadline = (p as any).invite_headline as string | null;
    const savedMessage = (p as any).invite_message as string | null;
    const headlineLeaks = !!savedHeadline && !themeIsSpiritual && SPIRITUAL_RX.test(savedHeadline);
    const messageLeaks = !!savedMessage && !themeIsSpiritual && SPIRITUAL_RX.test(savedMessage);
    if (headlineLeaks || messageLeaks) {
      setInviteHeadline(suggestedInvite.headline);
      setInviteMessage(suggestedInvite.message);
      setInviteEdited(false);
      // Clear stale fields in DB silently so it doesn't re-leak on reload.
      supabase.from("parties").update({
        invite_headline: suggestedInvite.headline,
        invite_message: suggestedInvite.message,
      } as any).eq("id", id!).then(() => {});
    } else {
      setInviteHeadline(savedHeadline || suggestedInvite.headline);
      setInviteMessage(savedMessage || suggestedInvite.message);
    }
    // Hydrate form
    if (p.event_date) {
      const d = new Date(p.event_date);
      setEventDate(d);
      setEventTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    }
    setVenue(p.venue || "");
    setCity((p as any).city || "");
    setGuestCount(p.guest_count ? String(p.guest_count) : "");
    setContactEmail((p as any).contact_email || "");
    setContactPhone((p as any).contact_phone || "");
    if (p.theme) {
      const match = matchTrendingTheme(p.theme);
      if (match) {
        setThemePick(match);
        setCustomTheme("");
      } else {
        setThemePick("Custom");
        setCustomTheme(p.theme);
      }
    }

    const [{ data: t }, { data: g }, { data: m }] = await Promise.all([
      supabase.from("party_tasks").select("*").eq("party_id", id!).order("due_date"),
      supabase.from("party_guests").select("*").eq("party_id", id!).order("created_at"),
      supabase.from("party_chat_messages").select("*").eq("party_id", id!).order("created_at"),
    ]);
    setTasks(t || []);
    setGuests(g || []);
    setMessages(m || []);
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  // Realtime RSVP updates
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`party-guests-${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "party_guests", filter: `party_id=eq.${id}` },
        (payload) => {
          const updated = payload.new as any;
          const old = payload.old as any;
          setGuests((gs) => gs.map((g) => (g.id === updated.id ? { ...g, ...updated } : g)));
          if (
            old?.rsvp_status === "pending" &&
            updated?.rsvp_status &&
            updated.rsvp_status !== "pending"
          ) {
            const emoji =
              updated.rsvp_status === "yes" ? "🎉" : updated.rsvp_status === "no" ? "😢" : "🤔";
            toast.success(`${updated.name} just RSVP'd ${updated.rsvp_status} ${emoji}`);
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Welcome message when chat empty
  useEffect(() => {
    if (party && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: `Hi! I'm your Party Concierge 🎉 Fill in the details on the left and I'll build a complete plan in seconds. Or just tell me what you're celebrating!`,
        },
      ]);
    }
  }, [party]);

  const saveDetails = async () => {
    if (!id) return;
    setSavingDetails(true);
    let isoDate: string | null = null;
    let tz: string | null = null;
    if (eventDate) {
      const [hh, mm] = eventTime.split(":").map(Number);
      const d = new Date(eventDate);
      d.setHours(hh || 0, mm || 0, 0, 0);
      isoDate = d.toISOString();
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    const finalTheme = themePick === "Custom" ? customTheme.trim() : themePick;
    const { error } = await supabase
      .from("parties")
      .update({
        title: partyTitle.trim() || party?.title || "Untitled Party",
        event_date: isoDate,
        event_timezone: tz,
        venue: venue.trim() || null,
        city: city.trim() || null,
        theme: finalTheme || null,
        guest_count: guestCount ? Number(guestCount) : 0,
        contact_email: contactEmail.trim() || null,
        contact_phone: contactPhone.trim() || null,
      } as any)
      .eq("id", id);
    setSavingDetails(false);
    if (error) {
      toast.error("Couldn't save details");
      return;
    }
    toast.success("Event details saved");
    await loadAll();
  };

  const saveInvite = async () => {
    if (!id) return;
    setSavingInvite(true);
    const { error } = await supabase
      .from("parties")
      .update({
        invite_headline: inviteHeadline.trim() || null,
        invite_message: inviteMessage.trim() || null,
      } as any)
      .eq("id", id);
    setSavingInvite(false);
    if (error) {
      toast.error("Couldn't save invite");
      return;
    }
    toast.success("Invite saved");
    await loadAll();
  };

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || sending) return;
    const userMsg = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    if (!overrideText) setInput("");
    setSending(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Please sign in again");
      const { data, error } = await supabase.functions.invoke("party-planner-chat", {
        body: { partyId: id, userMessage: text },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMessages((m) => [...m, { role: "assistant", content: data.message }]);
      if (data.planBuilt) {
        toast.success("Your party plan is ready!");
        await loadAll();
        setActiveTab("checklist");
      }
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I hit a snag. Try again?" }]);
    } finally {
      setSending(false);
    }
  };

  const generatePlanNow = () =>
    sendMessage(
      "Use the event details I've already filled in to build the full party plan now. Skip clarifying questions and call build_party_plan immediately.",
    );

  const draftVendorMessage = () =>
    sendMessage(
      "Draft a short, friendly WhatsApp/email message I can send to vendors (caterer, decorator, baker) requesting a quote. Include all the event details, my contact info, and the party theme. Format it as a copy-paste block.",
    );

  const toggleTask = async (taskId: string, current: boolean) => {
    setTasks((ts) => ts.map((t) => (t.id === taskId ? { ...t, is_completed: !current } : t)));
    await supabase.from("party_tasks").update({ is_completed: !current }).eq("id", taskId);
  };

  const updateTaskVendor = async (taskId: string, patch: Record<string, any>) => {
    setTasks((ts) => ts.map((t) => (t.id === taskId ? { ...t, ...patch } : t)));
    await supabase.from("party_tasks").update(patch as any).eq("id", taskId);
  };

  const sendVendorEmail = async (taskId: string, customMessage?: string) => {
    toast.loading("Emailing vendor...", { id: `vendor-${taskId}` });
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Please sign in again");
      const { data, error } = await supabase.functions.invoke("send-vendor-email", {
        body: { taskId, customMessage },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Vendor emailed", { id: `vendor-${taskId}` });
      await loadAll();
    } catch (e: any) {
      toast.error(e.message || "Could not send", { id: `vendor-${taskId}` });
    }
  };

  const generateVendorMessage = async (taskId: string, variation = 0) => {
    toast.loading("Drafting message...", { id: `gen-${taskId}` });
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Please sign in again");
      const { data, error } = await supabase.functions.invoke("generate-vendor-message", {
        body: { taskId, variation },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setTasks((ts) => ts.map((t) => (t.id === taskId ? { ...t, vendor_message: data.message } : t)));
      toast.success("AI message ready — edit if you'd like", { id: `gen-${taskId}` });
    } catch (e: any) {
      toast.error(e.message || "Could not generate", { id: `gen-${taskId}` });
    }
  };

  const buildVendorMessage = (t: any) => {
    if (t.vendor_message?.trim()) return t.vendor_message;
    const dateStr = party?.event_date
      ? new Date(party.event_date).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short", timeZone: party.event_timezone || undefined })
      : "TBD";
    const venue = [party?.venue, party?.city].filter(Boolean).join(", ") || "TBD";
    const greeting = t.vendor_name ? `Hi ${t.vendor_name},` : "Hello,";
    return `${greeting}\n\nI'm planning a ${party?.occasion || "celebration"} (${party?.title}) and would love your help with: ${t.title}.\n\n• When: ${dateStr}\n• Where: ${venue}\n• Guests: ${party?.guest_count || "TBD"}\n• Theme: ${party?.theme || "TBD"}\n${t.description ? `\nWhat I'm looking for:\n${t.description}\n` : ""}\nCould you share availability and a quote?\n\nThanks!\n${party?.contact_phone ? `📱 ${party.contact_phone}\n` : ""}${party?.contact_email ? `✉️ ${party.contact_email}` : ""}`;
  };

  const addGuest = async () => {
    if (!guestName.trim()) return;
    const { data, error } = await supabase
      .from("party_guests")
      .insert({ party_id: id, name: guestName.trim(), email: guestEmail.trim() || null })
      .select()
      .single();
    if (error) {
      toast.error("Could not add guest");
      return;
    }
    setGuests((g) => [...g, data]);
    setGuestName("");
    setGuestEmail("");
  };

  const removeGuest = async (gid: string) => {
    await supabase.from("party_guests").delete().eq("id", gid);
    setGuests((g) => g.filter((x) => x.id !== gid));
  };

  const sendInvites = async () => {
    const pending = guests.filter((g) => g.email && !g.invited_at);
    if (!pending.length) {
      toast.info("No new guests with email to invite");
      return;
    }
    toast.loading("Sending invites...", { id: "inv" });
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Please sign in again");
      const { data, error } = await supabase.functions.invoke("send-party-invite", {
        body: { partyId: id, guestIds: pending.map((g) => g.id) },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (error) throw error;
      toast.success(`Sent ${data.sent} invitation${data.sent === 1 ? "" : "s"}`, { id: "inv" });
      await loadAll();
    } catch (e: any) {
      toast.error(e.message || "Failed to send", { id: "inv" });
    }
  };

  if (!party) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  // Group day-of / secondary tasks under a collapsible "Show more" section.
  // Detection is by category ("day-of") OR known secondary title substrings, so AI variations still group correctly.
  const SECONDARY_TITLES = ["seating arrangement", "activity planning", "party day setup", "day-of schedule", "day of schedule", "venue walkthrough", "day-of helper", "day of helper"];
  const isSecondary = (t: any) => {
    if ((t.category || "").toLowerCase() === "day-of") return true;
    const lt = (t.title || "").toLowerCase();
    return SECONDARY_TITLES.some((s) => lt.includes(s));
  };
  const primaryTasks = tasks.filter((t) => !isSecondary(t));
  const secondaryTasks = tasks.filter(isSecondary);
  const secondaryDone = secondaryTasks.filter((t) => t.is_completed).length;
  // showSecondary is declared above with the other hooks.
  const tz = party.event_timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const currentInviteTheme =
    themePick === "Custom"
      ? (customTheme.trim() || party.theme)
      : (themePick || party.theme);
  const localFallback = (forceIndex?: number) => {
    const nextIndex = forceIndex ?? inviteSuggestionIndex + 1;
    const suggestion = getSuggestedInvite(currentInviteTheme, party.occasion, partyTitle || party.title, nextIndex);
    setInviteSuggestionIndex(nextIndex);
    setInviteHeadline(suggestion.headline);
    setInviteMessage(suggestion.message);
    setInviteEdited(false);
  };
  const applyInviteSuggestion = async () => {
    if (inviteGenerating) return;
    setInviteGenerating(true);
    try {
      const eventDateStr = party.event_date
        ? new Date(party.event_date).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short", timeZone: tz })
        : "";
      const { data, error } = await supabase.functions.invoke("generate-invite-copy", {
        body: {
          theme: currentInviteTheme,
          occasion: party.occasion,
          title: partyTitle || party.title,
          hostName: (party.contact_email || "").split("@")[0] || "the host",
          eventDate: eventDateStr,
          avoid: [inviteHeadline].filter(Boolean),
        },
      });
      if (error) throw error;
      if (!data?.headline || !data?.message) throw new Error("No copy");
      setInviteHeadline(data.headline);
      setInviteMessage(data.message);
      setInviteSuggestionIndex(inviteSuggestionIndex + 1);
      setInviteEdited(false);
    } catch (e: any) {
      console.error("invite copy gen failed", e);
      toast.message("Using offline suggestion");
      localFallback();
    } finally {
      setInviteGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Link to="/party-planner" className="text-sm text-muted-foreground hover:underline">
          ← All parties
        </Link>
        <div className="mt-2 mb-6">
          <h1 className="text-3xl font-bold">{party.title}</h1>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
            {party.occasion && <Badge variant="secondary">🎉 {party.occasion}</Badge>}
            {party.event_date && (
              <Badge variant="secondary">
                <CalendarIcon className="w-3 h-3 mr-1" />{" "}
                {new Date(party.event_date).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: tz,
                })}
              </Badge>
            )}
            {party.guest_count > 0 && (
              <Badge variant="secondary">
                <Users className="w-3 h-3 mr-1" /> {party.guest_count}
              </Badge>
            )}
            {tasks.length > 0 && <Badge>{progress}% complete</Badge>}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">📋 Details</TabsTrigger>
            <TabsTrigger value="chat">
              <MessageSquare className="w-4 h-4 mr-1" /> Concierge
            </TabsTrigger>
            <TabsTrigger value="checklist">✅ Checklist {tasks.length > 0 && `(${tasks.length})`}</TabsTrigger>
            <TabsTrigger value="invite">
              <Ticket className="w-4 h-4 mr-1" /> Invite
            </TabsTrigger>
            <TabsTrigger value="invites">
              <Mail className="w-4 h-4 mr-1" /> Guests {guests.length > 0 && `(${guests.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Fill these in once — your concierge will use them to build the plan and your invites.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Party Name</Label>
                  <Input
                    value={partyTitle}
                    onChange={(e) => setPartyTitle(e.target.value)}
                    placeholder="e.g. Aarav's 5th Birthday Bash"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !eventDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {eventDate ? format(eventDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={eventDate}
                          onSelect={setEventDate}
                          disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Time ({tz})</Label>
                    <Input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Venue</Label>
                    <Input
                      placeholder="e.g. Our home, Skyline Banquets"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>City / Location</Label>
                    <Input
                      placeholder="e.g. Mumbai"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Guest count</Label>
                    <Input
                      type="number"
                      min={1}
                      placeholder="15"
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select
                      value={themePick}
                      onValueChange={(v) => {
                        setThemePick(v);
                        if (!inviteEdited && v && v !== "Custom") {
                          const s = getSuggestedInvite(v, party?.occasion, partyTitle || party?.title || "your party", 0);
                          setInviteSuggestionIndex(0);
                          setInviteHeadline(s.headline);
                          setInviteMessage(s.message);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pick a trending theme" />
                      </SelectTrigger>
                      <SelectContent>
                        {THEME_GROUPS.map((group) => (
                          <SelectGroup key={group.label}>
                            <SelectLabel>{group.label}</SelectLabel>
                            {group.themes.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                    {themePick === "Custom" && (
                      <Input
                        className="mt-2"
                        placeholder="Type your own theme"
                        value={customTheme}
                        onChange={(e) => setCustomTheme(e.target.value)}
                      />
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Your contact email (for vendors)</Label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Your phone / WhatsApp</Label>
                    <Input
                      type="tel"
                      placeholder="+91 98xxxxxxx"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={saveDetails} disabled={savingDetails}>
                    <Save className="w-4 h-4 mr-2" /> {savingDetails ? "Saving..." : "Save details"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setActiveTab("chat");
                      setTimeout(generatePlanNow, 200);
                    }}
                  >
                    <Wand2 className="w-4 h-4 mr-2" /> Generate plan now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Button size="sm" variant="outline" onClick={generatePlanNow} disabled={sending}>
                    <Wand2 className="w-3 h-3 mr-1" /> Generate plan now
                  </Button>
                  <Button size="sm" variant="outline" onClick={draftVendorMessage} disabled={sending}>
                    📨 Draft vendor message
                  </Button>
                </div>
                <div className="h-[450px] overflow-y-auto space-y-3 mb-4 px-2">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2 whitespace-pre-wrap ${
                          m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {sending && <div className="text-sm text-muted-foreground">Concierge is thinking...</div>}
                  <div ref={chatEndRef} />
                </div>
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Tell me about your party..."
                    disabled={sending}
                  />
                  <Button onClick={() => sendMessage()} disabled={sending || !input.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checklist">
            <Card>
              <CardHeader>
                <CardTitle>Smart Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <div className="text-center py-8 space-y-3">
                    <p className="text-muted-foreground">
                      No checklist yet. Fill in the details and let the concierge build one.
                    </p>
                    <Button onClick={() => setActiveTab("details")}>Go to details</Button>
                  </div>
                ) : (
                  (() => {
                    const renderTask = (t: any) => {
                      const statusColor =
                        t.vendor_status === "confirmed" ? "default" :
                        t.vendor_status === "declined" ? "destructive" :
                        t.vendor_status === "contacted" ? "secondary" : "outline";
                      const statusLabel =
                        t.vendor_status === "confirmed" ? "✅ Confirmed" :
                        t.vendor_status === "declined" ? "❌ Declined" :
                        t.vendor_status === "contacted" ? "📨 Contacted" : "Not contacted";
                      return (
                        <Collapsible key={t.id} className="rounded-lg border">
                          <div className={`flex items-start gap-3 p-3 ${t.is_completed ? "opacity-60" : ""}`}>
                            <Checkbox
                              checked={t.is_completed}
                              onCheckedChange={() => toggleTask(t.id, t.is_completed)}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium ${t.is_completed ? "line-through" : ""}`}>{t.title}</div>
                              {t.description && (
                                <div className="text-sm text-muted-foreground">{t.description}</div>
                              )}
                              <div className="flex flex-wrap gap-2 mt-1.5">
                                {t.category && (
                                  <Badge variant="outline" className="text-xs">{t.category}</Badge>
                                )}
                                {t.due_date && (
                                  <Badge variant="outline" className="text-xs">
                                    📅 {new Date(t.due_date).toLocaleDateString()}
                                  </Badge>
                                )}
                                {t.vendor_name && (
                                  <Badge variant={statusColor as any} className="text-xs">
                                    🧑‍💼 {t.vendor_name} — {statusLabel}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <CollapsibleTrigger asChild>
                              <Button size="sm" variant="ghost" className="shrink-0">
                                Vendor <ChevronDown className="w-3 h-3 ml-1" />
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                          <CollapsibleContent>
                            <div className="border-t p-3 space-y-3 bg-muted/30">
                              <div className="grid sm:grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs">Vendor name</Label>
                                  <Input
                                    placeholder="e.g. Sweet Bakers"
                                    defaultValue={t.vendor_name || ""}
                                    onBlur={(e) => updateTaskVendor(t.id, { vendor_name: e.target.value.trim() || null })}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Status</Label>
                                  <Select
                                    value={t.vendor_status || "not_contacted"}
                                    onValueChange={(v) => updateTaskVendor(t.id, { vendor_status: v })}
                                  >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="not_contacted">Not contacted</SelectItem>
                                      <SelectItem value="contacted">Contacted</SelectItem>
                                      <SelectItem value="confirmed">Confirmed</SelectItem>
                                      <SelectItem value="declined">Declined</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-xs">Email</Label>
                                  <Input
                                    type="email"
                                    placeholder="vendor@email.com"
                                    defaultValue={t.vendor_email || ""}
                                    onBlur={(e) => updateTaskVendor(t.id, { vendor_email: e.target.value.trim() || null })}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Phone / WhatsApp</Label>
                                  <Input
                                    type="tel"
                                    placeholder="+91 98xxxxxxx"
                                    defaultValue={t.vendor_phone || ""}
                                    onBlur={(e) => updateTaskVendor(t.id, { vendor_phone: e.target.value.trim() || null })}
                                  />
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs">Notes (what to ask, quote received, etc.)</Label>
                                <Textarea
                                  rows={2}
                                  placeholder="e.g. asked for 2kg chocolate cake with photo print"
                                  defaultValue={t.vendor_notes || ""}
                                  onBlur={(e) => updateTaskVendor(t.id, { vendor_notes: e.target.value.trim() || null })}
                                />
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <Label className="text-xs">Message to vendor (editable)</Label>
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 px-2 text-xs"
                                      onClick={() => generateVendorMessage(t.id, 0)}
                                    >
                                      <Sparkles className="w-3 h-3 mr-1" /> {t.vendor_message ? "Regenerate" : "✨ Generate AI message"}
                                    </Button>
                                  </div>
                                </div>
                                <Textarea
                                  rows={6}
                                  placeholder="Click 'Generate AI message' to draft a personalized note based on your event details, or write your own."
                                  value={t.vendor_message || ""}
                                  onChange={(e) => setTasks((ts) => ts.map((x) => x.id === t.id ? { ...x, vendor_message: e.target.value } : x))}
                                  onBlur={(e) => updateTaskVendor(t.id, { vendor_message: e.target.value.trim() || null })}
                                />
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => sendVendorEmail(t.id, t.vendor_message || undefined)}
                                  disabled={!t.vendor_email}
                                >
                                  <Mail className="w-3 h-3 mr-1" /> Email vendor
                                </Button>
                                {t.vendor_phone && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    asChild
                                  >
                                    <a
                                      href={`https://wa.me/${t.vendor_phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(buildVendorMessage(t))}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      💬 WhatsApp
                                    </a>
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    navigator.clipboard.writeText(buildVendorMessage(t));
                                    toast.success("Message copied");
                                  }}
                                >
                                  <Copy className="w-3 h-3 mr-1" /> Copy message
                                </Button>
                                {t.vendor_contacted_at && (
                                  <span className="text-xs text-muted-foreground self-center">
                                    Last contacted: {new Date(t.vendor_contacted_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    };
                    return (
                      <div className="space-y-2">
                        {primaryTasks.map(renderTask)}
                        {secondaryTasks.length > 0 && (
                          <Collapsible open={showSecondary} onOpenChange={setShowSecondary} className="rounded-lg border-2 border-primary/30 bg-primary/5 mt-3">
                            <CollapsibleTrigger asChild>
                              <button
                                type="button"
                                className="w-full flex items-center justify-between gap-2 p-3.5 text-sm font-semibold hover:bg-primary/10 transition-colors rounded-lg"
                              >
                                <span className="flex items-center gap-2 text-foreground">
                                  <span>📅 Day-of details</span>
                                  <Badge variant="secondary" className="text-xs">{secondaryDone}/{secondaryTasks.length}</Badge>
                                </span>
                                <span className="flex items-center gap-1 text-xs text-primary font-medium">
                                  {showSecondary ? "Hide" : `Show ${secondaryTasks.length} more day-of task${secondaryTasks.length === 1 ? "" : "s"}`}
                                  {showSecondary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </span>
                              </button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="px-3 pb-3 space-y-2">
                                {secondaryTasks.map(renderTask)}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                      </div>
                    );
                  })()
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invite">
            <div className="grid lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Customize your invitation</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Edits update the preview live. Save when ready — the email matches what you see.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Invite headline</Label>
                    <Input
                      value={inviteHeadline}
                      onChange={(e) => { setInviteHeadline(e.target.value); setInviteEdited(true); }}
                      placeholder={`You're invited to ${partyTitle || party.title}!`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Personal note</Label>
                    <Textarea
                      rows={5}
                      value={inviteMessage}
                      onChange={(e) => { setInviteMessage(e.target.value); setInviteEdited(true); }}
                      placeholder="Add a warm note for your guests — why you'd love them there, what to expect, dress code, etc."
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={saveInvite} disabled={savingInvite}>
                      <Save className="w-4 h-4 mr-2" /> {savingInvite ? "Saving..." : "Save invite"}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => applyInviteSuggestion()} disabled={inviteGenerating}>
                      <Sparkles className="w-4 h-4 mr-2" /> {inviteGenerating ? "Generating..." : "Regenerate suggestion"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tip: pick a theme in <strong>Details</strong> to restyle the invitation card.
                  </p>
                </CardContent>
              </Card>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 px-1">Live preview</p>
                <InvitePreview
                  key={`${currentInviteTheme}-${inviteHeadline}-${inviteMessage}`}
                  party={{
                    ...party,
                    title: partyTitle || party.title,
                    theme: currentInviteTheme,
                  }}
                  hostName="You"
                  guestName="Your guest"
                  headline={inviteHeadline}
                  message={inviteMessage}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="invites">
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Add a guest</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-2">
                  <Input
                    placeholder="Name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                  />
                  <Input
                    placeholder="Email (optional)"
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                  />
                </div>
                <Button onClick={addGuest} disabled={!guestName.trim()}>
                  <Plus className="w-4 h-4 mr-1" /> Add Guest
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Guest List ({guests.length})</CardTitle>
                <Button
                  onClick={sendInvites}
                  size="sm"
                  disabled={!guests.some((g) => g.email && !g.invited_at)}
                >
                  <Mail className="w-4 h-4 mr-1" /> Send New Invites
                </Button>
              </CardHeader>
              <CardContent>
                {guests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No guests yet</p>
                ) : (
                  <div className="space-y-2">
                    {guests.map((g) => {
                      const rsvpUrl = `${window.location.origin}/rsvp/${g.rsvp_token}`;
                      return (
                        <div key={g.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{g.name}</div>
                            {g.email && (
                              <div className="text-xs text-muted-foreground truncate">{g.email}</div>
                            )}
                            <div className="flex gap-2 mt-1">
                              <Badge
                                variant={
                                  g.rsvp_status === "yes"
                                    ? "default"
                                    : g.rsvp_status === "no"
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {g.rsvp_status}
                              </Badge>
                              {g.invited_at && (
                                <span className="text-xs text-muted-foreground">Invited</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                navigator.clipboard.writeText(rsvpUrl);
                                toast.success("Link copied");
                              }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => removeGuest(g.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
