# ibrooker-sites
Static sites for https://ibrooker.com (com/) and https://ir.ibrooker.com (ir/).
The host pulls this repository every 10 minutes and copies com/ and ir/ into place.

## Search-engine notification (IndexNow)
`com/8d5ce3a11e43c4fef38ea4c43bdc5710.txt` and `ir/8d5ce3a11e43c4fef38ea4c43bdc5710.txt` hold the IndexNow key (Bing, Yandex, Naver, Seznam, Yep).
Keep them in place. After a page changes, POST its URL to https://api.indexnow.org/indexnow
with `{"host": "...", "key": "8d5ce3a11e43c4fef38ea4c43bdc5710", "keyLocation": "https://<host>/8d5ce3a11e43c4fef38ea4c43bdc5710.txt", "urlList": [...]}`.
Google does not use IndexNow; it needs Search Console.

## Caching (.htaccess)
HTML is served `no-cache` so edits are visible at once. CSS and JS are cached for 7 days.
Fonts (`.woff2`) are cached 1 year as `immutable`: never edit a font in place; save a changed
font under a new file name and update the preload link and `@font-face`. Images and icons are
cached 30 days; replace an image under a new name (or add `?v=`) if it must change at once. Whenever `assets/style.css` or `assets/story.js` changes,
bump the `?v=` number in that site's `index.html` (when merging a branch, use a number
higher than the one on main), or returning visitors keep the old file for up to a week.

## Canonical host (.htaccess)
Both sites answer only on `https://` without `www.`. Requests to `http://` or `www.` get one
301 to the same path on the canonical host (rules are host-scoped; `/.well-known/` is exempt
so SSL renewal keeps working). Keep canonical, hreflang, sitemap and og:url on these hosts.

## Error page (.htaccess)
`404.html` in each site is served for unknown URLs via `ErrorDocument 404 /404.html`.
The status stays 404 and the page carries `noindex`; it uses absolute paths (`/assets/...`)
so it renders correctly at any depth. Keep it out of sitemap.xml.

## Security headers (.htaccess)
Both sites send `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
`X-Frame-Options: SAMEORIGIN`, `Content-Security-Policy: frame-ancestors 'self'` and a
`Permissions-Policy` that switches off camera, microphone, geolocation, payment and USB.
The CSP is limited to `frame-ancestors` on purpose (inline JSON-LD and inline script are in use).
If a third-party embed or script is ever added, check it still works with these headers.
HSTS is not set yet; add it with a short max-age first, then raise it.
