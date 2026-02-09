

## Fix: Countdown Timer Shows "327 Days" Flash on Page Load

### Problem Analysis

When the page loads, the CountdownTimer briefly shows a large number (e.g., 327 days) before switching to the correct countdown. This happens because:

1. **Initial State Issue**: The `useHolidaySale` hook starts with `sale: null` and `isLoading: true`
2. **Fallback Date Triggered**: While loading, `targetDate` falls back to `DEFAULT_END_DATE` (December 31, 2026)
3. **Immediate Calculation**: The `useCountdown` hook calculates countdown to this far-future date
4. **Flash of Wrong Content**: User sees "327 days" for 1-2 seconds until the real sale data loads

### Visual Timeline

```text
Page Load                                  Sale Data Loaded
    |                                            |
    v                                            v
[327d 5h 23m 15s]  -----(1-2 seconds)----->  [3d 12h 45m 30s]
   (Wrong!)                                     (Correct!)
```

### Solution

**Don't render countdown until sale data is loaded.** Show a loading skeleton or nothing while `isLoading` is true.

---

### Code Changes

#### File: `src/components/CountdownTimer.tsx`

```typescript
export const CountdownTimer = ({ compact = false, className = '', countryCode, endDate: propEndDate }: CountdownTimerProps) => {
  const { sale, isLoading } = useHolidaySale({ countryCode });
  
  // If using database-driven endDate and still loading, show nothing or skeleton
  // This prevents the "327 days" flash from the DEFAULT_END_DATE fallback
  if (!propEndDate && isLoading) {
    if (compact) {
      return (
        <div className={`inline-flex items-center gap-1 font-mono ${className}`}>
          <Clock className="w-4 h-4 animate-pulse" />
          <span className="animate-pulse">--:--:--</span>
        </div>
      );
    }
    // Return loading skeleton for full-size timer
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        {['d', 'h', 'm', 's'].map((label) => (
          <div key={label} className="flex flex-col items-center">
            <div className="bg-surface-elevated border-2 border-border rounded-lg px-3 py-2 min-w-[60px] text-center animate-pulse">
              <span className="text-2xl md:text-3xl font-bold font-mono text-muted-foreground">--</span>
            </div>
            <span className="text-xs text-muted-foreground mt-1 uppercase">{label}</span>
          </div>
        ))}
      </div>
    );
  }
  
  // Use prop endDate if provided, otherwise use sale endDate, fallback to default
  const targetDate = propEndDate || (sale?.endDate) || DEFAULT_END_DATE;
  
  // ... rest of component unchanged
};
```

**Key Changes:**
- Check `!propEndDate && isLoading` at the start
- Show placeholder skeleton (`--:--:--` for compact, `--` boxes for full) while loading
- Only calculate countdown after sale data is available

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/CountdownTimer.tsx` | Add loading state handling with skeleton placeholder before countdown calculation |

---

### Why This Fixes the Issue

| Before | After |
|--------|-------|
| Shows "327d 5h..." (DEFAULT_END_DATE) | Shows "--:--:--" skeleton |
| Then switches to correct countdown | Then shows correct countdown |
| **Jarring, confusing flash** | **Smooth loading experience** |

---

### Affected Pages

This fix will improve the loading experience on:
- `/australia` - Hero countdown
- `/india` - Hero countdown  
- `/uk` - Hero countdown
- `/canada` - Hero countdown
- Homepage (`/`) - UrgencyBanner countdown
- ExitIntentModal - Countdown display

