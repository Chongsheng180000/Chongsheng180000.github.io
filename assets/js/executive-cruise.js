(function () {
  const root = document.querySelector('[data-cruise-root]');
  if (!root) return;

  const posts = window.BLOG_POSTS || [];
  const products = window.BLOG_PRODUCTS || [];
  const shell = root.querySelector('.executive-cockpit-shell');
  const steeringRim = root.querySelector('[data-steering-rim]');
  const searchOverlay = root.querySelector('[data-search-overlay]');
  const searchInput = root.querySelector('[data-cruise-search]');
  const modePanel = root.querySelector('[data-console-mode-panel]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ambientThemes = [
    { id: 'obsidian-gold', zh: '黑曜金', en: 'Obsidian Gold' },
    { id: 'phantom-starlight', zh: '星光白', en: 'Phantom Starlight' },
    { id: 'executive-amber', zh: '行政暖金', en: 'Executive Amber' },
    { id: 'midnight-blue', zh: '夜巡深蓝', en: 'Midnight Blue' },
    { id: 'violet-lounge', zh: '紫蓝后排', en: 'Violet Lounge' },
    { id: 'classic-walnut', zh: '经典胡桃', en: 'Classic Walnut' },
    { id: 'silent-black', zh: '静默黑', en: 'Silent Black' }
  ];

  const driveModes = [
    {
      id: 'read',
      zh: '阅读',
      en: 'Read',
      accentStatus: 'record',
      preferredTheme: 'phantom-starlight',
      titleZh: '当前路线',
      titleEn: 'Current Route',
      summaryZh: '最近的文章、随笔和日常记录放在最前面。先读内容，再看系统。',
      summaryEn: 'Recent articles, essays, and daily notes stay in front. Read first, inspect the system later.',
      primaryHref: 'posts.html',
      primaryZh: '开始阅读',
      primaryEn: 'Start Reading'
    },
    {
      id: 'build',
      zh: '打磨',
      en: 'Build',
      accentStatus: 'build',
      preferredTheme: 'midnight-blue',
      titleZh: '工具工位',
      titleEn: 'Build Bay',
      summaryZh: '工具、脚本、部署和自动化相关内容集中到这里。冷静一点，别把工具做成负担。',
      summaryEn: 'Tools, scripts, deployment, and automation notes are grouped here. Keep tools useful, not heavy.',
      primaryHref: 'posts.html?tag=%E5%B7%A5%E5%85%B7',
      primaryZh: '打开工具',
      primaryEn: 'Open Tools'
    },
    {
      id: 'shelf',
      zh: '货架',
      en: 'Shelf',
      accentStatus: 'shelf',
      preferredTheme: 'executive-amber',
      titleZh: '扶手货架',
      titleEn: 'Armrest Shelf',
      summaryZh: '脚本、模板、教程、咨询。能卖的先写边界，不能卖的只留记录。',
      summaryEn: 'Scripts, templates, tutorials, and consulting. Paid items need clear boundaries first.',
      primaryHref: 'shop.html',
      primaryZh: '打开货架',
      primaryEn: 'Open Shelf'
    },
    {
      id: 'archive',
      zh: '归档',
      en: 'Archive',
      accentStatus: 'record',
      preferredTheme: 'classic-walnut',
      titleZh: '路线归档',
      titleEn: 'Route Map',
      summaryZh: '按时间、分类和标签回看内容。它不是地图，只是把写过的东西排成路线。',
      summaryEn: 'Browse by time, category, and tags. Not a map, just a route through what has been written.',
      primaryHref: 'posts.html',
      primaryZh: '打开归档',
      primaryEn: 'Open Archive'
    },
    {
      id: 'night',
      zh: '夜巡',
      en: 'Night',
      accentStatus: 'thought',
      preferredTheme: 'violet-lounge',
      titleZh: '夜间巡航',
      titleEn: 'Night Cruise',
      summaryZh: '降低信息密度，保留巡航、星空、搜索和核心入口。适合只想安静看一会儿。',
      summaryEn: 'Lower the information density and keep cruise, starlight, search, and core entries.',
      primaryHref: 'posts.html',
      primaryZh: '继续阅读',
      primaryEn: 'Keep Reading'
    }
  ];

  const starlightModes = [
    { id: 'on', zh: '开启', en: 'On' },
    { id: 'dim', zh: '微光', en: 'Dim' },
    { id: 'map', zh: '星图', en: 'Map' },
    { id: 'off', zh: '关闭', en: 'Off' }
  ];

  const mobileReduced = window.matchMedia('(max-width: 820px)').matches;
  const categories = ['Daily', 'Writing', 'Tools', 'Scripts', 'Notes'];
  const categoryStatusMap = {
    Daily: 'record',
    Writing: 'thought',
    Tools: 'build',
    Scripts: 'build',
    Notes: 'thought'
  };
  const panels = ['read', 'build', 'daily', 'shelf'];
  const postCount = posts.length || 6;
  const productCount = products.length || 0;
  const recentPosts = posts
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);
  const categoryEnMap = {
    日常: 'Daily',
    随笔: 'Essay',
    经验: 'Notes',
    思想: 'Thought',
    工具: 'Tools',
    商品说明: 'Shelf'
  };
  const postTitleEnMap = {
    'restart-the-blog': 'The Day I Rebuilt the Blog',
    'one-button-afternoon': 'An Afternoon Spent on One Button',
    'script-boundaries': 'My Boundaries Around Scripts',
    'quiet-tools': 'Quiet Tools Stay Useful',
    'static-site-notes': 'Notes on Keeping a Static Site',
    'digital-shelf-rules': 'Rules for the Digital Shelf'
  };

  const cockpitStatus = {
    record: { zh: '记录', en: 'Record', subZh: '日常记录', subEn: 'Daily notes', value: 68 },
    build: { zh: '打磨', en: 'Build', subZh: '工具打磨', subEn: 'Tool work', value: 74 },
    shelf: { zh: '货架', en: 'Shelf', subZh: '资源整理', subEn: 'Resource shelf', value: Math.max(43, Math.min(82, 36 + productCount * 7)) },
    thought: { zh: '思考', en: 'Thought', subZh: '判断沉淀', subEn: 'Judgement', value: 56 }
  };

  const constellationItems = [
    {
      selector: '[data-kind="latest"]',
      label: recentPosts[0]?.title || '最新文章',
      href: recentPosts[0] ? `post.html?slug=${encodeURIComponent(recentPosts[0].slug)}` : 'posts.html',
      type: 'latest'
    },
    { selector: '[data-kind="daily"]', label: '日常记录', href: 'posts.html?category=%E6%97%A5%E5%B8%B8', type: 'daily' },
    { selector: '[data-kind="tools"]', label: '工具脚本', href: 'posts.html?tag=%E5%B7%A5%E5%85%B7', type: 'tools' },
    { selector: '[data-kind="shelf"]', label: '数字资源', href: 'shop.html', type: 'shelf' },
    { selector: '[data-kind="thought"]', label: '思想判断', href: 'posts.html?category=%E6%80%9D%E6%83%B3', type: 'thought' }
  ];

  const savedTheme = localStorage.getItem('cs-ambient-theme');
  const savedStarlight = localStorage.getItem('cs-starlight-mode');
  const initialThemeIndex = Math.max(0, ambientThemes.findIndex((theme) => theme.id === savedTheme));
  const initialStarlight = starlightModes.some((item) => item.id === savedStarlight)
    ? savedStarlight
    : mobileReduced ? 'dim' : 'on';

  const state = {
    cruiseMode: 'auto',
    previousCruiseMode: 'auto',
    driveMode: 'read',
    ambientIndex: initialThemeIndex,
    speed: reduceMotion ? 0.15 : 1,
    steeringAngle: 0,
    selectedCategory: 0,
    selectedPanel: 0,
    starlightMode: initialStarlight,
    statusFocus: 'record',
    minimal: false
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const qs = (selector) => root.querySelector(selector);
  const qsa = (selector) => Array.from(root.querySelectorAll(selector));
  const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  function currentLang() {
    return document.documentElement.dataset.lang === 'en' ? 'en' : 'zh';
  }

  function textOf(item, zhKey = 'zh', enKey = 'en') {
    if (!item) return '';
    return currentLang() === 'en' ? item[enKey] : item[zhKey];
  }

  function cruiseLabel() {
    if (state.cruiseMode === 'paused') return currentLang() === 'en' ? 'Paused' : '暂停';
    return state.cruiseMode === 'manual'
      ? currentLang() === 'en' ? 'Manual' : '手动'
      : currentLang() === 'en' ? 'Auto' : '自动';
  }

  function currentTheme() {
    return ambientThemes[state.ambientIndex % ambientThemes.length];
  }

  function currentDriveMode() {
    return driveModes.find((mode) => mode.id === state.driveMode) || driveModes[0];
  }

  function currentStarlight() {
    return starlightModes.find((mode) => mode.id === state.starlightMode) || starlightModes[0];
  }

  function setText(selector, value) {
    const node = qs(selector);
    if (node) node.textContent = value;
  }

  function setCruiseMode(mode) {
    if (mode !== 'paused') state.previousCruiseMode = mode;
    state.cruiseMode = mode;
    if (mode === 'auto') state.steeringAngle = 0;
    render();
  }

  function toggleCruise() {
    setCruiseMode(state.cruiseMode === 'manual' ? 'auto' : 'manual');
  }

  function togglePause() {
    if (state.cruiseMode === 'paused') {
      state.cruiseMode = state.previousCruiseMode || 'auto';
    } else {
      state.previousCruiseMode = state.cruiseMode;
      state.cruiseMode = 'paused';
    }
    render();
  }

  function setDriveMode(modeId, options = {}) {
    if (!driveModes.some((mode) => mode.id === modeId)) return;
    state.driveMode = modeId;
    state.selectedPanel = Math.max(0, panels.indexOf(modeId === 'archive' ? 'read' : modeId === 'night' ? 'daily' : modeId));
    const mode = currentDriveMode();
    state.statusFocus = mode.accentStatus;
    if (options.syncAmbient && mode.preferredTheme) {
      const index = ambientThemes.findIndex((theme) => theme.id === mode.preferredTheme);
      if (index >= 0) {
        state.ambientIndex = index;
        localStorage.setItem('cs-ambient-theme', ambientThemes[index].id);
      }
    }
    if (modeId === 'night' && state.starlightMode === 'dim') {
      state.starlightMode = 'on';
    }
    render();
  }

  function cycleDriveMode(step = 1) {
    const index = driveModes.findIndex((mode) => mode.id === state.driveMode);
    setDriveMode(driveModes[(index + step + driveModes.length) % driveModes.length].id, { syncAmbient: true });
  }

  function cycleTheme(step = 1) {
    state.ambientIndex = (state.ambientIndex + step + ambientThemes.length) % ambientThemes.length;
    localStorage.setItem('cs-ambient-theme', currentTheme().id);
    render();
  }

  function resetAmbient() {
    state.ambientIndex = ambientThemes.findIndex((theme) => theme.id === 'obsidian-gold');
    localStorage.setItem('cs-ambient-theme', currentTheme().id);
    render();
  }

  function cycleStarlight() {
    const index = starlightModes.findIndex((mode) => mode.id === state.starlightMode);
    state.starlightMode = starlightModes[(index + 1) % starlightModes.length].id;
    localStorage.setItem('cs-starlight-mode', state.starlightMode);
    render();
  }

  function cyclePanel(step = 1) {
    state.selectedPanel = (state.selectedPanel + step + panels.length) % panels.length;
    render();
  }

  function cycleCategory(step = 1) {
    state.selectedCategory = (state.selectedCategory + step + categories.length) % categories.length;
    state.statusFocus = categoryStatusMap[categories[state.selectedCategory]] || currentDriveMode().accentStatus;
    cyclePanel(step);
  }

  function changeSpeed(delta) {
    state.speed = clamp(state.speed + delta, 0.35, 2.2);
    if (state.cruiseMode === 'auto') state.cruiseMode = 'manual';
    render();
  }

  function steer(delta) {
    state.steeringAngle = clamp(state.steeringAngle + delta, -18, 18);
    if (state.cruiseMode !== 'paused') state.cruiseMode = 'manual';
    render();
  }

  function openSearch() {
    if (!searchOverlay) {
      window.location.href = 'search.html';
      return;
    }
    searchOverlay.hidden = false;
    root.classList.add('is-searching');
    window.setTimeout(() => searchInput?.focus(), 30);
  }

  function closeSearch() {
    if (!searchOverlay) return;
    searchOverlay.hidden = true;
    root.classList.remove('is-searching');
    shell?.focus({ preventScroll: true });
  }

  function submitSearch() {
    const query = searchInput?.value.trim();
    window.location.href = query ? `search.html?q=${encodeURIComponent(query)}` : 'search.html';
  }

  function toggleMinimal() {
    state.minimal = !state.minimal;
    render();
  }

  function handleAction(action) {
    switch (action) {
      case 'home':
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        break;
      case 'category':
        cycleCategory(1);
        break;
      case 'ambient':
        cycleTheme(1);
        break;
      case 'mode':
        cycleDriveMode(1);
        break;
      case 'cruise':
        toggleCruise();
        break;
      case 'search':
        openSearch();
        break;
      case 'shelf':
        window.location.href = 'shop.html';
        break;
      case 'archive':
        window.location.href = 'posts.html';
        break;
      case 'star':
        document.querySelector('#recent-title')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
        break;
      case 'prev':
        cyclePanel(-1);
        break;
      case 'next':
        cyclePanel(1);
        break;
      default:
        break;
    }
  }

  function renderModePanel() {
    if (!modePanel) return;
    const mode = currentDriveMode();
    const isEn = currentLang() === 'en';
    const recent = recentPosts.map((post) => `
      <a href="post.html?slug=${encodeURIComponent(post.slug)}">
        <span>${escapeHtml(isEn ? categoryEnMap[post.category] || post.category : post.category)}</span>
        <strong>${escapeHtml(isEn ? postTitleEnMap[post.slug] || post.title : post.title)}</strong>
      </a>
    `).join('');
    const years = [...new Set(posts.map((post) => String(post.date || '').slice(0, 4)).filter(Boolean))].slice(0, 3);
    const panelExtras = {
      read: recent || `<span class="console-mode-empty">${isEn ? 'Article data pending' : '文章数据待补充'}</span>`,
      build: isEn
        ? '<a href="posts.html?tag=%E5%B7%A5%E5%85%B7"><span>Tool Bay</span><strong>Tools, scripts, automation</strong></a><a href="posts.html"><span>Deploy</span><strong>Site and workflow notes</strong></a>'
        : '<a href="posts.html?tag=%E5%B7%A5%E5%85%B7"><span>工具区</span><strong>工具、脚本、自动化</strong></a><a href="posts.html"><span>部署</span><strong>站点和流程记录</strong></a>',
      shelf: isEn
        ? `<a href="shop.html"><span>Scripts</span><strong>${productCount || 0} resources</strong></a><a href="contact.html"><span>Boundary</span><strong>Ask clearly before delivery</strong></a>`
        : `<a href="shop.html"><span>脚本</span><strong>${productCount || 0} 个资源</strong></a><a href="contact.html"><span>边界</span><strong>先问清楚再交付</strong></a>`,
      archive: isEn
        ? `<a href="posts.html"><span>Route Years</span><strong>${years.join(' / ') || '2026'}</strong></a><button type="button" data-panel-search><span>Navigation Input</span><strong>Search articles, tools, resources</strong></button>`
        : `<a href="posts.html"><span>年份路线</span><strong>${years.join(' / ') || '2026'}</strong></a><button type="button" data-panel-search><span>导航输入</span><strong>搜索文章、工具、资源</strong></button>`,
      night: isEn
        ? '<a href="posts.html"><span>Low Light</span><strong>Keep reading entry</strong></a><button type="button" data-starlight-cycle><span>Starlight</span><strong>Switch starlight mode</strong></button>'
        : '<a href="posts.html"><span>低光</span><strong>保留阅读入口</strong></a><button type="button" data-starlight-cycle><span>星空</span><strong>切换星空模式</strong></button>'
    };
    modePanel.innerHTML = `
      <div class="console-mode-head">
        <span>${escapeHtml(isEn ? `${mode.en} Mode` : `${mode.zh}模式`)}</span>
        <em>${escapeHtml(isEn ? mode.titleEn : mode.titleZh)}</em>
      </div>
      <p>${escapeHtml(isEn ? mode.summaryEn : mode.summaryZh)}</p>
      <div class="console-mode-actions">
        <a class="luxury-button luxury-button--primary" href="${mode.primaryHref}">${escapeHtml(isEn ? mode.primaryEn : mode.primaryZh)}</a>
        <button class="luxury-button luxury-button--ghost" type="button" data-panel-search>${isEn ? 'Navigation Input' : '导航输入'}</button>
      </div>
      <div class="console-mode-routes">${panelExtras[mode.id]}</div>
    `;
  }

  function renderStatusGauges() {
    qsa('.instrument-gauge').forEach((gauge) => {
      const key = gauge.dataset.status;
      const status = cockpitStatus[key];
      if (!status) return;
      gauge.style.setProperty('--level', `${status.value}%`);
      gauge.style.setProperty('--dash', String(status.value));
      const value = gauge.querySelector('strong');
      const label = gauge.querySelector('span');
      const small = gauge.querySelector('small');
      if (value) value.textContent = status.value;
      if (label) label.textContent = textOf(status);
      if (small) small.textContent = currentLang() === 'en' ? status.subEn : status.subZh;
      gauge.classList.toggle('is-active', key === state.statusFocus);
    });
  }

  function renderConstellation() {
    constellationItems.forEach((item) => {
      const node = root.querySelector(item.selector);
      if (!node) return;
      node.href = item.href;
      node.dataset.label = item.label;
      node.setAttribute('aria-label', item.label);
    });
  }

  function render() {
    const theme = currentTheme();
    const mode = currentDriveMode();
    const starlight = currentStarlight();
    root.dataset.cruiseMode = state.cruiseMode;
    root.dataset.driveMode = state.driveMode;
    root.dataset.ambientTheme = theme.id;
    root.dataset.starlightMode = state.starlightMode;
    root.dataset.category = categories[state.selectedCategory].toLowerCase();
    root.classList.toggle('is-manual-cruise', state.cruiseMode === 'manual');
    root.classList.toggle('is-paused-cruise', state.cruiseMode === 'paused');
    root.classList.toggle('is-night-mode', state.driveMode === 'night');
    root.classList.toggle('is-minimal-console', state.minimal);
    ambientThemes.forEach(({ id }) => root.classList.remove(`ambient-theme-${id}`));
    root.classList.add(`ambient-theme-${theme.id}`);

    const duration = state.cruiseMode === 'paused' || reduceMotion
      ? 120
      : clamp(18 / state.speed, 6, 42);
    const lightDuration = state.cruiseMode === 'paused' || reduceMotion
      ? 160
      : clamp(12 / state.speed, 4, 28);

    const engineLoad = state.cruiseMode === 'paused'
      ? 0.08
      : clamp((state.speed - 0.35) / 1.85, 0.08, 1);
    const steeringDrift = state.steeringAngle * -1.15;

    root.style.setProperty('--steering-angle', `${state.steeringAngle}deg`);
    root.style.setProperty('--road-offset', `${state.steeringAngle * -0.55}px`);
    root.style.setProperty('--scenery-offset', `${steeringDrift}px`);
    root.style.setProperty('--city-offset', `${steeringDrift * 0.55}px`);
    root.style.setProperty('--steering-drift', `${steeringDrift}px`);
    root.style.setProperty('--engine-load', engineLoad.toFixed(3));
    root.style.setProperty('--guardrail-opacity', (0.28 + engineLoad * 0.2).toFixed(3));
    root.style.setProperty('--route-opacity', (0.5 + engineLoad * 0.24).toFixed(3));
    root.style.setProperty('--road-opacity', (0.36 + engineLoad * 0.28).toFixed(3));
    root.style.setProperty('--light-opacity', (0.24 + engineLoad * 0.28).toFixed(3));
    root.style.setProperty('--wheel-saturate', (0.96 + engineLoad * 0.08).toFixed(3));
    root.style.setProperty('--wheel-shadow-offset', `${steeringDrift * 0.08}px`);
    root.style.setProperty('--cruise-duration', `${duration}s`);
    root.style.setProperty('--light-duration', `${lightDuration}s`);

    setText('[data-mileage-readout]', currentLang() === 'en' ? `${postCount} posts` : `${postCount} 篇`);
    setText('[data-signal-readout]', currentLang() === 'en' ? 'RSS clear' : '订阅正常');
    setText('[data-cruise-readout]', cruiseLabel());
    setText('[data-lightbar-cruise]', cruiseLabel());
    setText('[data-drive-mode-readout]', textOf(mode));
    setText('[data-lightbar-mode]', textOf(mode));
    setText('[data-ambient-readout]', textOf(theme));
    setText('[data-starlight-readout]', textOf(starlight));
    setText('[data-starlight-control-label]', textOf(starlight));

    qsa('[data-console-panel]').forEach((item) => {
      const active = item.dataset.consolePanel === panels[state.selectedPanel];
      item.toggleAttribute('aria-current', active);
      item.classList.toggle('is-active', active);
    });
    qsa('[data-drive-mode-button]').forEach((button) => {
      const active = button.dataset.driveModeButton === state.driveMode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    qsa('[data-cruise-toggle], [data-steering-action="cruise"]').forEach((button) => {
      button.setAttribute('aria-pressed', String(state.cruiseMode === 'manual'));
      if (button.matches('[data-cruise-toggle]')) {
        button.textContent = state.cruiseMode === 'paused'
          ? currentLang() === 'en' ? 'Resume Cruise' : '继续巡航'
          : state.cruiseMode === 'manual'
            ? currentLang() === 'en' ? 'Release Control' : '交回巡航'
            : currentLang() === 'en' ? 'Take Control' : '接管巡航';
      }
    });
    renderStatusGauges();
    renderConstellation();
    renderModePanel();
    window.applySiteTranslations?.(root);
  }

  function isEditableTarget(target) {
    return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      closeSearch();
      setCruiseMode('auto');
      return;
    }
    if (event.metaKey || event.ctrlKey || event.altKey || isEditableTarget(event.target)) return;
    const focusedInCockpit = shell?.contains(document.activeElement);
    const manual = state.cruiseMode === 'manual' || state.cruiseMode === 'paused';
    if (!focusedInCockpit && !manual) return;

    const key = event.key.toLowerCase();
    if (key === ' ' || event.code === 'Space') {
      if (focusedInCockpit && !event.target.closest('button, a')) {
        event.preventDefault();
        togglePause();
      }
      return;
    }

    const map = {
      a: () => steer(-4),
      arrowleft: () => steer(-4),
      d: () => steer(4),
      arrowright: () => steer(4),
      w: () => changeSpeed(0.18),
      arrowup: () => changeSpeed(0.18),
      s: () => changeSpeed(-0.18),
      arrowdown: () => changeSpeed(-0.18),
      m: () => cycleDriveMode(1),
      l: () => cycleTheme(1)
    };
    if (map[key]) {
      event.preventDefault();
      map[key]();
    }
  }

  function initDragging() {
    if (!steeringRim) return;
    let dragging = false;
    const updateFromPointer = (event) => {
      const rect = steeringRim.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angle = Math.atan2(event.clientY - cy, event.clientX - cx) * 180 / Math.PI;
      state.steeringAngle = clamp((angle + 90) * 0.28, -18, 18);
      if (state.cruiseMode !== 'paused') state.cruiseMode = 'manual';
      render();
    };
    steeringRim.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button')) return;
      dragging = true;
      steeringRim.setPointerCapture(event.pointerId);
      updateFromPointer(event);
    });
    steeringRim.addEventListener('pointermove', (event) => {
      if (dragging) updateFromPointer(event);
    });
    steeringRim.addEventListener('pointerup', (event) => {
      dragging = false;
      try { steeringRim.releasePointerCapture(event.pointerId); } catch {}
    });
    steeringRim.addEventListener('pointercancel', () => {
      dragging = false;
    });
  }

  function initControls() {
    root.addEventListener('click', (event) => {
      const driveButton = event.target.closest('[data-drive-mode-button]');
      if (driveButton && root.contains(driveButton)) {
        event.preventDefault();
        setDriveMode(driveButton.dataset.driveModeButton, { syncAmbient: true });
        return;
      }
      if (event.target.closest('[data-mode-cycle]')) {
        event.preventDefault();
        cycleDriveMode(1);
        return;
      }
      if (event.target.closest('[data-ambient-cycle]')) {
        event.preventDefault();
        cycleTheme(1);
        return;
      }
      if (event.target.closest('[data-ambient-reset]')) {
        event.preventDefault();
        resetAmbient();
        return;
      }
      if (event.target.closest('[data-starlight-cycle]')) {
        event.preventDefault();
        cycleStarlight();
        return;
      }
      if (event.target.closest('[data-panel-search]')) {
        event.preventDefault();
        openSearch();
        return;
      }
      const actionButton = event.target.closest('[data-steering-action]');
      if (actionButton && root.contains(actionButton)) {
        event.preventDefault();
        handleAction(actionButton.dataset.steeringAction);
        return;
      }
      const toggle = event.target.closest('[data-cruise-toggle]');
      if (toggle && root.contains(toggle)) {
        event.preventDefault();
        toggleCruise();
        shell?.focus({ preventScroll: true });
      }
    });

    let holdTimer = 0;
    const center = root.querySelector('[data-steering-action="home"]');
    center?.addEventListener('pointerdown', () => {
      holdTimer = window.setTimeout(() => {
        holdTimer = 0;
        toggleMinimal();
      }, 650);
    });
    center?.addEventListener('pointerup', () => {
      if (holdTimer) window.clearTimeout(holdTimer);
    });
    center?.addEventListener('pointerleave', () => {
      if (holdTimer) window.clearTimeout(holdTimer);
    });

    root.querySelector('[data-search-close]')?.addEventListener('click', closeSearch);
    root.querySelector('[data-search-submit]')?.addEventListener('click', submitSearch);
    searchInput?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') submitSearch();
      if (event.key === 'Escape') closeSearch();
    });

    root.querySelectorAll('.main-console-screen, [data-steering-controller]').forEach((zone) => {
      zone.addEventListener('wheel', (event) => {
        if (state.cruiseMode !== 'manual') return;
        event.preventDefault();
        cyclePanel(event.deltaY > 0 ? 1 : -1);
      }, { passive: false });
    });

    document.addEventListener('keydown', handleKeydown);
  }

  function initAutoReturn() {
    if (reduceMotion) return;
    const tick = () => {
      if (state.cruiseMode === 'auto' && Math.abs(state.steeringAngle) > 0.05) {
        state.steeringAngle *= 0.88;
        if (Math.abs(state.steeringAngle) < 0.05) state.steeringAngle = 0;
        render();
      }
      window.requestAnimationFrame(tick);
    };
    tick();
  }

  initControls();
  initDragging();
  initAutoReturn();
  window.addEventListener('cs:languagechange', render);
  render();
})();
