

## Quality Toggle Feature Plan

### Overview

Add a toggle in the CakeCreator form to let users choose between:
- **Fast mode** (default): Uses `google/gemini-2.5-flash-image` - ~30 seconds
- **High Quality mode**: Uses `google/gemini-3-pro-image-preview` - ~2 minutes

---

### User Interface

The toggle will be placed in the "Customize Your Cake" section, at the top, as it's an important generation setting:

```
┌─────────────────────────────────────────────────────┐
│ Customize Your Cake                                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ⚡ Generation Quality                              │
│  ┌─────────────────────────────────────────────┐   │
│  │  ○ Fast (~30 seconds)        ⚡             │   │
│  │  ○ High Quality (~2 minutes) ✨             │   │
│  │    Creates more detailed, refined images     │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Cake Type          Layers                         │
│  [Chocolate ▼]      [2-Layer ▼]                    │
│                                                     │
│  Theme/Style        Color Scheme                   │
│  [Modern ▼]         [Pastels ▼]                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### Implementation Details

#### 1. Edge Function Changes (`supabase/functions/generate-complete-cake/index.ts`)

**Add quality to validation schema:**
```typescript
const cakeRequestSchema = z.object({
  // ... existing fields
  quality: z.enum(['fast', 'high']).optional().default('fast'),
});
```

**Extract quality and select model dynamically:**
```typescript
const { 
  name, character, occasion, /* ... other fields */ 
  quality  // Add this
} = validationResult.data;

// Model selection based on quality
const imageModel = quality === 'high' 
  ? 'google/gemini-3-pro-image-preview' 
  : 'google/gemini-2.5-flash-image';

console.log('Using model:', imageModel, 'for quality:', quality);
```

**Update all image generation calls** (3 locations where model is specified):
```typescript
body: JSON.stringify({
  model: imageModel,  // Dynamic instead of hardcoded
  messages: messages,
  modalities: ['image', 'text']
})
```

#### 2. Frontend Changes (`src/components/CakeCreator.tsx`)

**Add state for quality:**
```typescript
const [generationQuality, setGenerationQuality] = useState<'fast' | 'high'>('fast');
```

**Update progress simulation based on quality:**
```typescript
useEffect(() => {
  if (!isLoading) {
    setGenerationProgress(0);
    setGenerationStep("");
    return;
  }

  // Different progress steps based on quality mode
  const fastSteps = [
    { progress: 8, step: "🎂 Baking something special...", delay: 500 },
    { progress: 20, step: "✨ Adding magical decorations...", delay: 3000 },
    // ... (existing fast steps)
  ];

  const highQualitySteps = [
    { progress: 5, step: "🎂 Crafting your masterpiece...", delay: 500 },
    { progress: 12, step: "✨ Adding intricate decorations...", delay: 8000 },
    { progress: 20, step: "🌈 Mixing the perfect colors...", delay: 15000 },
    { progress: 30, step: "🎀 Sculpting beautiful tiers...", delay: 25000 },
    { progress: 40, step: "💖 Adding fine details...", delay: 35000 },
    { progress: 50, step: "🌟 Creating textures...", delay: 50000 },
    { progress: 60, step: "🎨 Refining the artistry...", delay: 65000 },
    { progress: 70, step: "✨ Perfecting every detail...", delay: 80000 },
    { progress: 80, step: "🍰 Adding finishing touches...", delay: 95000 },
    { progress: 88, step: "🎁 Nearly there...", delay: 110000 },
    { progress: 95, step: "🎉 Almost ready...", delay: 125000 },
    { progress: 97, step: "💫 Final moments...", delay: 140000 },
    { progress: 98, step: "🎂 Finishing up...", delay: 160000 },
  ];

  const steps = generationQuality === 'high' ? highQualitySteps : fastSteps;
  // ... rest of effect
}, [isLoading, generationQuality]);
```

**Update timeout based on quality:**
```typescript
const invokeWithRetry = async (functionName: string, body: any, maxRetries = 1) => {
  // Dynamic timeout based on quality
  const TIMEOUT_MS = body?.quality === 'high' ? 180000 : 60000; // 3 min vs 1 min
  // ... rest of function
};
```

**Pass quality to edge function:**
```typescript
const { data, error } = await invokeWithRetry('generate-complete-cake', {
  name: name.trim(),
  character: character || undefined,
  // ... other fields
  quality: generationQuality,  // Add this
});
```

**Add UI toggle in the "Customize Your Cake" section:**
```tsx
{/* Generation Quality Toggle - at top of Customize section */}
<div className="space-y-3 pb-4 border-b border-border/50">
  <Label className="text-sm font-medium flex items-center gap-2">
    <Sparkles className="w-4 h-4" />
    Generation Quality
  </Label>
  <div className="grid grid-cols-1 gap-2">
    <button
      type="button"
      onClick={() => setGenerationQuality('fast')}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left",
        generationQuality === 'fast'
          ? "border-party-purple bg-party-purple/10"
          : "border-border hover:border-party-purple/50"
      )}
    >
      <div className={cn(
        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
        generationQuality === 'fast' ? "border-party-purple" : "border-muted-foreground"
      )}>
        {generationQuality === 'fast' && (
          <div className="w-3 h-3 rounded-full bg-party-purple" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">⚡ Fast</span>
          <span className="text-xs text-muted-foreground">(~30 seconds)</span>
        </div>
      </div>
    </button>
    
    <button
      type="button"
      onClick={() => setGenerationQuality('high')}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left",
        generationQuality === 'high'
          ? "border-party-purple bg-party-purple/10"
          : "border-border hover:border-party-purple/50"
      )}
    >
      <div className={cn(
        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
        generationQuality === 'high' ? "border-party-purple" : "border-muted-foreground"
      )}>
        {generationQuality === 'high' && (
          <div className="w-3 h-3 rounded-full bg-party-purple" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">✨ High Quality</span>
          <span className="text-xs text-muted-foreground">(~2 minutes)</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Creates more detailed, refined cake images
        </p>
      </div>
    </button>
  </div>
</div>
```

**Update toast message to include quality info:**
```typescript
toast({
  title: "Creating your cake...",
  description: generationQuality === 'high'
    ? `AI is generating ${viewDescription} in high quality mode - this takes about 2 minutes!`
    : `AI is generating ${viewDescription} with your personalization!`,
});
```

---

### Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/generate-complete-cake/index.ts` | Add `quality` to schema, dynamic model selection |
| `src/components/CakeCreator.tsx` | Add state, UI toggle, update progress simulation, pass quality to function |

---

### Summary

- Default is Fast mode for optimal user experience
- High Quality option clearly indicates ~2 minute wait time
- Progress bar adapts to selected quality mode
- Timeout adapts (60s for fast, 180s for high quality)
- Visual toggle with radio-button style for clear selection

