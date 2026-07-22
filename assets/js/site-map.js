(() => {
  'use strict';

  if (document.body.dataset.page !== 'map') return;

  const posts = Array.isArray(window.BLOG_POSTS) ? window.BLOG_POSTS : [];
  const products = Array.isArray(window.BLOG_PRODUCTS) ? window.BLOG_PRODUCTS : [];
  const isEn = () => document.documentElement.dataset.lang === 'en';
  const t = (zh, en) => (isEn() ? en : zh);
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const routeMeta = {
    home: {
      code: '00', href: 'index.html', type: 'core',
      zh: '驾驶舱', en: 'Cockpit',
      descriptionZh: '首页中控、近期文章和全站主要入口。',
      descriptionEn: 'Home console, recent articles, and the primary site entrances.',
      path: 'CHONGSHENG DAILY OS / HOME'
    },
    posts: {
      code: '01', href: 'posts.html', type: 'reading',
      zh: '文章路线', en: 'Reading Routes',
      descriptionZh: `按日期、分类和标签查找 ${posts.length} 篇文章。`,
      descriptionEn: `Browse ${posts.length} articles by date, category, and tag.`,
      path: 'ARCHIVE / READING ROUTES'
    },
    search: {
      code: '02', href: 'search.html', type: 'system',
      zh: '导航输入', en: 'Navigation Input',
      descriptionZh: '在浏览器内检索文章、摘要、标签和商品，不上传关键词。',
      descriptionEn: 'Search articles, summaries, tags, and products locally in the browser.',
      path: 'SYSTEM / NAVIGATION INPUT'
    },
    shop: {
      code: '03', href: 'shop.html', type: 'shelf',
      zh: '数字货架', en: 'Digital Shelf',
      descriptionZh: `查看 ${products.length} 项工具、模板、教程与服务说明。`,
      descriptionEn: `Review ${products.length} tools, templates, tutorials, and service notes.`,
      path: 'ARMREST CONSOLE / DIGITAL SHELF'
    },
    about: {
      code: '04', href: 'about.html', type: 'identity',
      zh: '站主档案', en: 'Owner Profile',
      descriptionZh: '写什么、做什么，以及哪些边界不会碰。',
      descriptionEn: 'What I write, what I build, and the boundaries I keep.',
      path: 'OWNER PROFILE / IDENTITY'
    },
    contact: {
      code: '05', href: 'contact.html', type: 'identity',
      zh: '联系通道', en: 'Contact Channel',
      descriptionZh: '邮件、QQ、微信、商品咨询与合作说明。',
      descriptionEn: 'Email, direct contact, product inquiries, and collaboration notes.',
      path: 'OWNER PROFILE / CONTACT'
    },
    rss: {
      code: '06', href: 'rss.xml', type: 'system',
      zh: '信号订阅', en: 'Signal Feed',
      descriptionZh: '通过 RSS 接收最新文章，不依赖推荐算法。',
      descriptionEn: 'Receive new articles through RSS without a recommendation algorithm.',
      path: 'SYSTEM / SIGNAL FEED'
    },
    privacy: {
      code: '07', href: 'privacy.html', type: 'system',
      zh: '隐私边界', en: 'Privacy Boundary',
      descriptionZh: '说明站点会处理什么信息，以及信息如何被限制。',
      descriptionEn: 'What the site processes and how that information is constrained.',
      path: 'BOUNDARY SYSTEM / PRIVACY'
    },
    xml: {
      code: '08', href: 'sitemap.xml', type: 'system',
      zh: '机器地图', en: 'XML Map',
      descriptionZh: '提供给搜索引擎读取的 XML 站点索引。',
      descriptionEn: 'The XML site index provided for search engines.',
      path: 'SYSTEM / XML SITEMAP'
    }
  };

  const typeLabels = {
    core: ['核心入口', 'Core'],
    reading: ['阅读路线', 'Reading'],
    shelf: ['资源路线', 'Shelf'],
    identity: ['站主信息', 'Owner'],
    system: ['系统路线', 'System']
  };

  const pageEntries = Object.entries(routeMeta).map(([id, route]) => ({
    id: `page-${id}`,
    routeId: id,
    group: 'pages',
    type: route.type,
    code: route.code,
    href: route.href,
    titleZh: route.zh,
    titleEn: route.en,
    descriptionZh: route.descriptionZh,
    descriptionEn: route.descriptionEn,
    metaZh: typeLabels[route.type][0],
    metaEn: typeLabels[route.type][1],
    keywords: `${route.path} ${id}`
  }));

  const postEntries = posts.map((post, index) => ({
    id: `post-${post.slug}`,
    group: 'posts',
    type: 'reading',
    code: `R${String(index + 1).padStart(2, '0')}`,
    href: `post.html?slug=${encodeURIComponent(post.slug)}`,
    titleZh: post.title,
    titleEn: post.titleEn || post.title,
    descriptionZh: post.summary,
    descriptionEn: post.summaryEn || post.summary,
    metaZh: `${post.date} · ${post.category}`,
    metaEn: `${post.date} · ${post.categoryEn || post.category}`,
    keywords: [...(post.tags || []), ...(post.tagsEn || [])].join(' ')
  }));

  const productEntries = products.map((product, index) => ({
    id: `product-${product.slug}`,
    group: 'products',
    type: 'shelf',
    code: `S${String(index + 1).padStart(2, '0')}`,
    href: 'shop.html#shop-products',
    titleZh: product.name,
    titleEn: product.nameEn || product.name,
    descriptionZh: product.line,
    descriptionEn: product.lineEn || product.line,
    metaZh: `${product.kind} · ${product.status}`,
    metaEn: `${product.kindEn || product.kind} · ${product.statusEn || product.status}`,
    keywords: `${product.kind || ''} ${product.kindEn || ''} ${(product.includes || []).join(' ')} ${(product.includesEn || []).join(' ')}`
  }));

  const allEntries = [...pageEntries, ...postEntries, ...productEntries];
  const titleOf = (entry) => (isEn() ? entry.titleEn : entry.titleZh);
  const descriptionOf = (entry) => (isEn() ? entry.descriptionEn : entry.descriptionZh);
  const metaOf = (entry) => (isEn() ? entry.metaEn : entry.metaZh);
  const normalize = (value) => String(value || '').trim().toLocaleLowerCase(isEn() ? 'en' : 'zh-CN');
  const searchable = (entry) => normalize([
    entry.titleZh, entry.titleEn, entry.descriptionZh, entry.descriptionEn,
    entry.metaZh, entry.metaEn, entry.keywords
  ].join(' '));

  const state = {
    selectedRoute: 'home',
    filter: 'all',
    view: 'map',
    query: ''
  };

  const searchInput = $('#map-search');
  const searchResults = $('[data-map-search-results]');
  const directory = $('[data-route-directory]');
  const directoryCount = $('[data-directory-count]');
  const destination = $('[data-destination-console]');

  function setStats() {
    const routeStat = $('[data-map-stat="routes"]');
    const postStat = $('[data-map-stat="posts"]');
    const productStat = $('[data-map-stat="products"]');
    if (routeStat) routeStat.textContent = String(pageEntries.length).padStart(2, '0');
    if (postStat) postStat.textContent = String(posts.length).padStart(2, '0');
    if (productStat) productStat.textContent = String(products.length).padStart(2, '0');
    $$('[data-route-node-count="posts"]').forEach((node) => { node.textContent = `${posts.length} ${t('篇', 'POSTS')}`; });
    $$('[data-route-node-count="products"]').forEach((node) => { node.textContent = `${products.length} ${t('项', 'ITEMS')}`; });
  }

  function selectRoute(routeId, updateUrl = true) {
    const route = routeMeta[routeId];
    if (!route || !destination) return;
    state.selectedRoute = routeId;

    $$('.route-station').forEach((station) => {
      const selected = station.dataset.routeId === routeId;
      station.classList.toggle('is-selected', selected);
      station.setAttribute('aria-current', selected ? 'location' : 'false');
    });
    $$('[data-route-line]').forEach((line) => {
      const lineId = line.dataset.routeLine;
      line.classList.toggle('is-active', lineId === routeId || (routeId === 'xml' && lineId === 'privacy'));
    });

    $('[data-destination-code]', destination).textContent = route.code;
    $('[data-destination-path]', destination).textContent = route.path;
    $('[data-destination-title]', destination).textContent = isEn() ? route.en : route.zh;
    $('[data-destination-description]', destination).textContent = isEn() ? route.descriptionEn : route.descriptionZh;
    $('[data-destination-type]', destination).textContent = typeLabels[route.type][isEn() ? 1 : 0];
    $('[data-destination-link]', destination).href = route.href;

    if (updateUrl) {
      const url = new URL(window.location.href);
      if (routeId === 'home') url.searchParams.delete('route');
      else url.searchParams.set('route', routeId);
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
  }

  function applyFilter(filter) {
    state.filter = filter;
    $$('[data-route-filter]').forEach((button) => {
      const active = button.dataset.routeFilter === filter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    $$('.route-station').forEach((station) => {
      const visible = filter === 'all' || station.dataset.routeType === filter || station.dataset.routeType === 'core';
      station.classList.toggle('is-dimmed', !visible);
      station.tabIndex = visible ? 0 : -1;
    });
    $$('[data-route-line]').forEach((line) => {
      const station = $(`.route-station[data-route-id="${line.dataset.routeLine}"]`);
      line.classList.toggle('is-muted', Boolean(station?.classList.contains('is-dimmed')));
    });
    renderDirectory();
    renderSearchResults();
  }

  function matchesState(entry) {
    const filterMatch = state.filter === 'all' || entry.type === state.filter || entry.type === 'core';
    const queryMatch = !state.query || searchable(entry).includes(normalize(state.query));
    return filterMatch && queryMatch;
  }

  function renderSearchResults() {
    if (!searchResults) return;
    if (!state.query) {
      searchResults.hidden = true;
      searchResults.innerHTML = '';
      return;
    }

    const matches = allEntries.filter(matchesState).slice(0, 9);
    searchResults.hidden = false;
    searchResults.innerHTML = matches.length
      ? matches.map((entry) => `
          <a class="map-search-result" href="${escapeHtml(entry.href)}">
            <small>${escapeHtml(entry.code)} / ${escapeHtml(metaOf(entry))}</small>
            <strong>${escapeHtml(titleOf(entry))}</strong>
            <span>${escapeHtml(descriptionOf(entry))}</span>
          </a>
        `).join('')
      : `<p>${t('没有找到这条路线。换个词，或者放宽路线筛选。', 'No route matched. Try another term or loosen the route filter.')}</p>`;
  }

  function renderDirectory() {
    if (!directory) return;
    const groups = [
      { id: 'pages', zh: '主要舱室', en: 'Primary cabins' },
      { id: 'posts', zh: '文章路线', en: 'Reading routes' },
      { id: 'products', zh: '资源节点', en: 'Resource nodes' }
    ];
    const visibleEntries = allEntries.filter(matchesState);
    if (directoryCount) directoryCount.textContent = String(visibleEntries.length).padStart(2, '0');

    directory.innerHTML = groups.map((group) => {
      const entries = visibleEntries.filter((entry) => entry.group === group.id);
      if (!entries.length) return '';
      return `
        <section class="directory-group" data-directory-group="${escapeHtml(group.id)}">
          <h3>${escapeHtml(isEn() ? group.en : group.zh)}<span>${String(entries.length).padStart(2, '0')}</span></h3>
          <nav aria-label="${escapeHtml(isEn() ? group.en : group.zh)}">
            ${entries.map((entry) => `
              <a class="directory-route" href="${escapeHtml(entry.href)}">
                <span>${escapeHtml(entry.code)}</span>
                <span><strong>${escapeHtml(titleOf(entry))}</strong><small>${escapeHtml(descriptionOf(entry))}</small></span>
                <b>${escapeHtml(metaOf(entry))}</b>
              </a>
            `).join('')}
          </nav>
        </section>
      `;
    }).join('') || `<p class="directory-empty">${t('当前筛选下没有路线。', 'No routes match the current filter.')}</p>`;
  }

  function setView(view) {
    state.view = view;
    $$('[data-map-view]').forEach((button) => {
      const active = button.dataset.mapView === view;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    $$('[data-map-panel]').forEach((panel) => { panel.hidden = panel.dataset.mapPanel !== view; });
    if (view === 'directory') renderDirectory();
  }

  function renderRecentRoutes() {
    const mount = $('[data-recent-routes]');
    if (!mount) return;
    const recent = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    mount.innerHTML = recent.map((post, index) => `
      <a class="recent-route" href="post.html?slug=${encodeURIComponent(post.slug)}">
        <small>R${String(index + 1).padStart(2, '0')} · ${escapeHtml(post.date)} · ${escapeHtml(isEn() ? post.categoryEn || post.category : post.category)}</small>
        <strong>${escapeHtml(isEn() ? post.titleEn || post.title : post.title)}</strong>
        <span>${escapeHtml(isEn() ? post.readTimeEn || post.readTime : post.readTime)}</span>
      </a>
    `).join('');
  }

  $$('.route-station').forEach((station) => {
    station.addEventListener('click', (event) => {
      const routeId = station.dataset.routeId;
      const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
      const keyboardActivation = event.detail === 0;
      if (!modified && !keyboardActivation && state.selectedRoute !== routeId) {
        event.preventDefault();
        selectRoute(routeId);
      }
    });
    station.addEventListener('focus', () => selectRoute(station.dataset.routeId, false));
  });

  $$('[data-route-filter]').forEach((button) => {
    button.addEventListener('click', () => applyFilter(button.dataset.routeFilter));
  });

  $$('[data-map-view]').forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.mapView));
  });

  searchInput?.addEventListener('input', () => {
    state.query = searchInput.value.trim();
    renderSearchResults();
    renderDirectory();
  });

  document.addEventListener('keydown', (event) => {
    const tag = document.activeElement?.tagName;
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    if (event.key === '/' && !typing) {
      event.preventDefault();
      searchInput?.focus();
      return;
    }
    if (event.key === 'Escape' && document.activeElement === searchInput && searchInput.value) {
      searchInput.value = '';
      state.query = '';
      renderSearchResults();
      renderDirectory();
      return;
    }
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    if (!document.activeElement?.classList.contains('route-station')) return;
    event.preventDefault();
    const stations = $$('.route-station:not(.is-dimmed)');
    const index = stations.indexOf(document.activeElement);
    const step = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
    stations[(index + step + stations.length) % stations.length]?.focus();
  });

  const requestedRoute = new URLSearchParams(window.location.search).get('route');
  setStats();
  renderDirectory();
  renderRecentRoutes();
  selectRoute(routeMeta[requestedRoute] ? requestedRoute : 'home', false);
})();
