

## Fix GST Tax Invoice: Sender Name + Simplified Layout

### Changes to `supabase/functions/send-premium-emails/index.ts`

### 1. Fix Email Sender Name (line 1367)

Change sender name from `"USD Vision AI LLP"` to `"Cake AI Artist"`. The from address `billing@cakeaiartist.com` is already correct.

### 2. Simplify Invoice Table Layout (lines 209-241)

Replace the current table with a cleaner 3-row structure matching the reference invoice:

**Current (wrong):** Shows base amount (3,474.58) as Gross/Net, then IGST row, then Grand Total.

**New layout:**

| Sl No. | Description | Qty | SAC Code | Gross Amount (INR) | GST Rate | Discount | Net Amount (INR) |
|--------|-------------|-----|----------|--------------------|----------|----------|------------------|
| 1 | Cake AI Artist - Lifetime Access... | 1 | 997331 | 4,100.00 | 18% | -- | 4,100.00 |
| **Total** | | | | **4,100.00** | | | **4,100.00** |

Then below the table:
- **IGST @ 18%**: amount (e.g., 625.42) with amount in words
- **Grand Total**: 4,100.00 with amount in words

This matches the reference invoice format -- Gross Amount is the full amount, GST breakdown is shown separately below, and Grand Total equals the full amount.

### 3. Remove "Tax payable on reverse charge" lines (lines 257-267)

Remove the reverse charge and inter-state supply notes per user request to keep it simple. Keep only the "Whether tax payable on reverse charge: No" line above the table (matching reference placement at line ~205 area, before the item table).

### 4. Add "For USD Vision AI LLP / Authorised signatory" and "E. & O.E" to footer

Add these two lines in the footer section (lines 271-279) to match the reference invoice format. The company header already shows "USD Vision AI LLP" which stays as-is since it's the registered entity.

### Summary of Changes

| What | Current | New |
|------|---------|-----|
| Email sender name | "USD Vision AI LLP" | "Cake AI Artist" |
| Gross Amount column | Base amount (excl. GST) | Full amount (incl. GST) |
| Net Amount column | Base amount | Full amount |
| Table rows | Base + IGST + Grand Total | Full amount + Total row |
| Below table | Tax notes about reverse charge | IGST breakdown with words, Grand Total with words |
| Footer | Just computer-generated note | + "For USD Vision AI LLP / Authorised signatory" + "E. & O.E" |

### File

`supabase/functions/send-premium-emails/index.ts` -- modify `getGSTInvoiceEmailHtml()` function (lines ~139-287) and sender name (line 1367).

