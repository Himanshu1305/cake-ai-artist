# AEO/GEO Best Practices for 2026 — Research Report

_Compiled July 2026 for the Overnight SEO Overhaul. Sources: Princeton GEO study (Aggarwal et al.), HubSpot AEO research, OtterlyAI 1M-citation dataset, Google structured-data docs, and multiple 2025-2026 citation-pattern analyses._

---

## What Gets Cited in AI Answers (evidence)

The foundational controlled experiment is the **Princeton GEO study** (~10,000 queries, 9 datasets/7 domains, Google top-5 retrieval → GPT synthesis, validated on Perplexity). It ranked 9 optimization methods. The three winners were all forms of **machine-extractable provenance**:

| Tactic | Visibility lift | Notes |
|---|---|---|
| **Add statistics** (specific numbers, not vague claims) | **+30–41%** | Strongest single method; compounds with citations |
| **Add citations** (inline links to authoritative sources) | **+30–40%**; **+115%** for pages ranked #5 | Biggest "equalizer" — lifts low-ranked pages most |
| **Add expert quotations** (named-source quotes) | **+30–40%** | Best in People/Society, Explanation, History topics |
| Fluency optimization (readability) | +15–30% | Best paired with statistics |
| Authoritative voice (confident, un-hedged claims) | +10–20% | — |

**What failed (zero/negative impact):** keyword stuffing, "easy-to-understand" simplification, content padding, pure persuasive language.

**Cross-engine reality (2025-2026):**
- Engines source differently: ChatGPT leans on Wikipedia (~48% of its top-10 sources) + licensed publishers; Perplexity is Reddit-heavy, cites ~3–4 after rerank; Google AI Overviews weight **E-E-A-T heavily — 96% of AIO citations come from strong-E-E-A-T sources**.
- Only ~11% of domains are cited by *both* ChatGPT and Perplexity — structural extractability matters more than chasing one engine.
- **~80% of ChatGPT-cited URLs don't rank in Google's top 100.** The "just rank top 10" playbook is weakening.
- **On-page placement: 55% of AI Overview citations come from the top 30% of the page; only 21% from the bottom.** Put citable answers high.

---

## Direct-Answer Paragraph Formula

AI engines extract the **first 1–2 sentences of a section** to decide if it answers the query. Formula:

1. **Lead with a 40–60 word direct answer** immediately after the H1/H2 (inverted pyramid).
2. Put the **primary keyword/entity in the first 100 words**.
3. Follow with **2–3 atomic paragraphs of 1–3 sentences each**.
4. **One idea per sentence** so each is independently quotable.
5. Keep sections to **200–400 words**, self-contained "chunks."
6. **Self-contained rule:** every major sentence must make sense pulled out of context — no "as mentioned above" / dangling pronouns.

**Definition-opener pattern** (highly extractable): `[Term] is [clear, complete definition].`
> "An AI cake designer is a tool that generates custom cake design images from a text description of the occasion, flavor, and style, letting you visualize a cake before you order or bake it." (~33 words, standalone, attributable)

---

## Statistics & Definitions

- Include **a statistic roughly every 150–200 words**.
- Use **exact figures** ("in about 30 seconds", "5 free designs", "20+ occasions") — never "very fast", "many".
- **Pair each stat with an inline citation** to a primary source where possible (they compound).
- **Attribute by named entity** ("Researchers at X found…") — specific attribution makes a stat safely liftable.
- **Definition boxes** are pre-packaged summaries an engine lifts whole; the direct win for "What is X?" queries. One per concept, standalone, visually distinct.

---

## Schema That Matters in 2026

Key nuance: **schema.org markup is still valid even where Google killed the rich-result display.** LLMs rely on the structured understanding search engines build (which use schema) + clean HTML Q&A. Schema is a *supporting* signal, not the citation lever itself.

| Schema type | 2026 status | Verdict for the cake app |
|---|---|---|
| **FAQPage** | Rich result **deprecated (May 2026)**; markup still valid | **Keep it** — zero SERP harm, still parsed by AI/voice. But clean on-page Q&A HTML is what gets cited. |
| **HowTo** | **Fully retired** (2023); no rich result on any surface | Optional/harmless. Prioritize the on-page step list. |
| **Speakable** | **Still active** (news-focused) | Worth adding to the best citable passage. |
| **Article / BlogPosting** | Fully supported | **Required baseline.** Include author + `datePublished` + **visible last-updated date**. |
| **Organization** | Fully supported | **Keep** — establishes brand entity (logo, `sameAs`). |
| **Product / Offer + AggregateRating/Review** | Supported, rich results active | Keep on product/cake pages. Review-platform presence ~3× citation probability. |

Load-bearing schema: **Organization + Article (author + dates) + Product**; keep **FAQPage** (harmless, mildly helpful); **HowTo** optional.

---

## Content Structure Checklist

From HubSpot's 2026 format study (listicles = 21.9% of AI citations, articles 16.7%, product pages 13.7%):

**Page architecture**
- Question-based H2s mirroring real queries ("How does an AI cake designer work?").
- Under each H2, **lead with a 40–60 word direct answer**, then expand.
- One citable claim per H2; each section citable in isolation.
- Clear H1 → H2 → H3 hierarchy.

**Intent-matched title patterns AI cites most:** **"What is X," "X vs. Y," "How to X," "Best X."**

**Formats engines lift whole**
- **Lists** for steps/rankings (top-cited format type).
- **Comparison tables** — pages with **3+ tables earn ~25.7% more citations**.
- **Definition boxes** for "what is X."
- **FAQ section** with standalone Q&A pairs + FAQPage schema.

**Trust/citation-correlated elements**
- Statistics with inline named-source citations (every ~150–200 words).
- Visible last-updated date.
- Author bio / credentials (E-E-A-T).
- Review-platform profiles (~3× citation probability).

**llms.txt:** low-cost Business-to-Agent readiness file. Google does **not** support it; Perplexity/Anthropic may use it. Ship a simple one but **do not divert effort from clean extractable HTML.** (This repo already has `public/llms.txt`.)

---

## Top 5 highest-ROI actions for this app
1. Open every key page/section with a **40–60 word direct answer** right after the heading.
2. Inject **specific statistics + inline citations** throughout.
3. Add **question-based H2s** matching "What is / How to / Best / vs." patterns, each with a standalone answer + FAQ.
4. Ship **Organization + Article (author + last-updated) + Product** schema; keep FAQPage; add Speakable to hero answers.
5. Add **comparison tables (aim for 3+)** on comparison/product pages.
