## Goal
Make the secondary "See examples" button visually balanced with the primary "Design Your Cake Free" CTA on the homepage hero.

## Change
Update the button in `src/pages/Index.tsx` (around line 442) to use a soft pink-to-gold gradient background with a stronger gold border, so it reads as a companion to the primary gradient CTA rather than a flat outlined button.

### New className
```
bg-gradient-to-r from-party-pink/15 to-gold/15
border-2 border-gold/60
text-foreground
hover:from-party-pink/25 hover:to-gold/25 hover:border-gold
backdrop-blur-sm shadow-sm
text-base md:text-lg px-7 py-6 font-semibold
```

No other files affected.