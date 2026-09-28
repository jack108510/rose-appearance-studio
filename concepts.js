(() => {
  const concepts = [...document.querySelectorAll("[data-concept]")];
  const originalFamilies = {
    halo: "Minimal",
    petal: "Organic",
    signal: "Spatial",
    companion: "Expressive",
    ribbon: "Minimal",
    prism: "Sculptural",
  };
  const names = Object.fromEntries(
    concepts.map((card, index) => [
      card.dataset.concept,
      `${String(index + 1).padStart(2, "0")} ${card.querySelector(".concept-description h2").textContent}`,
    ]),
  );
  const status = document.querySelector("#review-status");
  const detail = document.querySelector("#concept-detail");
  const detailStage = document.querySelector("#detail-stage");
  const shortlistKey = "rose-concept-shortlist";
  const stops = new Map();
  const idleText = new Map();
  let picks = new Set(),
    filtered = false,
    family = "All",
    selected = null,
    returnFocus = null;
  try {
    const saved = JSON.parse(localStorage.getItem(shortlistKey) || "[]");
    if (Array.isArray(saved)) picks = new Set(saved.filter((id) => names[id]));
  } catch {}

  function render() {
    let count = 0;
    for (const card of concepts) {
      const picked = picks.has(card.dataset.concept);
      card.hidden =
        (filtered && !picked) ||
        (family !== "All" && card.dataset.family !== family);
      if (card.hidden) stops.get(card)?.();
      else count++;
      const button = card.querySelector(".shortlist");
      button.setAttribute("aria-pressed", String(picked));
      button.textContent = picked ? "Shortlisted ✓" : "Shortlist ＋";
    }
    document.querySelector("#shortlist-count").textContent =
      `${picks.size} shortlisted`;
    document.querySelector("#empty-shortlist").hidden = count !== 0;
    document
      .querySelector("#filter")
      .setAttribute("aria-pressed", String(filtered));
    document.querySelector("#filter").textContent = filtered
      ? "Show all concepts"
      : "Show shortlist";
    for (const button of document.querySelectorAll("[data-family-filter]"))
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.familyFilter === family),
      );
    if (selected) {
      const picked = picks.has(selected.dataset.concept);
      const button = document.querySelector("#detail-shortlist");
      button.setAttribute("aria-pressed", String(picked));
      button.textContent = picked ? "Shortlisted ✓" : "Shortlist ＋";
    }
  }
  function togglePick(card) {
    const id = card.dataset.concept;
    picks.has(id) ? picks.delete(id) : picks.add(id);
    render();
    try {
      localStorage.setItem(shortlistKey, JSON.stringify([...picks]));
      status.textContent = "Your shortlist is saved in this browser.";
    } catch {
      status.textContent = "Your shortlist will stay here for this visit.";
    }
  }
  function setPhase(container, phase, card, text) {
    container.dataset.phase = phase;
    container.classList.toggle("is-playing", phase !== "idle");
    const id = card.dataset.concept;
    if (phase === "idle") text.innerHTML = idleText.get(card);
    else
      text.textContent =
        phase === "listening"
          ? id === "companion"
            ? "Hey! I’m listening."
            : "Listening. Take your time."
          : id === "companion"
            ? "Let’s figure it out."
            : "Let’s find your next step.";
    const reply = container.querySelector(".ribbon-reply");
    if (reply) reply.hidden = phase === "idle";
    window.RoseObjects?.refresh(container);
  }

  for (const card of concepts) {
    card.dataset.family ||= originalFamilies[card.dataset.concept];
    idleText.set(card, card.querySelector(".concept-status").innerHTML);
    const shortlist = card.querySelector(".shortlist");
    shortlist.setAttribute(
      "aria-label",
      `Shortlist ${names[card.dataset.concept]}`,
    );
    shortlist.addEventListener("click", () => togglePick(card));
    const play = card.querySelector("[data-play]");
    const originalButton = play.innerHTML;
    const text = card.querySelector(".concept-status");
    text.setAttribute("role", "status");
    let timer;
    function stop() {
      clearTimeout(timer);
      if (!card.classList.contains("is-playing")) return;
      setPhase(card, "idle", card, text);
      play.innerHTML = originalButton;
      play.setAttribute("aria-pressed", "false");
    }
    stops.set(card, stop);
    play.setAttribute("aria-pressed", "false");
    play.addEventListener("click", () => {
      if (card.classList.contains("is-playing")) {
        stop();
        return;
      }
      for (const end of stops.values()) end();
      setPhase(card, "listening", card, text);
      play.textContent =
        card.dataset.concept === "ribbon" ? "■" : "End preview";
      play.setAttribute("aria-pressed", "true");
      timer = setTimeout(() => {
        setPhase(card, "speaking", card, text);
        timer = setTimeout(stop, 4500);
      }, 2200);
    });
    const inspect = document.createElement("button");
    inspect.className = "inspect";
    inspect.type = "button";
    inspect.textContent = "Explore look ↗";
    inspect.setAttribute(
      "aria-label",
      `Explore ${names[card.dataset.concept]}`,
    );
    inspect.addEventListener("click", () => openDetail(card, inspect));
    card.querySelector(".stage").append(inspect);
  }
  function openDetail(card, source) {
    for (const end of stops.values()) end();
    selected = card;
    returnFocus = source;
    document.querySelector("#detail-title").textContent = card.querySelector(
      ".concept-description h2",
    ).textContent;
    document.querySelector("#detail-number").textContent =
      `${names[card.dataset.concept].slice(0, 2)} / ${card.dataset.family} / MOTION STUDY`;
    document.querySelector("#detail-description").textContent =
      card.querySelector(".concept-description p").textContent;
    const stage = card.querySelector(".stage").cloneNode(true);
    stage.querySelector(".inspect")?.remove();
    for (const element of stage.querySelectorAll("[id]")) {
      const oldId = element.id,
        newId = `preview-${oldId}`;
      element.id = newId;
      for (const child of stage.querySelectorAll("*"))
        for (const attr of [...child.attributes])
          if (attr.value.includes(`url(#${oldId})`))
            child.setAttribute(
              attr.name,
              attr.value.replaceAll(`url(#${oldId})`, `url(#${newId})`),
            );
    }
    const play = stage.querySelector("[data-play]");
    play.removeAttribute("data-play");
    play.setAttribute("tabindex", "-1");
    play.setAttribute("aria-hidden", "true");
    play.disabled = true;
    detailStage.replaceChildren(stage);
    detailStage.className = "detail-open";
    window.RoseObjects?.cleanup();
    if (!detail.open) detail.showModal();
    detail.scrollTop = 0;
    window.RoseObjects?.mount(detailStage);
    selectPreviewState("idle");
    render();
  }
  function selectPreviewState(phase) {
    if (!selected) return;
    setPhase(
      detailStage,
      phase,
      selected,
      detailStage.querySelector(".concept-status"),
    );
    for (const button of detail.querySelectorAll("[data-preview-state]"))
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.previewState === phase),
      );
  }
  for (const button of detail.querySelectorAll("[data-preview-state]"))
    button.addEventListener("click", () =>
      selectPreviewState(button.dataset.previewState),
    );
  document.querySelector("#detail-shortlist").addEventListener("click", () => {
    if (selected) togglePick(selected);
  });
  document
    .querySelector("#detail-close")
    .addEventListener("click", () => detail.close());
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && detail.open) {
      event.preventDefault();
      detail.close();
    }
  });
  detail.addEventListener("click", (event) => {
    if (event.target === detail) detail.close();
  });
  detail.addEventListener("close", () => {
    if (detail.open) return;
    selected = null;
    detailStage.replaceChildren();
    detailStage.classList.remove("is-playing");
    window.RoseObjects?.cleanup();
    if (returnFocus?.isConnected && !returnFocus.closest(".concept")?.hidden)
      returnFocus.focus({ preventScroll: true });
  });
  document.querySelector("#filter").addEventListener("click", () => {
    filtered = !filtered;
    render();
  });
  for (const button of document.querySelectorAll("[data-family-filter]"))
    button.addEventListener("click", () => {
      family = button.dataset.familyFilter;
      render();
    });
  document.querySelector("#copy").addEventListener("click", async () => {
    if (!picks.size) {
      status.textContent = "Shortlist a concept first, then copy your choices.";
      return;
    }
    const text =
      "Rose concepts I want to explore: " +
      [...picks].map((id) => names[id]).join(", ") +
      ".";
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = "Copied. Paste your picks into our conversation.";
    } catch {
      status.textContent = text;
    }
  });
  const reference = document.querySelector("#original");
  document
    .querySelector("#reference-open")
    .addEventListener("click", () => reference.showModal());
  document
    .querySelector("#reference-close")
    .addEventListener("click", () => reference.close());
  reference.addEventListener("click", (event) => {
    if (event.target === reference) reference.close();
  });
  render();
})();
