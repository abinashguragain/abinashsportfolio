

## Plan: Replace static favicon.ico with dynamic admin-uploaded favicon

**What changes:**

1. **Delete `public/favicon.ico`** — Removes the default Lovable logo that overrides the admin-uploaded favicon.

That's the only change needed. The `index.html` already has `<link rel="icon">` and `<link rel="apple-touch-icon">` pointing to the admin-uploaded image, and `DynamicFavicon.tsx` handles runtime updates.

