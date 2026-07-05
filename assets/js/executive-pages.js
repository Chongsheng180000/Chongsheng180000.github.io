(function () {
  'use strict';

  const body = document.body;
  const page = body.dataset.page || '';
  const posts = window.BLOG_POSTS || [];
  const products = window.BLOG_PRODUCTS || [];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const storage = {
    get(key, fallback) {
      try {
        return localStorage.getItem(key) || fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {}
    }
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function initReadingLounge() {
    if (page !== 'post') return;
    const shell = $('#post-detail');
    const articleBody = $('.article-body');
    if (!shell || !articleBody) return;

    const progress = document.createElement('div');
    progress.className = 'reading-progress-light';
    progress.setAttribute('aria-hidden', 'true');
    progress.innerHTML = '<i></i>';
    shell.insertBefore(progress, shell.firstElementChild);

    const control = document.createElement('nav');
    control.className = 'reading-control-bar';
    control.setAttribute('aria-label', 'Reading Control Bar');
    control.innerHTML = `
      <button type="button" data-reading-action="font-down" aria-label="Reduce article font size">A-</button>
      <button type="button" data-reading-action="font-up" aria-label="Increase article font size">A+</button>
      <button type="button" data-reading-action="line" aria-label="Switch article line height">Line</button>
      <button type="button" data-reading-action="mode" aria-label="Switch reading mode">Mode: <span data-reading-mode-label></span></button>
      <button type="button" data-reading-action="light" aria-label="Toggle reading light">Light</button>
      <button type="button" data-reading-action="starlight" aria-label="Toggle starlight intensity">Starlight</button>
      <a href="posts.html">Archive</a>
    `;
    const layout = $('.article-layout');
    shell.insertBefore(control, layout || articleBody);

    const state = {
      font: Number(storage.get('cs-reading-font', '1')),
      line: Number(storage.get('cs-reading-line', '1.86')),
      mode: storage.get('cs-reading-mode', 'lounge'),
      light: storage.get('cs-reading-light', 'on'),
      starlight: storage.get('cs-reading-starlight', 'dim')
    };

    function apply() {
      state.font = clamp(Number(state.font) || 1, 0.9, 1.16);
      state.line = clamp(Number(state.line) || 1.86, 1.68, 2.05);
      body.dataset.readingMode = state.mode;
      body.dataset.readingLight = state.light;
      body.dataset.starlight = state.starlight;
      document.documentElement.style.setProperty('--saved-article-font-scale', String(state.font));
      document.documentElement.style.setProperty('--saved-article-line-height', String(state.line));
      $('[data-reading-mode-label]', control).textContent = state.mode[0].toUpperCase() + state.mode.slice(1);
      $$('[data-reading-action]', control).forEach((button) => {
        const action = button.dataset.readingAction;
        const pressed = (action === 'light' && state.light === 'on') || (action === 'starlight' && state.starlight !== 'off');
        button.setAttribute('aria-pressed', String(pressed));
      });
      storage.set('cs-reading-font', String(state.font));
      storage.set('cs-reading-line', String(state.line));
      storage.set('cs-reading-mode', state.mode);
      storage.set('cs-reading-light', state.light);
      storage.set('cs-reading-starlight', state.starlight);
    }

    control.addEventListener('click', (event) => {
      const button = event.target.closest('[data-reading-action]');
      if (!button) return;
      const action = button.dataset.readingAction;
      if (action === 'font-down') state.font -= 0.04;
      if (action === 'font-up') state.font += 0.04;
      if (action === 'line') state.line = state.line > 1.9 ? 1.72 : state.line > 1.78 ? 2.0 : 1.86;
      if (action === 'mode') {
        const modes = ['lounge', 'focus', 'night'];
        state.mode = modes[(modes.indexOf(state.mode) + 1) % modes.length];
      }
      if (action === 'light') state.light = state.light === 'on' ? 'low' : 'on';
      if (action === 'starlight') state.starlight = state.starlight === 'off' ? 'dim' : 'off';
      apply();
    });

    const tocLinks = $$('.toc a');
    if (!reduceMotion && 'IntersectionObserver' in window && tocLinks.length) {
      const sectionMap = new Map(tocLinks.map((link) => [decodeURIComponent(link.hash.slice(1)), link]));
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const link = sectionMap.get(entry.target.id);
          if (!link) return;
          if (entry.isIntersecting) {
            tocLinks.forEach((item) => item.classList.remove('is-active'));
            link.classList.add('is-active');
          }
        });
      }, { rootMargin: '-12% 0px -72% 0px', threshold: 0.01 });
      $$('section[id]', articleBody).forEach((section) => observer.observe(section));
    }

    const updateProgress = () => {
      const rect = articleBody.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const read = clamp((window.innerHeight - rect.top) / Math.max(total, 1), 0, 1);
      shell.style.setProperty('--reading-progress', `${Math.round(read * 100)}%`);
    };
    updateProgress();
    document.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    apply();
  }

  function initArchiveCluster() {
    if (page !== 'posts') return;
    const layout = $('.archive-layout');
    const results = $('.archive-results');
    if (!layout || !results || $('.archive-console-summary')) return;
    const years = [...new Set(posts.map((post) => String(post.date || '').slice(0, 4)).filter(Boolean))].sort((a, b) => b.localeCompare(a));
    const categories = [...new Set(posts.map((post) => post.category))];
    const summary = document.createElement('div');
    summary.className = 'archive-console-summary';
    summary.innerHTML = `
      <span><em>Mileage</em><strong>${posts.length || 0} routes</strong></span>
      <span><em>Years</em><strong>${years.join(' / ') || 'empty'}</strong></span>
      <span><em>Drive Mode</em><strong>${categories.length || 0} categories</strong></span>
    `;
    results.insertBefore(summary, results.firstElementChild);

    const input = $('#post-search');
    input?.setAttribute('aria-label', 'Navigation Input');
    input?.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    const filterPanel = $('.filter-panel');
    if (filterPanel && years.length) {
      const yearDial = document.createElement('div');
      yearDial.className = 'year-dial';
      yearDial.innerHTML = `
        <p class="field-label">Route Years</p>
        <div>${years.map((year) => `<button type="button" data-year-route="${year}">${year}</button>`).join('')}</div>
      `;
      filterPanel.insertBefore(yearDial, filterPanel.firstElementChild);
      yearDial.addEventListener('click', (event) => {
        const button = event.target.closest('[data-year-route]');
        if (!button || !input) return;
        input.value = button.dataset.yearRoute;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        $$('[data-year-route]', yearDial).forEach((item) => item.classList.toggle('is-active', item === button));
      });
    }
  }

  function initShopConsole() {
    if (page !== 'shop') return;
    $('.shop-hero')?.classList.add('armrest-hero');
    $('#shop-products')?.closest('.shell')?.classList.add('armrest-console');
    $$('.product-card').forEach((card) => card.setAttribute('tabindex', '0'));
  }

  function initOwnerProfile() {
    if (page !== 'about') return;
    const prose = $('.prose-page');
    if (!prose || $('.owner-profile-grid')) return;
    const grid = document.createElement('section');
    grid.className = 'shell owner-profile-grid';
    grid.setAttribute('aria-label', 'Owner Profile Display');
    grid.innerHTML = `
      <aside class="owner-profile-panel">
        <div class="owner-profile-badge">
          <span>Owner Profile</span>
          <strong>CHONGSHENG DAILY OS</strong>
        </div>
        <ul class="profile-status-list">
          <li><span>Writing</span><em>Active</em></li>
          <li><span>Build</span><em>Active</em></li>
          <li><span>Shelf</span><em>Limited</em></li>
          <li><span>Boundary</span><em>Clear</em></li>
        </ul>
      </aside>
      <div class="owner-profile-copy"></div>
    `;
    const copy = $('.owner-profile-copy', grid);
    copy.append(...Array.from(prose.childNodes));
    prose.replaceWith(grid);
  }

  initReadingLounge();
  initArchiveCluster();
  initShopConsole();
  initOwnerProfile();
})();
