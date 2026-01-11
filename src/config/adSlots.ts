/**
 * AdSense Ad Slot Configuration
 * 
 * IMPORTANT: Replace these placeholder values with your actual AdSense slot IDs
 * from your Google AdSense dashboard.
 * 
 * To get your slot IDs:
 * 1. Go to Google AdSense dashboard (adsense.google.com)
 * 2. Navigate to Ads > By ad unit
 * 3. Create ad units for each type/placement
 * 4. Copy the data-ad-slot value from the generated code
 */

export const AD_SLOTS = {
  // Homepage ads
  homepage_horizontal: "", // Create: 728x90 Leaderboard
  
  // Blog listing page ads
  blog_horizontal: "", // Create: 728x90 Leaderboard for between posts
  blog_rectangle: "", // Create: 300x250 Rectangle before newsletter
  
  // Blog post/article page ads
  article_top: "", // Create: Responsive ad for top of article
  article_sidebar: "", // Create: 300x250 Rectangle for sidebar
  article_in_content: "", // Create: In-article (fluid) for within content
  article_bottom: "", // Create: 728x90 Leaderboard for bottom
  
  // General sidebar ads
  sidebar_rectangle: "", // Create: 300x250 Rectangle for sidebars
} as const;

// Type for ad slot keys
export type AdSlotKey = keyof typeof AD_SLOTS;

/**
 * Get an ad slot ID by key
 * Returns empty string if slot is not configured
 */
export const getAdSlotId = (key: AdSlotKey): string => {
  return AD_SLOTS[key] || "";
};
