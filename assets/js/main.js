/* Rumah Khitan Syafaat Pakis - interaksi & animasi */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';
  const hasST = hasGSAP && typeof window.ScrollTrigger !== 'undefined';
  const animate = hasGSAP && !reduce;
  if (hasST) gsap.registerPlugin(ScrollTrigger);
  if (animate) document.documentElement.classList.add('js-anim');

  /* Header melayang: beri bayangan saat halaman di-scroll */
  const header = document.querySelector('.site-header');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Menu mobile */
  const body = document.body;
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const setMenu = (open) => {
    body.classList.toggle('menu-open', open);
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
    if (toggle) toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    if (menu) menu.setAttribute('aria-hidden', String(!open));
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open && animate && menu) {
      gsap.fromTo(menu.querySelectorAll('.m-link, .m-cta, .mobile-socials'),
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: .6, stagger: .05, ease: 'power3.out', delay: .12 });
    }
  };
  if (toggle && menu) {
    toggle.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  }

  /* Pecah judul hero per kata untuk animasi */
  const splitWords = (el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(w => `<span class="wrap"><span class="w">${w}</span></span>`).join(' ');
    return el.querySelectorAll('.w');
  };

  /* Intro hero: satu urutan animasi utama */
  const heroH1 = document.querySelector('[data-split]');
  if (animate && heroH1) {
    const words = splitWords(heroH1);
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from(words, { yPercent: 110, duration: 1.1, stagger: .06 })
      .from('[data-hero-fade]', { y: 26, opacity: 0, duration: .9, stagger: .12 }, '-=.7')
      .fromTo('.hero-media',
        { clipPath: 'inset(14% 10% 14% 10% round 28px)', opacity: .3 },
        { clipPath: 'inset(0% 0% 0% 0% round 28px)', opacity: 1, duration: 1.6, ease: 'expo.out' }, '-=.8')
      .from('.hero-media img', { scale: 1.18, duration: 1.8, ease: 'expo.out' }, '<')
      .from('.logo-card', { y: 40, opacity: 0, rotation: -4, duration: 1, ease: 'back.out(1.4)' }, '-=1.1');
    if (hasST) {
      gsap.to('.hero-media img', {
        yPercent: 8, ease: 'none',
        scrollTrigger: { trigger: '.hero-media', start: 'top bottom', end: 'bottom top', scrub: true }
      });
    }
  }

  /* Reveal ringan untuk judul bagian (sekali saja) */
  if (animate && hasST) {
    gsap.utils.toArray('[data-reveal]').forEach(el => {
      gsap.from(el, {
        y: 40, opacity: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
  }

  /* Angka naik: rating dan jumlah ulasan */
  document.querySelectorAll('[data-count]').forEach(el => {
    if (!animate || !hasST) return;
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.dec || '0', 10);
    const fmt = v => v.toFixed(dec).replace('.', ',');
    const obj = { v: 0 };
    el.textContent = fmt(0);
    gsap.to(obj, {
      v: target, duration: 1.8, ease: 'power2.out',
      onUpdate: () => { el.textContent = fmt(obj.v); },
      scrollTrigger: { trigger: el, start: 'top 90%', once: true }
    });
  });

  /* Teks editorial: kata menjadi jelas mengikuti scroll */
  const scrub = document.querySelector('[data-scrub]');
  if (scrub) {
    const text = scrub.textContent.trim();
    scrub.innerHTML = text.split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
    if (animate && hasST) {
      gsap.fromTo(scrub.querySelectorAll('.w'), { opacity: .16 }, {
        opacity: 1, ease: 'none', stagger: .15,
        scrollTrigger: { trigger: scrub, start: 'top 78%', end: 'bottom 45%', scrub: .6 }
      });
    }
  }

  /* Galeri fasilitas: bergerak horizontal saat di-pin (desktop) */
  const hpin = document.querySelector('[data-hscroll]');
  if (hpin && animate && hasST && matchMedia('(min-width: 900px)').matches) {
    const track = hpin.querySelector('.h-track');
    const scroller = hpin.querySelector('.h-scroller');
    const dist = () => Math.max(0, track.scrollWidth - scroller.clientWidth);
    gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: hpin, start: 'top top', end: () => '+=' + dist(),
        pin: true, scrub: .6, invalidateOnRefresh: true, anticipatePin: 1
      }
    });
  }

  /* Tombol WhatsApp magnetis (hanya perangkat dengan kursor) */
  if (animate && fine) {
    document.querySelectorAll('[data-magnetic]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .22, y: (e.clientY - r.top - r.height / 2) * .3, duration: .5, ease: 'power3.out' });
      });
      el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1, .45)' }));
    });
  }

  /* Video wawancara: dibuka di dialog, tidak autoplay */
  const vDlg = document.getElementById('video-dialog');
  if (vDlg) {
    const vid = vDlg.querySelector('video');
    const openVideo = () => { vDlg.showModal(); vid.currentTime = 0; vid.play().catch(() => {}); };
    document.querySelectorAll('[data-video-open]').forEach(b => b.addEventListener('click', openVideo));
    vDlg.addEventListener('close', () => vid.pause());
    vDlg.addEventListener('click', e => { if (e.target === vDlg) vDlg.close(); });
    vDlg.querySelector('[data-close]').addEventListener('click', () => vDlg.close());
  }

  /* Filter galeri */
  const chips = document.querySelectorAll('[data-filter]');
  chips.forEach(c => c.addEventListener('click', () => {
    chips.forEach(x => x.setAttribute('aria-pressed', String(x === c)));
    const f = c.dataset.filter;
    document.querySelectorAll('.m-item').forEach(m => { m.hidden = !(f === 'all' || m.dataset.cat === f); });
    if (animate) gsap.fromTo('.m-item:not([hidden])', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .55, stagger: .06, ease: 'power2.out' });
  }));

  /* Lightbox galeri: panah dan keyboard */
  const lb = document.getElementById('lightbox');
  if (lb) {
    const img = lb.querySelector('img');
    const cap = lb.querySelector('.lb-cap');
    const items = [...document.querySelectorAll('[data-lb]')];
    let list = [];
    let idx = 0;
    const visible = () => items.filter(i => !i.closest('.m-item').hidden);
    const show = (n) => {
      idx = (n + list.length) % list.length;
      const it = list[idx];
      img.src = it.dataset.src;
      img.alt = it.dataset.alt;
      cap.textContent = it.dataset.cap;
    };
    items.forEach(it => it.addEventListener('click', () => {
      list = visible();
      show(list.indexOf(it));
      lb.showModal();
    }));
    lb.querySelector('[data-prev]').addEventListener('click', () => show(idx - 1));
    lb.querySelector('[data-next]').addEventListener('click', () => show(idx + 1));
    lb.querySelector('[data-close]').addEventListener('click', () => lb.close());
    lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
    document.addEventListener('keydown', e => {
      if (!lb.open) return;
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* Carousel ulasan */
  const car = document.querySelector('[data-carousel]');
  if (car) {
    const slides = [...car.querySelectorAll('.slide')];
    const dotsWrap = car.querySelector('.dots');
    let i = 0;
    let timer = null;
    const go = (n) => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => { s.classList.toggle('is-active', k === i); s.setAttribute('aria-hidden', String(k !== i)); });
      dots.forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
    };
    const dots = slides.map((_, n) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'dot';
      b.setAttribute('aria-label', 'Tampilkan ulasan ' + (n + 1));
      b.addEventListener('click', () => go(n));
      dotsWrap.appendChild(b);
      return b;
    });
    car.querySelector('[data-prev]').addEventListener('click', () => go(i - 1));
    car.querySelector('[data-next]').addEventListener('click', () => go(i + 1));
    go(0);
    const play = () => { if (!reduce) timer = setInterval(() => go(i + 1), 7000); };
    const stop = () => clearInterval(timer);
    car.addEventListener('mouseenter', stop);
    car.addEventListener('mouseleave', play);
    car.addEventListener('focusin', stop);
    car.addEventListener('focusout', play);
    play();
  }
})();
