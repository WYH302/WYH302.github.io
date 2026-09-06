/* Progressive enhancement: the journal and first portrait work without JavaScript. */
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

(() => {
  const carousel = document.querySelector("[data-carousel]");
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll("[data-slide]")];
  const dots = [...carousel.querySelectorAll("[data-go-to]")];
  const status = carousel.querySelector("[data-carousel-status]");
  const zh = document.documentElement.lang.startsWith("zh");
  let index = 0;
  let inView = true;
  let ready = false;
  let timer;

  function render() {
    slides.forEach((slide, i) => {
      const offset = (i - index + slides.length) % slides.length;
      slide.dataset.position = offset === 0 ? "active" : offset === 1 ? "next" : offset === slides.length - 1 ? "previous" : "hidden";
      slide.tabIndex = offset === 0 ? 0 : -1;
      if (offset === 0) slide.removeAttribute("aria-hidden");
      else slide.setAttribute("aria-hidden", "true");
      if (offset === 0) dots[i].setAttribute("aria-current", "true");
      else dots[i].removeAttribute("aria-current");
    });
    carousel.dataset.index = String(index);
    status.textContent = zh ? `第 ${index + 1} 张，共 ${slides.length} 张` : `Photo ${index + 1} of ${slides.length}`;
  }

  function syncPlayback() {
    clearInterval(timer);
    // Keep a focused photo stable for keyboard users; controls never latch playback off.
    const playing = ready && inView && !document.hidden && !slides.includes(document.activeElement);
    carousel.dataset.playing = String(playing);
    if (playing) timer = setInterval(() => {
      index = (index + 1) % slides.length;
      render();
    }, 1000);
  }

  function goTo(next) {
    index = (next + slides.length) % slides.length;
    render();
    syncPlayback();
  }
  carousel.querySelector("[data-previous]").addEventListener("click", () => goTo(index - 1));
  carousel.querySelector("[data-next]").addEventListener("click", () => goTo(index + 1));
  dots.forEach(dot => dot.addEventListener("click", () => goTo(Number(dot.dataset.goTo))));
  carousel.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const slideFocused = slides.includes(document.activeElement);
    goTo(index + (event.key === "ArrowRight" ? 1 : -1));
    if (slideFocused) slides[index].focus();
  });
  carousel.addEventListener("focusin", syncPlayback);
  carousel.addEventListener("focusout", () => queueMicrotask(syncPlayback));
  document.addEventListener("visibilitychange", syncPlayback);
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    syncPlayback();
  }, { threshold: 0 }).observe(carousel);
  carousel.querySelectorAll("[data-carousel-controls]").forEach(control => { control.hidden = false; });
  render();
  syncPlayback();
  slides[0].querySelector("img").decode().catch(() => {}).then(() => {
    ready = true;
    syncPlayback();
  });
})();
