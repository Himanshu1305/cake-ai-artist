// Birthday message templates by relationship + age band.
// Used by /birthday-cake-for/{name} pages to give every page a unique,
// AEO-friendly "messages to write on {NAME}'s cake" list.
// {NAME} is replaced at render time.

export interface MessageBlock {
  heading: string;
  items: string[];
}

export const cakeMessagesFor = (): MessageBlock[] => [
  {
    heading: "Sweet & simple",
    items: [
      "Happy Birthday {NAME}",
      "Happy Birthday to you, {NAME}",
      "Many happy returns, {NAME}",
      "{NAME}'s big day",
      "Cheers to {NAME}",
      "{NAME} — celebrate",
    ],
  },
  {
    heading: "For a child (ages 1-10)",
    items: [
      "Happy Birthday little {NAME} 🎈",
      "{NAME} is [age] today!",
      "Three cheers for {NAME}",
      "Yay {NAME} — happy birthday",
      "{NAME}'s special day",
      "Hip hip hooray, {NAME}",
    ],
  },
  {
    heading: "For a teen / young adult",
    items: [
      "Happy Birthday {NAME} ✨",
      "{NAME}, level up to [age]",
      "Cheers to {NAME} at [age]",
      "Best one yet, {NAME}",
      "{NAME}'s era begins",
      "Stay golden, {NAME}",
    ],
  },
  {
    heading: "For an adult / milestone",
    items: [
      "Happy Birthday {NAME}",
      "{NAME}, vintage [birth year]",
      "Wishing {NAME} a beautiful year",
      "Cheers to {NAME} — [age] and counting",
      "{NAME}, you make [age] look easy",
      "To {NAME} — love always",
    ],
  },
  {
    heading: "From family",
    items: [
      "We love you, {NAME}",
      "Our world, {NAME}",
      "Happy Birthday, our {NAME}",
      "{NAME} — forever ours",
      "To our darling {NAME}",
      "{NAME} — proud of you",
    ],
  },
  {
    heading: "From friends",
    items: [
      "Bestie {NAME} — happy birthday",
      "Cheers {NAME} 🥂",
      "{NAME}, you're the best",
      "Happy Birthday {NAME} — let's party",
      "Squad's favourite — {NAME}",
      "{NAME} — main character today",
    ],
  },
];
