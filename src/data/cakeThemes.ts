// Theme pages — /birthday-cake-theme/{slug}
// Targets "{theme} birthday cake" and "{theme} cake design" queries.

export interface ThemeEntry {
  slug: string;
  title: string;       // display title (e.g. "Unicorn")
  audience: string;    // for copy: "kids", "boys", "girls", "adults", "anyone"
  description: string; // one-liner used in meta + intro
}

export const CAKE_THEMES: ThemeEntry[] = [
  { slug: "unicorn", title: "Unicorn", audience: "kids", description: "Pastel mane, gold horn, rainbow drips and edible glitter — the classic unicorn cake, designed by AI in 30 seconds." },
  { slug: "spiderman", title: "Spider-Man", audience: "kids", description: "Red-and-blue web swing, mask cutouts and dynamic action poses — the most-requested superhero cake on the planet." },
  { slug: "frozen", title: "Frozen", audience: "kids", description: "Icy blue fondant, snowflake details and an Elsa-inspired silhouette — every detail your little fan will recognise." },
  { slug: "barbie", title: "Barbie", audience: "girls", description: "Hot pink, glam doll silhouettes and rosette piping — the Barbiecore cake everyone is asking for." },
  { slug: "minecraft", title: "Minecraft", audience: "kids", description: "Pixel-perfect blocks, creeper greens and TNT accents — the cake every Minecraft kid actually wants." },
  { slug: "football", title: "Football", audience: "anyone", description: "Stadium grass, team colours and a hand-piped name — the cleanest football cake design online." },
  { slug: "cricket", title: "Cricket", audience: "anyone", description: "Bat, ball, stumps and team kit — cricket-fan cakes done right, with the player's name spelt correctly." },
  { slug: "princess", title: "Princess", audience: "girls", description: "Tiara, pastel ruffles and edible pearls — classic princess cake, ready in 30 seconds." },
  { slug: "dinosaur", title: "Dinosaur", audience: "kids", description: "Jurassic jungle scenes, T-Rex toppers and volcano drips — roar-worthy dinosaur cake design." },
  { slug: "car", title: "Car", audience: "kids", description: "Race tracks, supercars and checkered finish lines — the car-themed cake every speed-loving kid wants." },
  { slug: "harry-potter", title: "Harry Potter", audience: "anyone", description: "Hogwarts house colours, golden snitch, wand and spellbook — the magical cake every Potterhead deserves." },
  { slug: "anime", title: "Anime", audience: "anyone", description: "Manga-style characters, sakura petals and bold linework — anime cake design done right, no awkward proportions." },
  { slug: "music", title: "Music", audience: "anyone", description: "Vinyl records, music notes, guitars and concert-style lighting — the cake every music lover deserves." },
  { slug: "floral", title: "Floral", audience: "anyone", description: "Hand-piped buttercream florals, peonies and roses — elegant floral cake design for any celebration." },
  { slug: "gold", title: "Gold & Black Luxury", audience: "adults", description: "Matte black with gold leaf, marble texture and minimal name typography — the cake adults actually want." },
  { slug: "watercolour", title: "Watercolour", audience: "anyone", description: "Soft watercolour washes, gold drips and minimal piping — the most-pinned cake style of the year." },
  { slug: "pinata", title: "Piñata Cake", audience: "anyone", description: "Hammer-and-smash cake hiding sweets inside — the viral piñata cake design with name on the shell." },
  { slug: "rainbow", title: "Rainbow", audience: "kids", description: "Layered rainbow sponge, cloud piping and bright sprinkles — joy on a plate." },
  { slug: "space", title: "Space & Galaxy", audience: "kids", description: "Cosmic swirls, rocket toppers and edible stars — galaxy cake design that actually looks like the sky." },
  { slug: "mermaid", title: "Mermaid", audience: "girls", description: "Ocean waves, shimmering tail and shell accents — under-the-sea cake done in 30 seconds." },
  { slug: "pokemon", title: "Pokémon", audience: "kids", description: "Pikachu yellow, pokéball detailing and starter-trio silhouettes — Pokémon cake design that catches them all." },
  { slug: "construction", title: "Construction", audience: "kids", description: "Diggers, dump trucks and cement-grey buttercream — the cake every construction-mad toddler wants." },
  { slug: "fairy", title: "Fairy", audience: "girls", description: "Pastel wings, toadstools and woodland sparkle — magical fairy cake design ready in seconds." },
  { slug: "superhero", title: "Superhero", audience: "kids", description: "Cape silhouettes, comic-book POW! lettering and bold primaries — generic superhero cake done right." },
  { slug: "elegant", title: "Elegant White", audience: "adults", description: "White-on-white fondant, sugar pearls and minimal name piping — the timeless adult birthday cake." },
  { slug: "chocolate-drip", title: "Chocolate Drip", audience: "anyone", description: "Glossy chocolate ganache drips, gold leaf and macaron toppers — the most-requested cake style on Instagram." },
  { slug: "gamer", title: "Gamer", audience: "anyone", description: "Controller toppers, neon RGB lighting and pixel-art accents — the cake every gamer actually wants." },
  { slug: "bts", title: "BTS / K-pop", audience: "anyone", description: "Member silhouettes, purple aesthetic and album-cover styling — K-pop cake design with names spelt correctly." },
  { slug: "tropical", title: "Tropical", audience: "anyone", description: "Palm leaves, hibiscus and pineapple toppers — the tropical luau cake design for summer birthdays." },
  { slug: "vintage", title: "Vintage Lambeth", audience: "adults", description: "Lambeth piping, soft pastels and ribbons — the viral vintage cake trend, designed in 30 seconds." },
];
