(() => {
  "use strict";

  const search = document.querySelector("#skill-search");
  const cards = [...document.querySelectorAll(".skill-card")];
  const filters = [...document.querySelectorAll("[data-section-filter]")];
  const resultCount = document.querySelector("#result-count");
  const emptyState = document.querySelector("#empty-state");
  const clearSearch = document.querySelector("#clear-search");
  const copyStatus = document.querySelector("#copy-status");
  const copyDialog = document.querySelector("#copy-fallback");
  const copyCommand = document.querySelector("#copy-command");
  let section = "all";
  let statusTimer;

  function updateResults() {
    const terms = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    let visible = 0;
    for (const card of cards) {
      const matchesSection = section === "all" || card.dataset.section === section;
      const content = card.dataset.search.toLocaleLowerCase();
      card.hidden = !matchesSection || !terms.every((term) => content.includes(term));
      if (!card.hidden) visible += 1;
    }
    for (const filter of filters) {
      filter.setAttribute("aria-pressed", String(filter.dataset.sectionFilter === section));
    }
    resultCount.textContent = `${visible} of ${cards.length} skills`;
    emptyState.hidden = visible !== 0;
    clearSearch.hidden = search.value.length === 0;
  }

  search.addEventListener("input", updateResults);
  for (const filter of filters) {
    filter.addEventListener("click", () => {
      section = filter.dataset.sectionFilter;
      updateResults();
    });
  }
  clearSearch.addEventListener("click", () => {
    search.value = "";
    updateResults();
    search.focus();
  });
  document.querySelector("#reset-filters").addEventListener("click", () => {
    section = "all";
    search.value = "";
    updateResults();
    search.focus();
  });
  document.addEventListener("keydown", (event) => {
    const isEditing = event.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName);
    if (event.key.toLowerCase() === "k" && !isEditing && (event.metaKey || event.ctrlKey) && !event.altKey && !copyDialog.open) {
      event.preventDefault();
      search.focus();
    }
  });

  for (const button of document.querySelectorAll("[data-copy]")) {
    const originalLabel = button.textContent;
    let resetTimer;
    button.addEventListener("click", async () => {
      clearTimeout(resetTimer);
      button.disabled = true;
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        button.textContent = "Copied!";
        clearTimeout(statusTimer);
        copyStatus.textContent = "Install command copied.";
        copyStatus.classList.add("is-visible");
        statusTimer = setTimeout(() => copyStatus.classList.remove("is-visible"), 3000);
      } catch {
        button.textContent = "Copy manually";
        copyCommand.value = button.dataset.copy;
        copyDialog.showModal();
        copyCommand.focus();
        copyCommand.select();
      } finally {
        button.disabled = false;
        resetTimer = setTimeout(() => { button.textContent = originalLabel; }, 2500);
      }
    });
  }

  updateResults();
  document.documentElement.classList.add("js-ready");
})();
