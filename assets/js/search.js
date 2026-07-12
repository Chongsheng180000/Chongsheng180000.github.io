(function () {
  'use strict';

  const posts = window.BLOG_POSTS || [];
  const products = window.BLOG_PRODUCTS || [];
  const input = document.querySelector('#global-search-input');
  const postMount = document.querySelector('#search-post-results');
  const productMount = document.querySelector('#search-product-results');
  const postCount = document.querySelector('#search-post-count');
  const productCount = document.querySelector('#search-product-count');
  const empty = document.querySelector('#search-empty');
  const isEn = document.documentElement.dataset.lang === 'en';

  if (!input || !postMount || !productMount) return;

  const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const matches = (values, query) => values.join(' ').toLowerCase().includes(query);

  const viewPost = (post) => isEn ? {
    ...post,
    title: post.titleEn || post.title,
    category: post.categoryEn || post.category,
    summary: post.summaryEn || post.summary,
    tags: post.tagsEn || post.tags
  } : post;

  const viewProduct = (product) => isEn ? {
    ...product,
    name: product.nameEn || product.name,
    kind: product.kindEn || product.kind,
    line: product.lineEn || product.line,
    status: product.statusEn || product.status
  } : product;

  function renderPost(post) {
    const item = viewPost(post);
    return `
      <article class="search-item">
        <a href="post.html?slug=${encodeURIComponent(post.slug)}">
          <span>${escapeHtml(item.category)}</span>
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.summary)}</p>
        </a>
      </article>
    `;
  }

  function renderProduct(product) {
    const item = viewProduct(product);
    return `
      <article class="search-item product">
        <a href="contact.html?product=${encodeURIComponent(product.slug)}">
          <span>${escapeHtml(item.kind)} · ${escapeHtml(item.status)}</span>
          <strong>${escapeHtml(item.name)}</strong>
          <p>${escapeHtml(item.line)}</p>
        </a>
      </article>
    `;
  }

  function update() {
    const query = input.value.trim().toLowerCase();
    const postResults = query
      ? posts.filter((post) => {
          const item = viewPost(post);
          return matches([post.title, post.summary, post.category, ...post.tags, item.title, item.summary, item.category, ...item.tags], query);
        })
      : posts.slice(0, 4);
    const productResults = query
      ? products.filter((product) => {
          const item = viewProduct(product);
          return matches([product.name, product.line, product.kind, product.status, product.fit, item.name, item.line, item.kind, item.status], query);
        })
      : products.slice(0, 4);

    postMount.innerHTML = postResults.map(renderPost).join('');
    productMount.innerHTML = productResults.map(renderProduct).join('');
    postCount.textContent = String(postResults.length);
    productCount.textContent = String(productResults.length);
    empty.hidden = postResults.length + productResults.length !== 0;
  }

  input.addEventListener('input', update);
  const initial = new URLSearchParams(window.location.search).get('q');
  if (initial) input.value = initial;
  update();
})();
