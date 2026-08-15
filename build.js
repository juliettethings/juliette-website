#!/usr/bin/env node
// Builds the deployable index.html from index.template.html + content/*.json.
//
// Why this exists: Juliette's site used to be one hand-edited static HTML file with the
// projects/blog data hardcoded in a <script> block. To let her edit content herself through
// the Decap CMS admin panel (admin/), that data now lives in individual JSON files under
// content/projects/ and content/blog/ instead — each one Decap CMS collection entry. This
// script is the glue: it reads those files, regenerates the `const projects = [...]` and
// `const blogEntries = [...]` blocks inside the HTML template (between BUILD:...:START/END
// marker comments), and also self-hosts the project images that still point at Behance's CDN
// (see downloadProjectImages below) so the live site never depends on Behance staying up.
//
// Runs automatically on every Netlify deploy via `npm run build` (see netlify.toml). Can also
// be run locally with `node build.js` to preview changes before pushing.

const fs = require("fs");
const path = require("path");
const https = require("https");

const ROOT = __dirname;
const CONTENT_PROJECTS_DIR = path.join(ROOT, "content", "projects");
const CONTENT_BLOG_DIR = path.join(ROOT, "content", "blog");
const IMAGES_PROJECTS_DIR = path.join(ROOT, "images", "projects");
const TEMPLATE_PATH = path.join(ROOT, "index.template.html");
const OUTPUT_PATH = path.join(ROOT, "index.html");

function readJsonDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
}

function jsStringLiteral(s) {
  return JSON.stringify(s == null ? "" : String(s));
}

function jsTagsArray(tags) {
  return "[" + (tags || []).map(jsStringLiteral).join(",") + "]";
}

// ---- self-hosting: download any project image that's still a remote (Behance) URL ----
// Local sandbox/CI environments without outbound internet access will just fail these fetches
// and fall back to the original remote URL (logged as a warning) — the site still builds and
// works, it just isn't fully self-hosted until it's built somewhere with real internet access
// (Netlify's build servers have it).
// 8s connect/response timeout — important for environments with no outbound internet access
// (like a sandboxed local build) where a plain https.get() would otherwise hang until the OS's
// own TCP timeout (minutes), making every image download stall the whole build one by one.
const DOWNLOAD_TIMEOUT_MS = process.env.BUILD_IMAGE_TIMEOUT_MS
  ? parseInt(process.env.BUILD_IMAGE_TIMEOUT_MS, 10)
  : 8000;
function download(url, timeoutMs = DOWNLOAD_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const req = https
      .get(
        url,
        { headers: { "User-Agent": "Mozilla/5.0 (compatible; JulietteSiteBuild/1.0)" }, timeout: timeoutMs },
        (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            download(res.headers.location, timeoutMs).then(resolve, reject);
            return;
          }
          if (res.statusCode !== 200) {
            reject(new Error("HTTP " + res.statusCode + " for " + url));
            return;
          }
          const chunks = [];
          res.on("data", (c) => chunks.push(c));
          res.on("end", () => resolve(Buffer.concat(chunks)));
          res.on("error", reject);
        }
      )
      .on("error", reject);
    req.on("timeout", () => {
      req.destroy(new Error("timed out after " + timeoutMs + "ms"));
    });
  });
}

function extFromUrl(url) {
  const m = url.split("?")[0].match(/\.([a-zA-Z0-9]+)$/);
  return m ? m[1].toLowerCase() : "jpg";
}

async function downloadProjectImages(projects) {
  fs.mkdirSync(IMAGES_PROJECTS_DIR, { recursive: true });
  let downloaded = 0,
    cached = 0,
    failed = 0;

  // flatten every image that needs work into one job list, then run a small concurrency pool
  // over it — 200+ images downloaded one at a time (each with its own connect+transfer time)
  // would make every build painfully slow; a handful of connections in parallel is far faster
  // and still gentle on Behance's CDN.
  const jobs = [];
  for (const project of projects) {
    const dir = path.join(IMAGES_PROJECTS_DIR, project.slug);
    fs.mkdirSync(dir, { recursive: true });
    project._localImages = new Array(project.images.length);

    project.images.forEach((src, i) => {
      if (!/^https?:\/\//.test(src)) {
        // already a local path (self-hosted in a previous build) — keep as-is
        project._localImages[i] = src;
        return;
      }
      const ext = extFromUrl(src);
      const filename = String(i + 1).padStart(2, "0") + "." + ext;
      const localPath = path.join(dir, filename);
      const relPath = "images/projects/" + project.slug + "/" + filename;

      if (fs.existsSync(localPath) && fs.statSync(localPath).size > 0) {
        cached++;
        project._localImages[i] = relPath;
        return;
      }
      jobs.push({ project, i, src, localPath, relPath });
    });
  }

  const CONCURRENCY = 12;
  let cursor = 0;
  async function worker() {
    while (cursor < jobs.length) {
      const job = jobs[cursor++];
      try {
        const buf = await download(job.src);
        fs.writeFileSync(job.localPath, buf);
        downloaded++;
        job.project._localImages[job.i] = job.relPath;
      } catch (err) {
        failed++;
        console.warn(
          "  [image download failed, keeping remote URL] " +
            job.project.slug +
            " #" +
            (job.i + 1) +
            ": " +
            err.message
        );
        job.project._localImages[job.i] = job.src; // graceful fallback — site still works either way
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, jobs.length) }, worker));

  for (const project of projects) {
    project.images = project._localImages;
    delete project._localImages;
  }

  console.log(
    `Project images: ${downloaded} downloaded, ${cached} already cached, ${failed} failed (fell back to remote URL).`
  );
}

function buildProjectsLiteral(projects) {
  const sorted = [...projects].sort((a, b) => (a.order || 0) - (b.order || 0));
  const entries = sorted.map((p) => {
    const imagesLiteral = "[\n        " + p.images.map(jsStringLiteral).join(",\n        ") + "\n      ]";
    return (
      `    { title: ${jsStringLiteral(p.title)}, slug: ${jsStringLiteral(p.slug)}, ` +
      `color: ${jsStringLiteral(p.color)}, textColor: ${jsStringLiteral(p.textColor)}, ` +
      `tags: ${jsTagsArray(p.tags)},\n      images: ${imagesLiteral} }`
    );
  });
  return "  const projects = [\n" + entries.join(",\n") + "\n  ];";
}

function buildBlogLiteral(posts) {
  const sorted = [...posts].sort((a, b) => (a.order || 0) - (b.order || 0));
  const entries = sorted.map((e) => {
    return (
      `    { id: ${jsStringLiteral(e.id)}, image: ${jsStringLiteral(e.image)}, ` +
      `caption: ${jsStringLiteral(e.caption)}, title: ${jsStringLiteral(e.title)}, ` +
      `date: ${jsStringLiteral(e.date)}, text: ${jsStringLiteral(e.text)}, ` +
      `color: ${jsStringLiteral(e.color)}, textColor: ${jsStringLiteral(e.textColor)} }`
    );
  });
  return "  const blogEntries = [\n" + entries.join(",\n") + "\n  ];";
}

function replaceBetweenMarkers(html, startMarker, endMarker, replacement) {
  const startIdx = html.indexOf(startMarker);
  const endIdx = html.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(`Markers not found or out of order: ${startMarker} / ${endMarker}`);
  }
  const before = html.slice(0, startIdx) + startMarker + "\n";
  const after = "\n  " + endMarker + html.slice(endIdx + endMarker.length);
  return before + replacement + after;
}

async function main() {
  console.log("Reading content files...");
  const projects = readJsonDir(CONTENT_PROJECTS_DIR);
  const blogPosts = readJsonDir(CONTENT_BLOG_DIR);
  console.log(`  ${projects.length} projects, ${blogPosts.length} blog posts`);

  console.log("Self-hosting project images (downloads any remaining Behance URLs)...");
  await downloadProjectImages(projects);

  console.log("Regenerating index.html from template...");
  let html = fs.readFileSync(TEMPLATE_PATH, "utf8");

  html = replaceBetweenMarkers(
    html,
    "// BUILD:PROJECTS:START",
    "// BUILD:PROJECTS:END",
    buildProjectsLiteral(projects)
  );
  html = replaceBetweenMarkers(html, "// BUILD:BLOG:START", "// BUILD:BLOG:END", buildBlogLiteral(blogPosts));

  fs.writeFileSync(OUTPUT_PATH, html);
  console.log("Wrote " + OUTPUT_PATH);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
