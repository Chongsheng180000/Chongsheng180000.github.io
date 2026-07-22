(function () {
  'use strict';

  const posts = window.BLOG_POSTS || [];
  const products = window.BLOG_PRODUCTS || [];
  const productCategories = window.BLOG_PRODUCT_CATEGORIES || [];
  const body = document.body;
  const page = body.dataset.page || 'home';
  const languageParam = new URLSearchParams(window.location.search).get('lang');
  const requestedLanguage = ['zh', 'en'].includes(languageParam) ? languageParam : null;
  if (requestedLanguage) {
    try {
      localStorage.setItem('cs-lang', requestedLanguage);
    } catch {
      // The URL remains the source of truth when storage is unavailable.
    }
  }
  const savedLanguage = requestedLanguage || (localStorage.getItem('cs-lang') === 'en' ? 'en' : 'zh');
  document.documentElement.dataset.lang = savedLanguage;
  document.documentElement.lang = savedLanguage === 'en' ? 'en' : 'zh-CN';

  const navItems = [
    { zh: '首页', en: 'Home', href: 'index.html', key: 'home' },
    { zh: '随笔', en: 'Essays', href: 'posts.html?category=%E9%9A%8F%E7%AC%94', key: 'posts' },
    { zh: '日常', en: 'Daily', href: 'posts.html?category=%E6%97%A5%E5%B8%B8', key: 'posts' },
    { zh: '地图', en: 'Map', href: 'map.html', key: 'map' },
    { zh: '商品', en: 'Shelf', href: 'shop.html', key: 'shop' },
    { zh: '关于', en: 'About', href: 'about.html', key: 'about' },
    { zh: '搜索', en: 'Search', href: 'search.html', key: 'search' }
  ];

  const categories = [
    { name: '随笔', en: 'Essays', desc: '个人观察、情绪、思想碎片。', enDesc: 'Personal observations, moods, and sharp fragments.', href: 'posts.html?category=%E9%9A%8F%E7%AC%94' },
    { name: '日常', en: 'Daily', desc: '生活记录、折腾记录、普通但真实的事。', enDesc: 'Ordinary days, small repairs, and things worth keeping.', href: 'posts.html?category=%E6%97%A5%E5%B8%B8' },
    { name: '经验', en: 'Notes', desc: '学习、工具、博客搭建、AI 使用、效率方法。', enDesc: 'Learning notes, tools, site work, AI use, and workflow habits.', href: 'posts.html?category=%E7%BB%8F%E9%AA%8C' },
    { name: '思想', en: 'Thought', desc: '个人理念、判断、长期思考。', enDesc: 'Judgment, principles, and longer-running thinking.', href: 'posts.html?category=%E6%80%9D%E6%83%B3' },
    { name: '商品', en: 'Shelf', desc: '游戏脚本、合作类、安全资源、预测、其他。', enDesc: 'Scripts, consulting, safe resources, readings, and other shelf items.', href: 'shop.html' }
  ];

  const pageTitles = {
    home: ['重生日记 | 日常、工具和一点判断', 'Chongsheng Journal | Notes, Tools, and Judgment'],
    posts: ['文章 | 重生日记', 'Articles | Chongsheng Journal'],
    shop: ['商品 | 重生日记', 'Digital Shelf | Chongsheng Journal'],
    member: ['会员资源舱 | 重生日记', 'Member Lounge | Chongsheng Journal'],
    about: ['关于 | 重生日记', 'About | Chongsheng Journal'],
    contact: ['联系 | 重生日记', 'Contact | Chongsheng Journal'],
    search: ['搜索 | 重生日记', 'Search | Chongsheng Journal'],
    map: ['站点地图 | 重生日记', 'Site Map | Chongsheng Journal'],
    privacy: ['隐私说明 | 重生日记', 'Privacy | Chongsheng Journal']
  };

  const postCopyEn = {
    'restart-the-blog': {
      title: 'The Day I Rebuilt the Blog',
      category: 'Daily',
      readTime: '4 min',
      tags: ['Blog', 'Record', 'Static Site'],
      summary: 'Starting from one placeholder line, I turned the site into something that can hold notes for a long time.'
    },
    'one-button-afternoon': {
      title: 'An Afternoon Spent on One Button',
      category: 'Essay',
      readTime: '3 min',
      tags: ['Interface', 'Patience', 'Details'],
      summary: 'Button states, focus, touch size, and dark mode decide whether a page feels finished or rough.'
    },
    'script-boundaries': {
      title: 'My Boundaries Around Scripts',
      category: 'Thought',
      readTime: '5 min',
      tags: ['Scripts', 'Compliance', 'Judgment'],
      summary: 'Scripts can save repetitive labor, but they cannot be used to steal, crack, cheat, or push risk onto others.'
    },
    'tool-list-for-myself': {
      title: 'A Short List for the Tools I Actually Use',
      category: 'Notes',
      readTime: '6 min',
      tags: ['Workflow', 'Tools', 'List'],
      summary: 'A useful tool list explains when to use something and when to leave it alone.'
    },
    'yi-page-at-night': {
      title: 'Notes From Building a Zhouyi Page at Night',
      category: 'Essay',
      readTime: '4 min',
      tags: ['Zhouyi', 'Reading', 'Boundary'],
      summary: 'For prediction-related content, the limits need to be written before the atmosphere.'
    },
    'shop-without-auto-payment': {
      title: 'Why the Shop Does Not Need Auto Payment Yet',
      category: 'Shelf Note',
      readTime: '5 min',
      tags: ['Shop', 'Payment', 'Delivery'],
      summary: 'A static site can show products, but it should not hide real payment keys or pretend to be a backend.'
    }
  };

  const productCopyEn = {
    'automation-template-pack': {
      name: 'Compliant Automation Script Pack',
      kind: 'Scripts',
      line: 'Clean templates for local file handling, text cleanup, batch renaming, and personal automation.',
      fit: 'For people who organize materials often and want a safer starting point for scripts.',
      includes: ['PowerShell / JavaScript base templates', 'Common task examples', 'Boundary notes', 'Editable config files'],
      status: 'Consulting',
      price: 'TBD',
      method: 'Contact'
    },
    'static-blog-starter': {
      name: 'Personal Static Blog Starter',
      kind: 'Templates',
      line: 'A pure HTML, CSS, and JavaScript starter that can be hosted directly on GitHub Pages.',
      fit: 'For people who want a light blog without a backend or build pipeline.',
      includes: ['Home and article pages', 'Theme switching', 'Frontend search', 'SEO files', 'Deploy notes'],
      status: 'In progress',
      price: 'Reserved',
      method: 'Ask status'
    },
    'yi-reading': {
      name: 'Zhouyi Reading',
      kind: 'Consulting',
      line: 'A record-style reading around a concrete question, with limits stated clearly.',
      fit: 'For people who want another angle while still making their own decisions.',
      includes: ['Question framing', 'Reading record', 'Interpretation text', 'Risk note'],
      status: 'Consulting',
      price: 'Per request',
      method: 'Contact'
    }
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat(currentLang() === 'en' ? 'en-CA' : 'zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(date));
  }

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function currentLang() {
    return document.documentElement.dataset.lang === 'en' ? 'en' : 'zh';
  }

  function langValue(zh, en) {
    return currentLang() === 'en' ? en : zh;
  }

  function applyTranslations(root = document) {
    const lang = currentLang();
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    if (pageTitles[page]) document.title = pageTitles[page][lang === 'en' ? 1 : 0];
    const skipLink = $('.skip-link');
    if (skipLink) skipLink.textContent = lang === 'en' ? 'Skip to content' : '跳到正文';
    $$('[data-i18n-zh]', root).forEach((node) => {
      const value = lang === 'en' ? node.dataset.i18nEn : node.dataset.i18nZh;
      if (value != null) node.textContent = value;
    });
    $$('[data-i18n-placeholder-zh]', root).forEach((node) => {
      const value = lang === 'en' ? node.dataset.i18nPlaceholderEn : node.dataset.i18nPlaceholderZh;
      if (value != null) node.setAttribute('placeholder', value);
    });
    $$('[data-i18n-aria-zh]', root).forEach((node) => {
      const value = lang === 'en' ? node.dataset.i18nAriaEn : node.dataset.i18nAriaZh;
      if (value != null) node.setAttribute('aria-label', value);
    });
    $$('[data-i18n-title-zh]', root).forEach((node) => {
      const value = lang === 'en' ? node.dataset.i18nTitleEn : node.dataset.i18nTitleZh;
      if (value != null) node.setAttribute('title', value);
    });
    const languageButton = $('.language-toggle');
    if (languageButton) {
      languageButton.textContent = lang === 'en' ? 'Chinese' : '英文';
      languageButton.setAttribute('aria-label', lang === 'en' ? 'Switch to Chinese' : '切换到英文');
      languageButton.setAttribute('title', lang === 'en' ? 'Switch to Chinese' : '切换到英文');
    }
  }

  window.applySiteTranslations = applyTranslations;

  function postUrl(post) {
    return `post.html?slug=${encodeURIComponent(post.slug)}`;
  }

  function viewPost(post) {
    if (currentLang() !== 'en') return post;
    const fallback = postCopyEn[post.slug] || {};
    return {
      ...post,
      ...fallback,
      title: post.titleEn || fallback.title || post.title,
      category: post.categoryEn || fallback.category || post.category,
      readTime: post.readTimeEn || fallback.readTime || post.readTime,
      tags: post.tagsEn || fallback.tags || post.tags,
      summary: post.summaryEn || fallback.summary || post.summary,
      content: post.contentEn || post.content
    };
  }

  function viewProduct(product) {
    if (currentLang() !== 'en') return product;
    const fallback = productCopyEn[product.slug] || {};
    return {
      ...product,
      ...fallback,
      name: product.nameEn || fallback.name || product.name,
      kind: product.kindEn || fallback.kind || product.kind,
      line: product.lineEn || fallback.line || product.line,
      fit: product.fitEn || fallback.fit || product.fit,
      includes: product.includesEn || fallback.includes || product.includes,
      status: product.statusEn || fallback.status || product.status,
      price: product.priceEn || fallback.price || product.price,
      method: product.methodEn || fallback.method || product.method
    };
  }

  function renderHeader() {
    const mount = $('[data-site-header]');
    if (!mount) return;
    const currentCategory = getParam('category');
    const lang = currentLang();
    const nav = navItems.map(({ zh, en, href, key }) => {
      const label = lang === 'en' ? en : zh;
      const hrefQuery = href.includes('?') ? href.split('?')[1] : '';
      const hrefCategory = hrefQuery ? new URLSearchParams(hrefQuery).get('category') : null;
      const active = hrefCategory
        ? page === 'posts' && currentCategory === hrefCategory
        : key === page;
      return `<a class="${active ? 'active' : ''}" href="${href}">${label}</a>`;
    }).join('');

    mount.innerHTML = `
      <header class="site-header">
        <a class="brand" href="index.html" aria-label="${langValue('重生日记首页', 'Chongsheng Journal Home')}">
          <span class="brand-mark">${lang === 'en' ? 'CS' : '重'}</span>
          <span class="brand-text">${langValue('重生日记', 'Chongsheng Journal')}</span>
        </a>
        <nav class="desktop-nav" aria-label="${langValue('主导航', 'Primary navigation')}">${nav}</nav>
        <div class="nav-actions">
          <a class="icon-btn search-btn" href="search.html" aria-label="${langValue('搜索', 'Search')}" title="${langValue('搜索', 'Search')}"><span aria-hidden="true">⌕</span></a>
          <button class="icon-btn language-toggle" type="button" aria-label="${langValue('切换到英文', 'Switch to Chinese')}" title="${langValue('切换到英文', 'Switch to Chinese')}">${lang === 'en' ? 'Chinese' : '英文'}</button>
          <button class="icon-btn theme-toggle" type="button" aria-label="${langValue('切换明暗主题', 'Toggle theme')}" title="${langValue('切换明暗主题', 'Toggle theme')}"><span aria-hidden="true"></span></button>
          <button class="icon-btn menu-toggle" type="button" aria-label="${langValue('打开菜单', 'Open menu')}" aria-expanded="false"><span aria-hidden="true">☰</span></button>
        </div>
      </header>
      <div class="mobile-drawer" hidden>
        <nav aria-label="${langValue('移动端导航', 'Mobile navigation')}">${nav}</nav>
      </div>
    `;
  }

  function renderFooter() {
    const mount = $('[data-site-footer]');
    if (!mount) return;
    mount.innerHTML = `
      <footer class="site-footer">
        <div class="footer-inner">
          <div>
            <strong>${langValue('重生日记', 'Chongsheng Journal')}</strong>
            <p>${langValue('日常、随笔、工具和合规数字资源。', 'Daily notes, essays, tools, and compliant digital resources.')}© 2026 Chongsheng180000.</p>
          </div>
          <nav aria-label="${langValue('页脚链接', 'Footer links')}">
            <a href="rss.xml">${langValue('订阅', 'RSS')}</a>
            <a href="https://github.com/Chongsheng180000" rel="noopener">${langValue('代码主页', 'GitHub')}</a>
            <a href="mailto:Chongsheng20000@gmail.com">${langValue('邮箱', 'Email')}</a>
            <a href="contact.html">${langValue('联系', 'Contact')}</a>
            <a href="map.html">${langValue('站点地图', 'Sitemap')}</a>
            <a href="privacy.html">${langValue('隐私说明', 'Privacy')}</a>
          </nav>
        </div>
      </footer>
    `;
  }

  function initTheme() {
    const root = document.documentElement;
    const button = $('.theme-toggle');
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    const sync = () => {
      const theme = root.dataset.theme || 'light';
      if (themeMeta) themeMeta.content = theme === 'dark' ? '#050608' : '#ead3b3';
      if (button) {
        button.querySelector('span').textContent = theme === 'dark' ? '☀' : '◐';
        button.setAttribute('aria-label', theme === 'dark' ? langValue('切换到白昼主题', 'Switch to daylight mode') : langValue('切换到夜间主题', 'Switch to night mode'));
        button.setAttribute('title', theme === 'dark' ? langValue('切换到白昼主题', 'Switch to daylight mode') : langValue('切换到夜间主题', 'Switch to night mode'));
      }
    };
    sync();
    button?.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      localStorage.setItem('cs-theme', next);
      document.documentElement.animate(
        [{ filter: 'brightness(1.06)' }, { filter: 'brightness(1)' }],
        { duration: 260, easing: 'ease-out' }
      );
      sync();
    });
  }

  function initLanguage() {
    const root = document.documentElement;
    const sync = () => {
      applyTranslations();
      window.dispatchEvent(new CustomEvent('cs:languagechange', { detail: { lang: currentLang() } }));
    };
    let switching = false;
    const handleToggle = () => {
      if (switching) return;
      switching = true;
      const next = currentLang() === 'en' ? 'zh' : 'en';
      try {
        localStorage.setItem('cs-lang', next);
      } catch {
        switching = false;
        return;
      }
      root.classList.add('is-language-switching');
      const target = new URL(window.location.href);
      target.searchParams.set('lang', next);
      window.location.assign(target.href);
    };
    const bind = () => $('.language-toggle')?.addEventListener('click', handleToggle);
    bind();
    sync();
    window.addEventListener('storage', (event) => {
      if (event.key !== 'cs-lang' || !['zh', 'en'].includes(event.newValue)) return;
      if (event.newValue !== currentLang()) window.location.reload();
    });
  }

  function initMobileNav() {
    const toggle = $('.menu-toggle');
    const drawer = $('.mobile-drawer');
    if (!toggle || !drawer) return;
    toggle.addEventListener('click', () => {
      const open = drawer.hasAttribute('hidden');
      drawer.toggleAttribute('hidden', !open);
      toggle.setAttribute('aria-expanded', String(open));
      body.classList.toggle('nav-open', open);
    });
    $$('.mobile-drawer a').forEach((link) => {
      link.addEventListener('click', () => {
        drawer.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        body.classList.remove('nav-open');
      });
    });
  }

  function initCursor() {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reduceMotion) return;

    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.append(dot, ring);

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;

    window.addEventListener('pointermove', (event) => {
      document.body.classList.add('cursor-ready');
      x = event.clientX;
      y = event.clientY;
      dot.style.transform = `translate(${x}px, ${y}px)`;
      const interactive = event.target.closest('a, button, input, select, textarea');
      document.body.classList.toggle('cursor-hot', Boolean(interactive));
    }, { passive: true });

    const tick = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(tick);
    };
    tick();
  }

  function renderPostCard(post, compact = false) {
    const item = viewPost(post);
    return `
      <article class="post-card ${compact ? 'compact' : ''}">
        <a class="post-card-link" href="${postUrl(post)}" aria-label="${escapeHtml(item.title)}"></a>
        <div class="post-meta">
          <span>${escapeHtml(item.category)}</span>
          <time datetime="${post.date}">${formatDate(post.date)}</time>
          <span>${escapeHtml(item.readTime)}</span>
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary)}</p>
        <div class="tag-row">${item.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
      </article>
    `;
  }

  function renderHome() {
    const recentMount = $('#home-recent-posts');
    if (recentMount) {
      recentMount.innerHTML = posts
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6)
        .map((post) => renderPostCard(post))
        .join('');
    }

    const categoryMount = $('#home-categories');
    if (categoryMount) {
      categoryMount.innerHTML = categories.map((item) => {
        const count = item.name === '商品'
          ? products.length
          : posts.filter((post) => post.category === item.name).length;
        const label = currentLang() === 'en' ? item.en : item.name;
        const desc = currentLang() === 'en' ? item.enDesc : item.desc;
        return `
          <a class="category-lane" href="${item.href}">
            <span>${escapeHtml(label)}</span>
            <strong>${count}</strong>
            <p>${escapeHtml(desc)}</p>
          </a>
        `;
      }).join('');
    }

    const productMount = $('#home-products');
    if (productMount) {
      productMount.innerHTML = products.slice(0, 3).map(renderProductCard).join('');
    }
  }

  function renderFilters(list, mount, activeValue, onSelect, labels = new Map()) {
    if (!mount) return;
    mount.innerHTML = list.map((value) => {
      const active = value === activeValue;
      const label = labels.get(value) || value;
      return `<button class="chip ${active ? 'active' : ''}" type="button" data-value="${escapeHtml(value)}">${escapeHtml(label)}</button>`;
    }).join('');
    $$('button', mount).forEach((button) => {
      button.addEventListener('click', () => onSelect(button.dataset.value));
    });
  }

  function renderPostsPage() {
    const listMount = $('#posts-list');
    if (!listMount) return;

    const searchInput = $('#post-search');
    const sortSelect = $('#post-sort');
    const categoryMount = $('#category-filters');
    const tagMount = $('#tag-filters');
    const countMount = $('#post-count');
    const empty = $('#posts-empty');

    const tags = ['全部', ...new Set(posts.flatMap((post) => post.tags))];
    const cats = ['全部', ...new Set(posts.map((post) => post.category))];
    const categoryLabels = new Map([['全部', langValue('全部', 'All')]]);
    const tagLabels = new Map([['全部', langValue('全部', 'All')]]);
    posts.forEach((post) => {
      categoryLabels.set(post.category, currentLang() === 'en' ? post.categoryEn || post.category : post.category);
      post.tags.forEach((tag, index) => tagLabels.set(tag, currentLang() === 'en' ? post.tagsEn?.[index] || tag : tag));
    });
    const initialCategory = getParam('category') || '全部';
    const state = {
      category: cats.includes(initialCategory) ? initialCategory : '全部',
      tag: '全部',
      query: '',
      sort: 'newest'
    };

    const update = () => {
      const query = state.query.trim().toLowerCase();
      let result = posts.filter((post) => {
        const categoryOk = state.category === '全部' || post.category === state.category;
        const tagOk = state.tag === '全部' || post.tags.includes(state.tag);
        const haystack = [post.title, post.summary, post.category, post.date, ...post.tags].join(' ').toLowerCase();
        return categoryOk && tagOk && (!query || haystack.includes(query));
      });
      result.sort((a, b) => {
        const diff = new Date(b.date) - new Date(a.date);
        return state.sort === 'newest' ? diff : -diff;
      });

      listMount.innerHTML = result.map((post) => renderPostCard(post, true)).join('');
      if (countMount) countMount.textContent = currentLang() === 'en' ? `${result.length} routes` : `${result.length} 篇`;
      if (empty) empty.hidden = result.length !== 0;
      renderFilters(cats, categoryMount, state.category, (value) => {
        state.category = value;
        update();
      }, categoryLabels);
      renderFilters(tags, tagMount, state.tag, (value) => {
        state.tag = value;
        update();
      }, tagLabels);
    };

    searchInput?.addEventListener('input', () => {
      state.query = searchInput.value;
      update();
    });
    sortSelect?.addEventListener('change', () => {
      state.sort = sortSelect.value;
      update();
    });
    update();
  }

  function sectionId(value) {
    return 'sec-' + encodeURIComponent(value).replaceAll('%', '').toLowerCase();
  }

  function renderPostDetail() {
    const mount = $('#post-detail');
    if (!mount) return;
    const slug = getParam('slug') || posts[0]?.slug;
    const post = posts.find((item) => item.slug === slug);

    if (!post) {
      mount.innerHTML = `
        <div class="article-missing">
          <p class="eyebrow">404</p>
          <h1>${langValue('这篇文章还没放上来。', 'This article is not available.')}</h1>
          <p>${langValue('链接可能写错了，或者文章被挪走了。', 'The link may be incorrect, or the article has moved.')}</p>
          <a class="btn ghost" href="posts.html">${langValue('返回文章列表', 'Back to reading')}</a>
        </div>
      `;
      return;
    }

    const item = viewPost(post);
    const index = posts.findIndex((entry) => entry.slug === post.slug);
    const prev = posts[index + 1];
    const next = posts[index - 1];
    document.title = `${item.title} | ${langValue('重生日记', 'Chongsheng Journal')}`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.content = item.summary;
    const canonicalUrl = `https://chongsheng180000.github.io/${postUrl(post)}`;
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = canonicalUrl;
    const socialMeta = {
      'og:title': document.title,
      'og:description': item.summary,
      'og:url': canonicalUrl
    };
    Object.entries(socialMeta).forEach(([property, content]) => {
      const element = document.querySelector(`meta[property="${property}"]`);
      if (element) element.content = content;
    });

    const toc = item.content.map((section) => `<a href="#${sectionId(section.heading)}">${escapeHtml(section.heading)}</a>`).join('');
    const bodyHtml = item.content.map((section) => `
      <section id="${sectionId(section.heading)}">
        <h2>${escapeHtml(section.heading)}</h2>
        ${section.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
        ${section.code ? `<pre><code>${escapeHtml(section.code)}</code></pre>` : ''}
      </section>
    `).join('');

    mount.innerHTML = `
      <a class="back-link" href="posts.html">${langValue('← 返回文章列表', '← Back to archive')}</a>
      <header class="article-head">
        <div class="post-meta">
          <span>${escapeHtml(item.category)}</span>
          <time datetime="${post.date}">${formatDate(post.date)}</time>
          <span>${escapeHtml(item.readTime)}</span>
        </div>
        <h1>${escapeHtml(item.title)}</h1>
        <p>${escapeHtml(item.summary)}</p>
        <div class="tag-row">${item.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
      </header>
      <div class="article-layout">
        <aside class="toc" aria-label="${langValue('目录', 'Table of contents')}">
          <strong>${langValue('目录', 'Contents')}</strong>
          ${toc || `<span>${langValue('暂无', 'None')}</span>`}
        </aside>
        <div class="article-body">${bodyHtml}</div>
      </div>
      <nav class="post-nav" aria-label="${langValue('上一篇和下一篇', 'Previous and next article')}">
        ${prev ? `<a href="${postUrl(prev)}"><span>${langValue('上一篇', 'Previous')}</span><strong>${escapeHtml(viewPost(prev).title)}</strong></a>` : '<span></span>'}
        ${next ? `<a href="${postUrl(next)}"><span>${langValue('下一篇', 'Next')}</span><strong>${escapeHtml(viewPost(next).title)}</strong></a>` : '<span></span>'}
      </nav>
    `;
  }

  function renderProductCard(product, index = 0) {
    const item = viewProduct(product);
    return `
      <article class="product-card" data-kind="${escapeHtml(item.kind)}">
        <div class="product-top">
          <span><small>${String(index + 1).padStart(2, '0')}</small>${escapeHtml(item.kind)}</span>
          <em>${escapeHtml(item.status)}</em>
        </div>
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.line)}</p>
        <dl>
          <div><dt>${langValue('适合谁', 'For')}</dt><dd>${escapeHtml(item.fit)}</dd></div>
          <div><dt>${langValue('价格', 'Price')}</dt><dd>${escapeHtml(item.price)}</dd></div>
        </dl>
        <ul>${item.includes.map((entry) => `<li>${escapeHtml(entry)}</li>`).join('')}</ul>
        <a class="btn small" href="contact.html?product=${encodeURIComponent(product.slug)}">${escapeHtml(item.method)}</a>
      </article>
    `;
  }

  function renderShopPage() {
    const mount = $('#shop-products');
    if (!mount) return;
    const controls = $('#shop-category-controls');
    const countMount = $('#shop-product-count');
    const activeMount = $('#shop-active-category');
    const categories = productCategories.length
      ? productCategories
      : [...new Set(products.map((item) => item.kind))].map((key) => ({ key, en: products.find((item) => item.kind === key)?.kindEn || key, code: key.slice(0, 3), desc: '', descEn: '' }));
    let active = 'all';

    const categoryView = (category) => ({
      ...category,
      label: currentLang() === 'en' ? category.en : category.key,
      description: currentLang() === 'en' ? category.descEn : category.desc
    });

    const renderCategorySection = (category, entries, categoryIndex) => {
      const view = categoryView(category);
      return `
        <section class="product-category-section" data-category="${escapeHtml(category.key)}">
          <header class="product-category-heading">
            <span>${String(categoryIndex + 1).padStart(2, '0')}</span>
            <div>
              <p>${escapeHtml(category.code || 'CS')}</p>
              <h2>${escapeHtml(view.label)}</h2>
              <small>${escapeHtml(view.description)}</small>
            </div>
            <strong>${String(entries.length).padStart(2, '0')}</strong>
          </header>
          <div class="product-grid">
            ${entries.map((product, index) => renderProductCard(product, index)).join('')}
          </div>
        </section>
      `;
    };

    const update = () => {
      const visibleCategories = active === 'all' ? categories : categories.filter((category) => category.key === active);
      const result = active === 'all' ? products : products.filter((item) => item.kind === active);
      mount.innerHTML = visibleCategories.map((category) => {
        const entries = products.filter((item) => item.kind === category.key);
        return renderCategorySection(category, entries, categories.indexOf(category));
      }).join('');
      if (countMount) countMount.textContent = currentLang() === 'en' ? `${result.length} items` : `${result.length} 件`;
      if (activeMount) {
        const selected = categories.find((category) => category.key === active);
        activeMount.textContent = selected ? categoryView(selected).label : langValue('全部板块', 'All departments');
      }
      $$('[data-product-filter]', controls || document).forEach((button) => {
        const selected = button.dataset.productFilter === active;
        button.classList.toggle('active', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
      initReveal(mount);
    };

    if (controls) {
      controls.innerHTML = [
        `<button class="chip active" type="button" data-product-filter="all" aria-pressed="true"><span>00</span>${langValue('全部', 'All')}<small>${products.length}</small></button>`,
        ...categories.map((category, index) => {
          const view = categoryView(category);
          const count = products.filter((item) => item.kind === category.key).length;
          return `<button class="chip" type="button" data-product-filter="${escapeHtml(category.key)}" aria-pressed="false"><span>${String(index + 1).padStart(2, '0')}</span>${escapeHtml(view.label)}<small>${count}</small></button>`;
        })
      ].join('');
    }

    $$('[data-product-filter]', controls || document).forEach((button) => {
      button.addEventListener('click', () => {
        active = button.dataset.productFilter;
        update();
      });
    });
    update();
  }

  function initCockpitMotion() {
    const cockpit = $('[data-cockpit]');
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!cockpit || !finePointer || reduceMotion) return;

    cockpit.addEventListener('pointermove', (event) => {
      const rect = cockpit.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      cockpit.style.setProperty('--tilt-x', `${(x - 0.5) * 1.8}deg`);
      cockpit.style.setProperty('--tilt-y', `${(0.5 - y) * 1.2}deg`);
      cockpit.style.setProperty('--glow-x', `${x * 100}%`);
      cockpit.style.setProperty('--glow-y', `${y * 100}%`);
    }, { passive: true });

    cockpit.addEventListener('pointerleave', () => {
      cockpit.style.setProperty('--tilt-x', '0deg');
      cockpit.style.setProperty('--tilt-y', '0deg');
      cockpit.style.setProperty('--glow-x', '50%');
      cockpit.style.setProperty('--glow-y', '28%');
    });
  }

  function initReveal(scope = document) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    const targets = $$('.section, .page-hero, .post-card, .product-card, .product-category-section, .contact-card, .category-lane', scope);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.animate(
            [
              { opacity: 0.72, transform: 'translateY(12px)' },
              { opacity: 1, transform: 'translateY(0)' }
            ],
            { duration: 460, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' }
          );
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    targets.forEach((item) => observer.observe(item));
  }

  renderHeader();
  renderFooter();
  initTheme();
  initMobileNav();
  renderHome();
  renderPostsPage();
  renderPostDetail();
  renderShopPage();
  initLanguage();
  initCockpitMotion();
  initCursor();
  initReveal();
})();
