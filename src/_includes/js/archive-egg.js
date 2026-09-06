(function () {
  function onWritings() {
    const p = window.location.pathname.replace(/\/+$/, "");
    return p === "/writings" || p.endsWith("/writings");
  }
  document.addEventListener("DOMContentLoaded", function () {
    const dot = document.querySelector(".archive-dot");
    if (!dot) return;
    dot.addEventListener("click", function () {
      if (!onWritings()) return;
      const hidden = document.querySelectorAll(".post-card.archived-hidden");
      for (let i = 0; i < hidden.length; i++) {
        hidden[i].classList.remove("archived-hidden");
      }
    });
  });
})();
