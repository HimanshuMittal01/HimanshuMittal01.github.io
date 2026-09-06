/* Plays the Chidiya Udd section headlessly against the real markup.
   No test framework, no jsdom: a micro-DOM covering exactly what the script touches.
   Run: node test/chidiya-udd.test.mjs */
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const MARKUP = readFileSync(new URL("../src/_includes/partials/_chidiya-udd.html", import.meta.url), "utf8");
const SCRIPT = readFileSync(new URL("../src/_includes/js/chidiya-udd.js", import.meta.url), "utf8");

/* ---------- micro-DOM ---------- */

class El {
    constructor(tag, attrs = {}) {
        this.tag = tag;
        this.attrs = attrs;
        this.classes = new Set((attrs.class || "").split(/\s+/).filter(Boolean));
        this.dataset = {};
        for (const [k, v] of Object.entries(attrs)) {
            if (k.startsWith("data-")) this.dataset[k.slice(5).replace(/-(\w)/g, (_, c) => c.toUpperCase())] = v;
        }
        this.hidden = "hidden" in attrs;
        this.disabled = false;
        this.textContent = "";
        this.innerHTML = "";
        this.children = [];
        this.style = {};
        this.handlers = {};
        this.classList = {
            add: c => this.classes.add(c),
            remove: c => this.classes.delete(c),
            contains: c => this.classes.has(c)
        };
    }
    matches(sel) {
        return sel.split(",").map(s => s.trim()).some(s => {
            if (s.startsWith(".")) return this.classes.has(s.slice(1));
            const attr = s.match(/^\[([\w-]+)(?:="([^"]*)")?\]$/);
            if (attr) return attr[2] === undefined ? attr[1] in this.attrs : this.attrs[attr[1]] === attr[2];
            return this.tag === s;
        });
    }
    querySelector(sel) { return ALL.find(e => e.matches(sel)) || null; }
    querySelectorAll(sel) { return ALL.filter(e => e.matches(sel)); }
    setAttribute(k, v) { this.attrs[k] = v; }
    closest(sel) { return this.matches(sel) ? this : null; }
    addEventListener(type, fn) { (this.handlers[type] ||= []).push(fn); }
    dispatch(type, ev = {}) { if (this.disabled) return; (this.handlers[type] || []).forEach(fn => fn({ target: this, preventDefault() { }, ...ev })); }
    appendChild(c) { this.children.push(c); }
    focus() { }
    scrollIntoView() { }
    getBoundingClientRect() { return { top: 0 }; }
}

// Flat parse: the script only needs the hooks, not the tree shape.
const ALL = [];
for (const m of MARKUP.matchAll(/<(section|div|p|button|ol|h2|h3|span)\b([^>]*)>/g)) {
    const attrs = {};
    for (const a of m[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g)) attrs[a[1]] = a[2] === undefined ? "" : a[2];
    ALL.push(new El(m[1], attrs));
}
const root = ALL.find(e => e.classes.has("cu"));
assert.ok(root, "markup must contain a .cu root");

/* ---------- fake clock ---------- */

let now = 0, seq = 0, queue = [];
global.setTimeout = (fn, ms) => { const id = ++seq; queue.push({ id, at: now + (ms || 0), fn }); return id; };
global.clearTimeout = id => { queue = queue.filter(t => t.id !== id); };
global.window = {
    matchMedia: () => ({ matches: false }),
    addEventListener() { },
    innerHeight: 800
};
global.document = {
    querySelector: s => root.querySelector(s),
    addEventListener() { },
    createElement: tag => new El(tag),
    activeElement: null
};

/* ---------- run one playthrough ---------- */

function play(policy, choices) {
    ALL.forEach(e => { e.hidden = "hidden" in e.attrs; e.disabled = false; e.textContent = ""; e.children = []; e.classes = new Set((e.attrs.class || "").split(/\s+/).filter(Boolean)); });
    now = 0; queue = [];
    new Function(SCRIPT)();

    const target = root.querySelector(".cu-target");
    const word = root.querySelector(".cu-word");
    target.dispatch("click"); // begin

    let last = "", guard = 0;
    while (queue.length && guard++ < 5000) {
        queue.sort((a, b) => a.at - b.at || a.id - b.id);
        const t = queue.shift();
        now = t.at;
        t.fn();
        if (word.textContent && word.textContent !== last) {
            last = word.textContent;
            if (policy(last)) target.dispatch("click");
        }
        for (const action of choices) {
            const btn = root.querySelector(`[data-action="${action}"]`);
            const gated = (action === "trust" || action === "review") && root.querySelector(".cu-choices").hidden;
            if (btn && !btn.hidden && !btn.disabled && !gated) root.dispatch("click", { target: btn });
        }
    }
    return {
        beat: name => root.querySelectorAll("[data-beat]").find(b => b.dataset.beat === name),
        said: which => root.querySelector(`[data-said="${which}"]`),
        trail: root.querySelector(".cu-trail").children.map(c => c.className === "cu-hit" ? "✓" : "✗").join(""),
        tally: root.querySelector(".cu-tally").textContent
    };
}

const FLIES = w => !/^(ghoda|machhli|saanp)\b/.test(w);

/* ---------- assertions ---------- */

// 1. A visitor who raises for everything is trapped by the first non-flyer.
const reflex = play(() => true, ["advise", "delegate", "review"]);
assert.equal(reflex.trail, "✓✓✓✗" + "✓".repeat(19), "misses on ghoda at round 4, then 19 rounds run without the visitor");
assert.equal(reflex.beat("outcome-miss").hidden, false, "miss ending shows");
assert.equal(reflex.beat("outcome-hold").hidden, true, "hold ending stays hidden");

// 2. The delegated half runs to the end and hands back the reveal.
assert.equal(reflex.tally, "38", "delegated counter reaches 38");
assert.equal(reflex.said("review").hidden, false, "review path reports how little was read");
assert.equal(reflex.beat("reveal").hidden, false, "review path reaches the AI safety reveal");

// 3. A visitor who plays correctly survives all twelve rounds.
const perfect = play(FLIES, []);
assert.equal(perfect.trail, "✓".repeat(12), "perfect player clears every round");
assert.equal(perfect.beat("outcome-hold").hidden, false, "hold ending shows");
assert.equal(perfect.beat("outcome-miss").hidden, true, "miss ending stays hidden");

// 4. Trusting the record also reaches the reveal.
const trusting = play(() => true, ["advise", "delegate", "trust"]);
assert.equal(trusting.said("trust").hidden, false, "trust path states what is still unknown");
assert.equal(trusting.beat("reveal").hidden, false, "trust path reaches the AI safety reveal");

console.log("chidiya-udd: 12 assertions passed");
