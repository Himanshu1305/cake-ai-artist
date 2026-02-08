// Comprehensive bot detection patterns for SEO-safe geo-redirects
// NOTE: Only specific bot identifiers - avoid generic patterns that cause false positives
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
  'slurp',        // Yahoo
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'applebot',
  'msnbot',
  
  // Social media crawlers (specific bot names only)
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'slackbot',
  'telegrambot',
  'whatsapp/',  // More specific with slash to avoid matching app user agents
  
  // SEO tools
  'petalbot',
  'semrushbot',
  'ahrefsbot',
  'dotbot',
  'rogerbot',
  'screaming frog',
];

/**
 * Detects if the current visitor is a search engine bot
 * Used to prevent geo-redirects for crawlers so they can index all pages
 * 
 * IMPORTANT: Returns true (assume bot) in SSR/edge cases for safety
 */
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

/**
 * Check for URL parameter escape hatch to skip redirects
 * Useful for testing and allowing crawlers explicit access
 */
export const hasNoRedirectParam = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.has('noredirect') || params.has('googlebot');
  } catch {
    return false;
  }
};
