# Deploying this site

Everything in this folder is ready to go live. Here's what's already built, and the handful of steps left that only you can do (they need your own GitHub/Netlify accounts).

## What's already done

- The whole site is in this folder — `index.template.html` (the real source you'd hand-edit if you ever needed to) plus `build.js`, which regenerates the final `index.html` automatically from the content files under `content/projects/` and `content/blog/`.
- All 12 Design/Illustration projects and all 8 blog posts have been pulled into `content/*.json` — one file per project/post, editable through a CMS instead of by hand.
- A content editor (Decap CMS) is wired up under `admin/` — once deployed, you'll be able to go to `yoursite.netlify.app/admin`, log in, and edit project titles, colors, tags, and images, or add new projects/posts, without touching code.
- The Contact form is wired to actually deliver messages (via Netlify Forms) instead of just showing a placeholder message.
- The build script tries to download and self-host all your project images (currently pulled live from Behance) so the site doesn't depend on Behance staying up. This step can't run inside this sandbox (no outbound internet access here), but it's designed to run automatically on Netlify's own servers the first time the site builds there — see the note under Step 3.
- All the recent fixes (mobile blog opening straight to List view, the CONTACT hover color-lag bug, the 2-column mobile grid) are included.

## What's left — your steps

### 1. Put this folder in a GitHub repo

You'll need a free GitHub account if you don't already have one.

1. Create a new **empty** repository on GitHub (no README/gitignore — this folder already has one).
2. From this folder, push it up:
   ```
   git remote add origin <your-repo-url>
   git add -A
   git commit -m "Initial site"
   git push -u origin main
   ```
   (I've already run `git init` in this folder, so it's ready for the remote + first commit.)

### 2. Connect it to Netlify

1. Sign up / log in at netlify.com (free tier is plenty for this site).
2. "Add new site" → "Import an existing project" → connect your GitHub account → pick this repo.
3. Build settings should auto-detect from `netlify.toml` (build command `npm run build`, publish directory `.`) — just confirm and deploy.
4. Once it finishes, Netlify gives you a live URL like `random-name-123.netlify.app`. You can rename this (Site settings → Site details → Change site name) or connect a custom domain you own (Site settings → Domain management) whenever you're ready.

### 3. About the project images

The first real deploy on Netlify (not this sandbox) will attempt to download and self-host all 209 project images pulled from Behance. Netlify's build servers have normal internet access, so this should just work — but I haven't been able to verify it end-to-end myself, since my environment can't reach Behance at all to test it. After your first deploy:

- Check the deploy log (Netlify dashboard → Deploys → click the latest one) for a line like `Project images: 209 downloaded, 0 already cached, 0 failed`.
- If instead you see failures there, the site will still work fine — it just falls back to loading images directly from Behance's CDN for whichever ones failed, same as it does today. Let me know and I can dig into it further with the actual error messages from that log.

### 4. Turn on the content editor (Decap CMS)

The `admin/` folder is already built, but it needs your login system turned on:

1. In the Netlify dashboard for this site: **Site configuration → Identity → Enable Identity**.
2. Under Identity settings, set registration to **Invite only** (so random people can't sign up).
3. Still under Identity: **Services → Git Gateway → Enable Git Gateway**. This is what lets the CMS save your edits back to GitHub without you needing your own GitHub token.
4. Invite yourself: Identity tab → **Invite users** → enter your email → you'll get an email with a link to set a password.
5. After that, go to `yoursite.netlify.app/admin`, log in, and you'll see "Projects" and "Blog" collections you can edit directly — no code required. Every save there becomes a commit + a fresh deploy automatically.

### 5. Get Contact form submissions into your inbox

Netlify auto-detects the form on first deploy — no config needed for it to start collecting submissions. To actually get notified:

1. Site configuration → Forms → Form notifications → **Add notification** → "Email notification".
2. Enter `juliettething@gmail.com` (or whichever address you want) → Save.

Submissions also always show up in the Netlify dashboard under **Forms**, even without email notifications turned on.

## If anything looks wrong after deploying

Send me a screenshot or describe what you're seeing and I can take a look — most things (styling, content, bugs) can still be fixed by editing files here and having you re-run the same push/deploy step, or eventually just through the `/admin` editor once it's set up.
