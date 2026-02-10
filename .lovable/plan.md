

## Feature: GST Tax Invoice for All Payments (Lifetime + Monthly Subscriptions)

### Overview

Replace the current basic payment confirmation email with a **formal GST-compliant Tax Invoice** for **all INR payments** (both lifetime and monthly subscriptions), and add a "prices inclusive of GST" note for all non-INR currencies.

### Company Details

| Field | Value |
|-------|-------|
| Company Name | USD Vision AI LLP |
| GSTIN | 36AAJFU0315K1Z5 |
| PAN | AAJFU0315K |
| SAC Code | 997331 |
| Address | ZENITH NALLANGDALA, HCU Main Road, CUC Sub Post Office, Gachibowli, Hyderabad, Rangareddy, Telangana, 500046 |
| State Code | 36 (Telangana) |

### Tax Calculation (GST Inclusive, 18% IGST)

Formula: Base = Total / 1.18, IGST = Total - Base

| Payment Type | Total (INR) | Base Amount | IGST (18%) |
|-------------|-------------|-------------|------------|
| Tier 1 Lifetime | 4,100 | 3,474.58 | 625.42 |
| Tier 2 Lifetime | 8,200 | 6,949.15 | 1,250.85 |
| Monthly Subscription | 899 | 761.86 | 137.14 |

IGST is used (not CGST+SGST) because the seller is in Telangana and buyers are from various states (inter-state e-commerce supply).

---

### Changes to `supabase/functions/send-premium-emails/index.ts`

#### 1. Add `numberToWords()` helper function

Converts numeric amounts to words (e.g., 4100 to "Four Thousand One Hundred INR Only") for the formal invoice requirement.

#### 2. Add `getGSTInvoiceEmailHtml()` function

New function generating a formal tax invoice with:
- **Header**: "USD Vision AI LLP" with full address, GSTIN, PAN
- **Title**: "TAX INVOICE"
- **Bill To**: Buyer name, email
- **Item Table**: Description, Qty (1), SAC Code (997331), Gross Amount, GST Rate (18%), Net Amount
- **Tax row**: IGST @ 18% breakdown
- **Grand Total**: Full amount
- **Amount in words**: e.g., "Four Thousand One Hundred INR Only"
- **Footer**: "Tax payable on reverse charge: No", "Computer-generated invoice, no signature required"

This function works for **both** lifetime and monthly subscription payments -- the item description adapts:
- Lifetime: "Cake AI Artist - Lifetime Access, Tier 1 (First 50 Members)"
- Monthly: "Cake AI Artist - Monthly Premium Subscription"

#### 3. Modify email routing logic (lines ~1126-1156)

```text
if currency === "INR":
    -> Send getGSTInvoiceEmailHtml() instead of getPaymentConfirmationEmailHtml()
    -> Subject: "Tax Invoice - Cake AI Artist (Invoice CAI-2025-XXXX)"
else (USD, GBP, CAD, AUD):
    -> Send existing getPaymentConfirmationEmailHtml()
    -> Append note at bottom: "All prices are inclusive of applicable taxes (GST). Issued by USD Vision AI LLP, GSTIN: 36AAJFU0315K1Z5"
```

#### 4. Update existing `getPaymentConfirmationEmailHtml()` for non-INR

Add a small GST note section before the footer for all non-INR currencies:

> "All prices are inclusive of applicable taxes (GST). Issued by USD Vision AI LLP, GSTIN: 36AAJFU0315K1Z5"

---

### Invoice Layout (INR customers)

```text
+--------------------------------------------------+
|  USD Vision AI LLP                               |
|  ZENITH NALLANGDALA, HCU Main Road,             |
|  CUC Sub Post Office, Gachibowli, Hyderabad,    |
|  Rangareddy, Telangana, 500046                   |
|  GSTIN: 36AAJFU0315K1Z5  PAN: AAJFU0315K       |
+--------------------------------------------------+
|              TAX INVOICE                         |
+--------------------------------------------------+
| Bill To: [Name]        Invoice No: CAI-2025-0001|
| Email: [email]         Invoice Date: 10/02/2026 |
+--------------------------------------------------+
| # | Description        | Qty | SAC    | Gross   |
|---|--------------------+-----+--------+---------|
| 1 | Cake AI Artist -   |  1  | 997331 | 3474.58 |
|   | Lifetime Access    |     |        |         |
|   | OR Monthly Premium |     |        |         |
+--------------------------------------------------+
| IGST @ 18%                          |    625.42 |
+--------------------------------------------------+
| Grand Total                         |   4100.00 |
+--------------------------------------------------+
| Amount in words: Four Thousand One Hundred INR   |
+--------------------------------------------------+
| Tax payable on reverse charge: No                |
| Computer-generated invoice, no signature required|
+--------------------------------------------------+
```

### Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/send-premium-emails/index.ts` | Add `numberToWords()`, add `getGSTInvoiceEmailHtml()`, modify confirmation email routing (INR gets GST invoice, others get existing receipt + GST note) |

### No Upstream Changes Needed

The function already receives `amount`, `currency`, `tier`, and user details from both:
- `verify-razorpay-payment` (lifetime payments)
- `razorpay-webhook` (subscription payments)

No changes to payment flow or other edge functions required.

