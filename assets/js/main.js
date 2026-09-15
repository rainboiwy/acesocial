// ---- EDIT THIS: your projects ----
const projects = [
  { name: 'Nítido',         tag: 'Café · Brand website',             hue: '#D9B48F', video: 'assets/videos/nitido.mp4',      poster: 'assets/images/posters/nitido.jpg' },
  { name: 'Flor de Gràcia', tag: 'Bakery · Website',                 hue: '#E3A94F', video: 'assets/videos/pastry.mp4',      poster: 'assets/images/posters/pastry.jpg' },
  { name: 'Ramen Casolans', tag: 'Ramen bar · Website in ES/CA/EN',  hue: '#D2452F', video: 'assets/videos/ramen.mp4',       poster: 'assets/images/posters/ramen.jpg' },
  { name: 'Sancmart',       tag: 'Renovation studio · Website',      hue: '#BFB3A3', video: 'assets/videos/reformas.mp4',    poster: 'assets/images/posters/reformas.jpg' },
  { name: 'BS Tecnología',  tag: 'Phone repair · Website',           hue: '#5B8CFF', video: 'assets/videos/electronics.mp4', poster: 'assets/images/posters/electronics.jpg' },
];
// ---- END EDIT ----

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const canHover = matchMedia('(hover: hover)').matches;

/* header pill */
const header = $('#siteHeader');
const onScroll = () => header.classList.toggle('scrolled', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* hero intro once fonts are in (or after 1.2s, whichever first) */
Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1200))])
  .then(() => {
    document.body.offsetWidth; // flush styles so the intro transition always runs
    document.documentElement.classList.add('ready');
  });

/* marquee: duplicate content for a seamless loop */
$$('.tape-track').forEach(t => t.append(...[...t.children].map(n => n.cloneNode(true))));

/* manifesto: words light up as you scroll */
const mt = $('[data-words]');
if (mt) {
  const words = [];
  [...mt.childNodes].forEach(n => {
    if (n.nodeType !== Node.TEXT_NODE) { n.classList.add('w'); words.push(n); return; }
    const frag = document.createDocumentFragment();
    n.textContent.split(/(\s+)/).forEach(s => {
      if (!s.trim()) return frag.append(s);
      const w = document.createElement('span');
      w.className = 'w';
      w.textContent = s;
      words.push(w);
      frag.append(w);
    });
    n.replaceWith(frag);
  });
  const light = () => {
    const r = mt.getBoundingClientRect();
    const p = (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35);
    const lit = Math.round(Math.min(1, Math.max(0, p)) * words.length);
    words.forEach((w, i) => w.classList.toggle('on', i < lit));
  };
  addEventListener('scroll', light, { passive: true });
  light();
}

/* ace card: 3D tilt + holo follows the pointer */
const ace = $('#aceCard');
if (ace && canHover) {
  const hero = $('.hero');
  const clamp = v => Math.max(-1, Math.min(1, v));
  hero.addEventListener('pointermove', e => {
    const r = ace.getBoundingClientRect();
    const cx = clamp((e.clientX - r.left - r.width / 2) / (innerWidth / 3));
    const cy = clamp((e.clientY - r.top - r.height / 2) / (innerHeight / 3));
    ace.style.setProperty('--rx', `${-cy * 14}deg`);
    ace.style.setProperty('--ry', `${cx * 18}deg`);
    ace.style.setProperty('--mx', `${50 + cx * 50}%`);
    ace.style.setProperty('--my', `${50 + cy * 50}%`);
    ace.style.setProperty('--gx', `${50 + cx * 50}%`);
    ace.style.setProperty('--gy', `${50 + cy * 50}%`);
  });
  hero.addEventListener('pointerleave', () =>
    ['--rx', '--ry', '--mx', '--my', '--gx', '--gy'].forEach(p => ace.style.removeProperty(p)));
}

/* spotlight on service cards */
document.addEventListener('pointermove', e => {
  const c = e.target.closest?.('.spot');
  if (!c) return;
  const r = c.getBoundingClientRect();
  c.style.setProperty('--x', `${e.clientX - r.left}px`);
  c.style.setProperty('--y', `${e.clientY - r.top}px`);
});

/* magnetic buttons */
if (canHover) {
  $$('.magnetic').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
}

/* ---------- portfolio stack ---------- */
const stack = $('#stack');
const indexList = $('#workIndex');
const player = $('#player');
const playerVideo = $('#playerVideo');
const wide = matchMedia('(min-width: 900px)');
const cards = [];
const rows = [];
let hovered = null;

function layout() {
  if (!wide.matches) {
    cards.forEach(c => { c.style.top = ''; c.style.zIndex = ''; });
    stack.style.height = '';
    return;
  }
  const cardH = cards[0].offsetHeight;
  const peek = cardH * 0.25; // how much of each card peeks out
  const lift = 40;           // how far lower cards slide down on hover
  cards.forEach((el, idx) => {
    let top = 14 + idx * peek;
    if (hovered !== null) {
      if (idx === hovered) top -= 14;
      else if (idx > hovered) top += lift;
    }
    el.style.top = `${top}px`;
    el.style.zIndex = idx === hovered ? 20 : idx;
  });
  stack.style.height = `${14 + (cards.length - 1) * peek + cardH + lift}px`;
}

function setHover(i) {
  if (i === hovered) return;
  hovered = i;
  layout();
  cards.forEach((c, idx) => {
    c.classList.toggle('is-hovered', idx === i);
    if (!canHover) return;
    const v = $('video', c);
    if (idx === i) v.play().catch(() => {});
    else v.pause();
  });
  rows.forEach((r, idx) => r.classList.toggle('active', idx === i));
}

function openPlayer(p) {
  cards.forEach(c => $('video', c).pause());
  $('#playerTitle').textContent = p.name;
  $('#playerTag').textContent = p.tag;
  playerVideo.poster = p.poster;
  playerVideo.src = p.video;
  player.showModal();
  playerVideo.play().catch(() => {});
}

projects.forEach((p, i) => {
  const n = String(i + 1).padStart(2, '0');

  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'card';
  card.setAttribute('aria-label', `Watch the ${p.name} project video`);
  card.innerHTML = `
    <span class="card-tint" style="background:linear-gradient(160deg, ${p.hue}59, transparent 55%)"></span>
    <span class="card-head">
      <span><span class="card-title">${p.name}</span><span class="card-tag">${p.tag}</span></span>
      <span class="card-num">${n}<span class="card-arrow">↗</span></span>
    </span>
    <span class="card-preview">
      <video src="${p.video}" poster="${p.poster}" muted loop playsinline preload="none" disablepictureinpicture></video>
      <span class="card-play">▶ Watch full</span>
    </span>`;
  card.addEventListener('mouseenter', () => setHover(i));
  card.addEventListener('focus', () => setHover(i));
  card.addEventListener('click', () => openPlayer(p));
  stack.append(card);
  cards.push(card);

  const li = document.createElement('li');
  li.innerHTML = `<button type="button"><span class="n">${n}</span><span class="t">${p.name}</span><span class="g">${p.tag.split(' · ')[0]}</span></button>`;
  const row = li.firstElementChild;
  row.addEventListener('mouseenter', () => setHover(i));
  row.addEventListener('focus', () => setHover(i));
  row.addEventListener('click', () => openPlayer(p));
  indexList.append(li);
  rows.push(row);
});

stack.addEventListener('mouseleave', () => setHover(null));
indexList.addEventListener('mouseleave', () => setHover(null));
addEventListener('resize', layout);
wide.addEventListener('change', layout);
$$('video', stack)[0].addEventListener('loadedmetadata', layout, { once: true });
layout();

/* touch screens: play whichever card is on screen */
if (!canHover) {
  const vio = new IntersectionObserver(entries => entries.forEach(e => {
    const v = $('video', e.target);
    if (e.isIntersecting && !player.open) v.play().catch(() => {});
    else v.pause();
  }), { threshold: 0.6 });
  cards.forEach(c => vio.observe(c));
}

player.addEventListener('close', () => {
  playerVideo.pause();
  playerVideo.removeAttribute('src');
  playerVideo.load();
});
player.addEventListener('click', e => { if (e.target === player) player.close(); });

/* reveal on scroll */
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  io.unobserve(e.target);
}), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
$$('.reveal').forEach(el => io.observe(el));

/* copy email */
$$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
  const state = $('.copy-state', b);
  try {
    await navigator.clipboard.writeText(b.dataset.copy);
    state.textContent = 'Copied ✓';
  } catch {
    location.href = `mailto:${b.dataset.copy}`;
    return;
  }
  setTimeout(() => { state.textContent = 'Copy'; }, 1800);
}));

/* Barcelona local time */
const clock = $('#bcnTime');
if (clock) {
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' });
  const tick = () => { clock.textContent = fmt.format(new Date()); };
  tick();
  setInterval(tick, 15000);
}
