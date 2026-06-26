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
        message: '利用アプリ一覧を取得しました。SeatFlowレイアウトのみクラウド保存を検証中です。'
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
    normalizeAppInstance,
    getAppStatusLabel,
    getAppLink
  };
})();
