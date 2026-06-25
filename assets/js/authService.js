'use strict';

(() => {
  const DEFAULT_ACCOUNT = {
    status: 'mock',
    companyName: 'デモ企業 / 教室',
    contactName: 'デモ担当者',
    email: 'demo@example.com',
    businessType: 'demo',
    planStatus: 'demo',
    createdAt: '',
    updatedAt: '',
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

  async function login(input = {}) {
    const normalized = normalizeLoginInput(input);
    const validation = validateLoginInput(normalized);

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
    if (status.mode !== 'supabase') return mockLogin(normalized);
    return supabaseLogin(normalized);
  }

  async function mockLogin(input = {}) {
    const status = await getAuthStatus();
    if (status.mode !== 'mock') {
      return {
        ok: false,
        mode: status.mode,
        status,
        message: 'Supabase設定は検出されていますが、ログイン処理の準備が完了していません。'
      };
    }

    return {
      ok: true,
      mode: status.mode,
      status,
      account: { ...DEFAULT_ACCOUNT },
      loginInput: sanitizeLoginInput(input),
      message: 'mock modeのため、本番ログインは行っていません。入力内容・パスワードは保存していません。'
    };
  }

  async function supabaseLogin(input = {}) {
    const status = await getAuthStatus();
    const client = await window.SupabaseClientService?.getSupabaseClient?.();

    if (!client?.auth?.signInWithPassword) {
      return {
        ok: false,
        mode: status.mode,
        status,
        loginInput: sanitizeLoginInput(input),
        loginStatus: 'login_unavailable',
        message: 'Supabase設定は検出されていますが、ログイン処理の準備が完了していません。接続設定とライブラリ読み込みを確認してください。'
      };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: input.email,
        password: input.password
      });

      if (error) {
        return {
          ok: false,
          mode: status.mode,
          status,
          loginInput: sanitizeLoginInput(input),
          loginStatus: 'login_failed',
          message: readableLoginError(error)
        };
      }

      return {
        ok: true,
        mode: status.mode,
        status,
        loginStatus: 'logged_in',
        user: data?.user || null,
        loginInput: sanitizeLoginInput(input),
        message: 'ログインしました。アカウント画面へ移動します。'
      };
    } catch {
      return {
        ok: false,
        mode: status.mode,
        status,
        loginInput: sanitizeLoginInput(input),
        loginStatus: 'login_failed',
        message: 'ログインに失敗しました。メールアドレスまたはパスワードを確認してください。'
      };
    }
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

  async function getCurrentUser() {
    const status = await getAuthStatus();
    if (status.mode !== 'supabase') {
      return {
        ok: true,
        mode: status.mode,
        status,
        user: {
          id: 'mock-user',
          email: DEFAULT_ACCOUNT.email
        },
        message: 'mock modeのデモユーザーです。'
      };
    }

    const client = await window.SupabaseClientService?.getSupabaseClient?.();
    if (!client?.auth?.getUser) {
      return {
        ok: false,
        mode: status.mode,
        status,
        user: null,
        message: 'Supabase clientを確認できません。接続設定を確認してください。'
      };
    }

    try {
      const { data, error } = await client.auth.getUser();
      if (error || !data?.user) {
        return {
          ok: false,
          mode: status.mode,
          status,
          user: null,
          userStatus: 'not_logged_in',
          message: 'ログインが必要です。企業アカウントでログインしてください。'
        };
      }
      return {
        ok: true,
        mode: status.mode,
        status,
        user: data.user,
        userStatus: 'logged_in',
        message: 'ログイン中のユーザーを確認しました。'
      };
    } catch {
      return {
        ok: false,
        mode: status.mode,
        status,
        user: null,
        userStatus: 'user_load_failed',
        message: 'ログイン状態の確認に失敗しました。'
      };
    }
  }

  async function getCurrentAccount() {
    const status = await getAuthStatus();
    if (status.mode === 'supabase') return getSupabaseCurrentAccount();

    return {
      mode: status.mode,
      status,
      account: { ...DEFAULT_ACCOUNT },
      isAuthenticated: true,
      accountStatus: 'mock_account',
      message: 'mock modeのサンプルアカウントを表示しています。'
    };
  }

  async function getSupabaseCurrentAccount() {
    const userResult = await getCurrentUser();
    const status = userResult.status || await getAuthStatus();
    if (!userResult.ok || !userResult.user?.id) {
      return {
        ok: false,
        mode: status.mode,
        status,
        account: null,
        isAuthenticated: false,
        accountStatus: 'not_logged_in',
        message: userResult.message || 'ログインが必要です。企業アカウントでログインしてください。'
      };
    }

    const client = await window.SupabaseClientService?.getSupabaseClient?.();
    if (!client?.from) {
      return {
        ok: false,
        mode: status.mode,
        status,
        account: null,
        isAuthenticated: true,
        accountStatus: 'client_unavailable',
        message: 'Supabase clientを確認できません。接続設定を確認してください。'
      };
    }

    try {
      const { data, error } = await client
        .from('company_accounts')
        .select('id,email,company_name,contact_name,business_type,phone,plan_status,created_at,updated_at')
        .eq('owner_user_id', userResult.user.id)
        .maybeSingle();

      if (error) {
        return {
          ok: false,
          mode: status.mode,
          status,
          account: null,
          isAuthenticated: true,
          accountStatus: 'account_load_failed',
          message: '企業アカウント情報の取得に失敗しました。RLS設定を確認してください。'
        };
      }

      if (!data) {
        return {
          ok: false,
          mode: status.mode,
          status,
          account: null,
          isAuthenticated: true,
          accountStatus: 'account_not_found',
          message: 'ログインは確認できましたが、企業アカウント情報がまだ見つかりません。登録確認メール、Supabase trigger設定、RLS設定を確認してください。'
        };
      }

      return {
        ok: true,
        mode: status.mode,
        status,
        account: mapCompanyAccount(data),
        rawAccount: data,
        isAuthenticated: true,
        accountStatus: 'account_loaded',
        message: '企業アカウント情報を取得しました。'
      };
    } catch {
      return {
        ok: false,
        mode: status.mode,
        status,
        account: null,
        isAuthenticated: true,
        accountStatus: 'account_load_failed',
        message: '企業アカウント情報の取得に失敗しました。接続設定を確認してください。'
      };
    }
  }

  async function logout() {
    const status = await getAuthStatus();
    if (status.mode === 'supabase') return supabaseLogout();

    return {
      ok: true,
      mode: status.mode,
      status,
      message: 'mock modeの表示状態を初期化しました。本番ログアウト処理はまだありません。'
    };
  }

  async function supabaseLogout() {
    const status = await getAuthStatus();
    const client = await window.SupabaseClientService?.getSupabaseClient?.();
    if (!client?.auth?.signOut) {
      return {
        ok: false,
        mode: status.mode,
        status,
        logoutStatus: 'logout_unavailable',
        message: 'Supabase logoutの準備が完了していません。接続設定を確認してください。'
      };
    }

    try {
      const { error } = await client.auth.signOut();
      if (error) {
        return {
          ok: false,
          mode: status.mode,
          status,
          logoutStatus: 'logout_failed',
          message: 'ログアウトに失敗しました。しばらくしてから再度お試しください。'
        };
      }
      return {
        ok: true,
        mode: status.mode,
        status,
        logoutStatus: 'logged_out',
        message: 'ログアウトしました。'
      };
    } catch {
      return {
        ok: false,
        mode: status.mode,
        status,
        logoutStatus: 'logout_failed',
        message: 'ログアウトに失敗しました。接続設定を確認してください。'
      };
    }
  }

  function normalizeLoginInput(input = {}) {
    return {
      email: String(input.email || '').trim(),
      password: String(input.password || '')
    };
  }

  function validateLoginInput(input = {}) {
    const errors = [];
    if (!input.email) {
      errors.push('メールアドレスを入力してください。');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      errors.push('メールアドレスの形式を確認してください。');
    }
    if (!input.password) errors.push('パスワードを入力してください。');
    return {
      ok: errors.length === 0,
      errors
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

  function sanitizeLoginInput(input = {}) {
    return {
      email: input.email || ''
    };
  }

  function mapCompanyAccount(row = {}) {
    return {
      id: row.id || '',
      status: 'supabase',
      companyName: row.company_name || '',
      contactName: row.contact_name || '',
      email: row.email || '',
      businessType: row.business_type || '',
      planStatus: row.plan_status || '',
      createdAt: row.created_at || '',
      updatedAt: row.updated_at || '',
      apps: ['利用アプリ一覧は v0.13 で接続予定です。'],
      recentApps: ['最近使ったアプリのクラウド同期は v0.13 以降で検討します。'],
      syncStatus: 'company_accounts から取得しています。app_data保存はまだ行っていません。'
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

  function readableLoginError(error) {
    const message = String(error?.message || '');
    if (/email|password|credentials|invalid/i.test(message)) {
      return 'ログインに失敗しました。メールアドレスまたはパスワードを確認してください。';
    }
    if (/confirm|verified/i.test(message)) {
      return 'ログインに失敗しました。確認メールの完了状況を確認してください。';
    }
    return 'ログインに失敗しました。メールアドレスまたはパスワードを確認してください。';
  }

  window.AuthService = {
    getAuthMode,
    getAuthStatus,
    isMockMode,
    isSupabaseReady,
    signup,
    login,
    mockLogin,
    supabaseLogin,
    mockSignup,
    supabaseSignup,
    normalizeSignupInput,
    validateSignupInput,
    normalizeLoginInput,
    validateLoginInput,
    getCurrentUser,
    getCurrentAccount,
    getSupabaseCurrentAccount,
    logout,
    supabaseLogout,
    APP_LABELS
  };
})();
