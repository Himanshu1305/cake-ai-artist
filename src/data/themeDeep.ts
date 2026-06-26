// Per-theme deep content used by /birthday-cake-theme/{slug}.
// Hand-written — story, what makes a great X cake, common mistakes, message ideas.

export interface ThemeDeep {
  story: string;            // 2-3 sentence origin / why-it-matters block
  bestFor: string[];        // age groups / occasions
  checklist: string[];      // 5 "what makes a great X cake" items
  mistakes: string[];       // 3 common bakery / AI mistakes
  colours: string[];        // canonical colour palette
  messageIdeas: string[];   // 6 short message lines using {NAME} placeholder
}

export const THEME_DEEP: Record<string, ThemeDeep> = {
  unicorn: {
    story: "Unicorn cakes took over Pinterest in 2017 and never left. The look — pastel mane, gold horn, closed eyes with long lashes — is now the single most-searched cake design in the world. Done right, it's whimsical without being childish; done wrong, it's a mess of dripping food colour.",
    bestFor: ["girls 3-9", "first birthdays", "magical / fantasy themes", "best-friends parties"],
    checklist: [
      "A clean gold horn (edible or wafer paper), centered and upright — not leaning",
      "Pastel mane in 3-4 colours: blush, lilac, mint, baby blue — never neon",
      "Closed eyes with long curved lashes piped in black royal icing",
      "Smooth white buttercream base, not fondant (the soft finish reads as 'magical')",
      "Edible gold dust on the horn and ear tips — not coloured sprinkles"
    ],
    mistakes: [
      "Too many mane colours — looks chaotic, not magical",
      "A horn placed off-centre or angled forward",
      "Cartoon eyes with whites and pupils (looks creepy, not cute)"
    ],
    colours: ["blush pink", "lilac", "mint", "gold"],
    messageIdeas: [
      "Happy Birthday {NAME} — stay magical ✨",
      "Wishing {NAME} a unicorn-level birthday",
      "{NAME}, you're 1 in a million 🦄",
      "Magic, sparkles & cake — happy birthday {NAME}",
      "Be a unicorn, {NAME}",
      "{NAME}'s magical day"
    ]
  },
  spiderman: {
    story: "The most-requested superhero cake of the last 5 years. Spider-Man's signature red-and-blue with web detail works at any age and any skill level — from a piped mask on top to a full 3D city-scape with Spidey swinging from a buttercream skyscraper.",
    bestFor: ["boys 3-10", "superhero parties", "Marvel fans of any age"],
    checklist: [
      "Spider-Man red: deep cherry red, never tomato or pink-red",
      "Web pattern piped in clean black lines, not painted (paint smudges)",
      "Mask eyes: pointed teardrop white shapes with thin black outline",
      "Avoid bright cobalt blue — go for a slightly muted royal blue (matches the suit)",
      "Name in white block lettering on the red — highest contrast and most readable"
    ],
    mistakes: [
      "Web lines that don't connect — should radiate from a single centre point",
      "Mismatched red and blue (the suit is specific — Pantone-close matters)",
      "Glitter or sprinkles — Spidey is graphic, not glam"
    ],
    colours: ["spider red", "royal blue", "black", "white"],
    messageIdeas: [
      "Happy Birthday {NAME} — your friendly neighbourhood birthday boy",
      "{NAME}'s spidey-sense says: cake time 🕷️",
      "Web-slinging into year [age], {NAME}!",
      "Happy Birthday, Super {NAME}",
      "With great cake comes great responsibility — happy birthday {NAME}",
      "{NAME}, you're our hero"
    ]
  },
  frozen: {
    story: "Disney's Frozen cake design has dominated girls' birthdays since 2014 and the 2019 sequel revived it again. The defining elements — icy blues, snowflakes, an Elsa silhouette — are instantly recognisable to any 4-year-old. The hardest part is the colour palette: too dark and it looks navy; too pale and it looks washed out.",
    bestFor: ["girls 3-8", "winter birthdays", "Disney fans", "Christmas / Diwali week parties"],
    checklist: [
      "Frozen blue: light glacial blue with a hint of green, not navy",
      "Snowflakes in white royal icing — 6-point, geometric, not freehand stars",
      "Edible silver shimmer dust on the snowflakes (not glitter — glitter looks cheap)",
      "Elsa silhouette or 'Frozen' lettering, never both (too busy)",
      "Smooth ombré from white at the top to glacial blue at the base"
    ],
    mistakes: [
      "Blue that drifts into navy — looks like a generic ocean cake, not Frozen",
      "Snowflakes drawn as asterisks (*) instead of 6-fold symmetric shapes",
      "Multi-colour fondant accents — Frozen is monochromatic blue + white"
    ],
    colours: ["glacial blue", "white", "silver", "ice-pink accent"],
    messageIdeas: [
      "Let it snow — happy birthday {NAME} ❄️",
      "{NAME}, the cold never bothered you anyway",
      "Wishing {NAME} a magical Frozen birthday",
      "Happy Birthday {NAME} — queen of the day 👑",
      "{NAME}'s Frozen birthday adventure",
      "Snow much love for {NAME} on their special day"
    ]
  },
  barbie: {
    story: "After the 2023 Barbie film, Barbiecore cakes became one of the year's biggest design trends. The look is unapologetically hot pink, glossy, glamorous and a little ironic. Done well, it's high-fashion and grown-up; done badly, it's a sea of unflattering Pepto pink.",
    bestFor: ["girls 6+", "Barbiecore parties", "bachelorettes", "fashion-themed birthdays"],
    checklist: [
      "Specific 'Barbie hot pink' — closer to magenta than baby pink",
      "Glossy mirror glaze or smooth fondant — matte buttercream kills the Barbie shine",
      "Doll silhouette or 'B' monogram in gold leaf — not a full plastic Barbie doll on top",
      "Tone-on-tone pink: 3 shades of pink layered (bubblegum + magenta + blush)",
      "Modern script lettering in gold or white — never red on pink"
    ],
    mistakes: [
      "Sticking an actual Barbie doll into the cake — looks dated",
      "Pink that's too pale or too 'baby' — Barbie is bold",
      "Too many props (handbags, shoes, glitter) — pick one focal element"
    ],
    colours: ["Barbie hot pink", "blush pink", "gold", "white"],
    messageIdeas: [
      "Happy Birthday {NAME} — c'mon Barbie, let's go party 💕",
      "{NAME}, you're stereotypically perfect",
      "Hi {NAME}! Happy Birthday Barbie",
      "Life in plastic — happy birthday {NAME}",
      "{NAME}'s Barbie birthday — turning [age] in pink",
      "Hot pink, hot girl, hot birthday — {NAME}"
    ]
  },
  minecraft: {
    story: "Minecraft cakes have been the #1 boys' gaming cake since 2014 and show no sign of slowing — the game still pulls 170M monthly players. The cake design is forgiving (it's literally meant to look pixelated), which makes it bakery-friendly but also easy to do badly.",
    bestFor: ["boys 5-12", "gamer parties", "Minecraft superfans"],
    checklist: [
      "Square fondant pixels — never round or oval. Crispness is the whole point",
      "Grass-block top: brown bottom, green top with the dirt-grass transition visible",
      "Creeper green face in correct proportions (mouth wider than eyes)",
      "TNT block accents in scarlet with white 'TNT' lettering",
      "Avoid 3D characters on top — they break the pixel aesthetic"
    ],
    mistakes: [
      "Smooth, rounded edges — defeats the pixel art look",
      "Wrong creeper green (it's a specific muddy green, not lime)",
      "Adding non-Minecraft sprinkles or piping"
    ],
    colours: ["grass green", "dirt brown", "TNT red", "creeper green"],
    messageIdeas: [
      "Happy Birthday {NAME} — let's mine some cake ⛏️",
      "{NAME} just leveled up to [age]",
      "Creeper-free zone for {NAME}'s birthday",
      "{NAME}'s Minecraft birthday party",
      "Crafted with love for {NAME}",
      "Happy Birthday {NAME} — diamond level"
    ]
  },
  football: {
    story: "Football (soccer) cakes are the most-requested 'sport' cake worldwide — bigger than cricket in volume, especially in Europe and Latin America. The design is simple, which is why so many bakeries get it wrong: too much grass detail, the wrong team kit colours, or a printed photo when piping would look 10x better.",
    bestFor: ["boys/girls 5-15", "football fans of any age", "World Cup / Euros parties"],
    checklist: [
      "Realistic green textured top — use two greens (lighter mowed stripes)",
      "A clean white-and-black football, not orange or multi-colour",
      "Team kit colours piped on the side band — not airbrushed",
      "Player number on top in white or gold (large, single number)",
      "Goal-post or net detail at one edge for depth (optional)"
    ],
    mistakes: [
      "Using an edible printed photo of a player — looks dated and pixelated",
      "Wrong team colours (a Man City fan won't accept red and white)",
      "Yellow football instead of classic black-and-white"
    ],
    colours: ["pitch green", "white", "black", "team accent"],
    messageIdeas: [
      "Happy Birthday {NAME} — back of the net! ⚽",
      "{NAME}'s match day — turning [age]",
      "Goal! Happy Birthday {NAME}",
      "{NAME} — captain of the day",
      "{NAME}'s [team] birthday",
      "Top scorer this year: {NAME}"
    ]
  },
  cricket: {
    story: "In India, Pakistan, Australia, England and the West Indies, the cricket cake is the #1 boys' sport cake. The design challenge: getting the bat, ball and stumps in proportion and not making them look like toys stuck on top.",
    bestFor: ["boys 5-15", "cricket-mad adults", "IPL / Ashes / World Cup parties"],
    checklist: [
      "A proportional bat (long handle, willow blade) — never a flat oval",
      "Three stumps with two bails, not random sticks",
      "Red ball with white stitching detail — not a generic ball",
      "Team kit colours on a side band (India blue, Australia yellow, etc.)",
      "Player name and age in white block lettering — looks like a jersey"
    ],
    mistakes: [
      "Bat too short or too thick — looks like a paddle",
      "Forgetting the bails on top of the stumps",
      "Mixed team colours (pick one team — don't combine)"
    ],
    colours: ["pitch green", "willow tan", "team accent", "white"],
    messageIdeas: [
      "Happy Birthday {NAME} — howzzaat! 🏏",
      "{NAME}'s century year — turning [age]",
      "Man of the match: {NAME}",
      "{NAME} — opening batsman of the day",
      "{NAME}'s IPL-worthy birthday",
      "Six and out — happy birthday {NAME}"
    ]
  },
  princess: {
    story: "The princess cake is the eternal classic of girls' birthdays — sales data shows it's been a top-5 design for 30+ years. The challenge: avoiding the dated 'doll-in-skirt-cake' look and going for modern royal elegance instead.",
    bestFor: ["girls 2-8", "first birthdays", "Disney princess parties"],
    checklist: [
      "Tiara on top — gold or edible silver, not plastic",
      "Soft pastel ruffles or rosettes (pink, peach, ivory)",
      "Edible pearls — not silver dragees (which can be harsh in colour)",
      "A subtle 'royal' lettering style — script or serif, never blocky",
      "Soft buttercream finish, not glossy fondant"
    ],
    mistakes: [
      "Plastic doll inserted into the cake — looks dated",
      "Too many tiers — modern princess cakes are usually one or two tiers, not five",
      "Hot pink overload — modern royal palette is soft and pastel"
    ],
    colours: ["blush pink", "ivory", "gold", "peach"],
    messageIdeas: [
      "Happy Birthday Princess {NAME} 👑",
      "Her majesty {NAME} turns [age]",
      "Wishing Princess {NAME} a royal day",
      "{NAME} — queen of hearts",
      "Tiaras and tea cakes for {NAME}",
      "Happy Birthday {NAME} — long may you reign"
    ]
  },
  dinosaur: {
    story: "Dinosaur cakes have been the #1 boys' cake trend since the 2015 Jurassic World reboot. The strongest designs combine a T-Rex or triceratops silhouette with a 'lost world' jungle scene — palms, volcanoes, dino footprints.",
    bestFor: ["kids 3-8", "dino-mad fans", "fossil and natural-history parties"],
    checklist: [
      "Realistic dinosaur colour palette — earthy greens, mossy browns, sandy beige",
      "T-Rex or triceratops silhouette, not cartoon Barney",
      "Jungle palm leaves cut from green fondant (not generic flowers)",
      "Dino footprint detail piped on the side band",
      "Volcano with red-orange drip at the back for drama"
    ],
    mistakes: [
      "Bright primary-coloured dinosaurs (purple/blue) — looks like a toy",
      "Too many small toy dinos on top — pick 1-2 statement pieces",
      "Forgetting the 'lost world' context — a dino on a plain white cake feels lonely"
    ],
    colours: ["jungle green", "mossy brown", "lava orange", "stone grey"],
    messageIdeas: [
      "Happy Birthday {NAME} — dino-mite! 🦖",
      "{NAME} is [age] — RAWR means happy birthday in dinosaur",
      "Three-rex {NAME}",
      "{NAME}'s Jurassic birthday",
      "Stomping into [age], {NAME}",
      "Happy Birthday {NAME} — let's get this dino party started"
    ]
  },
  car: {
    story: "Car cakes split into two camps: the toddler 'cute red car with a face' and the older-kid 'realistic supercar.' Both are huge in the boys' birthday market. The design lives or dies on the proportions of the car body.",
    bestFor: ["boys 3-12", "Cars / Lightning McQueen fans", "race-track birthdays"],
    checklist: [
      "Race-track loop on the top board, with checkered start/finish line",
      "Specific car: Lightning McQueen red, Lambo yellow, Ferrari red — be precise",
      "Tire-track piping on the side band in black",
      "Number 95 or chosen race number large on top (looks like a real race car)",
      "Flag bunting — checkered black-and-white only, not party rainbow"
    ],
    mistakes: [
      "Generic 'red car' that doesn't match any famous car — kids notice immediately",
      "Rainbow track instead of checkered — wrong vibe",
      "Adding cartoon eyes to a realistic supercar (mix-up of two design directions)"
    ],
    colours: ["race red", "black", "white", "asphalt grey"],
    messageIdeas: [
      "Happy Birthday {NAME} — start your engines! 🏁",
      "{NAME}, you're [age] — vroom vroom!",
      "Speeding into [age], {NAME}",
      "Race-day birthday for {NAME}",
      "{NAME}'s pit stop — happy birthday",
      "Ka-chow! Happy Birthday {NAME}"
    ]
  },
  "harry-potter": {
    story: "Harry Potter cakes have crossed generations — adults who grew up with the books now order them for their own kids. The design lives in the details: Hogwarts house colours, golden snitch, the lightning bolt, the wand. Get the house wrong and the recipient will notice.",
    bestFor: ["fans 6-40", "book-themed parties", "movie marathons"],
    checklist: [
      "House colours done correctly: Gryffindor scarlet & gold, Slytherin emerald & silver, etc.",
      "Golden snitch with detailed feathered wings (not just a gold ball)",
      "Hogwarts crest or house crest as the main decoration",
      "Lightning bolt in a contrasting colour (not the same red as Gryffindor)",
      "Subtle 'Mischief Managed' or platform 9 3/4 reference — quote done well > cluttered props"
    ],
    mistakes: [
      "Mixing house colours (don't put Slytherin green next to Gryffindor red)",
      "Snitch as a plain yellow ball — the wings make it",
      "Photo-print of Daniel Radcliffe — feels dated and bootleg"
    ],
    colours: ["scarlet", "gold", "emerald", "midnight blue"],
    messageIdeas: [
      "Happy Birthday {NAME} — you're a wizard! ⚡",
      "{NAME}, mischief managed",
      "Wishing {NAME} a magical [age]th",
      "{NAME}'s Hogwarts birthday",
      "Yer a wizard, {NAME}",
      "{NAME} — accio cake!"
    ]
  },
  anime: {
    story: "Anime cakes are now a top-10 teen and young-adult cake category, driven by Demon Slayer, Jujutsu Kaisen, Naruto and Studio Ghibli. The art style is hard to render in icing — most bakeries get it wrong by drawing 'generic big-eyed character.' Done right, it looks like a print from the show.",
    bestFor: ["teens / young adults", "Naruto / Demon Slayer / Studio Ghibli fans"],
    checklist: [
      "Bold black line work — manga ink style, not soft Disney lines",
      "Specific character (Naruto, Tanjiro, Totoro), not generic 'anime girl'",
      "Speech bubble or kanji accent for authenticity",
      "Sakura petals or cloud pattern on the side band",
      "Limit to 2-3 character colours — anime art is graphic, not photoreal"
    ],
    mistakes: [
      "Wrong proportions — anime eyes are specific (large, slightly oval, not round)",
      "Generic 'kawaii' face that doesn't match any real show",
      "Too many characters crowded on one cake — pick one hero"
    ],
    colours: ["bold black", "sakura pink", "white", "character accent"],
    messageIdeas: [
      "Happy Birthday {NAME} — believe it! 🍥",
      "{NAME}'s anime birthday arc begins",
      "{NAME} — main character energy",
      "Wishing {NAME} a kawaii birthday",
      "{NAME}, ganbatte! Happy birthday",
      "{NAME}'s [age]th — power level: max"
    ]
  },
  music: {
    story: "Music cakes work for almost any age and gender — vinyl, guitars, headphones, music notes. The strongest designs commit to one music sub-culture (rock, K-pop, classical, EDM) instead of mixing them.",
    bestFor: ["teens to adults", "musicians", "music-festival fans"],
    checklist: [
      "One sub-culture — rock OR pop OR classical, not all three",
      "Vinyl record top with realistic black grooves and a centred label",
      "Music notes in clean black or gold — never multi-colour",
      "Guitar silhouette in profile, with frets and strings detailed",
      "Stage-light beam effect on the side board for drama"
    ],
    mistakes: [
      "Generic 'music' cake that mixes treble clefs, guitars and DJ decks",
      "Rainbow music notes (kills the cool factor)",
      "Vinyl with no centre label (looks like a frisbee)"
    ],
    colours: ["jet black", "gold", "stage red", "neon accent"],
    messageIdeas: [
      "Happy Birthday {NAME} — turn it up! 🎶",
      "{NAME}'s greatest hits — [age] years strong",
      "Hit play — happy birthday {NAME}",
      "{NAME}, you're the headliner",
      "Drop the bass — {NAME}'s birthday",
      "{NAME}'s playlist on repeat"
    ]
  },
  floral: {
    story: "Floral cakes are the #1 adult cake category, especially for women aged 25+. Buttercream florals (especially in the Korean style) have been the dominant trend since 2018 — the look is romantic, modern and Instagram-perfect.",
    bestFor: ["adults", "milestone birthdays (30, 40, 50)", "engagement and bridal"],
    checklist: [
      "Hand-piped buttercream florals (Korean technique) — peonies, ranunculus, roses",
      "Limited palette — 2-3 flower colours max, plus 1 leaf green",
      "Asymmetric flower placement (cluster on one side, not a ring around)",
      "Smooth pastel buttercream base — never fondant, never multi-colour",
      "Calligraphy-style name in gold or contrasting tone"
    ],
    mistakes: [
      "Fondant flowers stuck on top — looks plastic, not piped",
      "Too many flower types — modern florals are restrained",
      "Bright neon flowers — kills the elegance"
    ],
    colours: ["dusty pink", "sage green", "ivory", "muted lavender"],
    messageIdeas: [
      "Happy Birthday {NAME} — bloom & grow 🌸",
      "{NAME}, you're [age] and flourishing",
      "Wishing {NAME} a beautiful birthday",
      "{NAME}'s blooming birthday",
      "Hand-picked for {NAME}",
      "{NAME} — petal-perfect"
    ]
  },
  gold: {
    story: "Gold-and-black luxury cakes are the dominant adult cake trend for 30th, 40th and 50th birthdays. The aesthetic is restraint — matte black, gold leaf, minimal lettering. Done well, it photographs like a magazine cover.",
    bestFor: ["adults 25+", "milestone birthdays", "corporate / sophisticated parties"],
    checklist: [
      "Matte black base — not glossy fondant",
      "Real edible gold leaf in irregular patches, not gold spray",
      "Marble swirl detail in one area (gold veining through black)",
      "Name in elegant serif or thin script — never bold or playful",
      "Maximum 2 design elements — gold leaf + lettering. Resist adding more"
    ],
    mistakes: [
      "Gold spray instead of leaf — looks cheap",
      "Adding 'Happy Birthday' bunting or sparkles — breaks the luxury vibe",
      "Glossy black — should be matte for the luxe feel"
    ],
    colours: ["matte black", "edible gold", "ivory accent"],
    messageIdeas: [
      "Happy Birthday {NAME} — looking [age] never looked so good ✨",
      "{NAME}, vintage [birth year]",
      "Cheers to {NAME} at [age]",
      "Gold standard — {NAME}'s birthday",
      "{NAME}, fabulously [age]",
      "Happy Birthday {NAME}"
    ]
  },
  watercolour: {
    story: "Watercolour cakes were Pinterest's most-saved cake style of 2023. The look — soft brushstrokes, gold drips, hand-painted feel — translates beautifully into AI-generated designs because the imperfection is part of the charm.",
    bestFor: ["adults", "engagements", "milestone birthdays", "garden parties"],
    checklist: [
      "Soft, blended pastel washes — not crisp solid colour",
      "Gold drip on one edge only (not all the way around — looks too '2018')",
      "Minimal piping — just the name in script",
      "Visible brushstroke texture on the buttercream",
      "Pressed-flower or leaf accent at the base"
    ],
    mistakes: [
      "Bright colours instead of soft washes — wrong vibe entirely",
      "Drip everywhere — modern watercolour cakes have one drip side",
      "Adding sprinkles — they don't fit the painterly look"
    ],
    colours: ["dusty rose", "sage", "blush", "gold"],
    messageIdeas: [
      "Happy Birthday {NAME} 🎨",
      "{NAME}'s [age]th — painted with love",
      "Wishing {NAME} a beautiful day",
      "{NAME}, you colour our world",
      "Brushstrokes & birthday wishes for {NAME}",
      "{NAME} — every year a masterpiece"
    ]
  },
  pinata: {
    story: "Piñata cakes went viral on TikTok in 2021 and have stayed in the top 20 trending cake designs ever since. The format: a hollow chocolate shell smashed open to reveal sweets inside. Maximum drama, minimum baking skill.",
    bestFor: ["kids 6-14", "TikTok-loving teens", "surprise reveals"],
    checklist: [
      "A solid chocolate shell (3-4mm) that cracks cleanly under the hammer",
      "Bright candy filling visible inside on the cut — Smarties, M&Ms, gold coins",
      "A wooden hammer presented alongside (this is the whole reveal moment)",
      "Name piped on the outside of the shell in white royal icing",
      "Drip detail in a contrasting colour for extra drama"
    ],
    mistakes: [
      "Shell too thick — won't crack open",
      "Boring fillings (only sprinkles) — the reveal should feel abundant",
      "No hammer provided — the moment loses its magic"
    ],
    colours: ["chocolate brown", "candy multi", "white drip"],
    messageIdeas: [
      "Smash it, {NAME}! Happy Birthday 🎉",
      "{NAME}'s surprise inside — Happy [age]",
      "Crack it open — for {NAME}",
      "{NAME}, this one's full of love",
      "Sweet surprises for {NAME}",
      "Happy Birthday {NAME} — break it down"
    ]
  },
  rainbow: {
    story: "Rainbow cakes are the most universally loved design — they work for any age, any gender, any occasion. The defining moment is the cut: six layered colours revealed in one slice.",
    bestFor: ["kids 3-10", "pride birthdays", "inclusive / multi-friend parties"],
    checklist: [
      "Six distinct sponge layers — red, orange, yellow, green, blue, purple",
      "White vanilla buttercream outside — the rainbow is the surprise",
      "Fluffy cloud piping on top (white star tip)",
      "Rainbow arc on the side board in fondant or piped buttercream",
      "Sprinkles in matching rainbow colours, scattered not piled"
    ],
    mistakes: [
      "Muddy colours — use gel food colour, not liquid",
      "Uneven layer thickness — rainbow magic depends on equal stripes",
      "Tie-dye outside — defeats the surprise-cut reveal"
    ],
    colours: ["pure red", "orange", "yellow", "green", "blue", "purple"],
    messageIdeas: [
      "Happy Birthday {NAME} — somewhere over the rainbow 🌈",
      "{NAME}, you're our pot of gold",
      "Wishing {NAME} a rainbow of joy",
      "{NAME}'s rainbow birthday",
      "All the colours for {NAME}",
      "{NAME} — bright as ever"
    ]
  },
  space: {
    story: "Galaxy and space cakes have been the #1 boys' aesthetic cake since the 2018 mirror-glaze trend. The cosmic swirl is genuinely difficult to make in icing, which is why it photographs so well when done right.",
    bestFor: ["kids 5-12", "rocket / astronaut fans", "STEM-themed parties"],
    checklist: [
      "Mirror glaze in deep navy, purple and magenta with white-gold star speckles",
      "Edible silver and gold dust as 'stars' (not sprinkles)",
      "Rocket topper in profile, not from the front",
      "Planet accents at varying sizes (one large, two small — like a real solar system)",
      "Name in white block lettering — high contrast on the dark background"
    ],
    mistakes: [
      "Muddy glaze — colours need to swirl, not blend into grey",
      "Cartoon planets with faces — kills the cosmic mood",
      "Pastel galaxy — should be deep, rich and dark"
    ],
    colours: ["midnight blue", "magenta", "deep purple", "starlight gold"],
    messageIdeas: [
      "Happy Birthday {NAME} — to infinity & beyond 🚀",
      "{NAME}'s [age]th — out of this world",
      "Houston, we have a birthday — {NAME}",
      "Reach for the stars, {NAME}",
      "{NAME}'s cosmic birthday",
      "Happy Birthday {NAME} — you're a star"
    ]
  },
  mermaid: {
    story: "Mermaid cakes became a top-10 girls' cake after the Little Mermaid live-action remake. The defining elements: ocean ombré, shimmering tail, shell accents. The hardest part is the tail — it has to look like scales, not just a green shape.",
    bestFor: ["girls 4-10", "summer birthdays", "pool parties"],
    checklist: [
      "Ocean blue-to-teal ombré on the base",
      "Tail in shimmer fondant — scales detailed, not a flat shape",
      "Edible pearl scatter (real-looking, not white sprinkle balls)",
      "Sea shells and starfish accents — limit to 3-4 pieces, not a beach scene",
      "Hand-piped seaweed strands on one side"
    ],
    mistakes: [
      "Flat green tail with no scale detail — kills the magic",
      "Too many sea creatures — looks like an aquarium not a mermaid cake",
      "Wrong blue (royal blue instead of teal/ocean) — the colour matters"
    ],
    colours: ["ocean teal", "coral pink", "shimmer purple", "pearl white"],
    messageIdeas: [
      "Happy Birthday {NAME} — splash on! 🧜",
      "{NAME}, you're shore-ly fabulous",
      "Wishing {NAME} a fin-tastic birthday",
      "{NAME}'s mermaid birthday",
      "Sea you at [age], {NAME}",
      "{NAME} — under-the-sea queen"
    ]
  },
  pokemon: {
    story: "Pokémon cakes have been popular since 1999 and the 2016 Pokémon Go boom doubled demand. The franchise has 1000+ Pokémon — the design challenge is picking 1-3 to feature, not cramming the entire Pokédex on top.",
    bestFor: ["kids 5-12", "Pokémon Go players", "card collectors"],
    checklist: [
      "1-3 specific Pokémon (Pikachu + a starter), never a crowd",
      "Pikachu yellow done correctly — bright lemon, not orange-yellow",
      "Pokéball topper or piped pattern on the side board",
      "Recipient's name in the Pokémon font (bold, slightly curved, white with blue outline)",
      "Lightning bolt or grass tuft accents matching Pikachu's tail"
    ],
    mistakes: [
      "10+ Pokémon stuck on top — overwhelming and amateur",
      "Wrong Pikachu yellow — looks like a banana cake",
      "Generic 'Pokémon font' that's not the real franchise font"
    ],
    colours: ["Pikachu yellow", "pokéball red", "grass green", "deep blue"],
    messageIdeas: [
      "Happy Birthday {NAME} — gotta catch 'em all! ⚡",
      "{NAME} — Pokémon master at [age]",
      "Pikachu, I choose {NAME}",
      "{NAME}'s Pokémon birthday party",
      "Wishing {NAME} a wild birthday",
      "{NAME} just leveled up"
    ]
  },
  construction: {
    story: "Construction cakes are the #1 cake for boys aged 2-5 — diggers, dump trucks, cranes, road signs. The design is about chunky, recognisable shapes and earth-tone colours. Strong designs include real toy construction vehicles, not iced replicas.",
    bestFor: ["boys 2-6", "JCB / digger / truck fans"],
    checklist: [
      "Earth-tone palette — yellow, brown, grey, no neon",
      "Real toy digger or dump truck on top (washable, removable)",
      "Cement-grey 'concrete' buttercream texture on the side band",
      "Road signs in fondant (STOP, ROAD CLOSED)",
      "Crumbled chocolate biscuit as 'dirt' for digger to scoop"
    ],
    mistakes: [
      "Pastel colours — construction is bold and gritty",
      "Iced fondant digger that doesn't look like the real toy",
      "Forgetting the 'dirt' detail — it's what makes kids laugh"
    ],
    colours: ["digger yellow", "concrete grey", "earth brown", "stop-sign red"],
    messageIdeas: [
      "Happy Birthday {NAME} — let's dig in! 🚜",
      "{NAME} is [age] — under construction",
      "Building memories with {NAME}",
      "{NAME}'s digger birthday party",
      "Dump-truck loads of love for {NAME}",
      "{NAME} — chief of the crew"
    ]
  },
  fairy: {
    story: "Fairy cakes (the cake design, not the cupcakes) are a top-15 girls' design — woodland sparkle, pastel wings, toadstool accents. The aesthetic is whimsical, ethereal, and works equally well for 3-year-olds and 30-year-olds.",
    bestFor: ["girls 3-10", "fairy / fantasy parties", "garden parties"],
    checklist: [
      "Pastel fairy wings in transparent edible wafer paper",
      "Toadstool accents (red with white spots) — iconic and instantly readable",
      "Edible glitter dust on the wings — light, not heavy",
      "Soft sage and pastel pink palette",
      "Tiny fairy door on the side board for storybook charm"
    ],
    mistakes: [
      "Wings made of fondant — too thick and lifeless",
      "Too bright colours — fairy is soft and ethereal",
      "Cartoon fairy with a face on top — looks dated"
    ],
    colours: ["pastel pink", "sage green", "lavender", "shimmer gold"],
    messageIdeas: [
      "Happy Birthday {NAME} — sprinkle some magic ✨",
      "{NAME}'s fairy-tale [age]th",
      "Wishing {NAME} a magical birthday",
      "{NAME} — our forever fairy",
      "Believe in fairies — and {NAME}",
      "{NAME}'s woodland birthday"
    ]
  },
  superhero: {
    story: "When parents don't want to license a specific Marvel/DC character, the 'generic superhero' cake fills the gap — capes, masks, POW! lettering. It's a top-5 boys' cake category every year.",
    bestFor: ["boys 3-8", "superhero parties", "any kid who loves capes"],
    checklist: [
      "Comic-book POW! / BAM! / ZAP! lettering on the side board",
      "Cape silhouette draped over one side of the cake",
      "Mask topper (Robin / generic hero)",
      "Bold primary colours — red, blue, yellow, never pastel",
      "Recipient's name in superhero block lettering"
    ],
    mistakes: [
      "Muted colours — superhero must be loud",
      "Too many character references — keep it generic, not Marvel-vs-DC mashup",
      "Pastel cape — wrong vibe entirely"
    ],
    colours: ["hero red", "royal blue", "comic yellow", "black outline"],
    messageIdeas: [
      "Happy Birthday {NAME} — saving the day! 💥",
      "{NAME} — super at [age]",
      "Our hero {NAME}",
      "POW! Happy Birthday {NAME}",
      "{NAME}'s superhero training begins",
      "{NAME} — every day a hero"
    ]
  },
  elegant: {
    story: "The white-on-white elegant cake has been the timeless adult cake for 50+ years — sugar pearls, subtle texture, minimal piping. It's the cake choice of people who want their cake to look more like a wedding centrepiece than a kid's birthday.",
    bestFor: ["adults 30+", "milestone birthdays", "engagements"],
    checklist: [
      "Pure white smooth buttercream — no off-white or cream tones",
      "Sugar pearls clustered in groups (not scattered randomly)",
      "Single gold or silver leaf accent for warmth",
      "Subtle texture — quilted pattern, soft ruffle, or stencil lace",
      "Name in delicate script in pale gold — not bold, not loud"
    ],
    mistakes: [
      "Pearls of mixed sizes — should be uniform within each cluster",
      "Mixing gold and silver — pick one",
      "Adding colour anywhere — defeats the whole concept"
    ],
    colours: ["pure white", "pale gold accent", "ivory shadow"],
    messageIdeas: [
      "Happy Birthday {NAME} — timeless and treasured 🤍",
      "{NAME}, [age] never looked better",
      "Wishing {NAME} an elegant year",
      "{NAME} — every year more beautiful",
      "{NAME}'s milestone year",
      "Quietly perfect — like {NAME}"
    ]
  },
  "chocolate-drip": {
    story: "The chocolate drip cake has been Instagram's most-photographed cake style since 2016. It's universal — works for kids, teens, adults, weddings, birthdays, engagements. The whole design rests on one detail: a clean, even drip line.",
    bestFor: ["any age", "chocolate lovers", "Instagram-friendly events"],
    checklist: [
      "Drip lines all roughly equal length — not random",
      "Glossy ganache, not matte — it should catch the light",
      "Gold leaf accents in 2-3 spots (not all over)",
      "Macaron toppers in 2 contrasting colours — never 5+",
      "Name piped in white royal icing on the drip side"
    ],
    mistakes: [
      "Drip too thin — looks watery",
      "Drip running all the way to the cake board — should stop halfway down",
      "Mismatched macaron colours that fight the cake colour"
    ],
    colours: ["dark chocolate", "gold leaf", "macaron pastel pair"],
    messageIdeas: [
      "Happy Birthday {NAME} — drip, sip, celebrate 🍫",
      "{NAME}'s [age]th — sweet as ever",
      "Just drip with it — happy birthday {NAME}",
      "{NAME}, you're decadent",
      "Wishing {NAME} a deliciously happy day",
      "{NAME} — life is sweet"
    ]
  },
  gamer: {
    story: "Gamer cakes are now the #1 teen and young-adult cake category — gaming controller toppers, neon RGB lighting, pixel art accents. The brand-agnostic version (no specific console) works best for mixed-platform households.",
    bestFor: ["teens & young adults", "gamers", "esports / Twitch fans"],
    checklist: [
      "Controller topper — generic black controller, not Xbox-or-PlayStation-specific",
      "Neon RGB-style piping on the side band (purple, cyan, magenta)",
      "Pixel-art name in 8-bit font",
      "Black matte buttercream base — looks like a gaming setup",
      "Health-bar or 'level up' detail across the front"
    ],
    mistakes: [
      "Mixing PlayStation + Xbox brand logos (fans hate this)",
      "Pastel piping — gamer cakes should glow",
      "Realistic controller too small — should be a statement topper"
    ],
    colours: ["matte black", "neon purple", "cyan", "magenta"],
    messageIdeas: [
      "Happy Birthday {NAME} — level up! 🎮",
      "{NAME} just unlocked age [age]",
      "GG, {NAME} — happy birthday",
      "{NAME}'s respawn day",
      "Press start — {NAME}'s birthday",
      "{NAME} — XP +1 year"
    ]
  },
  bts: {
    story: "K-pop and BTS cakes are the fastest-growing teen-girl cake category since 2020. Strong designs feature member silhouettes, the purple-and-white BTS aesthetic, or specific album cover art. Wrong member name on the cake is the cardinal sin.",
    bestFor: ["teens & young adults", "K-pop fans", "ARMY birthday parties"],
    checklist: [
      "BTS purple done correctly — soft lilac, not dark grape",
      "Specific bias name spelled correctly (Jungkook, V/Taehyung, RM, etc.)",
      "Album-cover styling — clean minimal layout, not crowded",
      "Borahae (purple heart) detail in one corner",
      "Logo or member silhouette, never both (too busy)"
    ],
    mistakes: [
      "Misspelled member names — instant disappointment",
      "Wrong shade of purple — ARMYs notice",
      "Photo-print of the members — looks cheap; piped silhouettes look intentional"
    ],
    colours: ["BTS lilac", "white", "soft pink", "black accent"],
    messageIdeas: [
      "Happy Birthday {NAME} — borahae 💜",
      "{NAME}'s K-pop birthday era",
      "{NAME} + BTS = forever",
      "{NAME}, you're golden",
      "Wishing {NAME} a daebak birthday",
      "{NAME}'s [age]th — ARMY strong"
    ]
  },
  tropical: {
    story: "Tropical / luau cakes are summer's #1 cake category in the US, UK and Australia. Palm leaves, hibiscus, pineapple toppers — the design is about lush abundance and saturated colour.",
    bestFor: ["summer birthdays", "pool parties", "tropical destination themes"],
    checklist: [
      "Saturated palm-leaf green, not pastel",
      "Hibiscus flowers in coral or hot pink — at least 2-3 large blooms",
      "Pineapple topper or fondant pineapple charm",
      "Toucan or flamingo accent (pick one — not both)",
      "Gold pineapple-shape or 'Aloha' lettering"
    ],
    mistakes: [
      "Pastel colours — tropical should be saturated and bold",
      "Too many tropical motifs — pineapple + flamingo + palm + parrot is overload",
      "Sand-coloured base — tropical cakes are lush, not beachy"
    ],
    colours: ["palm green", "hibiscus coral", "sunshine yellow", "ocean teal"],
    messageIdeas: [
      "Happy Birthday {NAME} — aloha & celebrate 🌺",
      "{NAME}'s tropical [age]th",
      "Wishing {NAME} sun, sand and cake",
      "{NAME}, you're the pineapple of my eye",
      "Aloha {NAME} — happy birthday",
      "{NAME}'s island vibes"
    ]
  },
  vintage: {
    story: "Vintage Lambeth piping cakes went viral in 2022 and remain Pinterest's most-saved adult cake trend. The look is intricate piped ribbons, scallops and rosettes — 1950s baker's craft elevated by modern colour palettes.",
    bestFor: ["adults", "milestone birthdays", "engagements", "afternoon-tea parties"],
    checklist: [
      "Lambeth-style piping — ribbons, scallops, drop-string, fleur",
      "Soft pastel base — sage, dusty pink, butter yellow",
      "Tone-on-tone piping (same colour as base, slightly lighter)",
      "Edible flowers — small pansies or violas, not large blooms",
      "Hand-piped 'Happy Birthday {NAME}' in a script ribbon banner"
    ],
    mistakes: [
      "White piping on coloured base — modern Lambeth is tone-on-tone",
      "Over-decorated — leave breathing space between piping clusters",
      "Bright neon colours — kills the vintage feel"
    ],
    colours: ["dusty sage", "butter yellow", "soft rose", "ivory"],
    messageIdeas: [
      "Happy Birthday {NAME} — vintage perfection 🎀",
      "{NAME}'s [age]th — old-soul style",
      "Wishing {NAME} a classic, beautiful day",
      "{NAME} — timelessly lovely",
      "{NAME}'s afternoon-tea birthday",
      "Piped with love for {NAME}"
    ]
  }
};
