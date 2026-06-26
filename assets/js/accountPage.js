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
    setLoginButtonLabel(form, status);

    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const input = {
        email: $('#loginEmail').value.trim(),
        password: $('#loginPassword').value
      };

      setFormBusy(form, true, 'ログイン処理中...');
      renderStatus('ログイン処理を確認しています...', true);

      try {
        const result = await window.AuthService.login(input);
        renderModeStatus(result.status || status);
        setLoginButtonLabel(form, result.status || status);
        renderStatus(result.message, result.ok);
        renderLoginPreview(input, result.status || status, result);

        if (result.ok && result.mode === 'supabase') {
          window.setTimeout(() => {
            window.location.href = './account.html';
          }, 900);
        }
      } catch {
        renderStatus('ログインに失敗しました。メールアドレスまたはパスワードを確認してください。', false);
      } finally {
        setFormBusy(form, false);
      }
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
    renderAccountLoading(status);
    const result = await window.AuthService.getCurrentAccount();
    renderModeStatus(result.status || status);
    await renderAccountState(result, result.status || status);

    const logoutButton = $('#logoutButton');
    if (logoutButton) {
      logoutButton.addEventListener('click', async () => {
        logoutButton.disabled = true;
        const logout = await window.AuthService.logout();
        renderModeStatus(logout.status || status);
        renderStatus(logout.message, logout.ok);
        if (logout.ok && logout.mode === 'supabase') {
          window.setTimeout(() => {
            window.location.href = './login.html?logged_out=1';
          }, 900);
          return;
        }
        const latest = await window.AuthService.getCurrentAccount();
        await renderAccountState(latest, latest.status || status);
        logoutButton.disabled = false;
      });
    }
  }

  function renderAccountLoading(status) {
    setText('#accountStatus', `${modeLabel(status)} / 読み込み中`);
    setText('#accountSyncStatus', '企業アカウント情報を確認しています。');
    setText('#accountAppsStatus', '利用アプリ一覧を確認しています。');
    renderAppCards('#accountApps', []);
    renderStatus('読み込み中です。少しお待ちください。', true);
  }

  async function renderAccountState(result, status) {
    if (result?.account) {
      renderAccount(result.account, status, result);
      await renderAppsForAccount(result.account, status);
      renderStatus(result.message || 'アカウント情報を表示しています。', result.ok !== false);
      return;
    }

    clearAccount();
    setText('#accountStatus', accountStateLabel(result?.accountStatus || 'not_logged_in'));
    setText('#accountSyncStatus', result?.message || 'ログインが必要です。企業アカウントでログインしてください。');
    renderAppCards('#accountApps', []);
    setText('#accountAppsStatus', 'ログイン後に利用アプリ一覧を表示します。');
    setText('#accountDemoAppsStatus', 'ログイン後に検証用アプリ追加を表示します。');
    const demoApps = $('#accountDemoApps');
    if (demoApps) demoApps.innerHTML = '<p class="account-demo-empty">ログイン後に表示します。</p>';
    renderList('#accountRecentApps', ['最近使ったアプリのクラウド同期はまだ未接続です。']);
    renderStatus(`${result?.message || 'ログインが必要です。'} login.html または signup.html へ進んでください。`, false);

    if (status?.mode === 'supabase' && result?.accountStatus === 'not_logged_in') {
      window.setTimeout(() => {
        window.location.href = './login.html?redirect=account';
      }, 1200);
    }
  }

  function renderAccount(account, status) {
    setText('#accountStatus', `${modeLabel(status)} / ${account.status || 'account'}`);
    setText('#accountCompany', account.companyName);
    setText('#accountContact', account.contactName);
    setText('#accountEmail', account.email);
    setText('#accountBusinessType', labelForBusinessType(account.businessType));
    setText('#accountPlanStatus', labelForPlanStatus(account.planStatus));
    setText('#accountCreatedAt', formatDate(account.createdAt));
    setText('#accountUpdatedAt', formatDate(account.updatedAt));
    setText('#accountSyncStatus', status.message || account.syncStatus);
    renderList('#accountRecentApps', account.recentApps);
  }

  async function renderAppsForAccount(account, status) {
    setText('#accountAppsStatus', '利用アプリ一覧を確認しています。');

    if (!window.AppInstanceService?.getMyAppInstances) {
      renderAppCards('#accountApps', []);
      setText('#accountAppsStatus', '利用アプリ一覧サービスを確認できません。');
      return;
    }

    const result = await window.AppInstanceService.getMyAppInstances(account.id);
    setText('#accountAppsStatus', result.message || '利用アプリ一覧を表示しています。');
    renderAppCards('#accountApps', result.apps || []);
    await renderDemoAppAddPanel(account, status);

    if (status.mode === 'supabase' && result.appStatus === 'empty') {
      renderStatus(result.message, true);
    } else if (result.ok === false) {
      renderStatus(result.message, false);
    }
  }

  async function renderDemoAppAddPanel(account, status) {
    const root = $('#accountDemoApps');
    if (!root) return;

    if (status.mode !== 'supabase') {
      setText('#accountDemoAppsStatus', 'mock modeでは検証用アプリ追加は実行しません。');
      root.innerHTML = '<p class="account-demo-empty">Supabase接続時に、検証用アプリ追加を確認できます。</p>';
      return;
    }

    if (!window.AppInstanceService?.getAvailableDemoApps) {
      setText('#accountDemoAppsStatus', '検証用アプリ追加サービスを確認できません。');
      root.innerHTML = '<p class="account-demo-empty">設定を確認してください。</p>';
      return;
    }

    const result = await window.AppInstanceService.getAvailableDemoApps(account.id);
    setText('#accountDemoAppsStatus', result.message || '検証用に追加できるアプリを確認しています。');

    if (!result.ok) {
      root.innerHTML = `<p class="account-demo-empty">${escapeHtml(result.message || '検証用アプリ候補の取得に失敗しました。')}</p>`;
      return;
    }

    if (!result.apps?.length) {
      root.innerHTML = '<p class="account-demo-empty">追加できる検証用アプリはありません。</p>';
      return;
    }

    root.innerHTML = result.apps.map(app => `
      <div class="account-demo-app">
        <div>
          <span>${escapeHtml(app.appKey)}</span>
          <strong>${escapeHtml(app.name)}</strong>
          <p>${escapeHtml(app.description || '検証用に追加できます。')}</p>
        </div>
        <button class="btn secondary account-demo-add" type="button" data-demo-app-key="${escapeHtml(app.appKey)}">デモ追加</button>
      </div>
    `).join('');

    root.querySelectorAll('[data-demo-app-key]').forEach(button => {
      button.addEventListener('click', async () => {
        const appKey = button.dataset.demoAppKey;
        button.disabled = true;
        button.textContent = '追加中...';
        setText('#accountDemoAppsStatus', '検証用アプリを追加しています。');

        const addResult = await window.AppInstanceService.addDemoAppInstance(account.id, appKey);
        renderStatus(addResult.message, addResult.ok);

        const latest = await window.AuthService.getCurrentAccount();
        if (latest?.account) {
          await renderAppsForAccount(latest.account, latest.status || status);
        } else {
          setText('#accountDemoAppsStatus', addResult.message || '検証用アプリ追加後の再読込に失敗しました。');
        }
      });
    });
  }

  function clearAccount() {
    setText('#accountCompany', '-');
    setText('#accountContact', '-');
    setText('#accountEmail', '-');
    setText('#accountBusinessType', '-');
    setText('#accountPlanStatus', '-');
    setText('#accountCreatedAt', '-');
    setText('#accountUpdatedAt', '-');
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

  function renderLoginPreview(input, status, result = {}) {
    renderPreview([
      ['認証方式', modeLabel(status)],
      ['メールアドレス', input.email || '未入力'],
      ['ログイン状態', loginResultLabel(result)],
      ['保存', '入力内容・パスワードはlocalStorageに保存していません']
    ]);
  }

  function renderList(selector, items = []) {
    const root = $(selector);
    if (!root) return;
    root.innerHTML = items.map(item => `<li>${escapeHtml(item)}</li>`).join('');
  }

  function renderAppCards(selector, apps = []) {
    const root = $(selector);
    if (!root) return;
    if (!apps.length) {
      root.innerHTML = '<li class="account-app-empty">利用中アプリはまだ登録されていません。</li>';
      return;
    }

    root.innerHTML = apps.map(app => {
      const link = app.link
        ? `<a class="btn primary account-app-action" href="${escapeHtml(app.link)}">開く</a>`
        : '<span class="account-app-action account-app-disabled">準備中</span>';
      return `
        <li class="account-app-card">
          <div class="account-app-main">
            <span class="account-app-key">${escapeHtml(app.appKey || '-')}</span>
            <strong>${escapeHtml(app.displayName || app.name || '未設定アプリ')}</strong>
            <p>${escapeHtml(app.description || '')}</p>
          </div>
          <dl class="account-app-meta">
            <div><dt>利用状態</dt><dd>${escapeHtml(window.AppInstanceService?.getAppStatusLabel?.(app.status) || app.status || '-')}</dd></div>
            <div><dt>アプリ状態</dt><dd>${escapeHtml(window.AppInstanceService?.getAppStatusLabel?.(app.appStatus) || app.appStatus || '-')}</dd></div>
            <div><dt>最終更新</dt><dd>${escapeHtml(formatDate(app.updatedAt))}</dd></div>
            <div><dt>クラウド保存</dt><dd>${escapeHtml(app.cloudNote || 'app_data保存はまだ未接続です。')}</dd></div>
          </dl>
          ${link}
        </li>
      `;
    }).join('');
  }

  function modeLabel(status) {
    const mode = status?.mode || 'mock';
    if (mode === 'supabase') return 'supabase mode';
    return 'mock mode';
  }

  function modeNote(status) {
    if (!status) {
      return '現在はログインUIの検証モードです。本番アカウント登録・実データ保存はまだ行いません。';
    }
    if (status.mode === 'supabase') {
      if (page === 'signup') {
        return `${status.message} パスワードはLLLD Works Hub側では保存しません。`;
      }
      if (page === 'login') {
        return `${status.message} パスワードはLLLD Works Hub側では保存しません。`;
      }
      return `${status.message} 利用アプリ一覧を表示し、app_data保存はSeatFlowレイアウトのみ検証中です。`;
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

  function labelForPlanStatus(value) {
    const labels = {
      demo: 'デモ',
      free: '無料',
      trial: 'トライアル',
      paid: '有料',
      paused: '一時停止',
      cancelled: '解約'
    };
    return labels[value] || value || '-';
  }

  function labelForAppKey(value) {
    const labels = window.AuthService?.APP_LABELS || {};
    return labels[value] || value || '未選択';
  }

  function signupResultLabel(result = {}) {
    if (result.signupStatus === 'already_registered') return '登録済み / ログインしてください';
    if (!result.ok) return '未登録 / エラー';
    if (result.mode === 'mock') return 'mock確認のみ';
    if (result.needsEmailConfirmation) return '確認メール待ち';
    return '登録リクエスト受付済み';
  }

  function loginResultLabel(result = {}) {
    if (!result.ok) return '未ログイン / エラー';
    if (result.mode === 'mock') return 'mock確認のみ';
    return 'ログイン成功';
  }

  function accountStateLabel(status) {
    const labels = {
      not_logged_in: '未ログイン',
      account_not_found: '企業アカウント未作成',
      account_load_failed: '取得エラー',
      client_unavailable: 'Supabase client未準備'
    };
    return labels[status] || '未ログイン';
  }

  function setFormBusy(form, busy, busyLabel = '登録処理中...') {
    const button = form.querySelector('button[type="submit"]');
    if (!button) return;
    button.disabled = busy;
    button.textContent = busy ? busyLabel : button.dataset.idleLabel || '登録UIを確認する';
  }

  function setLoginButtonLabel(form, status) {
    const button = form.querySelector('button[type="submit"]');
    if (!button) return;
    const label = status?.mode === 'supabase' ? 'ログインする' : 'ログインUIを確認する';
    button.dataset.idleLabel = label;
    if (!button.disabled) button.textContent = label;
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

  function formatDate(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('ja-JP');
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
