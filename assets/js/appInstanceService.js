'use strict';

(() => {
  const APP_STATUS_LABELS = {
    active: '利用中',
    trial: 'トライアル',
    paused: '一時停止',
    disabled: '停止中',
    draft: '下書き',
    beta: 'β版',
    internal: '社内限定'
  };

  const APP_LINKS = {
    seatflow: './apps/seatflow/index.html',
    pdf_tool: './apps/pdf-tool/index.html',
    quiz_maker: './apps/quiz-maker/index.html',
    attendance: './apps/dakokun/index.html',
    meeting_support: './contents/meeting-support/index.html',
    sales_talk_support: './contents/sales-talk-support/index.html'
  };

  const DEMO_APP_KEYS = ['seatflow', 'pdf_tool', 'quiz_maker', 'attendance', 'meeting_support'];
  const FREE_BETA_ALLOWLIST = {
    'pdf-tool': {
      appKey: 'pdf_tool',
      status: 'active',
      priceType: 'free',
      label: 'PDF編集ツール'
    },
    'quiz-maker': {
      appKey: 'quiz_maker',
      status: 'trial',
      priceType: 'free-beta',
      label: '小テスト作成ツール'
    }
  };

  const MOCK_APPS = [
    {
      id: 'mock-seatflow',
      appKey: 'seatflow',
      name: '座席管理 SeatFlow',
      description: '教室や店舗の座席配置を管理します。',
      status: 'active',
      appStatus: 'active',
      displayName: '座席管理 SeatFlow',
      updatedAt: '',
      link: APP_LINKS.seatflow,
      cloudNote: 'SeatFlowの座席レイアウトのみクラウド保存に対応しています。'
    },
    {
      id: 'mock-pdf-tool',
      appKey: 'pdf_tool',
      name: 'PDF編集',
      description: 'PDFの結合・分割・整理を行うツールです。',
      status: 'active',
      appStatus: 'active',
      displayName: 'PDF編集',
      updatedAt: '',
      link: APP_LINKS.pdf_tool,
      cloudNote: 'PDF実データ保存はまだ未接続です。'
    },
    {
      id: 'mock-quiz-maker',
      appKey: 'quiz_maker',
      name: '小テスト作成',
      description: '小テスト作成と出力を支援します。',
      status: 'trial',
      appStatus: 'beta',
      displayName: '小テスト作成',
      updatedAt: '',
      link: APP_LINKS.quiz_maker,
      cloudNote: '小テストデータ保存は後続フェーズで検討します。'
    }
  ];

  async function getMyAppInstances(companyAccountId) {
    const status = await window.AuthService?.getAuthStatus?.();
    if (!status || status.mode !== 'supabase') {
      return getMockAppInstances();
    }

    if (!companyAccountId) {
      return {
        ok: false,
        mode: status.mode,
        status,
        appStatus: 'company_account_missing',
        apps: [],
        message: '企業アカウント情報が未取得のため、利用アプリ一覧を表示できません。'
      };
    }

    return getSupabaseAppInstances(companyAccountId);
  }

  function getMockAppInstances() {
    return {
      ok: true,
      mode: 'mock',
      appStatus: 'mock_apps',
      apps: MOCK_APPS.map(app => ({ ...app })),
      message: 'mock modeのサンプル利用アプリです。DB保存・app_data保存は行っていません。'
    };
  }

  async function getSupabaseAppInstances(companyAccountId) {
    const status = await window.AuthService?.getAuthStatus?.();
    const client = await window.SupabaseClientService?.getSupabaseClient?.();

    if (!client?.from) {
      return {
        ok: false,
        mode: status?.mode || 'supabase',
        status,
        appStatus: 'client_unavailable',
        apps: [],
        message: 'Supabase clientを確認できません。接続設定を確認してください。'
      };
    }

    try {
      const { data: instances, error: instanceError } = await client
        .from('app_instances')
        .select('id,company_account_id,app_key,display_name,status,settings_json,created_at,updated_at')
        .eq('company_account_id', companyAccountId)
        .order('created_at', { ascending: true });

      if (instanceError) {
        return {
          ok: false,
          mode: status?.mode || 'supabase',
          status,
          appStatus: 'app_instances_error',
          apps: [],
          message: '利用アプリ一覧の取得に失敗しました。RLS設定とapp_instancesを確認してください。'
        };
      }

      if (!instances || instances.length === 0) {
        return {
          ok: true,
          mode: status?.mode || 'supabase',
          status,
          appStatus: 'empty',
          apps: [],
          message: '利用中アプリはまだ登録されていません。登録時に選んだアプリ、またはSupabaseのapp_instances設定を確認してください。'
        };
      }

      const appKeys = [...new Set(instances.map(row => row.app_key).filter(Boolean))];
      const { data: appRows, error: appsError } = await client
        .from('apps')
        .select('app_key,name,description,status')
        .in('app_key', appKeys);

      if (appsError) {
        return {
          ok: false,
          mode: status?.mode || 'supabase',
          status,
          appStatus: 'apps_error',
          apps: instances.map(row => normalizeAppInstance(row)),
          message: 'アプリカタログ情報の取得に失敗しました。app_instancesのみ表示します。'
        };
      }

      const appMap = new Map((appRows || []).map(app => [app.app_key, app]));
      return {
        ok: true,
        mode: status?.mode || 'supabase',
        status,
        appStatus: 'loaded',
        apps: instances.map(row => normalizeAppInstance(row, appMap.get(row.app_key))),
        message: '利用アプリ一覧を取得しました。'
      };
    } catch {
      return {
        ok: false,
        mode: status?.mode || 'supabase',
        status,
        appStatus: 'app_instances_error',
        apps: [],
        message: '利用アプリ一覧の取得に失敗しました。接続設定を確認してください。'
      };
    }
  }

  async function getAvailableDemoApps(companyAccountId) {
    const status = await window.AuthService?.getAuthStatus?.();
    if (!status || status.mode !== 'supabase') {
      return {
        ok: true,
        mode: 'mock',
        apps: [],
        message: 'mock modeでは検証用アプリ追加は実行しません。'
      };
    }

    if (!companyAccountId) {
      return {
        ok: false,
        mode: status.mode,
        apps: [],
        message: '企業アカウント情報が未取得のため、検証用アプリを追加できません。'
      };
    }

    const client = await window.SupabaseClientService?.getSupabaseClient?.();
    if (!client?.from) {
      return {
        ok: false,
        mode: status.mode,
        apps: [],
        message: 'Supabase clientを確認できません。接続設定を確認してください。'
      };
    }

    try {
      const [{ data: catalog, error: catalogError }, { data: instances, error: instanceError }] = await Promise.all([
        client
          .from('apps')
          .select('app_key,name,description,status')
          .in('app_key', DEMO_APP_KEYS),
        client
          .from('app_instances')
          .select('app_key')
          .eq('company_account_id', companyAccountId)
      ]);

      if (catalogError || instanceError) {
        return {
          ok: false,
          mode: status.mode,
          apps: [],
          message: '検証用アプリ候補の取得に失敗しました。apps / app_instances / RLS設定を確認してください。'
        };
      }

      const owned = new Set((instances || []).map(row => row.app_key));
      const apps = (catalog || [])
        .filter(app => DEMO_APP_KEYS.includes(app.app_key))
        .filter(app => !owned.has(app.app_key))
        .map(app => ({
          appKey: app.app_key,
          name: app.name || app.app_key,
          description: app.description || descriptionForApp(app.app_key),
          appStatus: app.status || ''
        }));

      return {
        ok: true,
        mode: status.mode,
        apps,
        message: apps.length
          ? '検証用に追加できるアプリがあります。本番購入ではありません。'
          : '追加できる検証用アプリはありません。'
      };
    } catch {
      return {
        ok: false,
        mode: status.mode,
        apps: [],
        message: '検証用アプリ候補の取得に失敗しました。接続設定を確認してください。'
      };
    }
  }

  async function addDemoAppInstance(companyAccountId, appKey) {
    const status = await window.AuthService?.getAuthStatus?.();
    if (!status || status.mode !== 'supabase') {
      return {
        ok: false,
        mode: 'mock',
        message: 'mock modeのため、検証用アプリ追加は実行していません。'
      };
    }

    if (!companyAccountId || !DEMO_APP_KEYS.includes(appKey)) {
      return {
        ok: false,
        mode: status.mode,
        message: '追加対象のアプリまたは企業アカウントを確認できません。'
      };
    }

    const client = await window.SupabaseClientService?.getSupabaseClient?.();
    if (!client?.from) {
      return {
        ok: false,
        mode: status.mode,
        message: 'Supabase clientを確認できません。接続設定を確認してください。'
      };
    }

    try {
      const { data: existing, error: existingError } = await client
        .from('app_instances')
        .select('id,app_key')
        .eq('company_account_id', companyAccountId)
        .eq('app_key', appKey)
        .maybeSingle();

      if (existingError) {
        return {
          ok: false,
          mode: status.mode,
          message: '既存の利用アプリ確認に失敗しました。RLS設定を確認してください。'
        };
      }

      if (existing) {
        return {
          ok: true,
          mode: status.mode,
          alreadyExists: true,
          message: 'このアプリはすでに利用中アプリに登録されています。'
        };
      }

      const { data: app, error: appError } = await client
        .from('apps')
        .select('app_key,name,description,status')
        .eq('app_key', appKey)
        .maybeSingle();

      if (appError || !app) {
        return {
          ok: false,
          mode: status.mode,
          message: 'アプリカタログに対象アプリが見つかりません。seed.sqlの適用状況を確認してください。'
        };
      }

      const { error: insertError } = await client
        .from('app_instances')
        .insert({
          company_account_id: companyAccountId,
          app_key: app.app_key,
          display_name: app.name || app.app_key,
          status: 'trial',
          settings_json: {}
        });

      if (insertError) {
        const duplicate = /duplicate|unique|conflict/i.test(String(insertError.message || ''));
        return {
          ok: duplicate,
          mode: status.mode,
          alreadyExists: duplicate,
          message: duplicate
            ? 'このアプリはすでに利用中アプリに登録されています。'
            : '検証用アプリの追加に失敗しました。RLS設定とapp_instancesを確認してください。'
        };
      }

      return {
        ok: true,
        mode: status.mode,
        message: `${app.name || app.app_key} を検証用に追加しました。本番購入ではありません。`
      };
    } catch {
      return {
        ok: false,
        mode: status.mode,
        message: '検証用アプリの追加に失敗しました。接続設定を確認してください。'
      };
    }
  }

  async function reflectFreeBetaAppInstance(input = {}) {
    const slug = String(input.slug || input.id || '').trim();
    const priceType = String(input.priceType || '').trim();
    const allow = FREE_BETA_ALLOWLIST[slug];

    if (!allow || allow.priceType !== priceType) {
      return {
        ok: false,
        skipped: true,
        reason: 'not_allowlisted',
        message: 'このコンテンツは無料 / β版の正式反映対象ではありません。'
      };
    }

    const status = await window.AuthService?.getAuthStatus?.();
    if (!status || status.mode !== 'supabase') {
      return {
        ok: false,
        skipped: true,
        mode: status?.mode || 'mock',
        reason: 'mock_mode',
        message: 'mock modeのため、利用開始はこのブラウザ内の一時表示で確認します。'
      };
    }

    const accountResult = await window.AuthService?.getSupabaseCurrentAccount?.();
    if (!accountResult?.ok || !accountResult.account?.id) {
      return {
        ok: false,
        mode: status.mode,
        reason: 'account_missing',
        message: accountResult?.message || '企業アカウント情報を確認できないため、利用開始を保存できません。'
      };
    }

    const client = await window.SupabaseClientService?.getSupabaseClient?.();
    if (!client?.from) {
      return {
        ok: false,
        mode: status.mode,
        reason: 'client_unavailable',
        message: 'Supabase clientを確認できません。接続設定を確認してください。'
      };
    }

    const companyAccountId = accountResult.account.id;
    try {
      const existingResult = await fetchExistingAppInstance(client, companyAccountId, allow.appKey);
      if (!existingResult.ok) return existingResult;

      if (existingResult.instance) {
        return handleExistingAllowlistedInstance(client, existingResult.instance, allow);
      }

      const appResult = await fetchCatalogApp(client, allow.appKey);
      if (!appResult.ok) return appResult;

      const insertResult = await insertAllowlistedInstance(client, companyAccountId, appResult.app, allow);
      if (insertResult.ok) return insertResult;

      if (insertResult.duplicate) {
        const retryResult = await fetchExistingAppInstance(client, companyAccountId, allow.appKey);
        if (retryResult.ok && retryResult.instance) {
          return handleExistingAllowlistedInstance(client, retryResult.instance, allow);
        }
      }

      return insertResult;
    } catch {
      return {
        ok: false,
        mode: status.mode,
        reason: 'reflection_failed',
        message: '利用開始の保存に失敗しました。時間をおいてもう一度お試しください。'
      };
    }
  }

  async function fetchExistingAppInstance(client, companyAccountId, appKey) {
    const { data, error } = await client
      .from('app_instances')
      .select('id,company_account_id,app_key,display_name,status,settings_json,created_at,updated_at')
      .eq('company_account_id', companyAccountId)
      .eq('app_key', appKey)
      .maybeSingle();

    if (error) {
      return {
        ok: false,
        reason: 'existing_lookup_failed',
        message: '既存の利用アプリ確認に失敗しました。RLS設定とapp_instancesを確認してください。'
      };
    }

    return { ok: true, instance: data || null };
  }

  async function fetchCatalogApp(client, appKey) {
    const { data, error } = await client
      .from('apps')
      .select('app_key,name,description,status')
      .eq('app_key', appKey)
      .maybeSingle();

    if (error || !data) {
      return {
        ok: false,
        reason: 'catalog_missing',
        message: 'アプリカタログに対象アプリが見つかりません。appsの設定を確認してください。'
      };
    }

    return { ok: true, app: data };
  }

  async function handleExistingAllowlistedInstance(client, instance, allow) {
    if (instance.status === 'disabled') {
      return {
        ok: false,
        reason: 'disabled',
        appKey: allow.appKey,
        status: instance.status,
        message: 'このアプリは運営側で停止されています。再開が必要な場合はお問い合わせください。'
      };
    }

    if (instance.status === 'active' || instance.status === 'trial') {
      return {
        ok: true,
        reason: 'already_available',
        appKey: allow.appKey,
        status: instance.status,
        instance: normalizeAppInstance(instance),
        message: instance.status === 'trial'
          ? `${allow.label} はすでにβ版として利用中です。`
          : `${allow.label} はすでに利用中です。`
      };
    }

    if (instance.status !== 'paused') {
      return {
        ok: false,
        reason: 'unsupported_status',
        appKey: allow.appKey,
        status: instance.status,
        message: 'このアプリの利用状態を確認できません。運営へお問い合わせください。'
      };
    }

    const { data, error } = await client
      .from('app_instances')
      .update({ status: allow.status })
      .eq('id', instance.id)
      .select('id,company_account_id,app_key,display_name,status,settings_json,created_at,updated_at')
      .maybeSingle();

    if (error || !data) {
      return {
        ok: false,
        reason: 'paused_restore_failed',
        appKey: allow.appKey,
        message: '一時停止中アプリの再開に失敗しました。RLS設定とapp_instancesを確認してください。'
      };
    }

    return {
      ok: true,
      reason: 'restored_from_paused',
      appKey: allow.appKey,
      status: data.status,
      instance: normalizeAppInstance(data),
      message: `${allow.label} の利用を再開しました。`
    };
  }

  async function insertAllowlistedInstance(client, companyAccountId, app, allow) {
    const { data, error } = await client
      .from('app_instances')
      .insert({
        company_account_id: companyAccountId,
        app_key: allow.appKey,
        display_name: app.name || allow.label,
        status: allow.status,
        settings_json: {}
      })
      .select('id,company_account_id,app_key,display_name,status,settings_json,created_at,updated_at')
      .maybeSingle();

    if (error) {
      const duplicate = /duplicate|unique|conflict/i.test(String(error.message || ''));
      return {
        ok: false,
        duplicate,
        reason: duplicate ? 'duplicate' : 'insert_failed',
        appKey: allow.appKey,
        message: duplicate
          ? 'このアプリはすでに利用中アプリに登録されています。'
          : '利用開始の保存に失敗しました。RLS設定とapp_instancesを確認してください。'
      };
    }

    return {
      ok: true,
      reason: 'inserted',
      appKey: allow.appKey,
      status: data?.status || allow.status,
      instance: normalizeAppInstance(data || {
        company_account_id: companyAccountId,
        app_key: allow.appKey,
        display_name: app.name || allow.label,
        status: allow.status
      }, app),
      message: allow.status === 'trial'
        ? `${allow.label} をβ版として利用開始しました。`
        : `${allow.label} を利用開始しました。`
    };
  }

  function normalizeAppInstance(row = {}, app = {}) {
    const appKey = row.app_key || app.app_key || '';
    const name = app.name || row.display_name || appKey || '未設定アプリ';
    return {
      id: row.id || '',
      companyAccountId: row.company_account_id || '',
      appKey,
      name,
      description: app.description || descriptionForApp(appKey),
      status: row.status || 'active',
      appStatus: app.status || '',
      displayName: row.display_name || name,
      settings: row.settings_json || {},
      createdAt: row.created_at || '',
      updatedAt: row.updated_at || '',
      link: getAppLink(appKey),
      cloudNote: cloudNoteForApp(appKey)
    };
  }

  function getAppStatusLabel(status) {
    return APP_STATUS_LABELS[status] || status || '未設定';
  }

  function getAppLink(appKey) {
    return APP_LINKS[appKey] || '';
  }

  function descriptionForApp(appKey) {
    const descriptions = {
      attendance: '出退勤の記録と集計を支援します。',
      seatflow: '教室や店舗の座席配置を管理します。',
      pdf_tool: 'PDFの結合・分割・整理を行うツールです。',
      quiz_maker: '小テスト作成と出力を支援します。',
      meeting_support: '面談資料やヒアリングを支援します。',
      sales_talk_support: '営業トークや提案準備を支援します。'
    };
    return descriptions[appKey] || 'アプリ情報は準備中です。';
  }

  function cloudNoteForApp(appKey) {
    if (appKey === 'seatflow') return '座席レイアウトのみクラウド保存に対応しています。生徒名や利用状況は保存しません。';
    if (appKey === 'attendance') return '勤怠クラウド保存は v1.8 以降に慎重に扱います。';
    return 'app_data保存はまだ未接続です。';
  }

  window.AppInstanceService = {
    getMyAppInstances,
    getMockAppInstances,
    getSupabaseAppInstances,
    getAvailableDemoApps,
    addDemoAppInstance,
    reflectFreeBetaAppInstance,
    normalizeAppInstance,
    getAppStatusLabel,
    getAppLink
  };
})();
