

## Plan: Enhance Rapport Lines with Gratitude for Trust

**File:** `supabase/functions/send-weekly-upgrade-nudge/index.ts`

The current rapport lines appreciate creativity but don't explicitly thank users for choosing and trusting Cake AI Artist. We'll weave gratitude for their trust into each variant's rapport paragraph.

### Updated Rapport Lines

**Variant 1 (Feature Spotlight):**
> We love seeing what you create — you've already made some amazing designs! 🎨 Whether it's for a birthday, anniversary, or just for fun, your creativity keeps inspiring us. Thank you for trusting Cake AI Artist to bring your ideas to life. Here's something cool we think you'll love:

**Variant 2 (By the Numbers):**
> You're part of a growing community of creative cake designers, and we're so glad you're here. 💜 Every design you create adds something special to our platform. We're truly grateful you chose us to help with your cake creations. We wanted to share a quick look at how you can unlock even more creative freedom:

**Variant 3 (Success Stories):**
> Every great cake starts with a spark of creativity — and yours is clearly shining! ✨ We've watched our community grow into something truly special, and you're a big part of that. It means the world to us that you trust Cake AI Artist with your celebrations. Here's what some fellow creators have been up to:

**Variant 4 (Urgency):**
> Thank you for being part of the Cake AI Artist family — your creativity inspires us every day. 💛 We built this tool because we believe everyone deserves beautiful cake designs, and we're so grateful you chose to create with us. Seeing what you make truly makes it all worth it. We have something special to share with you:

### Technical Detail

Update the `rapportLines` object in `getEmailHtml` (lines ~67-70) with the revised text. No structural changes needed.

