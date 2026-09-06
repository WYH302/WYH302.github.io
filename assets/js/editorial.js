/* Progressive enhancement: the full journal remains readable without JavaScript. */
(() => {
  const tools = document.querySelector("[data-journal-tools]");
  const list = document.querySelector(".post-list");
  if (!tools || !list) return;
  const cards = [...list.querySelectorAll(".note-card")];
  const input = tools.querySelector("[data-essay-search]");
  const status = tools.querySelector(".search-status");
  const buttons = [...tools.querySelectorAll("[data-filter]")];
  const zh = document.documentElement.lang.startsWith("zh");
  let category = "all";
  function filter() {
    const query = input.value.trim().toLocaleLowerCase();
    let visible = 0;
    for (const card of cards) {
      const match = (category === "all" || card.dataset.category === category) &&
        card.textContent.toLocaleLowerCase().includes(query);
      card.hidden = !match;
      if (match) visible++;
    }
    list.classList.toggle("is-filtered", category !== "all" || Boolean(query));
    status.textContent = category === "all" && !query ? "" :
      zh ? `找到 ${visible} 篇文章${visible ? "" : "，试试其他关键词。"}` :
        `${visible} essay${visible === 1 ? "" : "s"} found${visible ? "." : ". Try another search."}`;
  }
  buttons.forEach(button => button.addEventListener("click", () => {
    category = button.dataset.filter;
    buttons.forEach(b => b.setAttribute("aria-pressed", String(b === button)));
    filter();
  }));
  input.addEventListener("input", filter);
  tools.hidden = false;
})();
