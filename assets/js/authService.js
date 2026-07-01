'use strict';

(() => {
  const DEFAULT_ACCOUNT = {
    id: 'mock-company-account',
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

  let mockAccountState = { ...DEFAULT_ACCOUNT };

  const VALID_BUSINESS_TYPES = ['school', 'store', 'restaurant', 'small_business', 'consulting', 'personal', 'demo'];
  const APP_LABELS = {
    works_portal: 'LLLD Works Hub ポータル',
    attendance: '勤怠管理',
    seatflow: '座席管理',
    pdf_tool: 'PDF編集',
    quiz_maker: '小テスト作成',
    meeting_support: '面談支援',
    sales_talk_support: '営業トーク支援'
  };
  const REQUIRED_APP_KEYS = ['works_portal'];

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
          signupStatus: signupErrorStatus(error),
          message: readableSignupError(error)
        };
      }

      if (isExistingSignupResponse(data)) {
        return {
          ok: false,
          mode: status.mode,
          status,
          signupInput: sanitizeSignupInput(input),
          signupStatus: 'already_registered',
          userId: null,
          needsEmailConfirmation: false,
          message: 'このメールアドレスは既に登録されています。ログインしてください。'
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
      account: { ...mockAccountState },
      isAuthenticated: true,
      accountStatus: 'mock_account',
      message: 'mock modeのサンプルアカウントを表示しています。'
    };
  }

  async function updateCurrentCompanyAccount(input = {}) {
    const normalized = normalizeCompanyAccountUpdate(input);
    const validation = validateCompanyAccountUpdate(normalized);
    const status = await getAuthStatus();

    if (!validation.ok) {
      return {
        ok: false,
        mode: 'validation',
        status,
        validation,
        account: null,
        message: validation.errors.join(' ')
      };
    }

    if (status.mode !== 'supabase') return mockUpdateCurrentCompanyAccount(normalized, status);
    return supabaseUpdateCurrentCompanyAccount(normalized, status);
  }

  async function mockUpdateCurrentCompanyAccount(input = {}, status = null) {
    const latestStatus = status || await getAuthStatus();
    mockAccountState = {
      ...mockAccountState,
      companyName: input.companyName,
      contactName: input.contactName,
      businessType: input.businessType,
      phone: input.phone,
      updatedAt: new Date().toISOString(),
      syncStatus: 'mock mode: 画面内のサンプル企業情報を更新しました。'
    };

    return {
      ok: true,
      mode: latestStatus.mode,
      status: latestStatus,
      account: { ...mockAccountState },
      accountStatus: 'mock_account_updated',
      message: 'mock modeで企業情報保存の表示を確認しました。実DBには保存していません。'
    };
  }

  async function supabaseUpdateCurrentCompanyAccount(input = {}, status = null) {
    const latestStatus = status || await getAuthStatus();
    const current = await getSupabaseCurrentAccount();

    if (!current.ok || !current.account?.id) {
      return {
        ok: false,
        mode: latestStatus.mode,
        status: latestStatus,
        account: null,
        accountStatus: current.accountStatus || 'account_load_failed',
        message: current.message || '企業アカウント情報を確認できないため保存できません。'
      };
    }

    const client = await window.SupabaseClientService?.getSupabaseClient?.();
    if (!client?.from) {
      return {
        ok: false,
        mode: latestStatus.mode,
        status: latestStatus,
        account: null,
        accountStatus: 'client_unavailable',
        message: 'Supabase clientを確認できません。接続設定を確認してください。'
      };
    }

    const updatePayload = {
      company_name: input.companyName,
      contact_name: input.contactName,
      phone: input.phone
    };
    if (input.businessType) updatePayload.business_type = input.businessType;

    try {
      const { data, error } = await client
        .from('company_accounts')
        .update(updatePayload)
        .eq('id', current.account.id)
        .select('id,email,company_name,contact_name,business_type,phone,plan_status,created_at,updated_at')
        .maybeSingle();

      if (error || !data) {
        return {
          ok: false,
          mode: latestStatus.mode,
          status: latestStatus,
          account: current.account,
          accountStatus: 'account_update_failed',
          message: '企業情報の保存に失敗しました。RLS設定とcompany_accountsの更新権限を確認してください。'
        };
      }

      return {
        ok: true,
        mode: latestStatus.mode,
        status: latestStatus,
        account: mapCompanyAccount(data),
        rawAccount: data,
        accountStatus: 'account_updated',
        message: '企業情報を保存しました。'
      };
    } catch {
      return {
        ok: false,
        mode: latestStatus.mode,
        status: latestStatus,
        account: current.account,
        accountStatus: 'account_update_failed',
        message: '企業情報の保存に失敗しました。時間をおいてもう一度お試しください。'
      };
    }
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

    const appKeys = [...new Set([
      ...REQUIRED_APP_KEYS,
      ...selectedApps.map(value => String(value).trim()).filter(Boolean)
    ])];

    return {
      companyName: String(input.companyName || '').trim(),
      contactName: String(input.contactName || '').trim(),
      email: String(input.email || '').trim(),
      password: String(input.password || ''),
      businessType: VALID_BUSINESS_TYPES.includes(input.businessType) ? input.businessType : '',
      selectedApps: appKeys
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

  function normalizeCompanyAccountUpdate(input = {}) {
    return {
      companyName: String(input.companyName || '').trim(),
      contactName: String(input.contactName || '').trim(),
      businessType: VALID_BUSINESS_TYPES.includes(input.businessType) ? input.businessType : '',
      phone: String(input.phone || '').trim()
    };
  }

  function validateCompanyAccountUpdate(input = {}) {
    const errors = [];

    if (!input.companyName) errors.push('企業名を入力してください。');
    if (input.companyName.length > 80) errors.push('企業名は80文字以内にしてください。');
    if (input.contactName.length > 80) errors.push('担当者名は80文字以内にしてください。');
    if (input.phone.length > 40) errors.push('電話番号は40文字以内にしてください。');
    if (input.phone && !/^[0-9+\-()\s]+$/.test(input.phone)) {
      errors.push('電話番号は数字、ハイフン、括弧、スペース、+で入力してください。');
    }

    return {
      ok: errors.length === 0,
      errors
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
      phone: row.phone || '',
      planStatus: row.plan_status || '',
      createdAt: row.created_at || '',
      updatedAt: row.updated_at || '',
      apps: ['利用アプリ一覧はapp_instancesから取得します。'],
      recentApps: ['最近使ったアプリのクラウド同期は後続フェーズで検討します。'],
      syncStatus: 'company_accounts から取得しています。SeatFlowレイアウトのみapp_data保存を検証中です。'
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
      return 'このメールアドレスは既に登録されています。ログインしてください。';
    }
    if (/password/i.test(message)) {
      return '登録に失敗しました。パスワードの条件を確認してください。';
    }
    if (/email/i.test(message)) {
      return '登録に失敗しました。メールアドレスを確認してください。';
    }
    return '登録に失敗しました。メールアドレス・パスワード・接続設定を確認してください。';
  }

  function signupErrorStatus(error) {
    const message = String(error?.message || '');
    if (/already|registered|exists/i.test(message)) return 'already_registered';
    return 'signup_failed';
  }

  function isExistingSignupResponse(data = {}) {
    const identities = data?.user?.identities;
    return Array.isArray(identities) && identities.length === 0;
  }

  function readableLoginError(error) {
    const message = String(error?.message || '');
    if (/confirm|verified/i.test(message)) {
      return 'ログインに失敗しました。確認メールの完了状況を確認してください。';
    }
    if (/email|password|credentials|invalid/i.test(message)) {
      return 'ログインに失敗しました。メールアドレスまたはパスワードを確認してください。';
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
    updateCurrentCompanyAccount,
    normalizeCompanyAccountUpdate,
    validateCompanyAccountUpdate,
    logout,
    supabaseLogout,
    APP_LABELS
  };
})();
