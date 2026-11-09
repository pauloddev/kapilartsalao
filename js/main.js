(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* Intro: pular com clique/toque e remover do DOM ao terminar */
  const intro = $('#intro');
  if (intro) {
    const done = () => intro.remove();
    intro.addEventListener('animationend', e => { if (e.animationName === 'introOut') done(); });
    intro.addEventListener('click', () => intro.classList.add('is-skip'));
    setTimeout(() => intro.isConnected && done(), 4200);
  }

  /* Header sólido ao rolar + WhatsApp flutuante */
  const header = $('.header');
  const wa = $('.wa-float');
  const onScroll = () => {
    const y = scrollY;
    header && header.classList.toggle('is-solid', y > 40);
    wa && wa.classList.toggle('is-visible', y > 600);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Menu mobile */
  const toggle = $('.menu-toggle');
  const menu = $('#mobile-menu');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    toggle && toggle.setAttribute('aria-expanded', String(open));
    menu && menu.setAttribute('aria-hidden', String(!open));
  };
  toggle && toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  menu && $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* Link ativo no menu */
  const navLinks = $$('.nav a[href^="#"]');
  if (navLinks.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(a => { const s = $(a.getAttribute('href')); s && io.observe(s); });
  }

  /* Reveal */
  const reveals = $$('.reveal, .reveal-img');
  if ('IntersectionObserver' in window && !reduce) {
    document.documentElement.classList.add('js-anim');
    // segurança: se algo não disparar, mostra tudo
    setTimeout(() => reveals.forEach(el => el.classList.add('is-in')), 2500);
    const ro = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); ro.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    reveals.forEach(el => ro.observe(el));
  } else reveals.forEach(el => el.classList.add('is-in'));

  /* Vídeos: tocar só quando visíveis */
  const lazyVideos = $$('video');
  if ('IntersectionObserver' in window) {
    const vo = new IntersectionObserver(entries => {
      entries.forEach(en => {
        const v = en.target;
        if (v.closest('.reel-card')) return; // controlado pelo carrossel
        if (en.isIntersecting) { v.play().catch(() => {}); } else v.pause();
      });
    }, { threshold: 0.25 });
    lazyVideos.forEach(v => vo.observe(v));
  }

  /* Botões de som */
  const bindSound = (btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const v = document.getElementById(btn.dataset.video) || btn.closest('.media').querySelector('video');
      if (!v) return;
      v.muted = !v.muted;
      if (!v.muted) v.play().catch(() => {});
      btn.innerHTML = `<svg><use href="#i-sound-${v.muted ? 'off' : 'on'}"/></svg>`;
      btn.setAttribute('aria-label', v.muted ? 'Ativar som' : 'Desativar som');
    });
  };
  $$('.sound-btn').forEach(bindSound);

  /* ---------- Carrossel de vídeos (destaque central) ---------- */
  const reelTrack = $('#reelTrack');
  if (reelTrack) {
    const vids = [
      ['v9', 'Loiro com ondas'], ['v3', 'Iluminado dourado'], ['v1', 'Finalização loiro'], ['v2', 'Antes e depois'],
      ['v14', 'Mechas • processo'], ['v17', 'Platinado & trança'], ['v15', 'Castanho iluminado'], ['v7', 'Corte & iluminação'],
      ['v5', 'Mechas no espelho'], ['v10', 'Corte curto'], ['v11', 'Tratamento'], ['v13', 'Penteado & make'], ['v6', 'Penteado semipreso']
    ];
    reelTrack.innerHTML = vids.map(([id, label], i) => `
      <div class="reel-card" data-i="${i}" role="group" aria-label="Vídeo ${i + 1} de ${vids.length}: ${label}">
        <div class="media">
          <video data-src="videos/${id}.mp4" poster="videos/posters/${id}.jpg" muted loop playsinline preload="none"></video>
          <button class="sound-btn" aria-label="Ativar som"><svg><use href="#i-sound-off"/></svg></button>
        </div>
        <span class="play-hint">${label}</span>
      </div>`).join('');
    const cards = $$('.reel-card', reelTrack);
    cards.forEach(c => bindSound($('.sound-btn', c)));
    const viewport = $('.reel-viewport');
    const counter = $('#reelCounter');
    let idx = 0, visible = false;

    const go = (n) => {
      idx = (n + cards.length) % cards.length;
      cards.forEach((c, i) => {
        const v = $('video', c);
        const active = i === idx;
        c.classList.toggle('is-active', active);
        if (active) {
          if (!v.src) v.src = v.dataset.src;
          if (visible) v.play().catch(() => {});
        } else {
          v.pause(); v.muted = true;
          const b = $('.sound-btn', c); b.innerHTML = '<svg><use href="#i-sound-off"/></svg>';
        }
      });
      const card = cards[idx];
      const offset = viewport.clientWidth / 2 - (card.offsetLeft + card.offsetWidth / 2);
      reelTrack.style.transform = `translateX(${offset}px)`;
      counter.innerHTML = `<span>${String(idx + 1).padStart(2, '0')}</span> / ${String(cards.length).padStart(2, '0')}`;
    };
    $('#reelPrev').addEventListener('click', () => go(idx - 1));
    $('#reelNext').addEventListener('click', () => go(idx + 1));
    cards.forEach((c, i) => c.addEventListener('click', () => { if (i !== idx) go(i); }));
    // swipe
    let sx = null;
    viewport.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    viewport.addEventListener('touchend', e => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
      sx = null;
    });
    // pausa fora da tela
    new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      const v = $('video', cards[idx]);
      if (visible) v.play().catch(() => {}); else v.pause();
    }, { threshold: 0.2 }).observe(viewport);
    addEventListener('resize', () => go(idx));
    go(Math.floor(cards.length / 2));
  }

  /* ---------- Carrosséis horizontais (serviços / galeria) ---------- */
  const scroller = (trackSel, prevSel, nextSel, barSel) => {
    const track = $(trackSel); if (!track) return;
    const bar = $(barSel);
    const step = () => {
      const first = track.firstElementChild;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 20;
      return first ? first.getBoundingClientRect().width + gap : 300;
    };
    $(prevSel).addEventListener('click', () => {
      if (track.scrollLeft <= 4) track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
      else track.scrollBy({ left: -step(), behavior: 'smooth' });
    });
    $(nextSel).addEventListener('click', () => {
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) track.scrollTo({ left: 0, behavior: 'smooth' });
      else track.scrollBy({ left: step(), behavior: 'smooth' });
    });
    const upd = () => {
      if (!bar) return;
      const vis = track.clientWidth / track.scrollWidth;
      const max = track.scrollWidth - track.clientWidth;
      const p = max > 0 ? track.scrollLeft / max : 0;
      bar.style.width = (vis * 100) + '%';
      bar.style.transform = `translateX(${p * ((1 - vis) / vis) * 100}%)`;
    };
    track.addEventListener('scroll', upd, { passive: true });
    addEventListener('resize', upd);
    upd();
  };
  scroller('#svcTrack', '#svcPrev', '#svcNext', '#svcProgress');
  scroller('#galTrack', '#galPrev', '#galNext', '#galProgress');

  /* ---------- Lightbox ---------- */
  const lb = $('#lightbox');
  if (lb) {
    const items = $$('.g-item');
    const img = $('img', lb);
    const count = $('.lb-count', lb);
    let cur = 0, lastFocus = null;
    const show = (i) => {
      cur = (i + items.length) % items.length;
      const it = items[cur];
      img.src = it.dataset.full;
      img.alt = $('img', it).alt;
      count.textContent = `${cur + 1} / ${items.length}`;
    };
    const open = (i) => { lastFocus = document.activeElement; show(i); lb.classList.add('is-open'); document.body.style.overflow = 'hidden'; $('.lb-close', lb).focus(); };
    const close = () => { lb.classList.remove('is-open'); document.body.style.overflow = ''; lastFocus && lastFocus.focus(); };
    items.forEach((it, i) => it.addEventListener('click', () => open(i)));
    $('.lb-close', lb).addEventListener('click', close);
    $('.lb-prev', lb).addEventListener('click', () => show(cur - 1));
    $('.lb-next', lb).addEventListener('click', () => show(cur + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    addEventListener('keydown', e => {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(cur + 1);
      if (e.key === 'ArrowLeft') show(cur - 1);
    });
    let tx = null;
    lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
      if (tx === null) return; const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1)); tx = null;
    });
  }

  /* ---------- Aberto agora (horário de João Pessoa, UTC-3) ---------- */
  const on = $('#openNow');
  if (on) {
    const now = new Date(Date.now() + (new Date().getTimezoneOffset() - 180) * 60000);
    const d = now.getDay(), h = now.getHours() + now.getMinutes() / 60;
    const open = d >= 1 && d <= 6 && h >= 9 && h < 18;
    on.classList.toggle('is-open', open);
    on.textContent = open ? 'Aberto agora • fecha às 18h' : (d === 0 || (d === 6 && h >= 18) ? 'Fechado agora • abre segunda às 09h' : (h < 9 ? 'Fechado agora • abre hoje às 09h' : 'Fechado agora • abre amanhã às 09h'));
  }

  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();
