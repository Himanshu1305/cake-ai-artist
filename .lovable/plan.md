

## Fix: India Geo-Redirect Not Working on Desktop

### Problem Identified

The geo-redirect to `/india` is not working despite:
1. ipapi.co correctly detecting `country_code: "IN"`
2. GeoContext logging `[GeoContext] ipapi.co response: IN`

**But NO logs from GeoRedirectWrapper** - meaning `isSearchBot()` is returning `true` prematurely, blocking all redirect logic.

---

### Root Cause

The bot detection is **too aggressive** after the recent changes. Specifically, in `isSearchBot()`:

```typescript
// SSR-safe: assume bot if navigator/window unavailable
if (typeof navigator === 'undefined') return true;
if (typeof window === 'undefined') return true;
```

While this is correct for SSR, the problem is that during React's initial render cycle (before hydration completes), these checks might incorrectly trigger in some edge cases.

Additionally, there's a potential issue with how we're checking patterns - some user agents might inadvertently match patterns like:
- `'spider'` - could match some rare browser extensions
- `'pinterest'` - could match if Pinterest app is involved
- `'crawl'` - very broad pattern

---

### Solution

1. **Add Debug Logging**: Add console.log to see exactly what's happening with bot detection
2. **Make Bot Detection Less Aggressive for Real Users**: Only check specific bot patterns, remove overly broad patterns
3. **Fix Timing Issue**: Ensure the check only runs when React has fully hydrated

---

### Code Changes

#### File: `src/utils/botDetection.ts`

**Add debugging and fix overly broad patterns:**

```typescript
// Remove these overly broad patterns that could cause false positives:
// - 'crawl' (too generic)
// - 'spider' (too generic) 
// - 'pinterest' (could match Pinterest browser)

// Updated BOT_PATTERNS - more specific, fewer false positives
const BOT_PATTERNS = [
  // Google crawlers (priority - most important for SEO)
  'googlebot',
  'googlebot-image',
  'googlebot-news',
  'googlebot-video',
  'storebot-google',
  'google-inspectiontool',
  'googleweblight',
  'chrome-lighthouse',
  'google page speed',
  'adsbot-google',
  'mediapartners-google',
  'google-safety',
  
  // Other major search engines
  'bingbot',
  'slurp',
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'applebot',
  'msnbot',
  
  // Social media crawlers (specific bot names)
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'slackbot',
  'telegrambot',
  'whatsapp/',  // More specific with slash
  
  // SEO tools
  'petalbot',
  'semrushbot',
  'ahrefsbot',
  'dotbot',
  'rogerbot',
  'screaming frog',
];

export const isSearchBot = (): boolean => {
  // SSR-safe: assume bot if navigator/window unavailable
  if (typeof navigator === 'undefined') {
    console.log('[BotDetection] navigator undefined, assuming bot');
    return true;
  }
  if (typeof window === 'undefined') {
    console.log('[BotDetection] window undefined, assuming bot');
    return true;
  }
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Empty or missing user agent is suspicious - treat as bot
  if (!userAgent || userAgent.trim() === '') {
    console.log('[BotDetection] Empty user agent, assuming bot');
    return true;
  }
  
  const isBot = BOT_PATTERNS.some(pattern => userAgent.includes(pattern));
  
  if (isBot) {
    const matchedPattern = BOT_PATTERNS.find(p => userAgent.includes(p));
    console.log('[BotDetection] Bot detected, matched pattern:', matchedPattern);
  }
  
  return isBot;
};
```

**Key changes:**
- Remove generic patterns: `'crawl'`, `'spider'`, `'bot/'`, `'bot;'`, `'pinterest'`
- Add more specific patterns for social bots
- Add debug logging to understand what's triggering

#### File: `src/components/GeoRedirectWrapper.tsx`

**Add debug logging:**

```typescript
useEffect(() => {
  console.log('[GeoRedirect] Starting, pathname:', location.pathname);
  
  // CRITICAL: Synchronous bot check FIRST
  const botDetected = isSearchBot();
  console.log('[GeoRedirect] isSearchBot result:', botDetected);
  
  if (botDetected) {
    console.log('[GeoRedirect] Search bot detected, skipping all redirect logic');
    return;
  }
  
  if (hasNoRedirectParam()) {
    console.log('[GeoRedirect] noredirect param detected, skipping redirect');
    return;
  }

  console.log('[GeoRedirect] hasRedirected:', hasRedirected, 'isRedirectable:', REDIRECTABLE_ROUTES.includes(location.pathname));
  
  if (hasRedirected || !REDIRECTABLE_ROUTES.includes(location.pathname)) {
    return;
  }

  // ... rest of detectAndRedirect
}, [location.pathname, hasRedirected, navigate]);
```

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/utils/botDetection.ts` | Remove overly broad patterns (`crawl`, `spider`, `bot/`, `bot;`, `pinterest`), add debug logging |
| `src/components/GeoRedirectWrapper.tsx` | Add debug logging to trace execution flow |

---

### Summary

- **Issue**: Bot detection is too aggressive, blocking real users from geo-redirect
- **Fix**: Remove generic patterns that could match legitimate browsers
- **Debug**: Add console logging to trace the exact issue
- **Result**: India users will correctly redirect to `/india` landing page

