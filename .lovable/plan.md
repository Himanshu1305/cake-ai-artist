

## Fix: Banner/Navigation Overlap Issue

### Problem Identified

The **UrgencyBanner** (fixed at top) and **Navigation bar** (sticky) have hardcoded offset values that don't account for dynamic banner height, causing overlap issues:

```typescript
// Current hardcoded approach in Index.tsx
<nav className={`sticky ${isBannerVisible ? 'top-16 md:top-12' : 'top-0'} ...`}>
```

**Why this fails:**
- UrgencyBanner height varies based on:
  - Sale label text length
  - Banner text content
  - Countdown timer vs Spots counter
  - Text wrapping on narrow screens
- Hardcoded `top-16` (64px) / `top-12` (48px) doesn't match actual banner height
- When banner content changes or wraps, navigation slides under or over the banner

### Visual Representation

```text
┌─────────────────────────────────────────────────────┐
│ UrgencyBanner (fixed top-0, z-50)                   │
│ 🎉 EXCLUSIVE DEAL  [content that may wrap]          │
│                    Limited spots remaining          │
│    ↑ Height varies: 40-80px depending on content    │
├─────────────────────────────────────────────────────┤
│ Navigation (sticky top-12/top-16)  ← HARDCODED!    │
│ 🎂 Cake AI Artist    [links...]        Sign In     │
│                                                     │
│    ↑ If banner is 60px but nav is at 48px = OVERLAP│
└─────────────────────────────────────────────────────┘
```

---

### Solution

**Use CSS custom property and JavaScript to dynamically calculate banner height:**

1. **UrgencyBanner**: Add a ref to measure actual height and report it via CSS custom property or callback
2. **Index.tsx** (and landing pages): Use the actual banner height for navigation offset
3. **Alternative simpler approach**: Make UrgencyBanner not fixed, just static at top, so navigation naturally flows below it

---

### Implementation Options

#### Option A: Static Banner (Simpler - Recommended)

Change UrgencyBanner from `fixed` to static positioning, making it part of normal document flow. The navigation stays sticky below it without needing any offset calculation.

**Pros:**
- No JavaScript height calculation needed
- Works perfectly on all screen sizes
- No risk of overlap

**Cons:**
- Banner scrolls away when user scrolls (not always visible)
- Users may prefer persistent banner

#### Option B: Dynamic Height Measurement (More Complex)

Measure the actual UrgencyBanner height and pass it to navigation for dynamic offset.

**Pros:**
- Banner stays fixed/visible while scrolling
- Accurate positioning

**Cons:**
- Requires refs and state management
- Slight complexity with SSR/hydration

---

### Recommended: Option B with Height Callback

**File: `src/components/UrgencyBanner.tsx`**

Add a height measurement callback:

```typescript
interface UrgencyBannerProps {
  onVisibilityChange?: (visible: boolean) => void;
  onHeightChange?: (height: number) => void;  // NEW
  countryCode?: string;
}

export const UrgencyBanner = ({ onVisibilityChange, onHeightChange, countryCode }) => {
  const bannerRef = useRef<HTMLDivElement>(null);
  
  // Measure height on mount and resize
  useEffect(() => {
    if (!bannerRef.current || !onHeightChange) return;
    
    const updateHeight = () => {
      if (bannerRef.current) {
        onHeightChange(bannerRef.current.offsetHeight);
      }
    };
    
    updateHeight();
    
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(bannerRef.current);
    
    return () => resizeObserver.disconnect();
  }, [onHeightChange, isSaleActive, isDismissed]);

  // Report 0 height when banner is hidden
  useEffect(() => {
    if (!isSaleActive || isDismissed || isLoading || !sale) {
      onHeightChange?.(0);
    }
  }, [isSaleActive, isDismissed, isLoading, sale, onHeightChange]);
  
  return (
    <motion.div ref={bannerRef} ... >
      ...
    </motion.div>
  );
};
```

**File: `src/pages/Index.tsx`** (and all landing pages)

```typescript
const [bannerHeight, setBannerHeight] = useState(48); // Default estimate

// In JSX:
<UrgencyBanner 
  onVisibilityChange={setIsBannerVisible} 
  onHeightChange={setBannerHeight}
  countryCode="US" 
/>

<nav 
  className="sticky z-40 bg-gradient-to-b ..."
  style={{ top: isBannerVisible ? `${bannerHeight}px` : '0px' }}
>
```

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/UrgencyBanner.tsx` | Add `onHeightChange` prop, useRef, ResizeObserver to measure and report height |
| `src/pages/Index.tsx` | Add `bannerHeight` state, pass callback to UrgencyBanner, use inline style for nav top offset |
| `src/pages/IndiaLanding.tsx` | Same changes as Index.tsx |
| `src/pages/UKLanding.tsx` | Same changes as Index.tsx |
| `src/pages/CanadaLanding.tsx` | Same changes as Index.tsx |
| `src/pages/AustraliaLanding.tsx` | Same changes as Index.tsx |

---

### Technical Details

**ResizeObserver** is used because:
- Banner height can change when sale data loads (skeleton → actual content)
- Text can reflow on window resize
- Countdown timer content changes every second (though height stays stable)

**Default height of 48px** ensures navigation doesn't jump on initial render before measurement completes.

---

### Expected Result

After implementation:
- Navigation bar will always appear directly below the UrgencyBanner
- No overlap regardless of banner content length
- Dynamic adjustment when window resizes or banner content changes
- Smooth experience across all device sizes

