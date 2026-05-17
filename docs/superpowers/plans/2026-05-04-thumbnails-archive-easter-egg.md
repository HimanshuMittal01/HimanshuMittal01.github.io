# Thumbnail Removal, Archive Easter Egg, Footer & Job-Post Update — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove post-list thumbnails (relocating effort-made images into post bodies), remove the stale footer copyright, add a hidden easter egg that reveals archived posts on the learnings page, and add a new perspective section to the job-hunting post.

**Architecture:** Eleventy static site. Changes are template/markdown/CSS/JS edits — no build tooling changes. There is no JS/unit test framework, so verification is: run the Eleventy build (`npm run build`) and assert on the generated `_site/` HTML with `grep`, plus the documented manual checks.

**Tech Stack:** Eleventy 3 (Liquid templates), vanilla CSS, vanilla inlined JS, Font Awesome 6 (already loaded in `base.html`).

Spec: `docs/superpowers/specs/2026-05-04-thumbnails-archive-easter-egg-design.md`

---

## File Structure

- `src/_includes/partials/_footer.html` — remove copyright line; add hidden easter-egg dot.
- `src/learnings.html` — render all posts (no archived filter), text-only cards, archived cards get hide class + corner icon.
- `src/assets/css/postlist.css` — remove thumbnail rules; add `.archived-hidden`, `.archive-corner-icon`, `.archive-dot` rules; fix text-only card layout.
- `src/_includes/js/archive-egg.js` — NEW: dot click → reveal archived posts on `/learnings/` only, one-way, session-only.
- `src/_layouts/base.html` — include `archive-egg.js` alongside `theme-switch.js`.
- 6 non-DSA post `.md` files — remove `thumbnail:` front matter, add lead `<img>` at top of body.
- 6 DSA-notes post `.md` files — remove `thumbnail:` front matter only.
- Job post `.md` — add `## The Three Drivers of a Job` section.
- `~/.claude/projects/-Users-himan-Documents-projects-hm-website/memory/feedback_no_thumbnails.md` + `MEMORY.md` — update nuance.

Work happens on branch `feature/thumbnails-archive-egg` (already created; spec already committed there).

---

## Task 1: Remove footer copyright line

**Files:**
- Modify: `src/_includes/partials/_footer.html`

- [ ] **Step 1: Establish baseline build**

Run: `npm run build`
Expected: completes without error; `_site/` regenerated.

- [ ] **Step 2: Remove the copyright paragraph**

In `src/_includes/partials/_footer.html`, delete this exact line (and its leading indentation):

```html
        <p>&copy; Himanshu Mittal 2024. All rights reserved.</p>
```

Leave the surrounding `<footer>`, `.footer-content`, and `.footer-social-links` markup intact.

- [ ] **Step 3: Build and verify removal**

Run: `npm run build && grep -rc "All rights reserved" _site || echo "ABSENT"`
Expected: prints `ABSENT` (string no longer in any generated page).

- [ ] **Step 4: Commit**

```bash
git add src/_includes/partials/_footer.html
git commit -m "chore: remove stale footer copyright line"
```

---

## Task 2: Add "The Three Drivers of a Job" section to job post

**Files:**
- Modify: `src/posts/240728-job-hunting-and-recruitment-a-balanced-perspective/280724-job-hunting-and-recruitment-a-balanced-perspective.md`

- [ ] **Step 1: Insert the new section**

In the job post, find the line `## Why Third Parties Cannot Solve This Problem` and its paragraph (ends `…must come directly from the involved parties.`). Immediately after that paragraph and the following blank line, and BEFORE `## Practical Advice for Candidates and Recruiters`, insert:

```markdown
## The Three Drivers of a Job

Before transparency can mean anything, a candidate has to know what they are being transparent about. Most jobs reward you along three axes: money and status; skills and experience; and desire, motivation, and impact. Few roles maximize all three at once—each job strikes a particular balance, and so does each person evaluating it.

Optimizing for money alone is common, and at certain points in life it is the right call. But the optimal balance is not fixed; it shifts with the phase of life you are in. Early on, skills and experience may compound into everything else. Later, impact and motivation may outweigh another increment of pay. A match that ignores which axis a candidate is actually optimizing for, right now, tends to unravel later—regardless of how transparent the process was. Knowing your own balance is what makes honest communication possible in the first place.

```

(Keep one blank line before `## Practical Advice…`.)

- [ ] **Step 2: Build and verify section present and ordered**

Run: `npm run build && grep -n "The Three Drivers of a Job" "_site/posts/240728-job-hunting-and-recruitment-a-balanced-perspective/280724-job-hunting-and-recruitment-a-balanced-perspective/index.html"`

If the generated path differs, locate it: `find _site -path "*job-hunting*" -name "index.html"`.
Expected: the heading appears, and appears before "Practical Advice for Candidates" in the same file (verify: `grep -n "Three Drivers\|Practical Advice for Candidates" <file>` shows Three Drivers first).

- [ ] **Step 3: Commit**

```bash
git add "src/posts/240728-job-hunting-and-recruitment-a-balanced-perspective/280724-job-hunting-and-recruitment-a-balanced-perspective.md"
git commit -m "content: add 'Three Drivers of a Job' perspective to job-hunting post"
```

---

## Task 3: Drop thumbnail front matter from DSA-notes posts

**Files (modify — remove only the `thumbnail:` line from each):**
- `src/posts/240218-dsa-notes-part-1.md`
- `src/posts/240219-dsa-notes-part-2/240219-dsa-notes-part-2.md`
- `src/posts/240211-dsa-notes-part-3.md`
- `src/posts/240224-dsa-notes-part-4.md`
- `src/posts/240303-dsa-notes-part-5.md`
- `src/posts/240309-dsa-notes-part-6.md`

- [ ] **Step 1: Remove the thumbnail front-matter line in each file**

In each file above, delete the single front-matter line that begins with `thumbnail:` (it is between the `summary:` line and the next front-matter line or closing `---`). Do not add any image. Do not touch any other front-matter key or body content.

- [ ] **Step 2: Verify no thumbnail keys remain in DSA posts**

Run: `grep -rl "^thumbnail:" src/posts/*dsa-notes* src/posts/240219-dsa-notes-part-2/ 2>/dev/null || echo "CLEAN"`
Expected: prints `CLEAN` (no DSA post still has a `thumbnail:` key).

- [ ] **Step 3: Build sanity check**

Run: `npm run build`
Expected: completes without error.

- [ ] **Step 4: Commit**

```bash
git add src/posts/240218-dsa-notes-part-1.md src/posts/240219-dsa-notes-part-2/240219-dsa-notes-part-2.md src/posts/240211-dsa-notes-part-3.md src/posts/240224-dsa-notes-part-4.md src/posts/240303-dsa-notes-part-5.md src/posts/240309-dsa-notes-part-6.md
git commit -m "chore: drop thumbnail front matter from DSA-notes posts"
```

---

## Task 4: Slide thumbnails into the 6 non-DSA post bodies

For each post: (a) remove the `thumbnail:` front-matter line, (b) insert a lead `<img>` as the FIRST line of the body (immediately after the closing `---`, followed by a blank line, then the existing first paragraph). Use the existing inline-image style from the job post (`<img src="..." alt="..." />`).

**Files & images:**

| File | Image src | alt |
| --- | --- | --- |
| `src/posts/260207-mental-map-of-agi-safety.md` | `/assets/thumbnails/AI-brain-with-shield-and-connections.png` | `A Mental Map of AI Safety` |
| `src/posts/260117-brain-rot.md` | `/assets/thumbnails/brain-rot.png` | `Brain Rot` |
| `src/posts/240728-job-hunting-and-recruitment-a-balanced-perspective/280724-job-hunting-and-recruitment-a-balanced-perspective.md` | `/assets/thumbnails/job-hunting-and-recruitment-post-bg.webp` | `Job Hunting and Recruitment - A Balanced Perspective` |
| `src/posts/240202-face-recognition-for-attendance-management/240202-face-recognition-for-attendance-management.md` | `/assets/thumbnails/facerek-post-bg.png` | `Face Recognition for Attendance Management` |
| `src/posts/240202-human-detection-and-tracking-in-surveillance-areas/240202-human-detection-and-tracking-in-surveillance-areas.md` | `/assets/thumbnails/belodt-post-bg.png` | `Human Detection and Tracking in Surveillance Areas` |
| `src/posts/240202-custom-tensorrt-plugin/240202-custom-tensorrt-plugin.md` | `/assets/thumbnails/tensorrt-post-bg.jpg` | `Custom TensorRT Plugin` |

- [ ] **Step 1: Edit each of the 6 files**

For each file: delete the front-matter line starting with `thumbnail:`. Then, immediately after the front-matter closing `---` line, insert a blank line, the image tag, a blank line, then the original body. The top of each body becomes:

```markdown
---

<img src="<IMAGE-SRC-FROM-TABLE>" alt="<ALT-FROM-TABLE>" />

<original first paragraph continues here>
```

Use the exact `src` and `alt` from the table row for that file. Use the alt text exactly (it equals the post's `title` value; if a file's `title` differs from the table, use the file's actual `title`).

- [ ] **Step 2: Verify thumbnail keys gone and lead image present**

Run:
```bash
grep -rl "^thumbnail:" src/posts/260207-mental-map-of-agi-safety.md src/posts/260117-brain-rot.md "src/posts/240728-job-hunting-and-recruitment-a-balanced-perspective/280724-job-hunting-and-recruitment-a-balanced-perspective.md" src/posts/240202-face-recognition-for-attendance-management/240202-face-recognition-for-attendance-management.md src/posts/240202-human-detection-and-tracking-in-surveillance-areas/240202-human-detection-and-tracking-in-surveillance-areas.md src/posts/240202-custom-tensorrt-plugin/240202-custom-tensorrt-plugin.md 2>/dev/null || echo "NO-THUMB-KEYS"
```
Expected: prints `NO-THUMB-KEYS`.

- [ ] **Step 3: Build and verify images render in post bodies**

Run: `npm run build && grep -rl "AI-brain-with-shield-and-connections.png\|brain-rot.png\|job-hunting-and-recruitment-post-bg.webp\|facerek-post-bg.png\|belodt-post-bg.png\|tensorrt-post-bg.jpg" _site/posts`
Expected: lists the 6 generated post `index.html` files (image now in body output). Spot-check one: `find _site -path "*brain-rot*" -name index.html -exec grep -n "brain-rot.png" {} \;` shows the `<img>` near the top, after the `<h1>`.

- [ ] **Step 4: Commit**

```bash
git add src/posts/260207-mental-map-of-agi-safety.md src/posts/260117-brain-rot.md "src/posts/240728-job-hunting-and-recruitment-a-balanced-perspective/280724-job-hunting-and-recruitment-a-balanced-perspective.md" src/posts/240202-face-recognition-for-attendance-management/240202-face-recognition-for-attendance-management.md src/posts/240202-human-detection-and-tracking-in-surveillance-areas/240202-human-detection-and-tracking-in-surveillance-areas.md src/posts/240202-custom-tensorrt-plugin/240202-custom-tensorrt-plugin.md
git commit -m "content: move post thumbnails into body as lead images"
```

---

## Task 5: Learnings list — text-only cards, render all posts, archived hidden + corner icon

**Files:**
- Modify: `src/learnings.html`
- Modify: `src/assets/css/postlist.css`

- [ ] **Step 1: Rewrite the post-list loop in `src/learnings.html`**

Replace the entire `<div class="post-list"> … </div>` block with:

```html
<div class="post-list">
    {% for post in collections.post %}
        <div class="post-card{% if post.data.archived %} archived-hidden{% endif %}">
            {% if post.data.archived %}<i class="fas fa-box-archive archive-corner-icon" aria-hidden="true"></i>{% endif %}
            <!-- Post Details (Title and Description) -->
            <div class="post-details">
                <h2><a href="{{ post.url }}">{{ post.data.title }}</a></h2>
                <p>{{ post.data.summary }}</p>
            </div>
        </div>
    {% endfor %}
</div>
```

(Removes the `{% unless post.data.archived %}` filter and the `.post-thumbnail` image block; adds the hide class + corner icon for archived posts only.)

- [ ] **Step 2: Update `src/assets/css/postlist.css`**

Delete the `.post-thumbnail` rule (lines defining `.post-thumbnail`) and the `.thumbnail-image` rule. In the `@media (max-width: 768px)` block, delete the `.post-thumbnail { width: 100%; height: 200px; }` rule. Then append these rules at the end of the file:

```css
/* Archived posts hidden until easter egg is triggered */
.post-card.archived-hidden {
    display: none;
}

/* Card needs positioning context for the corner icon */
.post-card {
    position: relative;
}

/* Archived corner marker */
.archive-corner-icon {
    position: absolute;
    top: 0.6rem;
    right: 0.75rem;
    font-size: 0.85rem;
    color: var(--text-color);
    opacity: 0.35;
}

/* Hidden easter-egg dot in the footer */
.archive-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    margin-left: 6px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.06;
    cursor: default;
    vertical-align: middle;
}
```

(`.post-card` already exists earlier in the file with `display:flex`; this appended block only adds `position: relative` — that is intentional and valid, it augments the existing rule. Do not remove the original `.post-card` flex rule.)

- [ ] **Step 3: Build and verify rendering**

Run: `npm run build`
Then:
```bash
find _site -path "*learnings*" -name index.html
```
Let `<L>` be that file. Verify:
- `grep -c "post-card" "<L>"` → equals total number of posts (active + archived), i.e. all posts now rendered.
- `grep -c "archived-hidden" "<L>"` → equals number of archived posts (should be all currently-archived posts; expect a positive number).
- `grep -c "thumbnail-image" "<L>"` → `0` (no thumbnails in list).
- `grep -c "fa-box-archive" "<L>"` → equals number of archived posts.

- [ ] **Step 4: Commit**

```bash
git add src/learnings.html src/assets/css/postlist.css
git commit -m "feat: text-only learnings list; render archived posts hidden with corner icon"
```

---

## Task 6: Easter-egg dot + reveal script

**Files:**
- Create: `src/_includes/js/archive-egg.js`
- Modify: `src/_includes/partials/_footer.html`
- Modify: `src/_layouts/base.html`

- [ ] **Step 1: Create the reveal script**

Create `src/_includes/js/archive-egg.js` with exactly:

```javascript
(function () {
  function onLearnings() {
    var p = window.location.pathname.replace(/\/+$/, "");
    return p === "/learnings" || p.endsWith("/learnings");
  }
  document.addEventListener("DOMContentLoaded", function () {
    var dot = document.querySelector(".archive-dot");
    if (!dot) return;
    dot.addEventListener("click", function () {
      if (!onLearnings()) return;
      var hidden = document.querySelectorAll(".post-card.archived-hidden");
      for (var i = 0; i < hidden.length; i++) {
        hidden[i].classList.remove("archived-hidden");
      }
    });
  });
})();
```

(One-way: removes the class so cards show; no re-hide. Session-only: nothing persisted, reload restores the server-rendered `archived-hidden` class.)

- [ ] **Step 2: Add the hidden dot to the footer**

In `src/_includes/partials/_footer.html`, inside `<div class="footer-content">`, after the `<div class="footer-social-links"> … </div>` block and before the closing `</div>` of `.footer-content`, add:

```html
        <span class="archive-dot" aria-hidden="true"></span>
```

- [ ] **Step 3: Include the script in base layout**

In `src/_layouts/base.html`, in the `<script type="text/javascript">` block, add the new include on the line after the existing `theme-switch.js` include so the block reads:

```html
	<script type="text/javascript">

		{% include "_includes/js/theme-switch.js" %}

		{% include "_includes/js/archive-egg.js" %}

	</script>
```

- [ ] **Step 4: Build and verify wiring**

Run: `npm run build`
Then, with `<L>` = the learnings `index.html` (from `find _site -path "*learnings*" -name index.html`):
- `grep -c "archive-dot" "<L>"` → `1` (dot present in footer).
- `grep -c "DOMContentLoaded" "<L>"` → `>=1` and `grep -c "archived-hidden\")" "<L>"` shows the script body inlined (script was included into the page).
- Pick a non-learnings page, e.g. `_site/index.html`: `grep -c "archive-dot" _site/index.html` → `1` (dot present site-wide) and the script is inlined there too (handler will no-op off `/learnings/`).

- [ ] **Step 5: Manual check (record result in commit/PR notes)**

Serve locally: `npm run start`, open `/learnings/`. Confirm: archived posts hidden on load; clicking the (near-invisible) footer dot reveals them with the archive corner icon; reload hides them again; clicking the dot on the home page does nothing. Stop the server when done.

- [ ] **Step 6: Commit**

```bash
git add src/_includes/js/archive-egg.js src/_includes/partials/_footer.html src/_layouts/base.html
git commit -m "feat: hidden footer dot reveals archived posts on learnings page"
```

---

## Task 7: Update no-thumbnails memory with the new nuance

**Files:**
- Modify: `/Users/himan/.claude/projects/-Users-himan-Documents-projects-hm-website/memory/feedback_no_thumbnails.md`
- Modify: `/Users/himan/.claude/projects/-Users-himan-Documents-projects-hm-website/memory/MEMORY.md`

- [ ] **Step 1: Rewrite the memory body**

Set the body of `feedback_no_thumbnails.md` (keep the existing front matter; update `description` to match) to:

```markdown
Do not use thumbnail images in the post LIST on hm-website (learnings page is text-only: title + summary). A lead image at the TOP of an individual post body (Medium-style) is fine and encouraged for posts where the author made an effort image.

**Why:** Maintaining a thumbnail per post in the list view is a recurring upkeep burden as the site grows; the author would rather not maintain them there. The images themselves still have value inside the post.

**How to apply:** New post list/section markup: no thumbnail/cover field, no default-thumbnail fallback. When a post has an effort-made image, place it as the first element of the post body, not in the list card.
```

Update the front-matter `description:` line to: `description: hm-website: no thumbnails in the post list (text-only); lead image inside a post body is fine`.

- [ ] **Step 2: Update the MEMORY.md pointer**

In `MEMORY.md`, replace the existing `feedback_no_thumbnails.md` line with:

```markdown
- [No thumbnails on hm-website](feedback_no_thumbnails.md) — no thumbnails in the post list (text-only); a lead image inside a post body is fine
```

- [ ] **Step 3: Verify (no commit — outside the repo)**

Run: `grep -n "lead image" /Users/himan/.claude/projects/-Users-himan-Documents-projects-hm-website/memory/feedback_no_thumbnails.md /Users/himan/.claude/projects/-Users-himan-Documents-projects-hm-website/memory/MEMORY.md`
Expected: both files match. (These are outside the git repo; do not `git add` them.)

---

## Task 9: Permalink scheme — clean `/learnings/<slug>/` URLs

**Files:**
- Modify: `src/posts/posts.json`

- [ ] **Step 1: Add the permalink rule**

`src/posts/posts.json` is currently:
```json
{
    "layout": "post.html",
    "tags": "post"
}
```
Change it to exactly:
```json
{
    "layout": "post.html",
    "tags": "post",
    "permalink": "/learnings/{{ page.fileSlug }}/"
}
```

- [ ] **Step 2: Build and check URLs (pre-restructure)**

Run: `rm -rf _site && npm run build`
Then: `find _site/learnings -name index.html | sed 's#_site##;s#index.html##' | sort`
Expected: post pages now appear under `/learnings/...` (slug still date-prefixed until Task 10 renames files — that's fine here; this step only proves the permalink rule applies). The list page `/learnings/` itself still builds.

- [ ] **Step 3: Commit**

```bash
git add src/posts/posts.json
git commit -m "feat: serve posts at clean /learnings/<slug>/ urls"
```

---

## Task 10: Restructure all posts into `src/posts/<slug>/<slug>.md` + co-locate lead images

**Files:** `git mv` of all 12 posts; move 6 image files; edit 6 lead-image refs.

Slug + image mapping (authoritative):

| Current path | New `src/posts/<slug>/<slug>.md` | Lead image to move into new folder → new ref |
| --- | --- | --- |
| `src/posts/260117-brain-rot.md` | `brain-rot` | `src/assets/thumbnails/brain-rot.png` → `./brain-rot.png` |
| `src/posts/260207-mental-map-of-agi-safety.md` | `a-mental-map-of-ai-safety` | `src/assets/thumbnails/AI-brain-with-shield-and-connections.png` → `./AI-brain-with-shield-and-connections.png` |
| `src/posts/240218-dsa-notes-part-1.md` | `dsa-interview-notes-array-part-1` | (none) |
| `src/posts/240219-dsa-notes-part-2/240219-dsa-notes-part-2.md` | `dsa-interview-notes-linked-list-part-2` | (none — but move any existing co-located assets in that folder) |
| `src/posts/240211-dsa-notes-part-3.md` | `dsa-interview-notes-binary-tree-part-3` | (none) |
| `src/posts/240224-dsa-notes-part-4.md` | `dsa-interview-notes-matrix-part-4` | (none) |
| `src/posts/240303-dsa-notes-part-5.md` | `dsa-interview-notes-string-part-5` | (none) |
| `src/posts/240309-dsa-notes-part-6.md` | `dsa-interview-notes-stack-and-queue-part-6` | (none) |
| `src/posts/240202-custom-tensorrt-plugin/240202-custom-tensorrt-plugin.md` | `custom-tensorrt-plugin` | `src/assets/thumbnails/tensorrt-post-bg.jpg` → `./tensorrt-post-bg.jpg` (also move any existing body images in the old folder) |
| `src/posts/240202-face-recognition-for-attendance-management/240202-face-recognition-for-attendance-management.md` | `face-recognition-for-attendance-management` | `src/assets/thumbnails/facerek-post-bg.png` → `./facerek-post-bg.png` (also move existing body images) |
| `src/posts/240202-human-detection-and-tracking-in-surveillance-areas/240202-human-detection-and-tracking-in-surveillance-areas.md` | `human-detection-and-tracking-in-surveillance-areas` | `src/assets/thumbnails/belodt-post-bg.png` → `./belodt-post-bg.png` (also move existing body images) |
| `src/posts/240728-job-hunting-and-recruitment-a-balanced-perspective/280724-job-hunting-and-recruitment-a-balanced-perspective.md` | `job-hunting-and-recruitment-a-balanced-perspective` | `src/assets/thumbnails/job-hunting-and-recruitment-post-bg.webp` → `./job-hunting-and-recruitment-post-bg.webp` (KEEP existing `./Concurrent job hunting and recruitment.png` body image — move it into the new folder too) |

- [ ] **Step 1: Move flat posts into folders (git mv)**

For each currently-flat `.md` post: create `src/posts/<slug>/` and `git mv` the file to `src/posts/<slug>/<slug>.md`. (git mv auto-creates the directory when the target path includes it; if not, `mkdir -p` the folder first, then `git mv`.) Example:
```bash
mkdir -p src/posts/brain-rot && git mv src/posts/260117-brain-rot.md src/posts/brain-rot/brain-rot.md
```
Do this for all flat posts per the table.

- [ ] **Step 2: Rename existing folder posts**

For folder posts, `git mv` both the directory and the markdown file so it ends up `src/posts/<slug>/<slug>.md`, and move any co-located asset files (images already referenced with `./`) into the new folder. Example:
```bash
git mv src/posts/240202-custom-tensorrt-plugin src/posts/custom-tensorrt-plugin
git mv src/posts/custom-tensorrt-plugin/240202-custom-tensorrt-plugin.md src/posts/custom-tensorrt-plugin/custom-tensorrt-plugin.md
```
Inspect each old folder first (`ls`) and `git mv` every asset it contains into the new folder (preserving filenames so existing `./` refs keep working).

- [ ] **Step 3: Move the 6 lead images into their post folders & rewrite refs**

For each of the 6 posts with a lead image: `git mv src/assets/thumbnails/<file> src/posts/<slug>/<file>`, then edit that post's lead `<img>` tag, changing `src="/assets/thumbnails/<file>"` to `src="./<file>"` (leave the `alt` exactly as is).

- [ ] **Step 4: Build and verify**

Run: `rm -rf _site && npm run build`
Verify:
- `find _site/learnings -name index.html | sed 's#_site##;s#index.html##' | sort` → exactly the 12 clean URLs `/learnings/<slug>/` plus the list page `/learnings/` (13 total `index.html` under `_site/learnings`), no date prefixes, no nested duplicates.
- No build errors/warnings about missing images.
- Spot-check 2 posts (one moved-flat e.g. brain-rot, one renamed-folder e.g. job-hunting): the generated `index.html` contains the lead image (image plugin emits `<picture>`/optimized `<img>`); for job-hunting confirm BOTH the lead image and the original `Concurrent…` body image resolve.
- `find _site -path "*learnings*" -name index.html | xargs grep -l "post-card"` includes the list page and `grep -c "post-card" <list>` still equals 12.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: folder-per-post structure with co-located lead images"
```
(`-A` is appropriate here because this task is composed of moves/renames/deletes across many post paths. Do NOT stage `src/quotes.html` or `.gitignore` if they show as modified — explicitly `git restore --staged src/quotes.html .gitignore` before commit if needed; they are unrelated user/working changes.)

---

## Task 11: Delete the thumbnails directory and orphaned default thumbnail

**Files:** delete `src/assets/thumbnails/`, delete `src/assets/images/default-thumbnail.jpg`

- [ ] **Step 1: Confirm nothing references them**

Run: `grep -rn "assets/thumbnails\|default-thumbnail" src/ ; echo "exit:$?"`
Expected: no matches (grep exit 1). If anything matches, STOP and report — a prior task missed a reference.

- [ ] **Step 2: Delete**

```bash
git rm -r src/assets/thumbnails
git rm src/assets/images/default-thumbnail.jpg
```
(All 6 used images were moved into post folders in Task 10; the 6 DSA thumbnails and the default were never referenced after Tasks 3/5.)

- [ ] **Step 3: Build and verify**

Run: `rm -rf _site && npm run build`
Verify: clean build; `test ! -d src/assets/thumbnails && echo "THUMBNAILS-DIR-GONE"` prints the marker; `grep -rn "assets/thumbnails\|default-thumbnail" src/ _site/ ; echo "exit:$?"` → no matches.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: delete unused thumbnails directory and default thumbnail"
```
(Again: do not stage unrelated `src/quotes.html` / `.gitignore` changes.)

---

## Task 8: Final full-site build verification

**Files:** none (verification only)

- [ ] **Step 1: Clean build**

Run: `rm -rf _site && npm run build`
Expected: completes with no errors/warnings about missing templates or images.

- [ ] **Step 2: Cross-check key invariants**

Run and confirm each:
- `grep -rc "All rights reserved" _site || echo ABSENT` → `ABSENT`
- `grep -rc "thumbnail-image" _site || echo ABSENT` → `ABSENT`
- `find _site -path "*learnings*" -name index.html -exec grep -c "post-card" {} \;` → equals total post count
- `find _site -path "*learnings*" -name index.html -exec grep -c "archived-hidden" {} \;` → equals archived post count (> 0)
- `grep -rl "fa-box-archive" _site` → includes the learnings page
- The 6 non-DSA posts' generated `index.html` each contain their lead image (`find _site/learnings -name index.html | xargs grep -l "post-bg\|brain-rot\|AI-brain-with-shield"` lists 6 files)
- `find _site/learnings -name index.html | sed 's#_site##;s#index.html##' | sort` → exactly the 12 clean `/learnings/<slug>/` URLs + `/learnings/` (no date prefixes, no nested duplicates)
- `test ! -d src/assets/thumbnails && echo OK` → `OK`
- `grep -rn "assets/thumbnails\|default-thumbnail" src/ _site/ ; echo exit:$?` → no matches (`exit:1`)
- All 12 posts exist as `src/posts/<slug>/<slug>.md` (`find src/posts -name '*.md' | grep -v posts.json` → 12 paths, each `<slug>/<slug>.md`)

- [ ] **Step 3: Final commit (only if Step 2 produced any uncommitted formatting/cleanup)**

```bash
git status --porcelain
# if anything is uncommitted and intended:
git add -A
git commit -m "chore: final build verification cleanup"
```

- [ ] **Step 4: Done — hand back for branch finishing**

Report verification output. Implementation complete; ready for the finishing-a-development-branch step (merge/PR decision).

---

## Notes for the implementer

- There is no unit-test framework here; "verify it fails / passes" is replaced by build + `grep` on `_site/` output and the one documented manual browser check (Task 6 Step 5).
- Generated post paths under `_site/` may include a nested folder named after the file slug; use the provided `find` commands rather than hardcoding paths if a `grep` target is not found.
- Memory files (Task 7) live outside the git repo — never `git add` them.
- Keep commits per-task as specified (frequent commits).
