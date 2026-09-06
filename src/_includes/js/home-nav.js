/* The homepage name appears only once the hero has scrolled away. Other pages
   have no .home .hero, so this is a no-op there. */
(function () {
    const header = document.querySelector("header");
    const hero = document.querySelector(".home .hero");
    if (!header || !hero || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (entries) {
        header.classList.toggle("past-hero", !entries[0].isIntersecting);
    }).observe(hero);
})();
