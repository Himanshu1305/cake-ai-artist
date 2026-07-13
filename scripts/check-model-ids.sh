#!/bin/bash
# Lint guard: no hardcoded AI model IDs outside _shared/ai-models.ts
matches=$(grep -rn '"google/\|"openai/\|"anthropic/' supabase/functions/ | grep -v '_shared/ai-models.ts')
if [ -n "$matches" ]; then
  echo "❌ Hardcoded model ID found — import from _shared/ai-models.ts instead:"
  echo "$matches"
  exit 1
fi
echo "✅ No hardcoded model IDs"
