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

  const VALID_BUSINESS_TYPES = ['school', 'store', 'restaurant', 'small_business', 'consulting', 'demo'];
  const APP_LABELS = {
    attendance: '勤怠管理',
    seatflow: '座席管理',
    pdf_tool: 'PDF編集',
    quiz_maker: '小テスト作成',
    meeting_support: '面談支援',
    sales_talk_support: '営業トーク支援'
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
    return status.mode === 'supabase' && status.clientReady;
  }

  async function signup(input = {}) {
    const normalized = normalizeSignupInput(input);
    const validation = validateSignupInput(normalized);

    if (!validation.ok) {
      return {
        ok: false,
        mode: 'validation',
        status: await getAuthStatus(),
        validation,
        message: validation.errors.join(' ')
      };
    }

    const status = await getAuthStatus();
    if (status.mode !== 'supabase') return mockSignup(normalized);
    return supabaseSignup(normalized);
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

  async function mockSignup(input = {}) {
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
      signupInput: sanitizeSignupInput(input),
      message: 'mock modeのため、本番登録・実データ保存は行っていません。入力内容・パスワードは保存していません。'
    };
  }

  async function supabaseSignup(input = {}) {
    const status = await getAuthStatus();
    const client = await window.SupabaseClientService?.getSupabaseClient?.();

    if (!client?.auth?.signUp) {
      return {
        ok: false,
        mode: status.mode,
        status,
        signupInput: sanitizeSignupInput(input),
        message: 'Supabase設定は検出されていますが、登録処理の準備が完了していません。接続設定とライブラリ読み込みを確認してください。'
      };
    }

    try {
      const { data, error } = await client.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            company_name: input.companyName,
            contact_name: input.contactName,
            business_type: input.businessType,
            selected_app_keys: input.selectedApps
          },
          emailRedirectTo: buildEmailRedirectTo()
        }
      });

      if (error) {
        return {
          ok: false,
          mode: status.mode,
          status,
          signupInput: sanitizeSignupInput(input),
          message: readableSignupError(error)
        };
      }

      return {
        ok: true,
        mode: status.mode,
        status,
        signupInput: sanitizeSignupInput(input),
        signupStatus: 'signup_requested',
        userId: data?.user?.id || null,
        needsEmailConfirmation: !data?.session,
        message: '登録リクエストを受け付けました。確認メールが届いている場合は、メール内のリンクを確認してください。'
      };
    } catch {
      return {
        ok: false,
        mode: status.mode,
        status,
        signupInput: sanitizeSignupInput(input),
        message: '登録に失敗しました。メールアドレス・パスワード・接続設定を確認してください。'
      };
    }
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

  function normalizeSignupInput(input = {}) {
    const selectedApps = Array.isArray(input.selectedApps)
      ? input.selectedApps
      : Array.isArray(input.apps)
        ? input.apps
        : [];

    return {
      companyName: String(input.companyName || '').trim(),
      contactName: String(input.contactName || '').trim(),
      email: String(input.email || '').trim(),
      password: String(input.password || ''),
      businessType: VALID_BUSINESS_TYPES.includes(input.businessType) ? input.businessType : '',
      selectedApps: selectedApps.map(value => String(value).trim()).filter(Boolean)
    };
  }

  function validateSignupInput(input = {}) {
    const errors = [];
    const warnings = [];

    if (!input.companyName) errors.push('会社名 / 店舗名 / 教室名を入力してください。');
    if (!input.contactName) errors.push('担当者名を入力してください。');
    if (!input.email) {
      errors.push('メールアドレスを入力してください。');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      errors.push('メールアドレスの形式を確認してください。');
    }
    if (!input.password) {
      errors.push('パスワードを入力してください。');
    } else if (input.password.length < 8) {
      errors.push('パスワードは8文字以上にしてください。');
    }
    if (!input.businessType) errors.push('業種を選択してください。');
    if (!input.selectedApps.length) warnings.push('使いたいアプリを1つ以上選ぶと、初期設定がしやすくなります。');

    return {
      ok: errors.length === 0,
      errors,
      warnings
    };
  }

  function sanitizeSignupInput(input = {}) {
    return {
      companyName: input.companyName || '',
      contactName: input.contactName || '',
      email: input.email || '',
      businessType: input.businessType || '',
      selectedApps: Array.isArray(input.selectedApps) ? [...input.selectedApps] : []
    };
  }

  function buildEmailRedirectTo() {
    try {
      return new URL('./login.html?signup=confirmed', window.location.href).href;
    } catch {
      return './login.html?signup=confirmed';
    }
  }

  function readableSignupError(error) {
    const message = String(error?.message || '');
    if (/already|registered|exists/i.test(message)) {
      return '登録に失敗しました。メールアドレスの状態を確認してください。';
    }
    if (/password/i.test(message)) {
      return '登録に失敗しました。パスワードの条件を確認してください。';
    }
    if (/email/i.test(message)) {
      return '登録に失敗しました。メールアドレスを確認してください。';
    }
    return '登録に失敗しました。メールアドレス・パスワード・接続設定を確認してください。';
  }

  window.AuthService = {
    getAuthMode,
    getAuthStatus,
    isMockMode,
    isSupabaseReady,
    signup,
    mockLogin,
    mockSignup,
    supabaseSignup,
    normalizeSignupInput,
    validateSignupInput,
    getCurrentAccount,
    logout,
    APP_LABELS
  };
})();
