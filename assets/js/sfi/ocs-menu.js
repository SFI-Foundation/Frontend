// Enhance the OCS bar/drawer without loading the Minima theme or duplicating links.
(() => {
  const toggle = document.getElementById("navToggle");
  const navigation = document.getElementById("navLinks");
  if (!toggle || !navigation || typeof HTMLDialogElement === "undefined")
    return;

  const drawer = document.createElement("dialog");
  drawer.id = "opencsMenu";
  drawer.className = "opencs-drawer";
  drawer.setAttribute("aria-label", "SFI navigation");
  const heading = document.createElement("div");
  heading.className = "opencs-drawer__head";
  const title = document.createElement("span");
  title.textContent = "SFI Foundation";
  const close = document.createElement("button");
  close.type = "button";
  close.className = "opencs-drawer__close";
  close.setAttribute("aria-label", "Close navigation menu");
  close.textContent = "×";
  heading.append(title, close);
  drawer.append(heading, navigation);
  document.body.append(drawer);
  toggle.hidden = false;

  toggle.addEventListener("click", () => {
    drawer.showModal();
    toggle.setAttribute("aria-expanded", "true");
    navigation.querySelector("[aria-current]")?.focus();
  });
  close.addEventListener("click", () => drawer.close());
  drawer.addEventListener("close", () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus();
  });
  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) drawer.close();
  });
  drawer.addEventListener("click", (event) => {
    const bounds = drawer.getBoundingClientRect();
    if (
      event.target === drawer &&
      (event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom)
    )
      drawer.close();
  });
})();
