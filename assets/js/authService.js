'use strict';

(() => {
  const DEFAULT_ACCOUNT = {
    status: 'mock',
    companyName: 'デモ企業 / 教室',
    contactName: 'デモ担当者',
    email: 'demo@example.com',
    businessType: 'demo',
    planStatus: 'demo',
    apps: ['SeatFlow', 'PDF編集'],
    recentApps: ['PDF編集ツール', '座席管理アプリ', '小テスト作成'],
    syncStatus: 'mock mode: クラウド同期はまだ行っていません'
  };

  async function getAuthMode() {
    const status = await getAuthStatus();
    return status.mode;
  }

  async function getAuthStatus() {
    if (window.SupabaseClientService?.getSupabaseConnectionStatus) {
      const connection = await window.SupabaseClientService.getSupabaseConnectionStatus();
      return {
        requestedMode: connection.requestedMode,
        mode: connection.safeMode,
        configured: connection.configured,
        clientAvailable: connection.clientAvailable,
        clientReady: connection.clientReady,
        reason: connection.reason,
        message: connection.message,
        isConnected: false,
        productionAuthEnabled: false
      };
    }

    const safeMode = await window.SiteConfigService?.getSafeAuthMode?.() || 'mock';
    return {
      requestedMode: safeMode,
      mode: safeMode,
      configured: false,
      clientAvailable: false,
      clientReady: false,
      reason: 'service_missing',
      message: '認証設定サービスを確認できないため、mock modeで動作しています。',
      isConnected: false,
      productionAuthEnabled: false
    };
  }

  async function isMockMode() {
    return (await getAuthMode()) === 'mock';
  }

  async function isSupabaseReady() {
    const status = await getAuthStatus();
    return status.mode === 'supabase' && status.configured;
  }

  async function mockLogin() {
    const status = await getAuthStatus();
    if (status.mode !== 'mock') {
      return {
        ok: false,
        mode: status.mode,
        status,
        message: 'Supabase設定は検出されていますが、このフェーズでは本番ログインはまだ実行しません。'
      };
    }

    return {
      ok: true,
      mode: status.mode,
      status,
      account: { ...DEFAULT_ACCOUNT },
      message: 'mock modeのため、本番ログインは行っていません。入力内容・パスワードは保存していません。'
    };
  }

  async function mockSignup() {
    const status = await getAuthStatus();
    if (status.mode !== 'mock') {
      return {
        ok: false,
        mode: status.mode,
        status,
        message: 'Supabase設定は検出されていますが、このフェーズでは本番登録はまだ実行しません。'
      };
    }

    return {
      ok: true,
      mode: status.mode,
      status,
      account: { ...DEFAULT_ACCOUNT },
      message: 'mock modeのため、本番登録・実データ保存は行っていません。入力内容・パスワードは保存していません。'
    };
  }

  async function getCurrentAccount() {
    const status = await getAuthStatus();
    return {
      mode: status.mode,
      status,
      account: { ...DEFAULT_ACCOUNT },
      isAuthenticated: status.mode === 'mock'
    };
  }

  async function logout() {
    const status = await getAuthStatus();
    return {
      ok: true,
      mode: status.mode,
      status,
      message: 'mock modeの表示状態を初期化しました。本番ログアウト処理はまだありません。'
    };
  }

  window.AuthService = {
    getAuthMode,
    getAuthStatus,
    isMockMode,
    isSupabaseReady,
    mockLogin,
    mockSignup,
    getCurrentAccount,
    logout
  };
})();
