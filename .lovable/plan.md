Add the Google Analytics gtag.js tag to the site so page views and events are tracked on all routes.

What will change
- Edit `index.html` (the single entry point for this React app) to load the Google tag. Because the app is a single-page application, one insertion in `index.html` covers every current and future route.
- The existing Google Consent Mode script already creates `window.dataLayer` and `gtag()`. The new tag will reuse those objects and only add the async library load + the `gtag('config', 'G-3XYSM50D2P')` call.

Placement
- Immediately after the existing Consent Mode `<script>` block and before the `<meta charset>` tag inside `<head>`.

Code to insert
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-3XYSM50D2P"></script>
<script>
  gtag('js', new Date());
  gtag('config', 'G-3XYSM50D2P');
</script>
```

Why omit the `dataLayer` / `gtag()` re-declaration?
- The Consent Mode block at the top of `<head>` already declares them. Re-declaring is safe but redundant; keeping the tag clean avoids confusion.

No other files are touched.