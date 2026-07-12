(function () {
  'use strict';

  const body = document.body;
  const page = body.dataset.page || '';
  const posts = window.BLOG_POSTS || [];
  const products = window.BLOG_PRODUCTS || [];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const isEn = () => document.documentElement.dataset.lang === 'en';
  const t = (zh, en) => isEn() ? en : zh;

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

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  body.dataset.ambientTheme = storage.get('cs-ambient-theme', 'obsidian-gold');

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
    control.setAttribute('aria-label', t('阅读控制', 'Reading controls'));
    control.innerHTML = `
      <button type="button" data-reading-action="font-down" aria-label="${t('减小正文字号', 'Reduce article font size')}">A−</button>
      <button type="button" data-reading-action="font-up" aria-label="${t('增大正文字号', 'Increase article font size')}">A＋</button>
      <button type="button" data-reading-action="line" aria-label="${t('切换正文行距', 'Switch article line height')}">${t('行距', 'Line')}</button>
      <button type="button" data-reading-action="mode" aria-label="${t('切换阅读模式', 'Switch reading mode')}"><span data-reading-mode-label></span></button>
      <button type="button" data-reading-action="light" aria-label="${t('切换阅读灯', 'Toggle reading light')}">${t('阅读灯', 'Light')}</button>
      <button type="button" data-reading-action="starlight" aria-label="${t('切换星空顶', 'Toggle starlight')}">${t('星空', 'Starlight')}</button>
      <a href="posts.html">${t('归档', 'Archive')}</a>
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
    const modeLabels = {
      lounge: t('休息舱', 'Lounge'),
      focus: t('专注', 'Focus'),
      night: t('夜读', 'Night')
    };

    function apply() {
      state.font = clamp(Number(state.font) || 1, 0.9, 1.16);
      state.line = clamp(Number(state.line) || 1.86, 1.68, 2.05);
      body.dataset.readingMode = state.mode;
      body.dataset.readingLight = state.light;
      body.dataset.starlight = state.starlight;
      document.documentElement.style.setProperty('--saved-article-font-scale', String(state.font));
      document.documentElement.style.setProperty('--saved-article-line-height', String(state.line));
      $('[data-reading-mode-label]', control).textContent = modeLabels[state.mode] || modeLabels.lounge;
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
      if (action === 'line') state.line = state.line > 1.9 ? 1.72 : state.line > 1.78 ? 2 : 1.86;
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
          if (!link || !entry.isIntersecting) return;
          tocLinks.forEach((item) => item.classList.remove('is-active'));
          link.classList.add('is-active');
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
    const results = $('.archive-results');
    const filterPanel = $('.filter-panel');
    if (!results || !filterPanel || $('.archive-console-summary')) return;
    const years = [...new Set(posts.map((post) => String(post.date || '').slice(0, 4)).filter(Boolean))].sort((a, b) => b.localeCompare(a));
    const categories = [...new Set(posts.map((post) => post.category))];
    const summary = document.createElement('div');
    summary.className = 'archive-console-summary';
    summary.innerHTML = `
      <span><em>${t('内容里程', 'Mileage')}</em><strong>${t(`${posts.length} 篇`, `${posts.length} routes`)}</strong></span>
      <span><em>${t('年份', 'Years')}</em><strong>${years.join(' / ') || '—'}</strong></span>
      <span><em>${t('分类', 'Drive Modes')}</em><strong>${t(`${categories.length} 类`, `${categories.length} categories`)}</strong></span>
    `;
    results.insertBefore(summary, results.firstElementChild);

    const input = $('#post-search');
    input?.setAttribute('aria-label', t('搜索文章、摘要和标签', 'Search articles, summaries, and tags'));
    input?.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    if (years.length) {
      const yearDial = document.createElement('div');
      yearDial.className = 'year-dial';
      yearDial.innerHTML = `
        <p class="field-label">${t('路线年份', 'Route Years')}</p>
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

  function initContactConsole() {
    if (page !== 'contact') return;
    const request = $('[data-contact-request]');
    const slug = new URLSearchParams(window.location.search).get('product');
    const product = products.find((item) => item.slug === slug);
    if (request && product) {
      const name = isEn() ? product.nameEn || product.name : product.name;
      request.hidden = false;
      request.innerHTML = `
        <span>${t('当前咨询', 'Current request')}</span>
        <strong>${escapeHtml(name)}</strong>
        <a href="mailto:Chongsheng20000@gmail.com?subject=${encodeURIComponent(`${t('商品咨询', 'Product request')}: ${name}`)}">${t('用邮箱说明需求', 'Describe it by email')}</a>
      `;
    }

    $$('[data-copy-value]').forEach((button) => {
      button.addEventListener('click', async () => {
        const value = button.dataset.copyValue || '';
        try {
          await navigator.clipboard.writeText(value);
          const original = button.textContent;
          button.textContent = t('已复制', 'Copied');
          window.setTimeout(() => { button.textContent = original; }, 1200);
        } catch {
          window.prompt(t('请手动复制', 'Copy manually'), value);
        }
      });
    });
  }

  initReadingLounge();
  initArchiveCluster();
  initContactConsole();
})();
