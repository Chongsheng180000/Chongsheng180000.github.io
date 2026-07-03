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

  if (!input || !postMount || !productMount) return;

  const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const matches = (values, query) => values.join(' ').toLowerCase().includes(query);

  function renderPost(post) {
    return `
      <article class="search-item">
        <a href="post.html?slug=${encodeURIComponent(post.slug)}">
          <span>${escapeHtml(post.category)}</span>
          <strong>${escapeHtml(post.title)}</strong>
          <p>${escapeHtml(post.summary)}</p>
        </a>
      </article>
    `;
  }

  function renderProduct(product) {
    return `
      <article class="search-item product">
        <a href="contact.html?product=${encodeURIComponent(product.slug)}">
          <span>${escapeHtml(product.kind)} · ${escapeHtml(product.status)}</span>
          <strong>${escapeHtml(product.name)}</strong>
          <p>${escapeHtml(product.line)}</p>
        </a>
      </article>
    `;
  }

  function update() {
    const query = input.value.trim().toLowerCase();
    const postResults = query
      ? posts.filter((post) => matches([post.title, post.summary, post.category, ...post.tags], query))
      : posts.slice(0, 4);
    const productResults = query
      ? products.filter((product) => matches([product.name, product.line, product.kind, product.status, product.fit], query))
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
