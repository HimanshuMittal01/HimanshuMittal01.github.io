(function () {
    const root = document.querySelector(".cu");
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stage = root.querySelector(".cu-stage");
    const call = root.querySelector(".cu-call");
    const word = root.querySelector(".cu-word");
    const gloss = root.querySelector(".cu-gloss");
    const trail = root.querySelector(".cu-trail");
    const target = root.querySelector(".cu-target");
    const hint = root.querySelector(".cu-hint");
    const scriptTitle = root.querySelector(".cu-script-title");
    const beats = Array.prototype.slice.call(root.querySelectorAll("[data-beat]"));

    // The dealer sets the pace. Windows shrink until a human reflex cannot keep up.
    const ROUNDS = [
        ["chidiya", "sparrow", 1, 1800],
        ["tota", "parrot", 1, 1550],
        ["kabootar", "pigeon", 1, 1350],
        ["ghoda", "horse", 0, 1200],
        ["kauwa", "crow", 1, 1050],
        ["patang", "kite", 1, 950],
        ["titli", "butterfly", 1, 860],
        ["machhli", "fish", 0, 780],
        ["baaz", "falcon", 1, 700],
        ["aeroplane", "", 1, 630],
        ["makkhi", "housefly", 1, 570],
        ["saanp", "snake", 0, 510]
    ];

    let timers = [];
    let armed = false;
    let pressed = false;
    let index = 0;
    let live = false;
    let done = false;

    const wait = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
    const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

    // Reveals nudge the page into view, but only until the visitor takes the wheel.
    let visitorScrolled = false;
    ["wheel", "touchmove"].forEach(t =>
        window.addEventListener(t, () => { visitorScrolled = true; }, { passive: true, once: true }));

    const beat = name => beats.filter(b => b.dataset.beat === name);
    function reveal(name) {
        beat(name).forEach(el => {
            el.hidden = false;
            const box = el.getBoundingClientRect();
            if (!visitorScrolled && box.top > window.innerHeight * 0.9) {
                el.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
            }
        });
    }

    function mark(ok) {
        const li = document.createElement("li");
        li.className = ok ? "cu-hit" : "cu-slip";
        trail.appendChild(li);
    }

    function say(round) {
        word.textContent = round[0] + " udd.";
        gloss.textContent = round[1];
    }

    /* ---- the played rounds ---- */

    function playRound() {
        if (index >= ROUNDS.length) return finish("hold");
        const round = ROUNDS[index];
        pressed = false;
        armed = true;
        say(round);
        root.classList.add("is-calling");
        wait(() => root.classList.remove("is-calling"), 120);
        wait(() => {
            armed = false;
            const correct = pressed === Boolean(round[2]);
            mark(correct);
            if (!correct) return finish("miss");
            index += 1;
            wait(playRound, 90);
        }, round[3]);
    }

    function raise() {
        if (done) return;
        if (!live) return start();
        if (armed) pressed = true;
    }

    function start() {
        live = true;
        index = 0;
        trail.innerHTML = "";
        target.focus();
        wait(playRound, 700);
    }

    function finish(how) {
        clearTimers();
        live = false;
        armed = false;
        done = true;
        target.disabled = true;
        word.textContent = "";
        gloss.textContent = "";
        hint.textContent = how === "miss" ? "The dealer stops." : "The dealer stops, unhurried.";
        reveal(how === "miss" ? "outcome-miss" : "outcome-hold");
        wait(() => { reveal("turn"); }, 1400);
        wait(() => { reveal("escalate"); }, 2600);
        wait(() => { reveal("advise"); unlock("advise"); }, 3600);
    }

    /* ---- the delegated rounds ---- */

    const unlock = action => {
        const btn = root.querySelector('[data-action="' + action + '"]');
        if (btn) btn.hidden = false;
    };
    const spend = action => {
        const btn = root.querySelector('[data-action="' + action + '"]');
        if (btn) btn.disabled = true;
    };

    function autoRounds(count, pace, done) {
        call.setAttribute("aria-live", "off"); // do not machine-gun a screen reader
        let n = 0;
        const step = () => {
            if (n >= count) { call.setAttribute("aria-live", "polite"); return done(); }
            say(ROUNDS[n % ROUNDS.length]);
            mark(true);
            n += 1;
            wait(step, pace);
        };
        step();
    }

    function onAdvise() {
        spend("advise");
        autoRounds(5, 380, () => {
            wait(() => { reveal("delegate"); unlock("delegate"); }, 500);
        });
    }

    function onDelegate() {
        spend("delegate");
        target.disabled = true;
        const tally = root.querySelector(".cu-tally");
        let n = 0;
        const climb = () => {
            n += 1;
            if (tally) tally.textContent = String(n);
            if (n < 38) wait(climb, 70);
        };
        if (tally) { tally.textContent = "0"; climb(); }
        autoRounds(14, 150, () => {
            wait(() => {
                reveal("audit");
                const choices = root.querySelector(".cu-choices");
                if (choices) choices.hidden = false;
            }, 700);
        });
    }

    /* The rate never changes. The volume does. Every mark is identical, which is
       the whole point: nothing on the surface says which ones were wrong. */
    function scaleOut() {
        reveal("scale");
        const nEl = root.querySelector(".cu-scale-n");
        const wEl = root.querySelector(".cu-scale-w");
        const field = root.querySelector(".cu-field");
        const TOTAL = 38412, DOTS = 240, STEPS = 55;
        let step = 0;
        const tick = () => {
            step += 1;
            const t = step / STEPS;
            const n = Math.round(38 + (TOTAL - 38) * t * t * t);
            if (nEl) nEl.textContent = n.toLocaleString();
            if (wEl) wEl.textContent = Math.round(n / 38).toLocaleString();
            if (field) { const want = Math.round(DOTS * t); while (field.children.length < want) field.appendChild(document.createElement("li")); }
            if (step < STEPS) wait(tick, 45);
            else wait(() => reveal("reveal"), 1600);
        };
        if (nEl) nEl.textContent = "38";
        if (wEl) wEl.textContent = "1";
        tick();
    }

    function onTrust() {
        spend("trust"); spend("review");
        const said = root.querySelector('[data-said="trust"]');
        if (said) said.hidden = false;
        wait(scaleOut, 1400);
    }

    function onReview() {
        spend("trust"); spend("review");
        const wall = root.querySelector(".cu-wall");
        const said = root.querySelector('[data-said="review"]');
        const counter = root.querySelector(".cu-read-count");
        const bar = root.querySelector(".cu-progress");
        const fill = root.querySelector(".cu-progress-read");
        if (wall) wall.hidden = false;
        if (bar) bar.hidden = false;
        // count what they could plausibly have read while it sat open
        let read = 0;
        const tick = () => {
            read += 34;
            if (counter) counter.textContent = String(read);
            if (fill) fill.style.width = (read / 11482 * 100).toFixed(2) + "%";
            if (read < 340) wait(tick, 600);
            else {
                if (said) said.hidden = false;
                wait(scaleOut, 1600);
            }
        };
        tick();
    }

    /* ---- wiring ---- */

    root.addEventListener("click", e => {
        const btn = e.target.closest("[data-action]");
        if (!btn || btn.disabled) return;
        ({ advise: onAdvise, delegate: onDelegate, trust: onTrust, review: onReview }[btn.dataset.action] || function () { })();
    });

    target.addEventListener("click", raise);
    document.addEventListener("keydown", e => {
        if (!live && !stage.hidden && e.code === "Space" && document.activeElement === target) return; // button handles it
        if (live && (e.code === "Space" || e.code === "ArrowUp")) { e.preventDefault(); raise(); }
    });

    function readInstead() {
        clearTimers();
        live = false;
        stage.hidden = true;
        if (scriptTitle) scriptTitle.hidden = false;
        beats.forEach(b => { b.hidden = b.dataset.beat === "outcome-miss" || b.dataset.beat === "outcome-hold"; });
        root.querySelectorAll(".cu-choice, .cu-choices").forEach(el => { el.hidden = true; });
        const said = root.querySelector('[data-said="trust"]');
        if (said) said.hidden = true;
    }
    root.querySelector(".cu-escape").addEventListener("click", readInstead);

    /* Default DOM state is the readable narrative. Upgrade to the game only if
       the visitor has not asked for less motion. */
    if (!reduce) {
        stage.hidden = false;
        if (scriptTitle) scriptTitle.hidden = true;
        beats.forEach(b => { b.hidden = true; });
    }
})();
