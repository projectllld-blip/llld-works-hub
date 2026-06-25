'use strict';

(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];

  const page = document.body.dataset.accountPage;
  if (!page) return;

  init();

  async function init() {
    const mode = await window.AuthService.getAuthMode();
    setText('[data-auth-mode]', `${mode} mode`);
    setText('[data-mode-note]', modeNote(mode));

    if (page === 'login') initLogin(mode);
    if (page === 'signup') initSignup(mode);
    if (page === 'account') initAccount(mode);
  }

  function initLogin(mode) {
    const form = $('#loginForm');
    if (!form) return;

    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const email = $('#loginEmail').value.trim();
      const result = await window.AuthService.mockLogin({ email });
      renderStatus(result.message, result.ok);
      renderPreview([
        ['認証方式', mode],
        ['メールアドレス', email || '未入力'],
        ['保存', 'パスワード・認証トークンは保存していません']
      ]);
    });
  }

  function initSignup(mode) {
    const form = $('#signupForm');
    if (!form) return;

    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const input = {
        companyName: $('#signupCompany').value.trim(),
        contactName: $('#signupContact').value.trim(),
        email: $('#signupEmail').value.trim(),
        businessType: $('#signupBusinessType').value,
        apps: $$('input[name="apps"]:checked').map(input => input.value)
      };
      const result = await window.AuthService.mockSignup(input);
      renderStatus(result.message, result.ok);
      renderPreview([
        ['認証方式', mode],
        ['会社名 / 店舗名 / 教室名', input.companyName || '未入力'],
        ['担当者名', input.contactName || '未入力'],
        ['メールアドレス', input.email || '未入力'],
        ['業種', labelForBusinessType(input.businessType)],
        ['使いたいアプリ', input.apps.join('、') || '未選択'],
        ['保存', '入力内容・パスワードはlocalStorageに保存していません']
      ]);
    });
  }

  async function initAccount(mode) {
    const result = await window.AuthService.getCurrentAccount();
    renderAccount(result.account, mode);

    const logoutButton = $('#logoutButton');
    if (logoutButton) {
      logoutButton.addEventListener('click', async () => {
        const logout = await window.AuthService.logout();
        renderStatus(logout.message, logout.ok);
        const latest = await window.AuthService.getCurrentAccount();
        renderAccount(latest.account, mode);
      });
    }
  }

  function renderAccount(account, mode) {
    setText('#accountStatus', `${mode} mode / 本番同期なし`);
    setText('#accountCompany', account.companyName);
    setText('#accountContact', account.contactName);
    setText('#accountEmail', account.email);
    setText('#accountSyncStatus', account.syncStatus);
    renderList('#accountApps', account.apps);
    renderList('#accountRecentApps', account.recentApps);
  }

  function renderStatus(message, ok) {
    const status = $('#accountStatusMessage');
    if (!status) return;
    status.textContent = message;
    status.dataset.state = ok ? 'ok' : 'warn';
  }

  function renderPreview(rows) {
    const preview = $('#accountPreview');
    if (!preview) return;
    preview.hidden = false;
    preview.innerHTML = rows.map(([key, value]) => `
      <div>
        <dt>${escapeHtml(key)}</dt>
        <dd>${escapeHtml(value)}</dd>
      </div>
    `).join('');
  }

  function renderList(selector, items = []) {
    const root = $(selector);
    if (!root) return;
    root.innerHTML = items.map(item => `<li>${escapeHtml(item)}</li>`).join('');
  }

  function modeNote(mode) {
    if (mode === 'supabase') {
      return 'Supabase mode設定ですが、この画面では本番認証処理をまだ実行しません。RLSと接続設計の確認後に有効化します。';
    }
    return '現在はログインUIの検証モードです。本番アカウント登録・実データ保存はまだ行いません。';
  }

  function labelForBusinessType(value) {
    const labels = {
      school: '学習塾',
      store: '小売店',
      restaurant: '飲食店',
      small_business: '小規模事業者',
      consulting: 'コンサル',
      demo: 'デモ利用'
    };
    return labels[value] || value || '未選択';
  }

  function setText(selector, value) {
    const el = $(selector);
    if (el) el.textContent = value || '';
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }
})();
