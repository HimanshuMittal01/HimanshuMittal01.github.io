/* A vertical index for long posts: dashes in the empty right column that expand to
   section titles on hover, and mark the section you are reading. Built from the
   rendered headings, so nothing in the markdown has to know about it. */
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var prose = document.querySelector(".prose");
    if (!prose) return;

    var heads = prose.querySelectorAll("h2");
    if (heads.length < 3) return; // a short piece does not need an index

    var nav = document.createElement("nav");
    nav.className = "prose-toc";
    nav.setAttribute("aria-label", "Sections");

    var list = document.createElement("ol");
    var links = [];

    Array.prototype.forEach.call(heads, function (h, i) {
      if (!h.id) {
        h.id =
          h.textContent
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") || "section-" + i;
      }
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = h.textContent;
      li.appendChild(a);
      list.appendChild(li);
      links.push(a);
    });

    nav.appendChild(list);
    prose.parentNode.insertBefore(nav, prose.nextSibling);

    function activate(id) {
      links.forEach(function (a) {
        var on = a.getAttribute("href") === "#" + id;
        if (on) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    }

    if (!("IntersectionObserver" in window)) return;

    // a heading counts as current once it reaches the top band of the viewport, and
    // stays current until the next one gets there
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) activate(entry.target.id);
        });
      },
      { rootMargin: "0px 0px -80% 0px" }
    );

    Array.prototype.forEach.call(heads, function (h) {
      observer.observe(h);
    });
  });
})();
