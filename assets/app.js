(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Nawigacja: cień po przewinięciu, menu mobilne, język
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('solid', scrollY > 24);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  const burger = $('.burger');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('#menu a').forEach((a) => a.addEventListener('click', () => { nav.classList.remove('open'); burger.setAttribute('aria-expanded', false); }));

  const lang = $('.lang'), lb = $('.lang-b');
  lb.addEventListener('click', (e) => { e.stopPropagation(); lb.setAttribute('aria-expanded', lang.classList.toggle('open')); });
  document.addEventListener('click', () => { lang.classList.remove('open'); lb.setAttribute('aria-expanded', false); });

  // Animacje wejścia
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
  $$('.reveal').forEach((el) => (reduce ? el.classList.add('in') : io.observe(el)));

  // Ciężarówka sterowana przewijaniem
  // Tło hero: droga płynie sama, a przewijanie pcha ciężarówkę w prawo
  const hero = $('.hero');
  const scene = hero && $('.scene', hero);
  if (scene) {
    const truck = $('.truck', scene), far = $('.far', scene), mid = $('.mid', scene), lane = $('.lane', scene);
    const spins = $$('.spin', scene);
    const IDLE = 90;   // px/s – prędkość "jazdy" bez przewijania
    const PUSH = 1.25; // ile szerokości ekranu przejedzie tir przy przewinięciu całego hero
    let p = 0, shown = 0, t0 = performance.now(), visible = true;

    const frame = (now) => {
      if (!visible) return;
      const vw = innerWidth, W = truck.offsetWidth;
      if (!W) { requestAnimationFrame(frame); return; } // jeszcze nie wyrenderowana – unikamy dzielenia przez 0
      shown += (p - shown) * 0.12; // płynne doganianie pozycji przewijania
      const start = vw > 940 ? 0.5 : 0.03; // desktop: start po prawej obok tekstu
      const x = vw * start + shown * PUSH * vw;
      const dist = ((now - t0) / 1000) * IDLE + shown * 2200;
      truck.style.transform = `translate3d(${x.toFixed(1)}px, ${(Math.sin(dist * 0.09) * 0.8).toFixed(2)}px, 0)`;
      const deg = ((dist + x) / (2 * Math.PI * ((24 * W) / 760))) * 360;
      spins.forEach((s) => s.setAttribute('transform', `rotate(${(deg % 360).toFixed(1)})`));
      far.style.backgroundPosition = `${(-dist * 0.08).toFixed(1)}px 100%`;
      mid.style.backgroundPosition = `${(-dist * 0.35).toFixed(1)}px 100%`;
      lane.style.backgroundPosition = `${(-dist).toFixed(0)}px 0`;
      requestAnimationFrame(frame);
    };
    const onScroll = () => { p = Math.min(1, Math.max(0, scrollY / hero.offsetHeight)); };

    if (reduce) {
      truck.style.transform = `translateX(${innerWidth * (innerWidth > 940 ? 0.5 : 0.1)}px)`;
    } else {
      onScroll();
      shown = p;
      addEventListener('scroll', onScroll, { passive: true });
      new IntersectionObserver(([e]) => { const was = visible; visible = e.isIntersecting; if (visible && !was) requestAnimationFrame(frame); }).observe(hero);
      requestAnimationFrame(frame);
    }
  }

  // Liczniki
  const co = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    co.unobserve(e.target);
    const el = e.target, end = +el.dataset.count;
    if (reduce || el.hasAttribute('data-plain')) return;
    const t0 = performance.now(), d = 1400;
    const step = (t) => { const p = Math.min((t - t0) / d, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach((el) => co.observe(el));

  // Filtr floty
  $$('.fbtn').forEach((b) => b.addEventListener('click', () => {
    $$('.fbtn').forEach((x) => x.classList.toggle('on', x === b));
    $$('.vcard').forEach((c) => (c.hidden = b.dataset.f !== 'all' && c.dataset.kind !== b.dataset.f));
  }));

  // Formularz – wersja demonstracyjna (mailto). W produkcji podłącz backend / Formspree itp.
  const form = $('#form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const d = new FormData(form);
    const body = `${d.get('msg') || ''}\n\n${d.get('name')}\n${d.get('contact')}`;
    location.href = `mailto:${form.dataset.to}?subject=${encodeURIComponent('Zapytanie / Enquiry – growingeco.pl')}&body=${encodeURIComponent(body)}`;
    const ok = $('.form-ok', form); ok.textContent = form.dataset.ok; ok.hidden = false;
  });
})();
