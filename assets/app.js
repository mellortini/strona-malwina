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
    // Tir jedzie zawsze do przodu (w prawo), a na samej górze strony zawsze stoi w pozycji startowej.
    // X = pozycja "rozwinięta" (rośnie bez końca); na ekranie zawijana: za prawą krawędzią -> zza lewej.
    let p = 0, X = 0, shownX = 0, t0 = performance.now(), visible = true;
    let mode = 1, anchorP = 0, anchorX = 0, upDist = 0; // mode: 1 = w dół, -1 = w górę
    const mod = (a, n) => ((a % n) + n) % n;
    // szerokość jednego kafla tła w px (SVG 3000x220 i 3000x160 skalowane do wysokości warstwy)
    const tiles = { far: 1, mid: 1 };
    const measure = () => {
      tiles.far = Math.max(1, far.offsetHeight * 3000 / 220);
      tiles.mid = Math.max(1, mid.offsetHeight * 3000 / 160);
      far.style.width = `${Math.ceil(innerWidth + tiles.far)}px`;
      mid.style.width = `${Math.ceil(innerWidth + tiles.mid)}px`;
    };
    measure();
    addEventListener('resize', measure);
    const geom = () => {
      const vw = innerWidth, W = truck.offsetWidth || 1;
      return { vw, W, span: vw + W, startX: vw * (vw > 940 ? 0.5 : 0.03) }; // desktop: start po prawej obok tekstu
    };
    const targetX = (np) => {
      const { vw, span, startX } = geom();
      if (mode === 1) return anchorX + (np - anchorP) * PUSH * vw;
      // w górę: dojedź do przodu dokładnie do pozycji startowej, gdy np = 0
      return anchorX + ((anchorP - np) / anchorP) * upDist;
    };

    const frame = (now) => {
      if (!visible) return;
      const { W, span } = geom();
      if (W <= 1) { requestAnimationFrame(frame); return; } // jeszcze nie wyrenderowana
      shownX += (X - shownX) * 0.12; // płynne doganianie
      const x = mod(shownX + W, span) - W;
      const dist = ((now - t0) / 1000) * IDLE + shownX * 0.28; // wolniej przy przewijaniu = brak migotania pasów
      truck.style.transform = `translate3d(${x.toFixed(1)}px, ${(Math.sin(dist * 0.09) * 0.8).toFixed(2)}px, 0)`;
      const deg = ((dist + x) / (2 * Math.PI * ((24 * W) / 760))) * 360;
      spins.forEach((s) => s.setAttribute('transform', `rotate(${(deg % 360).toFixed(1)})`));
      // przesuw przez transform (GPU) zamiast background-position (przemalowanie co klatkę)
      far.style.transform = `translate3d(${(-(dist * 0.08) % tiles.far).toFixed(1)}px,0,0)`;
      mid.style.transform = `translate3d(${(-(dist * 0.35) % tiles.mid).toFixed(1)}px,0,0)`;
      lane.style.transform = `translate3d(${(-dist % 200).toFixed(1)}px,0,0)`;
      requestAnimationFrame(frame);
    };
    const onScroll = () => {
      const np = Math.min(1, Math.max(0, scrollY / hero.offsetHeight));
      if (np === p) return;
      const dir = np > p ? 1 : -1;
      if (dir !== mode) {
        // zmiana kierunku przewijania: nowy punkt odniesienia
        mode = dir; anchorP = p; anchorX = X;
        if (mode === -1) {
          const { span, startX } = geom();
          upDist = mod(startX - anchorX, span);
          if (upDist < span * 0.25) upDist += span; // za blisko – zrób pełne okrążenie, by nie pełzał
        }
      }
      X = targetX(np);
      if (np === 0) { X = anchorX + (mode === -1 ? upDist : 0); mode = 1; anchorP = 0; anchorX = X; } // góra = start
      p = np;
    };

    if (reduce) {
      truck.style.transform = `translateX(${innerWidth * (innerWidth > 940 ? 0.5 : 0.1)}px)`;
    } else {
      p = Math.min(1, Math.max(0, scrollY / hero.offsetHeight));
      anchorX = geom().startX; anchorP = 0;
      X = shownX = anchorX + p * PUSH * innerWidth;
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
