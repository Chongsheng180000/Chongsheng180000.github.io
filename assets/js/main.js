(function () {
  'use strict';

  const posts = window.BLOG_POSTS || [];
  const products = window.BLOG_PRODUCTS || [];
  const body = document.body;
  const page = body.dataset.page || 'home';

  const navItems = [
    ['首页', 'index.html', 'home'],
    ['随笔', 'posts.html?category=%E9%9A%8F%E7%AC%94', 'posts'],
    ['日常', 'posts.html?category=%E6%97%A5%E5%B8%B8', 'posts'],
    ['经验', 'posts.html?category=%E7%BB%8F%E9%AA%8C', 'posts'],
    ['思想', 'posts.html?category=%E6%80%9D%E6%83%B3', 'posts'],
    ['商品', 'shop.html', 'shop'],
    ['关于', 'about.html', 'about'],
    ['搜索', 'search.html', 'search']
  ];

  const categories = [
    { name: '随笔', desc: '个人观察、情绪、思想碎片。', href: 'posts.html?category=%E9%9A%8F%E7%AC%94' },
    { name: '日常', desc: '生活记录、折腾记录、普通但真实的事。', href: 'posts.html?category=%E6%97%A5%E5%B8%B8' },
    { name: '经验', desc: '学习、工具、博客搭建、AI 使用、效率方法。', href: 'posts.html?category=%E7%BB%8F%E9%AA%8C' },
    { name: '思想', desc: '个人理念、判断、长期思考。', href: 'posts.html?category=%E6%80%9D%E6%83%B3' },
    { name: '商品', desc: '游戏脚本、合作类、安全资源、预测、其他。', href: 'shop.html' }
  ];

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
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(date));
  }

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function postUrl(post) {
    return `post.html?slug=${encodeURIComponent(post.slug)}`;
  }

  function renderHeader() {
    const mount = $('[data-site-header]');
    if (!mount) return;
    const currentCategory = getParam('category');
    const nav = navItems.map(([label, href, key]) => {
      const hrefQuery = href.includes('?') ? href.split('?')[1] : '';
      const hrefCategory = hrefQuery ? new URLSearchParams(hrefQuery).get('category') : null;
      const active = hrefCategory
        ? page === 'posts' && currentCategory === hrefCategory
        : key === page;
      return `<a class="${active ? 'active' : ''}" href="${href}">${label}</a>`;
    }).join('');

    mount.innerHTML = `
      <header class="site-header">
        <a class="brand" href="index.html" aria-label="重生日记首页">
          <span class="brand-mark">重</span>
          <span class="brand-text">重生日记</span>
        </a>
        <nav class="desktop-nav" aria-label="主导航">${nav}</nav>
        <div class="nav-actions">
          <a class="icon-btn search-btn" href="search.html" aria-label="搜索" title="搜索"><span aria-hidden="true">⌕</span></a>
          <button class="icon-btn theme-toggle" type="button" aria-label="切换明暗主题" title="切换明暗主题"><span aria-hidden="true"></span></button>
          <button class="icon-btn menu-toggle" type="button" aria-label="打开菜单" aria-expanded="false"><span aria-hidden="true">☰</span></button>
        </div>
      </header>
      <div class="mobile-drawer" hidden>
        <nav aria-label="移动端导航">${nav}</nav>
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
            <strong>重生日记</strong>
            <p>日常、随笔、工具和合规数字资源。© 2026 Chongsheng180000.</p>
          </div>
          <nav aria-label="页脚链接">
            <a href="rss.xml">RSS</a>
            <a href="https://github.com/Chongsheng180000" rel="noopener">GitHub</a>
            <a href="contact.html">联系</a>
            <a href="map.html">站点地图</a>
            <a href="privacy.html">隐私说明</a>
          </nav>
        </div>
      </footer>
    `;
  }

  function initTheme() {
    const root = document.documentElement;
    const button = $('.theme-toggle');
    const sync = () => {
      const theme = root.dataset.theme || 'light';
      if (button) {
        button.querySelector('span').textContent = theme === 'dark' ? '☀' : '◐';
        button.setAttribute('aria-label', theme === 'dark' ? '切换到明亮主题' : '切换到暗色主题');
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
    return `
      <article class="post-card ${compact ? 'compact' : ''}">
        <a class="post-card-link" href="${postUrl(post)}" aria-label="${escapeHtml(post.title)}"></a>
        <div class="post-meta">
          <span>${escapeHtml(post.category)}</span>
          <time datetime="${post.date}">${formatDate(post.date)}</time>
          <span>${escapeHtml(post.readTime)}</span>
        </div>
        <h3>${escapeHtml(post.title)}</h3>
        <p>${escapeHtml(post.summary)}</p>
        <div class="tag-row">${post.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
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
        return `
          <a class="category-lane" href="${item.href}">
            <span>${item.name}</span>
            <strong>${count}</strong>
            <p>${item.desc}</p>
          </a>
        `;
      }).join('');
    }

    const productMount = $('#home-products');
    if (productMount) {
      productMount.innerHTML = products.slice(0, 3).map(renderProductCard).join('');
    }
  }

  function renderFilters(list, mount, activeValue, onSelect) {
    if (!mount) return;
    mount.innerHTML = list.map((value) => {
      const active = value === activeValue;
      return `<button class="chip ${active ? 'active' : ''}" type="button" data-value="${escapeHtml(value)}">${escapeHtml(value)}</button>`;
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
        const haystack = [post.title, post.summary, post.category, ...post.tags].join(' ').toLowerCase();
        return categoryOk && tagOk && (!query || haystack.includes(query));
      });
      result.sort((a, b) => {
        const diff = new Date(b.date) - new Date(a.date);
        return state.sort === 'newest' ? diff : -diff;
      });

      listMount.innerHTML = result.map((post) => renderPostCard(post, true)).join('');
      if (countMount) countMount.textContent = `${result.length} 篇`;
      if (empty) empty.hidden = result.length !== 0;
      renderFilters(cats, categoryMount, state.category, (value) => {
        state.category = value;
        update();
      });
      renderFilters(tags, tagMount, state.tag, (value) => {
        state.tag = value;
        update();
      });
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
          <h1>这篇文章还没放上来。</h1>
          <p>链接可能写错了，或者文章被挪走了。</p>
          <a class="btn ghost" href="posts.html">返回文章列表</a>
        </div>
      `;
      return;
    }

    const index = posts.findIndex((item) => item.slug === post.slug);
    const prev = posts[index + 1];
    const next = posts[index - 1];
    document.title = `${post.title} | 重生日记`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.content = post.summary;

    const toc = post.content.map((section) => `<a href="#${sectionId(section.heading)}">${escapeHtml(section.heading)}</a>`).join('');
    const bodyHtml = post.content.map((section) => `
      <section id="${sectionId(section.heading)}">
        <h2>${escapeHtml(section.heading)}</h2>
        ${section.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
        ${section.code ? `<pre><code>${escapeHtml(section.code)}</code></pre>` : ''}
      </section>
    `).join('');

    mount.innerHTML = `
      <a class="back-link" href="posts.html">← 返回文章列表</a>
      <header class="article-head">
        <div class="post-meta">
          <span>${escapeHtml(post.category)}</span>
          <time datetime="${post.date}">${formatDate(post.date)}</time>
          <span>${escapeHtml(post.readTime)}</span>
        </div>
        <h1>${escapeHtml(post.title)}</h1>
        <p>${escapeHtml(post.summary)}</p>
        <div class="tag-row">${post.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
      </header>
      <div class="article-layout">
        <aside class="toc" aria-label="目录">
          <strong>目录</strong>
          ${toc || '<span>暂无</span>'}
        </aside>
        <div class="article-body">${bodyHtml}</div>
      </div>
      <nav class="post-nav" aria-label="上一篇和下一篇">
        ${prev ? `<a href="${postUrl(prev)}"><span>上一篇</span><strong>${escapeHtml(prev.title)}</strong></a>` : '<span></span>'}
        ${next ? `<a href="${postUrl(next)}"><span>下一篇</span><strong>${escapeHtml(next.title)}</strong></a>` : '<span></span>'}
      </nav>
    `;
  }

  function renderProductCard(product) {
    return `
      <article class="product-card" data-kind="${escapeHtml(product.kind)}">
        <div class="product-top">
          <span>${escapeHtml(product.kind)}</span>
          <em>${escapeHtml(product.status)}</em>
        </div>
        <h3>${escapeHtml(product.name)}</h3>
        <p>${escapeHtml(product.line)}</p>
        <dl>
          <div><dt>适合谁</dt><dd>${escapeHtml(product.fit)}</dd></div>
          <div><dt>价格</dt><dd>${escapeHtml(product.price)}</dd></div>
        </dl>
        <ul>${product.includes.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
        <a class="btn small" href="contact.html?product=${encodeURIComponent(product.slug)}">${escapeHtml(product.method)}</a>
      </article>
    `;
  }

  function renderShopPage() {
    const mount = $('#shop-products');
    if (!mount) return;
    const buttons = $$('[data-product-filter]');
    let active = 'all';

    const update = () => {
      const result = active === 'all' ? products : products.filter((item) => item.kind === active);
      mount.innerHTML = result.map(renderProductCard).join('');
      buttons.forEach((button) => button.classList.toggle('active', button.dataset.productFilter === active));
    };

    buttons.forEach((button) => {
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

  function initReveal() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    const targets = $$('.section, .page-hero, .post-card, .product-card, .contact-card, .category-lane');
    targets.forEach((item) => item.classList.add('reveal'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
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
  initCockpitMotion();
  initCursor();
  initReveal();
})();
