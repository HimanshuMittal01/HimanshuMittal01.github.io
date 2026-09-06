(function () {
    const scroller = document.getElementById("scraps");
    const wrap = scroller && scroller.closest(".carousel-wrap");
    if (!wrap) return;

    const bar = wrap.querySelector(".scrap-progress span");
    const dotsWrap = wrap.querySelector(".scrap-dots");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const EVERY = 3800;    // time the line takes to run out
    const RESUME = 9000;   // how long the visitor keeps control after touching it

    let timer = null, idle = null;
    let paused = false, hovered = false, onScreen = true;
    let stops = [0];

    /* Page stops are measured from the scraps themselves, so every stop is also a
       scroll-snap point. Page arithmetic and CSS snapping used to disagree, which
       left the strip re-scrolling to a position it was already at. */
    function measure() {
        const box = scroller.getBoundingClientRect();
        const max = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
        const width = scroller.clientWidth;
        const out = [];
        let anchor = null;
        for (const el of scroller.children) {
            const left = el.getBoundingClientRect().left - box.left + scroller.scrollLeft;
            if (anchor === null || left - anchor >= width * 0.9) { out.push(Math.min(Math.round(left), max)); anchor = left; }
        }
        if (!out.length) out.push(0);
        if (out[out.length - 1] < max) out.push(max);
        stops = out.filter((v, i, a) => a.indexOf(v) === i);
    }

    const at = () => {
        let best = 0;
        for (let i = 1; i < stops.length; i++) {
            if (Math.abs(stops[i] - scroller.scrollLeft) < Math.abs(stops[best] - scroller.scrollLeft)) best = i;
        }
        return best;
    };

    function syncDots() {
        const i = at();
        Array.prototype.forEach.call(dotsWrap.children, (d, k) => {
            d.classList.toggle("active", k === i);
            d.setAttribute("aria-current", k === i ? "true" : "false");
        });
    }

    function renderDots() {
        measure();
        if (dotsWrap.children.length !== stops.length) {
            dotsWrap.innerHTML = "";
            stops.forEach((_, i) => {
                const b = document.createElement("button");
                b.type = "button";
                b.className = "dot";
                b.setAttribute("aria-label", "Go to page " + (i + 1) + " of " + stops.length);
                b.addEventListener("click", () => { hold(); go(stops[i]); });
                dotsWrap.appendChild(b);
            });
        }
        syncDots();
    }

    function restartTick() {
        if (!bar) return;
        bar.style.animation = "none";
        void bar.offsetWidth;
        bar.style.animation = "";
    }

    function go(left) {
        scroller.scrollTo({ left: left, behavior: reduce ? "auto" : "smooth" });
        setTimeout(syncDots, 600);
    }

    function next() {
        if (paused || hovered || reduce || !onScreen) return;
        go(stops[(at() + 1) % stops.length]);
        restartTick();
    }

    function start() {
        if (reduce || paused || hovered || !onScreen || timer) return;
        wrap.classList.add("is-ticking");
        restartTick();
        timer = setInterval(next, EVERY);
    }

    function stop() {
        wrap.classList.remove("is-ticking");
        if (timer) { clearInterval(timer); timer = null; }
    }

    /* The visitor gets the strip whenever they actually touch it, and gets it back
       for a while, never for good: it always returns to moving on its own. */
    function hold() {
        paused = true;
        stop();
        if (idle) clearTimeout(idle);
        idle = setTimeout(() => { paused = false; start(); }, RESUME);
    }

    scroller.addEventListener("pointerdown", hold);
    scroller.addEventListener("focusin", hold);
    scroller.addEventListener("wheel", e => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) hold();   // sideways only; a page scroll passing over is not intent
    }, { passive: true });
    scroller.addEventListener("scroll", syncDots, { passive: true });
    scroller.addEventListener("mouseenter", () => { hovered = true; stop(); });
    scroller.addEventListener("mouseleave", () => { hovered = false; start(); });
    scroller.addEventListener("keydown", e => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        hold();
        go(stops[Math.min(stops.length - 1, Math.max(0, at() + (e.key === "ArrowRight" ? 1 : -1)))]);
    });

    window.addEventListener("resize", renderDots);
    if ("ResizeObserver" in window) new ResizeObserver(renderDots).observe(scroller);
    if ("IntersectionObserver" in window) {
        new IntersectionObserver(es => {
            onScreen = es[0].isIntersecting;
            if (onScreen) start(); else stop();
        }, { threshold: 0.05 }).observe(scroller);
    }

    renderDots();
    start();
})();
