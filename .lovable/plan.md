

## Plan: Add Warm Rapport-Building Lines to Each Email Variant

**File:** `supabase/functions/send-weekly-upgrade-nudge/index.ts`

Currently each variant jumps straight from "Hey {name}! 👋" into the sales pitch. We'll add 2-3 warm, appreciative lines after the greeting to build rapport before presenting the upgrade content.

### Implementation

Refactor `getEmailHtml` to insert a new `<tr><td>` row between the greeting and the variant body. Each variant gets its own rapport paragraph:

**Variant 1 (Feature Spotlight):**
> We love seeing what you create — you've already made some amazing designs! 🎨 Whether it's for a birthday, anniversary, or just for fun, your creativity keeps inspiring us. Here's something cool we think you'll love:

**Variant 2 (By the Numbers):**
> You're part of a growing community of creative cake designers, and we're so glad you're here. 💜 Every design you create adds something special to our platform. We wanted to share a quick look at how you can unlock even more creative freedom:

**Variant 3 (Success Stories):**
> Every great cake starts with a spark of creativity — and yours is clearly shining! ✨ We've watched our community grow into something truly special, and you're a big part of that. Here's what some fellow creators have been up to:

**Variant 4 (Urgency):**
> Thank you for being part of the Cake AI Artist family — your creativity inspires us every day. 💛 We built this tool because we believe everyone deserves beautiful cake designs, and seeing what you create makes it all worth it. We have something special to share with you:

### Technical Detail

In `getEmailHtml`, a new row will be added after the greeting `<td>` and before the variant `body`. The motivational text will be styled as `color:#555; font-size:15px; line-height:1.6` to match the existing body text style.

