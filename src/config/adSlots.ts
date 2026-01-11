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
  homepage_horizontal: "8100111510", // Leaderboard 728x90
  
  // Blog listing page ads
  blog_horizontal: "8100111510", // Leaderboard 728x90
  blog_rectangle: "8138628204", // Medium Rectangle 300x250
  
  // Blog post/article page ads
  article_top: "3234620037", // Vertical (responsive)
  article_sidebar: "8138628204", // Medium Rectangle 300x250
  article_in_content: "6876667365", // In-article (fluid)
  article_bottom: "8100111510", // Leaderboard 728x90
  
  // General sidebar ads
  sidebar_rectangle: "8138628204", // Medium Rectangle 300x250
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
