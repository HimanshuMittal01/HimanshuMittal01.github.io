# Design: Thumbnail Removal, Archive Easter Egg, Footer & Job-Post Update

Date: 2026-05-04
Status: Approved

## Goal

Several related changes to the hm-website (Eleventy static site):

1. Remove the stale footer copyright line.
2. Remove thumbnails from the post list; relocate effort-made images into post bodies (Medium-style lead image).
3. Add a hidden "easter egg" that reveals archived posts inline on the learnings page.
4. Add a new "Three Drivers of a Job" perspective section to the job-hunting post.

## Context

- Static site built with Eleventy. Posts live in `src/posts/`, listed by `src/learnings.html`.
- Posts use front matter: `title`, `summary`, `thumbnail`, `date`, optional `archived: true`.
- `learnings.html` currently skips archived posts via `{% unless post.data.archived %}` and renders a `.post-thumbnail` image per card.
- `_layouts/post.html` renders `<h1>{{ title }}</h1>` followed by `{{ content }}` — so a lead image at the top of a post body appears directly under the title.
- Footer is a shared partial (`_includes/partials/_footer.html`) rendered on every page.
- JS is inlined into `base.html` via `{% include "_includes/js/<file>.js" %}` (pattern: `theme-switch.js`).
- User preference (memory): no thumbnails in the post list — they are hard to maintain.

## A. Footer Copyright Removal

**File:** `src/_includes/partials/_footer.html`

Remove the entire `<p>&copy; Himanshu Mittal 2024. All rights reserved.</p>` line. Keep the social links. No copyright notice (it is automatic in law and adds only maintenance rot on a personal site).

## B. Remove Thumbnails From Post List

**Files:** `src/learnings.html`, `src/assets/css/postlist.css`

- Remove the `<!-- Post Thumbnail -->` `<div class="post-thumbnail">…<img class="thumbnail-image">…</div>` block from the post card markup.
- Post card becomes title (`<h2><a>`) + summary (`<p>`) only.
- Drop the `default-thumbnail.jpg` fallback usage (no longer referenced).
- In `postlist.css`, remove now-unused `.post-thumbnail` and `.thumbnail-image` rules; adjust `.post-card` layout so the text-only card still looks right (no leftover empty image column / flex gap).

## C. Slide Thumbnails Into Post Bodies (6 non-DSA posts)

For each post below: insert the image as the **first element of the post body** (immediately after the closing `---` of front matter), then **remove the `thumbnail:` front-matter line**. Image files remain in `src/assets/thumbnails/` (no file moves).

| Post | Image (absolute src) |
| --- | --- |
| `260207-mental-map-of-agi-safety.md` | `/assets/thumbnails/AI-brain-with-shield-and-connections.png` |
| `260117-brain-rot.md` | `/assets/thumbnails/brain-rot.png` |
| `240728-job-hunting-and-recruitment-a-balanced-perspective/280724-job-hunting-and-recruitment-a-balanced-perspective.md` | `/assets/thumbnails/job-hunting-and-recruitment-post-bg.webp` |
| `240202-face-recognition-for-attendance-management/240202-face-recognition-for-attendance-management.md` | `/assets/thumbnails/facerek-post-bg.png` |
| `240202-human-detection-and-tracking-in-surveillance-areas/240202-human-detection-and-tracking-in-surveillance-areas.md` | `/assets/thumbnails/belodt-post-bg.png` |
| `240202-custom-tensorrt-plugin/240202-custom-tensorrt-plugin.md` | `/assets/thumbnails/tensorrt-post-bg.jpg` |

Lead image markup (consistent with the existing inline-image style in the job post):

```html
<img src="<absolute-src>" alt="<post title>" />
```

## D. DSA Notes (6 posts) — Drop Thumbnail Only

For: `240218-dsa-notes-part-1.md`, `240219-dsa-notes-part-2/240219-dsa-notes-part-2.md`, `240211-dsa-notes-part-3.md`, `240224-dsa-notes-part-4.md`, `240303-dsa-notes-part-5.md`, `240309-dsa-notes-part-6.md`:

Remove the `thumbnail:` front-matter line only. **No lead image added.** Their thumbnail files in `src/assets/thumbnails/` become orphaned and are left as-is (not deleted in this change).

## E. Archive Easter Egg

**Trigger element — `src/_includes/partials/_footer.html`**

Add a small, near-invisible dot in the footer (≈10px, very low opacity, e.g. `class="archive-dot"`). It exists on every page (shared partial) but its click handler only acts on `/learnings/`.

**Reveal script — new `src/_includes/js/archive-egg.js`, included in `base.html`**

- Include via `{% include "_includes/js/archive-egg.js" %}` inside the existing `<script>` block in `base.html` (same pattern as `theme-switch.js`).
- On dot click: if `window.location.pathname` is the learnings path (`/learnings/`, tolerate trailing-slash variants), reveal archived posts; otherwise no-op.
- One-way reveal, session-only: clicking again does nothing; a page reload resets to hidden. No `localStorage`.
- Reveal = remove the `archived-hidden` class (or set `display`) on all `.post-card.archived-hidden` elements.

**Post list rendering — `src/learnings.html`**

- Render **all** posts (remove the `{% unless post.data.archived %}` filter).
- Archived posts' cards get an extra class: `class="post-card archived-hidden"`.
- CSS `.archived-hidden { display: none; }` in `postlist.css`.
- Archived cards include a small corner icon `<i class="fas fa-box-archive">` (muted color), positioned absolute top-right of the card. **Active posts get no icon.**

**Note on visibility:** archived post markup ships in the HTML to all visitors (hidden via CSS). Acceptable — the content is not secret, just hidden behind a playful interaction. No `noindex` handling required.

## F. Job Post — "Three Drivers of a Job" Section

**File:** `src/posts/240728-job-hunting-and-recruitment-a-balanced-perspective/280724-job-hunting-and-recruitment-a-balanced-perspective.md`

Insert a new section **after** `## Why Third Parties Cannot Solve This Problem` and **before** `## Practical Advice for Candidates and Recruiters`:

```markdown
## The Three Drivers of a Job

Before transparency can mean anything, a candidate has to know what they
are being transparent about. Most jobs reward you along three axes: money
and status; skills and experience; and desire, motivation, and impact. Few
roles maximize all three at once — each job strikes a particular balance,
and so does each person evaluating it.

Optimizing for money alone is common, and at certain points in life it is
the right call. But the optimal balance is not fixed; it shifts with the
phase of life you are in. Early on, skills and experience may compound into
everything else. Later, impact and motivation may outweigh another
increment of pay. A match that ignores which axis a candidate is actually
optimizing for, right now, tends to unravel later — regardless of how
transparent the process was. Knowing your own balance is what makes honest
communication possible in the first place.
```

(Exact wording may be lightly polished during implementation; intent and structure as above.)

## G. Memory Update

Revise the existing no-thumbnails feedback memory to capture the nuance: no thumbnails in the **post list**, but a lead image **inside a post body** is fine (co-located in the post's own folder).

## H. Post URL & Folder Restructure (added mid-execution)

The current post URLs are malformed: date-prefixed and, for the job post, doubly nested (`/posts/240728-…/280724-…/`). The structure is inconsistent (some posts are flat `.md`, some are folders). Goal: clean, consistent URLs and structure.

**H1. Permalink scheme.** Add to `src/posts/posts.json`:

```json
"permalink": "/learnings/{{ page.fileSlug }}/"
```

Every post then serves at `/learnings/<fileSlug>/`. `fileSlug` is the post file's basename without extension, which (after H2) equals the chosen clean slug. No date prefix, no nesting, no slugify-library dependence. `learnings.html` uses `{{ post.url }}` so the list links auto-follow.

**H2. Folder-per-post.** Every post becomes `src/posts/<slug>/<slug>.md` using `git mv`. Chosen slugs:

| Old path | New `src/posts/<slug>/<slug>.md` |
| --- | --- |
| 260117-brain-rot.md | brain-rot |
| 260207-mental-map-of-agi-safety.md | a-mental-map-of-ai-safety |
| 240218-dsa-notes-part-1.md | dsa-interview-notes-array-part-1 |
| 240219-dsa-notes-part-2/240219-dsa-notes-part-2.md | dsa-interview-notes-linked-list-part-2 |
| 240211-dsa-notes-part-3.md | dsa-interview-notes-binary-tree-part-3 |
| 240224-dsa-notes-part-4.md | dsa-interview-notes-matrix-part-4 |
| 240303-dsa-notes-part-5.md | dsa-interview-notes-string-part-5 |
| 240309-dsa-notes-part-6.md | dsa-interview-notes-stack-and-queue-part-6 |
| 240202-custom-tensorrt-plugin/… | custom-tensorrt-plugin |
| 240202-face-recognition-for-attendance-management/… | face-recognition-for-attendance-management |
| 240202-human-detection-and-tracking-in-surveillance-areas/… | human-detection-and-tracking-in-surveillance-areas |
| 240728-job-hunting…/280724-job-hunting….md | job-hunting-and-recruitment-a-balanced-perspective |

Existing folder posts: keep any co-located body images, moving them into the renamed folder; relative `./img` refs are unaffected (same-folder).

**H3. Co-locate lead images + delete thumbnails dir.** The 6 lead images added in section C currently use absolute `/assets/thumbnails/…`. Move each image file into its post's new folder and rewrite the lead `<img>` to a relative `./<filename>` reference. Then delete the entire `src/assets/thumbnails/` directory and the now-orphaned `src/assets/images/default-thumbnail.jpg`. The `eleventyImageTransformPlugin` resolves `<img>` relative to the input file and copies optimized output (proven by the job post's existing `./Concurrent…png`), so no passthrough config change is needed.

Lead image moves:

| Post slug | Image file moved into folder | New ref |
| --- | --- | --- |
| a-mental-map-of-ai-safety | AI-brain-with-shield-and-connections.png | `./AI-brain-with-shield-and-connections.png` |
| brain-rot | brain-rot.png | `./brain-rot.png` |
| job-hunting-and-recruitment-a-balanced-perspective | job-hunting-and-recruitment-post-bg.webp | `./job-hunting-and-recruitment-post-bg.webp` |
| face-recognition-for-attendance-management | facerek-post-bg.png | `./facerek-post-bg.png` |
| human-detection-and-tracking-in-surveillance-areas | belodt-post-bg.png | `./belodt-post-bg.png` |
| custom-tensorrt-plugin | tensorrt-post-bg.jpg | `./tensorrt-post-bg.jpg` |

## Out of Scope

- Persisting the easter-egg reveal across reloads/visits.
- Any `/archive/` standalone page.
- Active-post status icons.
- Dynamic copyright year (line removed instead).
- Redirects from old `/posts/…` URLs (posts are archived/hidden; acceptable per user).

## Testing / Verification

- `npx @11ty/eleventy` (or project build) succeeds with no template errors.
- `/learnings/` shows only non-archived posts as text-only cards (no images, no broken layout).
- Clicking the footer dot on `/learnings/` reveals archived cards, each with the archive corner icon; clicking the dot on another page does nothing.
- Reload of `/learnings/` hides archived posts again.
- The 6 non-DSA posts render their lead image directly under the title.
- DSA posts render with no image and no broken `thumbnail` reference.
- Job post shows the new section in the correct position.
- Every post serves at `/learnings/<slug>/` (no date prefix, no nesting); `/learnings/` list links resolve to these URLs.
- `src/assets/thumbnails/` no longer exists; no template/post references it; lead images load (optimized by the image plugin) from each post's own folder.
- All 12 posts live as `src/posts/<slug>/<slug>.md`.
