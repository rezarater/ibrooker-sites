# ibrooker-sites
Static sites for https://ibrooker.com (com/) and https://ir.ibrooker.com (ir/).
The host pulls this repository every 10 minutes and copies com/ and ir/ into place.

## Search-engine notification (IndexNow)
`com/8d5ce3a11e43c4fef38ea4c43bdc5710.txt` and `ir/8d5ce3a11e43c4fef38ea4c43bdc5710.txt` hold the IndexNow key (Bing, Yandex, Naver, Seznam, Yep).
Keep them in place. After a page changes, POST its URL to https://api.indexnow.org/indexnow
with `{"host": "...", "key": "8d5ce3a11e43c4fef38ea4c43bdc5710", "keyLocation": "https://<host>/8d5ce3a11e43c4fef38ea4c43bdc5710.txt", "urlList": [...]}`.
Google does not use IndexNow; it needs Search Console.

## Caching (.htaccess)
HTML is served `no-cache` so edits are visible at once. CSS and JS are cached for 7 days,
like fonts and images. Whenever `assets/style.css` or `assets/story.js` changes,
bump the `?v=` number in that site's `index.html` (when merging a branch, use a number
higher than the one on main), or returning visitors keep the old file for up to a week.
