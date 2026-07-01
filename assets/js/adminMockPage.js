'use strict';

(() => {
  const mockCompanies = [
    {
      id: 'mock-company-a',
      name: 'サンプル商店',
      createdAt: '2026-06-12',
      updatedAt: '2026-07-01 10:30',
      status: '正常',
      flag: '確認済み',
      appDataCount: 3,
      hasWorksPortal: true,
      hasPortalState: true,
      hasSeatflow: true,
      hasSeatLayout: true,
      lastSavedAt: '2026-07-01 10:30',
      apps: [
        { key: 'works_portal', label: 'Works Portal', status: 'active' },
        { key: 'seatflow', label: 'SeatFlow', status: 'active' },
        { key: 'pdf_tool', label: 'PDF Tool', status: 'active' }
      ],
      issues: []
    },
    {
      id: 'mock-company-b',
      name: 'テスト教室',
      createdAt: '2026-06-18',
      updatedAt: '2026-06-30 18:05',
      status: '確認待ち',
      flag: 'RLS確認待ち',
      appDataCount: 1,
      hasWorksPortal: true,
      hasPortalState: true,
      hasSeatflow: false,
      hasSeatLayout: false,
      lastSavedAt: '2026-06-30 18:05',
      apps: [
        { key: 'works_portal', label: 'Works Portal', status: 'active' },
        { key: 'quiz_maker', label: 'Quiz Maker', status: 'active' },
        { key: 'meeting_support', label: 'Meeting Support', status: 'mock' }
      ],
      issues: ['RLS確認待ち', 'seatflowなし', 'seat_layoutなし']
    },
    {
      id: 'mock-company-c',
      name: 'デモ工房',
      createdAt: '2026-06-21',
      updatedAt: '2026-06-24 09:12',
      status: '注意あり',
      flag: 'portal_stateなし',
      appDataCount: 0,
      hasWorksPortal: true,
      hasPortalState: false,
      hasSeatflow: false,
      hasSeatLayout: false,
      lastSavedAt: '未保存',
      apps: [
        { key: 'works_portal', label: 'Works Portal', status: 'active' },
        { key: 'dakokun', label: 'だこくん', status: 'mock' }
      ],
      issues: ['portal_stateなし', 'seatflowなし', 'seat_layoutなし', 'app_instanceあり / app_dataなし', '長期間更新なし']
    },
    {
      id: 'mock-company-d',
      name: '検証オフィス',
      createdAt: '2026-06-25',
      updatedAt: '2026-06-29 14:48',
      status: '注意あり',
      flag: 'PARKED機能あり',
      appDataCount: 2,
      hasWorksPortal: true,
      hasPortalState: true,
      hasSeatflow: true,
      hasSeatLayout: false,
      lastSavedAt: '2026-06-29 14:48',
      apps: [
        { key: 'works_portal', label: 'Works Portal', status: 'active' },
        { key: 'seatflow', label: 'SeatFlow', status: 'limited' }
      ],
      issues: ['seat_layoutなし', 'PARKED機能あり']
    },
    {
      id: 'mock-company-e',
      name: '未設定サンプル',
      createdAt: '2026-06-28',
      updatedAt: '2026-06-28 11:20',
      status: '要確認',
      flag: 'works_portalなし',
      appDataCount: 0,
      hasWorksPortal: false,
      hasPortalState: false,
      hasSeatflow: true,
      hasSeatLayout: false,
      lastSavedAt: '未保存',
      apps: [
        { key: 'seatflow', label: 'SeatFlow', status: 'active' }
      ],
      issues: ['works_portalなし', 'portal_stateなし', 'seat_layoutなし']
    }
  ];

  const state = {
    selectedCompanyId: mockCompanies[0].id
  };

  const $ = selector => document.querySelector(selector);

  init();

  function init() {
    renderSummary();
    renderCompanyList();
    renderCompanyDetail();
    renderIssueList();

    const list = $('#adminCompanyList');
    if (!list) return;
    list.addEventListener('click', event => {
      const button = event.target.closest('[data-company-id]');
      if (!button) return;
      state.selectedCompanyId = button.dataset.companyId;
      renderCompanyList();
      renderCompanyDetail();
    });
  }

  function renderSummary() {
    setText('#adminCompanyCount', mockCompanies.length);
    setText('#adminAppCount', uniqueAppKeys().length);
    setText('#adminDataCount', mockCompanies.reduce((total, company) => total + company.appDataCount, 0));
    setText('#adminIssueCount', mockCompanies.reduce((total, company) => total + company.issues.length, 0));
    setText('#adminUpdatedAt', latestUpdatedAt());
  }

  function renderCompanyList() {
    const root = $('#adminCompanyList');
    if (!root) return;

    root.innerHTML = mockCompanies.map(company => {
      const pressed = company.id === state.selectedCompanyId ? 'true' : 'false';
      const warnClass = company.issues.length ? ' warn' : '';
      return `
        <button class="admin-company-button" type="button" data-company-id="${escapeAttr(company.id)}" aria-pressed="${pressed}">
          <span class="admin-company-title">
            <span>${escapeHtml(company.name)}</span>
            <span class="admin-status-pill${warnClass}">${escapeHtml(company.status)}</span>
          </span>
          <span class="admin-company-meta">
            <span>登録日: ${escapeHtml(company.createdAt)}</span>
            <span>最終更新: ${escapeHtml(company.updatedAt)}</span>
            <span>利用アプリ: ${company.apps.length} / 注意: ${escapeHtml(company.flag)}</span>
            <span>works_portal: ${yesNo(company.hasWorksPortal)} / portal_state: ${yesNo(company.hasPortalState)}</span>
            <span>seatflow: ${yesNo(company.hasSeatflow)} / seat_layout: ${yesNo(company.hasSeatLayout)}</span>
          </span>
        </button>
      `;
    }).join('');
  }

  function renderCompanyDetail() {
    const root = $('#adminCompanyDetail');
    const company = currentCompany();
    if (!root || !company) return;

    root.innerHTML = `
      <h3>${escapeHtml(company.name)}</h3>
      <div class="admin-detail-grid">
        ${detailItem('works_portal app_instance', yesNo(company.hasWorksPortal))}
        ${detailItem('portal_state app_data', yesNo(company.hasPortalState))}
        ${detailItem('seatflow app_instance', yesNo(company.hasSeatflow))}
        ${detailItem('seat_layout app_data', yesNo(company.hasSeatLayout))}
        ${detailItem('app_data件数', String(company.appDataCount))}
        ${detailItem('最終保存日時', company.lastSavedAt)}
      </div>
      <h3>利用中アプリ mock</h3>
      <ul class="admin-app-list">
        ${company.apps.map(app => `
          <li>
            <span>${escapeHtml(app.label)} <small>(${escapeHtml(app.key)})</small></span>
            <strong class="admin-status-pill ${app.status === 'active' ? 'check' : 'warn'}">${escapeHtml(app.status)}</strong>
          </li>
        `).join('')}
      </ul>
    `;
  }

  function renderIssueList() {
    const root = $('#adminIssueList');
    if (!root) return;
    const issues = mockCompanies.flatMap(company => (
      company.issues.map(issue => ({ company: company.name, issue }))
    ));

    root.innerHTML = issues.length
      ? issues.map(item => `
        <li>
          <span>${escapeHtml(item.company)}: ${escapeHtml(item.issue)}</span>
          <strong class="admin-status-pill warn">mock</strong>
        </li>
      `).join('')
      : '<li><span>異常状態はありません</span><strong class="admin-status-pill check">mock</strong></li>';
  }

  function currentCompany() {
    return mockCompanies.find(company => company.id === state.selectedCompanyId) || mockCompanies[0];
  }

  function uniqueAppKeys() {
    return Array.from(new Set(mockCompanies.flatMap(company => company.apps.map(app => app.key))));
  }

  function latestUpdatedAt() {
    const dates = mockCompanies
      .map(company => company.updatedAt)
      .sort();
    return dates.length ? dates[dates.length - 1] : '-';
  }

  function yesNo(value) {
    return value ? 'あり' : 'なし';
  }

  function detailItem(label, value) {
    return `
      <div class="admin-detail-item">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
    `;
  }

  function setText(selector, value) {
    const element = $(selector);
    if (element) element.textContent = value;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#096;');
  }
})();
