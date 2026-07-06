'use strict';

(() => {
  const $ = selector => document.querySelector(selector);

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    setText('#myAppsStatus', '利用中アプリを確認しています。');
    try {
      const account = await window.AuthService?.getCurrentAccount?.();
      if (!account?.id) {
        renderMode('未ログイン', 'ログイン後に、利用中アプリ一覧を表示します。');
        renderEmpty('ログインすると利用中アプリを確認できます。');
        return;
      }

      const result = await window.AppInstanceService?.getMyAppInstances?.(account.id);
      renderMode(modeLabel(result), result?.message || '利用中アプリ一覧を表示しています。');
      renderApps(result?.apps || []);
      setText('#myAppsStatus', result?.message || `${result?.apps?.length || 0}件の利用中アプリを表示しています。`);
    } catch {
      renderMode('読込失敗', '利用中アプリ一覧を読み込めませんでした。');
      renderEmpty('利用中アプリ一覧の取得に失敗しました。時間を置いて再度確認してください。');
      setText('#myAppsStatus', '利用中アプリ一覧の取得に失敗しました。');
    }
  }

  function renderApps(apps) {
    const root = $('#myAppsList');
    if (!root) return;
    if (!apps.length) {
      renderEmpty('利用中アプリはまだ登録されていません。マーケットやアカウント画面を確認してください。');
      return;
    }

    root.innerHTML = apps.map(app => {
      const link = app.link
        ? `<a class="btn primary account-app-action" href="${escapeAttr(app.link)}">開く</a>`
        : '<span class="account-app-action account-app-disabled">準備中</span>';
      return `
        <li class="account-app-card">
          <div class="account-app-main">
            <span class="account-app-key">${escapeHtml(app.appKey || '-')}</span>
            <strong>${escapeHtml(app.displayName || app.name || '未設定アプリ')}</strong>
            <p>${escapeHtml(app.description || '')}</p>
          </div>
          <dl class="account-app-meta">
            <div><dt>利用状態</dt><dd>${escapeHtml(statusLabel(app.status))}</dd></div>
            <div><dt>アプリ状態</dt><dd>${escapeHtml(statusLabel(app.appStatus))}</dd></div>
            <div><dt>最終更新</dt><dd>${escapeHtml(formatDate(app.updatedAt))}</dd></div>
            <div><dt>クラウド保存</dt><dd>${escapeHtml(app.cloudNote || 'app_data保存はまだ未接続です。')}</dd></div>
          </dl>
          ${link}
        </li>
      `;
    }).join('');
  }

  function renderEmpty(message) {
    const root = $('#myAppsList');
    if (root) root.innerHTML = `<li class="account-app-empty">${escapeHtml(message)}</li>`;
  }

  function renderMode(label, note) {
    setText('#myAppsMode', label);
    setText('#myAppsModeNote', note);
  }

  function modeLabel(result) {
    if (!result) return '確認中';
    if (result.mode === 'supabase') return 'supabase mode';
    if (result.mode === 'mock') return 'mock mode';
    return result.mode || '確認中';
  }

  function statusLabel(status) {
    return window.AppInstanceService?.getAppStatusLabel?.(status) || status || '-';
  }

  function formatDate(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function setText(selector, value) {
    const element = $(selector);
    if (element) element.textContent = value || '';
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[char]);
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#096;');
  }
})();
