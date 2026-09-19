import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";

const script = fs.readFileSync(new URL("../assets/js/editorial.js", import.meta.url), "utf8");
const flush = () => new Promise(resolve => setImmediate(resolve));

function fixture() {
  const element = () => ({
    dataset: {}, events: {}, attrs: {},
    addEventListener(name, fn) { this.events[name] = fn; },
    setAttribute(name, value) { this.attrs[name] = value; },
    removeAttribute(name) { delete this.attrs[name]; },
  });
  const images = Array.from({ length: 6 }, (_, i) => {
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    return { dataset: i ? { src: "photo-" + i, srcset: "small-" + i + " 480w" } : {},
      src: i ? undefined : "photo-0", decode: () => promise, resolve, reject };
  });
  const slides = images.map(img => ({ ...element(), querySelector: () => img,
    focus() { document.activeElement = this; } }));
  const dots = slides.map((_, i) => ({ ...element(), dataset: { goTo: String(i) } }));
  const previous = element(), next = element(), status = element();
  const carousel = { ...element(),
    querySelectorAll(selector) {
      if (selector === "[data-slide]") return slides;
      if (selector === "[data-go-to]") return dots;
      return [previous, next];
    },
    querySelector(selector) {
      return selector === "[data-previous]" ? previous : selector === "[data-next]" ? next : status;
    },
  };
  const document = { ...element(), hidden: false, activeElement: null,
    documentElement: { lang: "zh-CN" }, querySelectorAll: () => [],
    querySelector: selector => selector === "[data-carousel]" ? carousel : null };
  let tick, interval;
  vm.runInNewContext(script, { document, queueMicrotask,
    setInterval(fn, ms) { tick = fn; interval = ms; return 1; },
    clearInterval() { tick = undefined; },
    IntersectionObserver: class { constructor(fn) { this.fn = fn; } observe() { this.fn([{isIntersecting: true}]); } },
  });
  return { images, slides, dots, carousel, document, next, previous,
    tick: () => tick?.(), interval: () => interval };
}

test("carousel defers five downloads and preloads neighbours only after the first decode", async () => {
  const f = fixture();
  assert.deepEqual(f.images.map(i => i.src), ["photo-0", undefined, undefined, undefined, undefined, undefined]);
  f.images[0].resolve();
  await flush();
  assert.equal(f.interval(), 1000);
  assert.equal(f.images[1].src, "photo-1");
  assert.equal(f.images[2].src, undefined);
  f.tick();
  assert.equal(f.carousel.dataset.index, "0", "slow next photo must not replace current photo");
  f.images[1].resolve();
  await flush();
  assert.equal(f.images[5].src, "photo-5");
  f.tick();
  assert.equal(f.carousel.dataset.index, "1");
  for (const i of [5, 2, 3, 4]) { f.images[i].resolve(); await flush(); }
  for (let i = 0; i < 5; i++) f.tick();
  assert.equal(f.carousel.dataset.index, "0", "all six photos remain in the rotation");
});

test("manual navigation waits for decoding and the latest request wins", async () => {
  const f = fixture();
  f.images[0].resolve();
  await flush();
  f.dots[2].events.click();
  f.dots[4].events.click();
  f.images[2].resolve();
  await flush();
  assert.equal(f.carousel.dataset.index, "0");
  f.images[4].resolve();
  await flush();
  assert.equal(f.carousel.dataset.index, "4");
  f.previous.events.click();
  f.images[3].resolve();
  await flush();
  assert.equal(f.carousel.dataset.index, "3");
  f.next.events.click();
  await flush();
  assert.equal(f.carousel.dataset.index, "4");
});

test("a failed image is skipped without a blank frame or stopping background loading", async () => {
  const f = fixture();
  f.images[0].resolve(); await flush();
  f.images[1].reject(new Error("offline")); await flush();
  f.tick();
  assert.equal(f.carousel.dataset.index, "0");
  f.images[5].resolve(); await flush();
  f.images[2].resolve(); await flush();
  f.tick();
  assert.equal(f.carousel.dataset.index, "2");
});

test("keyboard focus and page visibility continue to pause playback", async () => {
  const f = fixture();
  for (const img of f.images) img.resolve();
  await flush();
  f.document.hidden = true;
  f.document.events.visibilitychange();
  f.tick();
  assert.equal(f.carousel.dataset.index, "0");
  f.document.hidden = false;
  f.document.activeElement = f.slides[0];
  f.carousel.events.keydown({ key: "ArrowRight", preventDefault() {} });
  await flush();
  assert.equal(f.document.activeElement, f.slides[1]);
  assert.equal(f.carousel.dataset.playing, "false");
});
