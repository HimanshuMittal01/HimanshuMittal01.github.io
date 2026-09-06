/* Drives the scraps carousel headlessly against the real script.
   Micro-DOM with a fake clock, a fake scroll box and real item geometry.
   Run: node test/scraps-carousel.test.mjs */
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const SCRIPT = readFileSync(new URL("../src/_includes/js/scraps-carousel.js", import.meta.url), "utf8");

let now = 0, seq = 0, queue = [];
global.setTimeout = (fn, ms) => { const id = ++seq; queue.push({ id, at: now + (ms || 0), fn, every: 0 }); return id; };
global.setInterval = (fn, ms) => { const id = ++seq; queue.push({ id, at: now + ms, fn, every: ms }); return id; };
global.clearTimeout = global.clearInterval = id => { queue = queue.filter(t => t.id !== id); };
function tickTo(ms) {
    const until = now + ms;
    let guard = 0;
    while (guard++ < 4000) {
        queue.sort((a, b) => a.at - b.at || a.id - b.id);
        if (!queue[0] || queue[0].at > until) break;
        const t = queue.shift();
        now = t.at;
        if (t.every) queue.push({ ...t, at: now + t.every });
        t.fn();
    }
    now = until;
}

class El {
    constructor(tag = "div", cls = "") {
        this.tag = tag; this.className = cls; this.style = {}; this.children = []; this.handlers = {};
        this.attrs = {}; this.offsetWidth = 1; this.left = 0;
        this.classList = {
            add: c => { if (!this.className.split(" ").includes(c)) this.className = (this.className + " " + c).trim(); },
            remove: c => { this.className = this.className.split(" ").filter(x => x !== c).join(" "); },
            toggle: (c, on) => on ? this.classList.add(c) : this.classList.remove(c),
            contains: c => this.className.split(" ").includes(c)
        };
    }
    set innerHTML(_) { this.children = []; }
    get innerHTML() { return ""; }
    setAttribute(k, v) { this.attrs[k] = v; }
    addEventListener(t, fn) { (this.handlers[t] ||= []).push(fn); }
    dispatch(t, ev = {}) { (this.handlers[t] || []).forEach(fn => fn({ preventDefault() { }, ...ev })); }
    appendChild(c) { this.children.push(c); return c; }
    getBoundingClientRect() { return { left: this.left }; }
}

const wrap = new El("div", "carousel-wrap");
const bar = new El("span", "");
const dots = new El("div", "scrap-dots");
const strip = new El("div", "scraps");
wrap.querySelector = sel => sel.includes("scrap-progress") ? bar : sel.includes("scrap-dots") ? dots : null;
strip.closest = () => wrap;

// 20 scraps, 165px + 9px gap, in a 1000px window: stops land on item boundaries
const PITCH = 174;
strip.children = Array.from({ length: 20 }, (_, i) => { const e = new El("article", "scrap"); e.left = i * PITCH; return e; });
strip.clientWidth = 1000;
strip.scrollWidth = 20 * PITCH;
strip.scrollLeft = 0;
strip.left = 0;
strip.getBoundingClientRect = () => ({ left: 0 });   // the box stays put; its items shift under it
strip.children.forEach((e, i) => { e.getBoundingClientRect = () => ({ left: i * PITCH - strip.scrollLeft }); });
strip.scrollTo = ({ left }) => { strip.scrollLeft = Math.max(0, Math.round(left)); strip.dispatch("scroll"); };

global.window = { matchMedia: () => ({ matches: false }), addEventListener() { } };
global.document = { getElementById: id => id === "scraps" ? strip : null, createElement: t => new El(t) };

new Function(SCRIPT)();

const MAX = 20 * PITCH - 1000;

// 1. stops are measured from real item geometry, so each is a snap point
assert.equal(dots.children.length, 4, "four pages across twenty scraps");
assert.ok(dots.children[0].classList.contains("active"), "first dot starts active");

// 2. it moves on its own, without being touched
assert.ok(wrap.classList.contains("is-ticking"), "line runs at rest");
tickTo(3900);
assert.equal(strip.scrollLeft, 1044, "first advance lands on the seventh scrap");
assert.ok(dots.children[1].classList.contains("active"), "the dot follows the strip");

// 3. it keeps going. this is the bug that made it stall after a page or two.
tickTo(3900); assert.equal(strip.scrollLeft, 2088, "second advance");
tickTo(3900); assert.equal(strip.scrollLeft, MAX, "third advance reaches the end");
tickTo(3900); assert.equal(strip.scrollLeft, 0, "then it wraps to the start");

// 4. a page scroll passing over the strip is NOT the visitor taking control
strip.dispatch("wheel", { deltaX: 0, deltaY: 120 });
assert.ok(wrap.classList.contains("is-ticking"), "vertical wheel over the strip is ignored");
tickTo(3900);
assert.equal(strip.scrollLeft, 1044, "and it keeps advancing through it");

// 5. a real sideways gesture hands control over, and it comes back
strip.dispatch("wheel", { deltaX: -90, deltaY: 2 });
assert.equal(wrap.classList.contains("is-ticking"), false, "sideways wheel stops it");
const held = strip.scrollLeft;
tickTo(4000);
assert.equal(strip.scrollLeft, held, "nothing moves while the visitor has it");
tickTo(6000);
assert.ok(wrap.classList.contains("is-ticking"), "control returns after the idle window");

// 6. dots drive it
dots.children[3].dispatch("click");
assert.equal(strip.scrollLeft, MAX, "dot four jumps to the last page");
assert.equal(wrap.classList.contains("is-ticking"), false, "clicking a dot hands control over");
tickTo(9500);
assert.ok(wrap.classList.contains("is-ticking"), "and it resumes afterwards");

console.log("scraps-carousel: 16 assertions passed");
