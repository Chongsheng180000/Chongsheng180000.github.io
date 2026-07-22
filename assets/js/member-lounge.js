(function () {
  'use strict';

  if (document.body.dataset.page !== 'member') return;

  const config = window.CHONGSHENG_MEMBER_CONFIG || {};
  const apiBase = String(config.apiBase || '').replace(/\/+$/u, '');
  const deviceStorageKey = config.deviceStorageKey || 'cs-member-device-id';
  const tokenStorageKey = config.tokenStorageKey || 'cs-member-session-token';
  const requestTimeout = 12000;

  const trigger = document.getElementById('member-access-trigger');
  const entryStatus = document.querySelector('.member-entry-console__status b');
  const dialog = document.getElementById('member-access-dialog');
  const closeButton = document.getElementById('member-dialog-close');
  const form = document.getElementById('member-access-form');
  const codeInput = document.getElementById('member-code');
  const verifyButton = document.getElementById('member-verify');
  const submitLabel = document.querySelector('[data-member-submit-label]');
  const accessStatus = document.getElementById('member-access-status');
  const lounge = document.getElementById('member-lounge');
  const logoutButton = document.getElementById('member-logout');
  const categoryStrip = document.getElementById('member-category-strip');
  const productMount = document.getElementById('member-products');
  const productCount = document.getElementById('member-product-count');
  const activeCategoryMount = document.getElementById('member-active-category');
  const detailMount = document.getElementById('member-detail-console');

  if (!apiBase || !trigger || !dialog || !form || !codeInput || !lounge || !productMount) return;

  const state = {
    authenticated: false,
    session: null,
    products: [],
    activeCategory: 'all',
    submitting: false,
    requestController: null,
    expiryTimer: null,
    opener: null
  };

  const text = (zh, en) => document.documentElement.dataset.lang === 'en' ? en : zh;

  function readStorage(storage, key) {
    try {
      return storage.getItem(key) || '';
    } catch {
      return '';
    }
  }

  function writeStorage(storage, key, value) {
    try {
      storage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  function removeStorage(storage, key) {
    try {
      storage.removeItem(key);
    } catch {
      // Storage can be unavailable in hardened browser modes.
    }
  }

  function randomDeviceId() {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  function getDeviceId() {
    const existing = readStorage(localStorage, deviceStorageKey);
    if (existing) return existing;
    const created = randomDeviceId();
    return writeStorage(localStorage, deviceStorageKey, created) ? created : '';
  }

  async function parseJson(response) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  async function request(path, options = {}) {
    const controller = new AbortController();
    const abortFromCaller = () => controller.abort();
    if (options.signal) {
      if (options.signal.aborted) controller.abort();
      else options.signal.addEventListener('abort', abortFromCaller, { once: true });
    }
    const timeout = window.setTimeout(() => controller.abort(), requestTimeout);
    const headers = new Headers(options.headers || {});
    headers.set('Accept', 'application/json');
    try {
      return await fetch(`${apiBase}${path}`, {
        ...options,
        headers,
        cache: 'no-store',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        signal: controller.signal
      });
    } finally {
      window.clearTimeout(timeout);
      options.signal?.removeEventListener('abort', abortFromCaller);
    }
  }

  function authenticatedHeaders(token, deviceId) {
    return {
      Authorization: `Bearer ${token}`,
      'X-Device-ID': deviceId
    };
  }

  function setAccessStatus(kind, message) {
    accessStatus.dataset.state = kind || '';
    accessStatus.textContent = message || '';
  }

  function setSubmitting(submitting) {
    state.submitting = submitting;
    verifyButton.disabled = submitting;
    codeInput.disabled = submitting;
    dialog.setAttribute('aria-busy', String(submitting));
    submitLabel.textContent = submitting
      ? text('正在验证会员凭证……', 'Verifying member access…')
      : text('验证并进入', 'Verify and enter');
  }

  function openDialog() {
    if (state.authenticated) {
      lounge.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      return;
    }
    getDeviceId();
    state.opener = document.activeElement;
    setAccessStatus('', '');
    dialog.showModal();
    window.setTimeout(() => codeInput.focus(), 0);
  }

  function closeDialog() {
    if (state.submitting && state.requestController) state.requestController.abort();
    codeInput.value = '';
    setSubmitting(false);
    setAccessStatus('', '');
    if (dialog.open) dialog.close();
  }

  function clearMemberState(removeToken = true) {
    if (removeToken) removeStorage(sessionStorage, tokenStorageKey);
    if (state.expiryTimer) window.clearTimeout(state.expiryTimer);
    state.expiryTimer = null;
    state.authenticated = false;
    state.session = null;
    state.products = [];
    state.activeCategory = 'all';
    document.body.classList.remove('member-authenticated');
    lounge.hidden = true;
    lounge.removeAttribute('data-ready');
    productMount.replaceChildren();
    categoryStrip.replaceChildren();
    detailMount.replaceChildren();
    detailMount.hidden = true;
    productCount.textContent = '0';
    trigger.classList.remove('is-verified');
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.querySelector('strong').textContent = text('会员区', 'Member Lounge');
    trigger.querySelector('small').textContent = text('验证会员凭证', 'Verify member access');
    if (entryStatus) entryStatus.textContent = text('私享入口待验证', 'Private access locked');
  }

  function categoryLabel(category) {
    const labels = {
      all: ['全部资源', 'All resources'],
      'resource-pack': ['资源包', 'Resource packs'],
      template: ['高级模板', 'Advanced templates'],
      script: ['私享脚本', 'Private scripts'],
      custom: ['定制需求', 'Custom requests']
    };
    const pair = labels[category];
    return pair ? text(pair[0], pair[1]) : category.replaceAll('-', ' ');
  }

  function formatMemberDate(epoch) {
    if (!Number.isFinite(Number(epoch)) || Number(epoch) <= 0) return text('待更新', 'Pending');
    return new Intl.DateTimeFormat(document.documentElement.dataset.lang === 'en' ? 'en-CA' : 'zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(Number(epoch) * 1000));
  }

  function memberButton(label, className, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;
    button.addEventListener('click', onClick);
    return button;
  }

  function renderCustomRequest() {
    const panel = document.createElement('section');
    panel.className = 'member-custom-request';
    const copy = document.createElement('div');
    const eyebrow = document.createElement('span');
    eyebrow.textContent = text('定制需求', 'Custom requests');
    const heading = document.createElement('h3');
    heading.textContent = text('先把用途和边界说清楚。', 'Start with the intended use and boundaries.');
    const description = document.createElement('p');
    description.textContent = text(
      '说明目标、使用环境和交付预期。无法合规完成的需求不会接单。',
      'Describe the goal, environment, and expected delivery. Requests that cannot be completed lawfully are declined.'
    );
    copy.append(eyebrow, heading, description);
    const link = document.createElement('a');
    link.className = 'member-product-action member-product-action--primary';
    link.href = 'contact.html?topic=member-custom-request';
    link.textContent = text('提交需求', 'Send request');
    panel.append(copy, link);
    productMount.replaceChildren(panel);
  }

  function renderProduct(product, index) {
    const article = document.createElement('article');
    article.className = 'member-product-module';
    article.style.setProperty('--member-spot-x', '50%');
    article.style.setProperty('--member-spot-y', '18%');
    article.style.setProperty('--member-tilt-x', '0deg');
    article.style.setProperty('--member-tilt-y', '0deg');
    if (product.featured) article.dataset.featured = 'true';

    const top = document.createElement('div');
    top.className = 'member-product-module__top';
    const indexLabel = document.createElement('span');
    indexLabel.textContent = String(index + 1).padStart(2, '0');
    const category = document.createElement('b');
    category.textContent = categoryLabel(String(product.category || 'resource-pack'));
    const status = document.createElement('em');
    status.innerHTML = '<i aria-hidden="true"></i>';
    status.append(document.createTextNode(String(product.status || text('可预览', 'Preview'))));
    top.append(indexLabel, category, status);

    const title = document.createElement('h3');
    title.textContent = String(product.title || text('未命名资源', 'Untitled resource'));
    const subtitle = document.createElement('p');
    subtitle.className = 'member-product-module__subtitle';
    subtitle.textContent = String(product.subtitle || '');
    const description = document.createElement('p');
    description.className = 'member-product-module__description';
    description.textContent = String(product.description || '');

    const metadata = document.createElement('dl');
    const metadataItems = [
      [text('版本', 'Version'), product.version || text('待定', 'Pending')],
      [text('更新', 'Updated'), formatMemberDate(product.updatedAt || product.createdAt)],
      [text('权限', 'Access'), product.planRequired || 'member']
    ];
    metadataItems.forEach(([term, value]) => {
      const item = document.createElement('div');
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = String(term);
      dd.textContent = String(value);
      item.append(dt, dd);
      metadata.append(item);
    });

    const actions = document.createElement('div');
    actions.className = 'member-product-module__actions';
    const preview = memberButton(text('查看详情', 'View details'), 'member-product-action', () => loadProductDetail(product.slug, preview));
    preview.setAttribute('aria-controls', 'member-detail-console');
    preview.setAttribute('aria-expanded', 'false');
    const requestLink = document.createElement('a');
    requestLink.className = 'member-product-action member-product-action--primary';
    requestLink.href = `contact.html?topic=member-resource&product=${encodeURIComponent(String(product.slug || ''))}`;
    requestLink.textContent = text('咨询获取', 'Request access');
    actions.append(preview, requestLink);

    const boundary = document.createElement('small');
    boundary.className = 'member-product-module__boundary';
    boundary.textContent = text('交付与授权范围需单独确认', 'Delivery and license scope require confirmation');

    article.append(top, title, subtitle, description, metadata, actions, boundary);
    bindProductLight(article);
    return article;
  }

  function bindProductLight(article) {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    let frame = 0;
    article.addEventListener('pointermove', (event) => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = article.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
        article.style.setProperty('--member-spot-x', `${(x * 100).toFixed(2)}%`);
        article.style.setProperty('--member-spot-y', `${(y * 100).toFixed(2)}%`);
        article.style.setProperty('--member-tilt-x', `${((0.5 - y) * 1.1).toFixed(2)}deg`);
        article.style.setProperty('--member-tilt-y', `${((x - 0.5) * 1.25).toFixed(2)}deg`);
      });
    }, { passive: true });
    article.addEventListener('pointerleave', () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        article.style.setProperty('--member-spot-x', '50%');
        article.style.setProperty('--member-spot-y', '18%');
        article.style.setProperty('--member-tilt-x', '0deg');
        article.style.setProperty('--member-tilt-y', '0deg');
      });
    });
  }

  function renderProducts() {
    const filtered = state.activeCategory === 'all'
      ? state.products
      : state.products.filter((product) => product.category === state.activeCategory);

    if (state.activeCategory === 'custom') {
      productCount.textContent = '1';
      activeCategoryMount.textContent = categoryLabel('custom');
      renderCustomRequest();
      return;
    }

    productCount.textContent = String(filtered.length).padStart(2, '0');
    activeCategoryMount.textContent = categoryLabel(state.activeCategory);
    productMount.replaceChildren(...filtered.map(renderProduct));
    if (!filtered.length) {
      const empty = document.createElement('p');
      empty.className = 'member-products-empty';
      empty.textContent = text('这个分类暂时没有可用资源。', 'No resources are available in this category yet.');
      productMount.append(empty);
    }
  }

  function renderCategories() {
    const categories = ['all', ...new Set(state.products.map((product) => String(product.category || '')).filter(Boolean)), 'custom'];
    const fragment = document.createDocumentFragment();
    categories.forEach((category, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'member-category-control';
      button.dataset.category = category;
      button.setAttribute('aria-pressed', String(category === state.activeCategory));
      const number = document.createElement('span');
      number.textContent = String(index).padStart(2, '0');
      const label = document.createElement('b');
      label.textContent = categoryLabel(category);
      button.append(number, label);
      button.addEventListener('click', () => {
        state.activeCategory = category;
        detailMount.hidden = true;
        detailMount.replaceChildren();
        categoryStrip.querySelectorAll('button').forEach((control) => {
          control.setAttribute('aria-pressed', String(control === button));
        });
        renderProducts();
      });
      fragment.append(button);
    });
    categoryStrip.replaceChildren(fragment);
  }

  function showMemberLounge(session, products) {
    state.authenticated = true;
    state.session = session;
    state.products = Array.isArray(products) ? products : [];
    state.activeCategory = 'all';
    document.body.classList.add('member-authenticated');
    lounge.hidden = false;
    lounge.dataset.ready = 'true';
    trigger.classList.add('is-verified');
    trigger.removeAttribute('aria-haspopup');
    trigger.querySelector('strong').textContent = text('进入会员区', 'Open Member Lounge');
    trigger.querySelector('small').textContent = text('会员凭证已验证', 'Member access verified');
    if (entryStatus) entryStatus.textContent = text('私享入口已验证', 'Private access verified');
    renderCategories();
    renderProducts();
    const expiryCandidates = [session?.expiresAt, session?.idleExpiresAt]
      .map(Number)
      .filter((value) => Number.isFinite(value) && value > 0);
    if (expiryCandidates.length) {
      const delay = Math.max(0, Math.min(...expiryCandidates) * 1000 - Date.now());
      state.expiryTimer = window.setTimeout(() => clearMemberState(), Math.min(delay, 2147483647));
    }
  }

  async function restoreSession(token, deviceId) {
    const headers = authenticatedHeaders(token, deviceId);
    const sessionResponse = await request('/api/member/session', { method: 'GET', headers });
    if (!sessionResponse.ok) throw new Error('unauthorized');
    const sessionPayload = await parseJson(sessionResponse);
    if (!sessionPayload?.ok || !sessionPayload.member) throw new Error('unauthorized');

    const productsResponse = await request('/api/member/products', { method: 'GET', headers });
    if (!productsResponse.ok) throw new Error('unauthorized');
    const productsPayload = await parseJson(productsResponse);
    if (!productsPayload?.ok || !Array.isArray(productsPayload.products)) throw new Error('unauthorized');
    showMemberLounge(sessionPayload.member, productsPayload.products);
  }

  async function loadProductDetail(slug, sourceButton) {
    const token = readStorage(sessionStorage, tokenStorageKey);
    const deviceId = readStorage(localStorage, deviceStorageKey);
    if (!token || !deviceId) {
      clearMemberState();
      openDialog();
      return;
    }
    sourceButton.disabled = true;
    sourceButton.textContent = text('读取中……', 'Loading…');
    try {
      const response = await request(`/api/member/products/${encodeURIComponent(String(slug))}`, {
        method: 'GET',
        headers: authenticatedHeaders(token, deviceId)
      });
      if (response.status === 401) throw new Error('unauthorized');
      const payload = await parseJson(response);
      if (!response.ok || !payload?.ok || !payload.product) throw new Error('not-found');
      const product = payload.product;
      const heading = document.createElement('h3');
      heading.textContent = String(product.title || '');
      const description = document.createElement('p');
      description.textContent = String(product.description || '');
      const meta = document.createElement('span');
      meta.textContent = `${categoryLabel(String(product.category || ''))} · ${String(product.status || '')} · ${String(product.version || text('版本待定', 'Version pending'))}`;
      const close = memberButton(text('收起详情', 'Close details'), 'member-detail-close', () => {
        detailMount.hidden = true;
        detailMount.replaceChildren();
        sourceButton.setAttribute('aria-expanded', 'false');
        sourceButton.focus();
      });
      detailMount.replaceChildren(meta, heading, description, close);
      detailMount.hidden = false;
      sourceButton.setAttribute('aria-expanded', 'true');
      detailMount.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
    } catch (error) {
      if (error.message === 'unauthorized') {
        clearMemberState();
        openDialog();
      } else {
        detailMount.hidden = false;
        detailMount.textContent = text('暂时无法读取资源详情，请稍后再试。', 'Resource details are temporarily unavailable. Please try again later.');
      }
    } finally {
      sourceButton.disabled = false;
      sourceButton.textContent = text('查看详情', 'View details');
    }
  }

  async function verifyAccess(event) {
    event.preventDefault();
    if (state.submitting) return;
    const code = codeInput.value.trim();
    if (!code) {
      setAccessStatus('error', text('请输入会员卡密。', 'Enter a member access code.'));
      codeInput.focus();
      return;
    }

    const deviceId = getDeviceId();
    if (!deviceId) {
      setAccessStatus('error', text('浏览器无法保存设备标识，请允许本地存储后重试。', 'This browser cannot keep the device identifier. Enable local storage and try again.'));
      return;
    }
    setSubmitting(true);
    setAccessStatus('loading', text('正在验证会员凭证……', 'Verifying member access…'));
    state.requestController = new AbortController();
    codeInput.value = '';

    try {
      const response = await request('/api/member/verify-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, deviceId }),
        signal: state.requestController.signal
      });
      const payload = await parseJson(response);
      if (response.status === 429) throw new Error('rate-limit');
      if (!response.ok || !payload?.ok || typeof payload.token !== 'string') throw new Error('invalid');
      if (!writeStorage(sessionStorage, tokenStorageKey, payload.token)) throw new Error('storage');
      await restoreSession(payload.token, deviceId);
      setAccessStatus('success', text('验证通过，正在进入会员资源舱。', 'Access verified. Opening the member lounge.'));
      window.setTimeout(() => {
        if (dialog.open) dialog.close();
        lounge.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      }, 260);
    } catch (error) {
      removeStorage(sessionStorage, tokenStorageKey);
      if (error.name === 'AbortError') {
        setAccessStatus('', '');
      } else if (error.message === 'rate-limit') {
        setAccessStatus('error', text('尝试次数过多，请稍后再试。', 'Too many attempts. Please try again later.'));
      } else if (error.message === 'storage') {
        setAccessStatus('error', text('浏览器无法保存本次会话，请允许会话存储后重试。', 'This browser cannot keep the session. Enable session storage and try again.'));
      } else {
        setAccessStatus('error', text('卡密无效或不可用。卡密请联系站主领取。', 'The access code is invalid or unavailable. Contact the site owner for access.'));
      }
    } finally {
      state.requestController = null;
      setSubmitting(false);
    }
  }

  async function logout() {
    const token = readStorage(sessionStorage, tokenStorageKey);
    const deviceId = readStorage(localStorage, deviceStorageKey);
    logoutButton.disabled = true;
    try {
      if (token && deviceId) {
        await request('/api/member/logout', {
          method: 'POST',
          headers: authenticatedHeaders(token, deviceId)
        });
      }
    } catch {
      // Local logout is authoritative even when the network is unavailable.
    } finally {
      clearMemberState();
      logoutButton.disabled = false;
      trigger.focus();
      trigger.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    }
  }

  function trapDialogFocus(event) {
    if (event.key !== 'Tab' || !dialog.open) return;
    const focusable = Array.from(dialog.querySelectorAll('button:not([disabled]), input:not([disabled]), a[href]'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  async function initialize() {
    const token = readStorage(sessionStorage, tokenStorageKey);
    clearMemberState(false);
    if (!token) return;
    const deviceId = getDeviceId();
    if (!deviceId) {
      clearMemberState();
      return;
    }
    try {
      await restoreSession(token, deviceId);
    } catch {
      clearMemberState();
    }
  }

  function initializeLoungeLight() {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = matchMedia('(pointer: fine)').matches;
    if (reduced || !finePointer) return;
    lounge.addEventListener('pointermove', (event) => {
      const rect = lounge.getBoundingClientRect();
      lounge.style.setProperty('--lounge-light-x', `${((event.clientX - rect.left) / rect.width * 100).toFixed(2)}%`);
      lounge.style.setProperty('--lounge-light-y', `${((event.clientY - rect.top) / rect.height * 100).toFixed(2)}%`);
    }, { passive: true });
    lounge.addEventListener('pointerleave', () => {
      lounge.style.setProperty('--lounge-light-x', '50%');
      lounge.style.setProperty('--lounge-light-y', '12%');
    });
  }

  trigger.addEventListener('click', openDialog);
  closeButton.addEventListener('click', closeDialog);
  form.addEventListener('submit', verifyAccess);
  logoutButton.addEventListener('click', logout);
  dialog.addEventListener('keydown', trapDialogFocus);
  dialog.addEventListener('cancel', () => {
    if (state.submitting && state.requestController) state.requestController.abort();
    codeInput.value = '';
    setSubmitting(false);
    setAccessStatus('', '');
  });
  dialog.addEventListener('close', () => {
    codeInput.value = '';
    if (state.opener instanceof HTMLElement) state.opener.focus();
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog && !state.submitting) closeDialog();
  });
  window.addEventListener('cs:languagechange', () => {
    if (state.authenticated) {
      renderCategories();
      renderProducts();
    }
  });

  initializeLoungeLight();
  initialize();
})();
