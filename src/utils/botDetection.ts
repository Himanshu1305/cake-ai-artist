// Common search engine bot user agents
const BOT_PATTERNS = [
  'googlebot',
  'bingbot',
  'slurp',        // Yahoo
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'applebot',
  'msnbot',
  'crawl',
  'spider',
  'bot',
];

/**
 * Detects if the current visitor is a search engine bot
 * Used to prevent geo-redirects for crawlers so they can index all pages
 */
export const isSearchBot = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  return BOT_PATTERNS.some(bot => userAgent.includes(bot));
};
