// Progressive enhancement: without JavaScript, all configured links stay visible.
(() => {
  const button = document.getElementById("navToggle");
  const nav = document.getElementById("navLinks");
  const header = button?.closest(".opencs-bar");
  if (!button || !nav || !header) return;
  const setOpen = (open) => {
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
  };
  button.hidden = false;
  header.classList.add("opencs-bar--enhanced");
  button.addEventListener("click", () =>
    setOpen(button.getAttribute("aria-expanded") !== "true"),
  );
  header.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      button.getAttribute("aria-expanded") === "true"
    ) {
      setOpen(false);
      button.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) setOpen(false);
  });
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });
  // Use the Sass breakpoint exposed by the shared public tokens.
  const breakpoint = getComputedStyle(header)
    .getPropertyValue("--sfi-nav-breakpoint")
    .trim();
  window
    .matchMedia(`(max-width: ${breakpoint})`)
    .addEventListener("change", () => setOpen(false));
})();
