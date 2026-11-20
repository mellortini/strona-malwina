// Generator statycznej strony: node build.mjs  ->  dist/ (pl w katalogu głównym, /en/, /de/)
import { mkdirSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { T, media, contact, fleet, countries, pricing, refsAlt, certs, letters, extra } from './content.mjs';
const VER = Date.now().toString(36); // wersja plików – omija stary cache przeglądarki
const YEARS = new Date().getFullYear() - 2011; // lata na rynku – liczone automatycznie

const LANGS = ['pl', 'en', 'de'];
const LABEL = { pl: 'Polski', en: 'English', de: 'Deutsch' };

const ICON = {
  truck: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7zM6.5 19a1.8 1.8 0 100-3.6 1.8 1.8 0 000 3.6zM17.5 19a1.8 1.8 0 100-3.6 1.8 1.8 0 000 3.6z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  box: '<path d="M3 8l9-5 9 5v8l-9 5-9-5zM3 8l9 5 9-5M12 13v8"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  leaf: '<path d="M20 4C9 4 4 9 4 15c0 2 1 4 3 5 6 0 13-3 13-16zM4 20c3-5 6-8 10-10"/>',
  pulse: '<path d="M3 12h4l2-6 4 12 2-6h6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  doc: '<path d="M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  globe2: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  box2: '<path d="M4 7l8-4 8 4v10l-8 4-8-4zM4 7l8 4 8-4M12 11v10"/>',
  wrench: '<path d="M14.5 6.5a4 4 0 005 5L21 13l-8 8-3-3 8-8zM9 15l-6 6M3 21l3-3"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  fb: '<path d="M14 8h3V4h-3a4 4 0 00-4 4v2H7v4h3v6h4v-6h3l1-4h-4V8.5c0-.3.2-.5.5-.5z"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
};
const ic = (n, cls = '') =>
  `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]}</svg>`;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const num = (n) => String(n).replace('.', ',');

function langHref(from, to) {
  if (from === to) return '#';
  const up = from === 'pl' ? '' : '../';
  return to === 'pl' ? up || './' : `${up}${to}/`;
}

// ---------- Scena "ciężarówka w trasie" (animacja przewijania) ----------
function rng(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}
// Warstwy tła jako powtarzalne (bezszwowe) obrazki SVG w CSS
const bg = (svg) => `background-image:url(&quot;data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, '%27')}&quot;)`;
// Pagórki low poly: grzbiet z losowych punktów + trójkątne fasety, bezszwowo powtarzalne (szer. 3000)
// pal = [jasny, średni, ciemny, najciemniejszy]
function lowPolyHills({ seed, h, minY, maxY, step, pal, lights = 0 }) {
  const r = rng(seed), W = 3000, pts = [];
  for (let x = 0; x < W - step * 0.6; x += step * (0.7 + r() * 0.6)) pts.push([x, minY + r() * (maxY - minY)]);
  pts.push([W, pts[0][1]]); // ta sama wysokość na obu krawędziach = brak szwu
  const mid = [], n = pts.length;
  for (let i = 0; i < n - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
    const ridge = Math.max(y1, y2);
    mid.push([(x1 + x2) / 2 + (r() - 0.5) * step * 0.3, ridge + (h - ridge) * (0.35 + r() * 0.25)]);
  }
  const P = (p) => `${p[0].toFixed(0)},${p[1].toFixed(0)}`;
  const tri = (a, b, c, col) => `<polygon points="${P(a)} ${P(b)} ${P(c)}" fill="${col}" stroke="${col}" stroke-width="1"/>`;
  const pick = (i, j) => pal[Math.min(pal.length - 1, i + (r() > 0.5 ? j : 0))];
  let out = `<rect x="0" y="${Math.max(minY, maxY) - 1}" width="${W}" height="${h}" fill="${pal[3]}"/>`;
  // światło z lewej: zbocza opadające w prawo jaśniejsze
  for (let i = 0; i < n - 1; i++) {
    const A = pts[i], B = pts[i + 1], M = mid[i];
    out += tri(A, B, M, B[1] > A[1] ? pick(0, 1) : pick(1, 1));
    if (i < n - 2) out += tri(M, B, mid[i + 1], pick(1, 1));
    const Mb = [M[0], h];
    out += tri(A, M, [A[0], h], pick(2, 1)) + tri(A, [A[0], h], Mb, pal[3]);
    out += tri(M, B, [B[0], h], pick(2, 1)) + tri(M, [B[0], h], Mb, pick(2, 1));
  }
  for (let k = 0; k < lights; k++) {
    const i = Math.floor(r() * (n - 1)), M = mid[i];
    out += `<circle cx="${(M[0] + (r() - 0.5) * 40).toFixed(0)}" cy="${(M[1] + 6 + r() * 14).toFixed(0)}" r="1.8" fill="#ffd38a" opacity=".85"/>`;
  }
  return out;
}
// Daleki plan: wyższe, bledsze pagórki (nocą światełka wiosek)
function skyline(day = false) {
  const pal = day ? ['#a9c9c4', '#93b8b3', '#7fa6a3', '#6d9592'] : ['#21405f', '#1b3754', '#162f49', '#122840'];
  const hills = lowPolyHills({ seed: 7, h: 220, minY: 40, maxY: 140, step: 230, pal, lights: day ? 0 : 26 });
  return bg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3000 220" width="3000" height="220">${hills}</svg>`);
}
// Bliższy plan: niższe, ciemniejsze pagórki + latarnie przy drodze
function roadside(day = false) {
  const pal = day ? ['#79b26d', '#5f9d5b', '#4a8a4c', '#3c7841'] : ['#14304a', '#10283f', '#0c2135', '#0a1b2c'];
  const pole = day ? '#6b7682' : '#0a1a2b', lamp = day ? '#d5dbe1' : '#ffe3a3';
  let out = lowPolyHills({ seed: 42, h: 160, minY: 50, maxY: 120, step: 170, pal });
  for (let x = 120; x < 3000; x += 375)
    out += `<g transform="translate(${x} 160)"><rect x="-2" y="-120" width="4" height="120" fill="${pole}"/><path d="M0-120H22" stroke="${pole}" stroke-width="3"/>${day ? '' : '<circle cx="24" cy="-117" r="26" fill="#ffd27a" opacity=".12"/>'}<circle cx="24" cy="-117" r="5" fill="${lamp}"/></g>`;
  return bg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3000 160" width="3000" height="160">${out}</svg>`);
}
function truckSvg() {
  const wheel = (x) =>
    `<g transform="translate(${x} 190)"><g class="spin"><circle r="24" fill="#101418"/><circle r="21" fill="none" stroke="#252b31" stroke-width="2"/><circle r="14" fill="#c3ccd5"/><circle r="10" fill="#9aa5b0"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<circle cx="${(7 * Math.cos((i * Math.PI) / 4)).toFixed(1)}" cy="${(7 * Math.sin((i * Math.PI) / 4)).toFixed(1)}" r="1.4" fill="#4b5560"/>`).join('')}<path d="M0-13V-9" stroke="#5f6b78" stroke-width="2.5"/><circle r="3.5" fill="#3a434d"/></g></g>`;
  // Napis firmowy jak na pojazdach: "TRANSPORT · SPEDYCJA" + Growing (pomarańczowo-czerwony, kursywa) + eco
  const logo = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" font-family="Sora,Arial,sans-serif">
    <path d="M4-30Q30-44 70-38" stroke="#e5531f" stroke-width="4" fill="none" stroke-linecap="round"/>
    <text x="74" y="-34" font-size="8" font-weight="600" fill="#e5531f" letter-spacing="1">TRANSPORT · SPEDYCJA</text>
    <text x="0" y="0" font-size="40" font-weight="700" font-style="italic" fill="#e5531f" letter-spacing="-1">Growing</text>
    <text x="184" y="0" font-size="24" font-weight="600" fill="#4b5157">eco</text></g>`;
  // MAN TGX (kabina GX) z białą naczepą typu box – widok z boku, przodem w prawo
  return `<svg class="truck-svg" viewBox="0 0 760 222" aria-hidden="true">
  <defs><linearGradient id="beam" x1="0" x2="1"><stop offset="0" stop-color="#fff2c4" stop-opacity=".5"/><stop offset="1" stop-color="#fff2c4" stop-opacity="0"/></linearGradient>
  <linearGradient id="glass" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#4c7aa6"/><stop offset=".55" stop-color="#1c3550"/><stop offset="1" stop-color="#0f1c2b"/></linearGradient>
  <linearGradient id="tank" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#e9edf1"/><stop offset=".5" stop-color="#aab3bc"/><stop offset="1" stop-color="#6f7983"/></linearGradient>
  <linearGradient id="side" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e3e8ed"/></linearGradient></defs>
  <path class="beam" d="M738 170L1160 118V250L738 180Z" fill="url(#beam)"/>
  <ellipse cx="380" cy="214" rx="380" ry="7" fill="#000" opacity=".35"/>

  <!-- naczepa -->
  <rect x="10" y="18" width="568" height="146" rx="3" fill="url(#side)" stroke="#c7cfd8" stroke-width="1.5"/>
  <path d="M10 26H578" stroke="#d3dae2" stroke-width="2"/>
  ${Array.from({ length: 11 }, (_, i) => `<path d="M${60 + i * 48} 28V156" stroke="#e8ecf0" stroke-width="1.5"/>`).join('')}
  <rect x="10" y="156" width="568" height="10" fill="#c9d1d9"/>
  <rect x="30" y="166" width="548" height="9" fill="#1d2329"/>
  <rect x="12" y="140" width="5" height="12" rx="1" fill="#ff3b30"/>
  <rect x="12" y="166" width="22" height="6" fill="#2a3038"/>
  ${logo(170, 108, 1.55)}
  <rect x="52" y="172" width="176" height="7" rx="2" fill="#15191e"/>
  <path d="M232 176V206M228 176H238" stroke="#15191e" stroke-width="4"/>
  <path d="M244 182H440M244 194H440" stroke="#9aa5b0" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M458 175V204M452 205H466" stroke="#3a434d" stroke-width="5"/>

  <!-- ciągnik: rama, zbiornik, błotnik -->
  <rect x="470" y="172" width="250" height="12" fill="#1d2329"/>
  <path d="M486 190A34 34 0 0 1 554 190Z" fill="#15191e"/>
  <rect x="560" y="164" width="50" height="34" rx="9" fill="url(#tank)"/>
  <path d="M572 164V198M598 164V198" stroke="#5b6570" stroke-width="2"/>

  <!-- kabina MAN TGX GX -->
  <path d="M598 192V60Q598 34 624 31L708 28Q724 28 728 42L737 112Q740 122 740 134V188Q740 198 730 198H606Q598 198 598 192Z" fill="url(#side)" stroke="#c7cfd8" stroke-width="1.5"/>
  <path d="M606 34Q660 22 712 24" stroke="#dfe5eb" stroke-width="3" fill="none"/>
  <rect x="603" y="48" width="8" height="120" rx="2" fill="#1b1f24"/>
  <path d="M654 50H706Q713 50 715 58L723 106H654Z" fill="url(#glass)"/>
  <path d="M662 56H680L666 98H662Z" fill="#fff" opacity=".16"/>
  <path d="M650 48V176M650 176H712" stroke="#d3dae2" stroke-width="1.5" fill="none"/>
  <rect x="690" y="120" width="10" height="4" rx="2" fill="#2a3038"/>
  <path d="M724 66H731V112H724ZM719 108L727 118" stroke="#1b1f24" stroke-width="3" fill="#1b1f24"/>
  <path d="M735 124L740 130V170H733Z" fill="#1b1f24"/>
  <path d="M700 31L724 30Q731 31 733 40L734 48L716 46Q712 40 700 39Z" fill="#1b1f24"/>
  <rect x="730" y="171" width="10" height="8" rx="2" fill="#fff4bf"/>
  <rect x="704" y="191" width="36" height="7" rx="2" fill="#2a3038"/>
  ${logo(656, 152, 0.31)}
  <rect x="616" y="150" width="9" height="12" rx="1" fill="#f4a51c"/>
  <path d="M660 192A34 34 0 0 1 728 192Z" fill="#15191e"/>

  ${[86, 140, 194, 520, 694].map(wheel).join('')}
</svg>`;
}

function render(lang) {
  const t = T[lang];
  const A = lang === 'pl' ? 'assets/' : '../assets/';
  const hreflang = LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="https://growingeco.pl/${l === 'pl' ? '' : l + '/'}">`).join('\n');

  const statsHtml = t.stats
    .map((s) => `<div class="stat"><div class="stat-n"><span data-count="${s.n}" ${s.plain ? 'data-plain' : ''}>${s.n}</span>${s.s}</div><div class="stat-l">${s.l}</div></div>`)
    .join('');

  const svc = t.services.items
    .map(
      (s, i) => `<article class="card svc reveal" style="--d:${i * 80}ms">
        <div class="svc-ic">${ic(s.ic)}</div>
        <h3>${s.h}</h3><p>${s.p}</p>
        <ul class="tags">${s.tags.map((x) => `<li>${x}</li>`).join('')}</ul>
        <a class="link" href="#contact">${t.services.more} ${ic('arrow')}</a>
      </article>`,
    )
    .join('');

  const f = t.fleet;
  const fleetCards = fleet
    .map((v) => {
      const [name, note] = f.items[v.id];
      return `<article class="vcard reveal" data-kind="${v.own ? 'own' : 'fwd'}">
        <div class="vhead"><span class="badge ${v.own ? 'badge-own' : ''}">${v.own ? f.own : f.fwd}</span></div>
        <h3>${name}</h3><p class="vnote">${note}</p>
        <dl class="specs">
          <div><dt>${f.cap}</dt><dd>${lang === 'en' ? v.t : num(v.t)} <small>${f.units.t}</small></dd></div>
          <div><dt>${f.pal}</dt><dd>${v.pal}</dd></div>
          <div><dt>${f.vol}</dt><dd>${v.m3} <small>${f.units.m3}</small></dd></div>
        </dl>
        <div class="dim"><span>${f.dim}</span><b>${lang === 'en' ? v.dim.replace(/,/g, '.') : v.dim}</b></div>
      </article>`;
    })
    .join('');

  const perks = f.perks.map(([h, p]) => `<li><span class="tick">${ic('check')}</span><div><b>${h}</b><span>${p}</span></div></li>`).join('');

  const pillIc = ['clock', 'globe2', 'box2', 'shield'];
  const pillars = t.about.pillars
    .map(([h, p], i) => `<div class="pillar reveal" style="--d:${i * 70}ms">${ic(pillIc[i])}<h4>${h}</h4><p>${p}</p></div>`)
    .join('');

  const trkIc = ['pulse', 'mail', 'clock', 'doc'];
  const trk = t.tracking.items
    .map(([h, p], i) => `<li class="reveal" style="--d:${i * 70}ms"><span class="trk-ic">${ic(trkIc[i])}</span><div><b>${h}</b><span>${p}</span></div></li>`)
    .join('');

  const chips = countries.map((c) => `<span class="chip">${c}</span>`).join('');
  const ecoItems = t.eco.items.map(([a, b]) => `<div class="eco-i"><b>${a}</b><span>${b}</span></div>`).join('');
  const x = extra[lang];
  const refs = media.refs.map((u, i) => `<div class="logo"><img src="${u}" alt="${refsAlt[i]}" loading="lazy"></div>`).join('');
  const certCards = certs
    .map((c, i) => {
      const [h, p] = x.certs.items[c.id];
      return `<a class="cert reveal" style="--d:${i * 70}ms" href="${c.img}" target="_blank" rel="noopener"><div class="cert-img"><img src="${c.img}" alt="${h}" loading="lazy"></div><h3>${h}</h3><p>${p}</p></a>`;
    })
    .join('');
  const letterCards = letters
    .map((l) => `<a class="letter" href="${l.img}" target="_blank" rel="noopener" aria-label="${x.certs.letters}: ${l.who}"><img src="${l.img}" alt="${x.certs.letters}: ${l.who}" loading="lazy"><span>${l.who}</span></a>`)
    .join('');

  // cena w lokalnym formacie: "od 210 zł" / "from PLN 210" / "ab 210 PLN"
  const price = (p) => {
    const from = p.startsWith('od '), v = p.replace('od ', '').replace(' zł', '');
    if (lang === 'en') return `${from ? 'from ' : ''}PLN ${v}`;
    if (lang === 'de') return `${from ? 'ab ' : ''}${v} PLN`;
    return p;
  };
  const rows = (list) => list.map(([k, p]) => `<tr><th scope="row">${t.workshop.rows[k] || x.rows[k]}</th><td>${price(p)}</td></tr>`).join('');
  const li = (arr) => arr.map((x) => `<li>${ic('check')}<span>${x}</span></li>`).join('');
  const faq = t.faq.items.map(([q, a]) => `<details class="qa"><summary>${q}${ic('down')}</summary><p>${a}</p></details>`).join('');
  const team = contact.team
    .map((m) => `<li><span class="role">${t.contact.roles[m.k]}</span><a href="mailto:${m.mail}">${m.mail}</a><a href="tel:${m.tel.replace(/\s/g, '')}">${m.tel}</a></li>`)
    .join('');

  const langMenu = LANGS.map((l) => `<a href="${l === lang ? './' : langHref(lang, l)}" hreflang="${l}" lang="${l}" ${l === lang ? 'aria-current="true"' : ''}>${LABEL[l]}</a>`).join('');

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Growing Eco',
    legalName: x.legal,
    email: contact.mail,
    sameAs: [contact.fb],
    url: 'https://growingeco.pl/',
    telephone: contact.phone,
    foundingDate: '2011',
    address: { '@type': 'PostalAddress', streetAddress: 'Karsewo 17a', postalCode: '62-220', addressLocality: 'Niechanowo', addressCountry: 'PL' },
  };

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${esc(t.meta.title)}</title>
<meta name="description" content="${esc(t.meta.desc)}">
<meta property="og:title" content="${esc(t.meta.title)}">
<meta property="og:description" content="${esc(t.meta.desc)}">
<meta property="og:image" content="${media.hero}">
<meta name="theme-color" content="#0b1b2e">
${hreflang}
<link rel="alternate" hreflang="x-default" href="https://growingeco.pl/">
<link rel="icon" href="${media.logo}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Sora:wght@500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${A}style.css?v=${VER}">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
<a class="skip" href="#main">${x.skip}</a>

<header class="nav" id="nav">
  <div class="wrap nav-in">
    <a class="brand" href="#top" aria-label="Growing Eco"><img src="${media.logoWhite}" alt="Growing Eco" height="38"></a>
    <nav class="menu" id="menu" aria-label="Main">
      <a href="#services">${t.nav.services}</a><a href="#fleet">${t.nav.fleet}</a><a href="#about">${t.nav.about}</a>
      <a href="#eco">${t.nav.eco}</a><a href="#workshop">${t.nav.workshop}</a><a href="#careers">${t.nav.careers}</a>
      <a href="#faq">${t.nav.faq}</a><a href="#contact">${t.nav.contact}</a>
    </nav>
    <div class="nav-r">
      <div class="lang"><button class="lang-b" aria-haspopup="true" aria-expanded="false">${ic('globe')}<span>${lang.toUpperCase()}</span>${ic('down')}</button><div class="lang-m">${langMenu}</div></div>
      <a class="btn btn-sm btn-pri hide-s" href="#contact">${t.nav.cta}</a>
      <button class="burger" aria-label="${t.nav.menu}" aria-controls="menu" aria-expanded="false">${ic('menu')}</button>
    </div>
  </div>
</header>

<main id="main">
<section class="hero" id="top">
  <div class="scene" aria-hidden="true">
    <div class="stars"></div>
    <div class="layer far" style="${skyline()}"></div>
    <div class="layer mid" style="${roadside()}"></div>
    <div class="road"><div class="lane"></div></div>
    <div class="truck">${truckSvg()}</div>
  </div>
  <div class="wrap hero-in">
    <p class="eyebrow">${t.hero.eyebrow}</p>
    <h1>${t.hero.h1}</h1>
    <p class="lead">${t.hero.lead}</p>
    <div class="cta-row">
      <a class="btn btn-pri" href="#contact">${t.hero.cta1} ${ic('arrow')}</a>
      <a class="btn btn-ghost" href="#services">${t.hero.cta2}</a>
    </div>
    <ul class="hero-badges"><li>${ic('shield')}${t.hero.badge1}</li><li>${ic('leaf')}EURO 6</li><li>${ic('check')}${t.hero.badge2}</li></ul>
  </div>
</section>
<div class="stats-band"><div class="wrap"><div class="stats">${statsHtml}</div></div></div>

<section class="sec" id="services">
  <div class="wrap">
    <header class="sec-h reveal"><p class="eyebrow dark">${t.services.eyebrow}</p><h2>${t.services.h2}</h2><p class="lead dark">${t.services.lead}</p></header>
    <div class="grid3">${svc}</div>
  </div>
</section>

<section class="sec alt" id="fleet">
  <div class="wrap">
    <header class="sec-h reveal"><p class="eyebrow dark">${f.eyebrow}</p><h2>${f.h2}</h2><p class="lead dark">${f.lead}</p></header>
    <ul class="perks reveal">${perks}</ul>
    <div class="filters" role="tablist">
      <button class="fbtn on" data-f="all">${f.filterAll}</button><button class="fbtn" data-f="own">${f.filterOwn}</button><button class="fbtn" data-f="fwd">${f.filterFwd}</button>
    </div>
    <div class="fleet-grid">${fleetCards}</div>
  </div>
</section>

<section class="sec" id="about">
  <div class="wrap split">
    <div class="split-img reveal"><img src="${media.about}" alt="Growing Eco – MAN TGX" loading="lazy"><div class="award">${ic('check')}<span>${t.about.award}</span></div></div>
    <div class="reveal">
      <p class="eyebrow dark">${t.about.eyebrow}</p><h2>${t.about.h2}</h2>
      <p>${t.about.p1}</p><p>${t.about.p2}</p>
      <blockquote>${t.about.mission}</blockquote>
      <ul class="values">${t.about.values.map((v) => `<li>${v}</li>`).join('')}</ul>
    </div>
  </div>
  <div class="wrap"><div class="pillars">${pillars}</div></div>
</section>

<section class="sec alt" id="certs">
  <div class="wrap">
    <header class="sec-h reveal"><p class="eyebrow dark">${x.certs.eyebrow}</p><h2>${x.certs.h2}</h2><p class="lead dark">${x.certs.lead}</p></header>
    <div class="certs">${certCards}</div>
    <h3 class="letters-h reveal">${x.certs.letters}</h3>
    <div class="letters reveal">${letterCards}</div>
  </div>
</section>

<section class="sec dark-sec" id="tracking">
  <div class="wrap split">
    <div class="reveal">
      <p class="eyebrow">${t.tracking.eyebrow}</p><h2>${t.tracking.h2}</h2><p class="lead">${t.tracking.lead}</p>
      <ul class="trk">${trk}</ul>
    </div>
    <div class="routes reveal">
      <h3>${t.tracking.routes}</h3>
      <div class="chips">${chips}</div>
      <p>${t.tracking.routesNote}</p>
    </div>
  </div>
</section>

<section class="eco" id="eco">
  <div class="wrap eco-in reveal">
    <div>${ic('leaf', 'eco-leaf')}<p class="eyebrow">${t.eco.eyebrow}</p><h2>${t.eco.h2}</h2><p>${t.eco.p}</p></div>
    <div class="eco-list">${ecoItems}</div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <header class="sec-h center reveal"><p class="eyebrow dark">${t.clients.eyebrow}</p><h2>${t.clients.h2}</h2><p class="lead dark">${t.clients.lead}</p></header>
    <div class="logos reveal">${refs}</div>
  </div>
</section>

<section class="sec alt" id="workshop">
  <div class="wrap">
    <header class="sec-h reveal"><p class="eyebrow dark">${t.workshop.eyebrow}</p><h2>${t.workshop.h2}</h2><p class="lead dark">${t.workshop.lead}</p>
      <a class="btn btn-pri" href="https://growingeco.pl/wp-booking-calendar/" target="_blank" rel="noopener">${ic('wrench')} ${t.workshop.cta}</a></header>
    <div class="grid2">
      <div class="card price reveal"><h3>${t.workshop.service}</h3><table>${rows(pricing.service)}</table></div>
      <div class="card price reveal"><h3>${t.workshop.tyres}</h3><table>${rows(pricing.tyres)}</table></div>
      <div class="card price reveal"><h3>${x.ws.swap}</h3><table>${rows(pricing.swap)}</table></div>
      <div class="card price reveal"><h3>${x.ws.other}</h3><table>${rows(pricing.other)}</table></div>
    </div>
    <p class="note">${t.workshop.note} ${x.ws.booking}</p>
  </div>
</section>

<section class="sec" id="careers">
  <div class="wrap">
    <header class="sec-h reveal"><p class="eyebrow dark">${t.careers.eyebrow}</p><h2>${t.careers.h2}</h2><p class="lead dark">${t.careers.lead}</p></header>
    <div class="grid2">
      <article class="card job reveal">
        <h3>${t.careers.driver.h}</h3><p>${t.careers.driver.p}</p>
        <ul class="ticks">${li(t.careers.driver.points)}</ul>
        <a class="btn btn-pri" href="tel:${contact.phoneHref}">${ic('phone')} ${t.careers.driver.cta}</a>
      </article>
      <article class="card job reveal">
        <h3>${t.careers.carrier.h}</h3><p>${t.careers.carrier.p}</p>
        <ul class="ticks">${li(t.careers.carrier.points)}</ul>
        <div class="mini-contacts">
          <div><span>${t.careers.carrier.domestic}</span><a href="mailto:s.kozanecki@growingeco.pl">s.kozanecki@growingeco.pl</a><a href="tel:+48731091399">+48 731 091 399</a></div>
          <div><span>${t.careers.carrier.europe}</span><a href="mailto:s.maczak@growingeco.eu">s.maczak@growingeco.eu</a><a href="tel:+48669222417">+48 669 222 417</a></div>
        </div>
      </article>
    </div>
  </div>
</section>

<section class="sec alt" id="faq">
  <div class="wrap narrow">
    <header class="sec-h center reveal"><p class="eyebrow dark">${t.faq.eyebrow}</p><h2>${t.faq.h2}</h2></header>
    <div class="faq reveal">${faq}</div>
  </div>
</section>

<section class="sec contact" id="contact">
  <div class="wrap split top">
    <div class="reveal">
      <p class="eyebrow">${t.contact.eyebrow}</p><h2>${t.contact.h2}</h2><p class="lead">${t.contact.lead}</p>
      <ul class="cinfo">
        <li>${ic('phone')}<div><span>${lang === 'de' ? 'Telefon' : 'Tel.'}</span><a href="tel:${contact.phoneHref}">${contact.phone}</a></div></li>
        <li>${ic('pin')}<div><span>${t.contact.hq}</span><a href="https://maps.google.com/?q=${encodeURIComponent(contact.address)}" target="_blank" rel="noopener">${contact.address}</a></div></li>
        <li>${ic('mail')}<div><span>E-mail</span><a href="mailto:${contact.mail}">${contact.mail}</a></div></li>
        <li class="urgent">${ic('clock')}<div><span>${t.contact.urgent}</span><a href="tel:${contact.urgentHref}">${contact.urgent}</a> · <a href="mailto:${contact.orders}">${contact.orders}</a></div></li>
      </ul>
      <h3 class="team-h">${t.contact.team}</h3>
      <ul class="team">${team}</ul>
    </div>
    <form class="card form reveal" id="form" data-to="${contact.team[0].mail}" data-ok="${esc(t.contact.form.ok)}" novalidate>
      <label>${t.contact.form.name}<input name="name" required autocomplete="name"></label>
      <label>${t.contact.form.contact}<input name="contact" required autocomplete="email"></label>
      <label>${t.contact.form.msg}<textarea name="msg" rows="4"></textarea></label>
      <label class="consent"><input type="checkbox" required><span>${t.contact.form.consent} <a href="${contact.privacy}" target="_blank" rel="noopener">${t.contact.form.policy}</a>.</span></label>
      <button class="btn btn-pri" type="submit">${t.contact.form.send} ${ic('arrow')}</button>
      <p class="form-ok" role="status" hidden></p>
    </form>
  </div>
</section>
</main>

<footer class="foot">
  <div class="wrap foot-in">
    <div><img src="${media.logoWhite}" alt="Growing Eco" height="34"><p>${t.footer.tag}</p></div>
    <nav aria-label="Footer"><a href="${contact.privacy}">${t.footer.privacy}</a><a href="#certs">${t.footer.cert}</a><a href="#eu">${t.footer.euh}</a><a href="${t.footer.whistleHref}">${t.footer.whistle} 2025</a><a href="https://growingeco.pl/firma/procedura-zgloszen-wewnetrznych/">${t.footer.whistle} 2024</a><a href="${contact.fb}" target="_blank" rel="noopener">Facebook</a></nav>
  </div>
  <div class="wrap eu" id="eu"><img src="${media.eu}" alt="${x.eu.h}" loading="lazy"><div><b>${x.eu.h}</b><p>${x.eu.text}</p></div></div>
  <div class="wrap foot-b">© 2011–${new Date().getFullYear()} ${x.legal} · ${contact.address}. ${t.footer.rights}</div>
</footer>
<script src="${A}app.js?v=${VER}" defer></script>
</body>
</html>`;
}

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist/assets', { recursive: true });
cpSync('assets', 'dist/assets', { recursive: true });
for (const l of LANGS) {
  const dir = l === 'pl' ? 'dist' : `dist/${l}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/index.html`, render(l).replace(/\{years\}/g, YEARS));
}
console.log('OK -> dist/ (pl, en, de)');
