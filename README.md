# TaleVerse website
Static site (HTML/CSS/JS). All content lives in `content/*.json` and is edited through Pages CMS.

## Deploy
1. Create a GitHub repo and push this folder.
2. Cloudflare Pages → Create project → Connect to Git → select repo. Framework: None. Build command: empty. Output directory: `/`.
3. CMS: open https://app.pagescms.org, sign in with GitHub, pick the repo. `.pages.yml` configures Games, News and Site settings. Saving commits to GitHub and Cloudflare redeploys in about a minute.
4. Contact form: get a free access key at https://web3forms.com (enter the email that should receive messages), then paste it into Site settings → Web3Forms access key.

## Add content
- New game: CMS → Games → add entry (upload cover, fill fields).
- New article: CMS → News → add entry. Newest date shows first.
- Social links and text: CMS → Site settings.

## Later expansion
Add a new collection in `.pages.yml` plus a page that calls `load('name')` in `assets/app.js` (FAQ, diaries, trailers, extra languages).
