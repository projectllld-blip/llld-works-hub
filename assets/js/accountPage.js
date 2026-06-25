'use strict';

(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];

  const page = document.body.dataset.accountPage;
  if (!page) return;

  init();

  async function init() {
    try {
      const status = await window.AuthService.getAuthStatus();
      renderModeStatus(status);

      if (page === 'login') initLogin(status);
      if (page === 'signup') initSignup(status);
      if (page === 'account') initAccount(status);
    } catch {
      setText('[data-auth-mode]', 'mock mode');
      setText('[data-mode-note]', '認証設定の読み込みに失敗したため、mock modeで表示しています。');
    }
  }

  function initLogin(status) {
    const form = $('#loginForm');
    if (!form) return;

    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const email = $('#loginEmail').value.trim();
      const result = await window.AuthService.mockLogin({ email });
      renderModeStatus(result.status || status);
      renderStatus(result.message, result.ok);
      renderPreview([
        ['認証方式', modeLabel(result.status || status)],
        ['メールアドレス', email || '未入力'],
        ['保存', 'パスワード・認証トークンは保存していません']
      ]);
    });
  }

  function initSignup(status) {
    const form = $('#signupForm');
    if (!form) return;
    setSignupButtonLabel(form, status);

    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const input = {
        companyName: $('#signupCompany').value.trim(),
        contactName: $('#signupContact').value.trim(),
        email: $('#signupEmail').value.trim(),
        password: $('#signupPassword').value,
        businessType: $('#signupBusinessType').value,
        selectedApps: $$('input[name="apps"]:checked').map(input => input.value)
      };

      setFormBusy(form, true);
      renderStatus('登録処理を確認しています...', true);

      try {
        const result = await window.AuthService.signup(input);
        renderModeStatus(result.status || status);
        setSignupButtonLabel(form, result.status || status);
        renderStatus(result.message, result.ok);
        renderSignupPreview(input, result.status || status, result);
      } catch {
        renderStatus('登録に失敗しました。メールアドレス・パスワード・接続設定を確認してください。', false);
      } finally {
        setFormBusy(form, false);
      }
    });
  }

  async function initAccount(status) {
    const result = await window.AuthService.getCurrentAccount();
    renderModeStatus(result.status || status);
    renderAccount(result.account, result.status || status);

    const logoutButton = $('#logoutButton');
    if (logoutButton) {
      logoutButton.addEventListener('click', async () => {
        const logout = await window.AuthService.logout();
        renderModeStatus(logout.status || status);
        renderStatus(logout.message, logout.ok);
        const latest = await window.AuthService.getCurrentAccount();
        renderAccount(latest.account, latest.status || status);
      });
    }
  }

  function renderAccount(account, status) {
    setText('#accountStatus', `${modeLabel(status)} / 本番同期なし`);
    setText('#accountCompany', account.companyName);
    setText('#accountContact', account.contactName);
    setText('#accountEmail', account.email);
    setText('#accountSyncStatus', status.message || account.syncStatus);
    renderList('#accountApps', account.apps);
    renderList('#accountRecentApps', account.recentApps);
  }

  function renderModeStatus(status) {
    setText('[data-auth-mode]', modeLabel(status));
    setText('[data-mode-note]', modeNote(status));
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

  function renderSignupPreview(input, status, result = {}) {
    const selectedApps = input.selectedApps || [];
    const rows = [
      ['認証方式', modeLabel(status)],
      ['会社名 / 店舗名 / 教室名', input.companyName || '未入力'],
      ['担当者名', input.contactName || '未入力'],
      ['メールアドレス', input.email || '未入力'],
      ['業種', labelForBusinessType(input.businessType)],
      ['使いたいアプリ', selectedApps.map(labelForAppKey).join('、') || '未選択'],
      ['登録状態', signupResultLabel(result)],
      ['保存', '入力内容・パスワードはlocalStorageに保存していません']
    ];
    renderPreview(rows);
  }

  function renderList(selector, items = []) {
    const root = $(selector);
    if (!root) return;
    root.innerHTML = items.map(item => `<li>${escapeHtml(item)}</li>`).join('');
  }

  function modeLabel(status) {
    const mode = status?.mode || 'mock';
    if (mode === 'supabase') return 'supabase mode（本番処理未接続）';
    return 'mock mode';
  }

  function modeNote(status) {
    if (!status) {
      return '現在はログインUIの検証モードです。本番アカウント登録・実データ保存はまだ行いません。';
    }
    if (status.mode === 'supabase') {
      if (page === 'signup') {
        return `${status.message} パスワードはLLLD Works Hub側では保存しません。login / account接続はv0.12予定です。`;
      }
      return `${status.message} 本番アカウント登録・ログイン・データ保存はまだ行いません。`;
    }
    return `${status.message} 入力内容・パスワード・認証トークンは保存しません。`;
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

  function labelForAppKey(value) {
    const labels = window.AuthService?.APP_LABELS || {};
    return labels[value] || value || '未選択';
  }

  function signupResultLabel(result = {}) {
    if (!result.ok) return '未登録 / エラー';
    if (result.mode === 'mock') return 'mock確認のみ';
    if (result.needsEmailConfirmation) return '確認メール待ち';
    return '登録リクエスト受付済み';
  }

  function setFormBusy(form, busy) {
    const button = form.querySelector('button[type="submit"]');
    if (!button) return;
    button.disabled = busy;
    button.textContent = busy ? '登録処理中...' : button.dataset.idleLabel || '登録UIを確認する';
  }

  function setSignupButtonLabel(form, status) {
    const button = form.querySelector('button[type="submit"]');
    if (!button) return;
    const label = status?.mode === 'supabase' ? '登録リクエストを送信' : '登録UIを確認する';
    button.dataset.idleLabel = label;
    if (!button.disabled) button.textContent = label;
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
