(function () {
  function onLearnings() {
    const p = window.location.pathname.replace(/\/+$/, "");
    return p === "/learnings" || p.endsWith("/learnings");
  }
  document.addEventListener("DOMContentLoaded", function () {
    const dot = document.querySelector(".archive-dot");
    if (!dot) return;
    dot.addEventListener("click", function () {
      if (!onLearnings()) return;
      const hidden = document.querySelectorAll(".post-card.archived-hidden");
      for (let i = 0; i < hidden.length; i++) {
        hidden[i].classList.remove("archived-hidden");
      }
    });
  });
})();
