'use strict';

(() => {
  const ROLES = ['guest', 'member', 'author', 'admin'];
  const STORAGE_KEY = 'llldWorksHub.mockRole';
  let currentRole = readStoredRole();

  function readStoredRole() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const role = raw ? JSON.parse(raw) : 'guest';
      return ROLES.includes(role) ? role : 'guest';
    } catch {
      return 'guest';
    }
  }

  function writeStoredRole(role) {
    try {
      if (window.StoragePolicy) {
        window.StoragePolicy.setItem(STORAGE_KEY, role);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(role));
      }
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(role));
    }
  }

  function getCurrentUserMock() {
    return {
      id: currentRole === 'guest' ? null : `mock-${currentRole}`,
      role: currentRole,
      isLoggedIn: currentRole !== 'guest',
      label: {
        guest: 'ゲスト',
        member: 'メンバー',
        author: '投稿者',
        admin: '管理者'
      }[currentRole]
    };
  }

  function setCurrentRoleMock(role) {
    if (!ROLES.includes(role)) {
      throw new Error(`Unknown mock role: ${role}`);
    }
    currentRole = role;
    writeStoredRole(role);
    return getCurrentUserMock();
  }

  const isGuest = () => currentRole === 'guest';
  const isMember = () => currentRole === 'member';
  const isAuthor = () => currentRole === 'author';
  const isAdmin = () => currentRole === 'admin';

  function can(action) {
    const role = currentRole;
    const permissions = {
      viewPublic: ['guest', 'member', 'author', 'admin'],
      viewInternal: ['member', 'author', 'admin'],
      submitContent: ['author', 'admin'],
      reviewContent: ['admin'],
      manageUsers: ['admin']
    };
    return (permissions[action] || []).includes(role);
  }

  window.AuthMockService = {
    roles: [...ROLES],
    getCurrentUser: getCurrentUserMock,
    setMockRole: setCurrentRoleMock,
    getCurrentUserMock,
    setCurrentRoleMock,
    isGuest,
    isMember,
    isAuthor,
    isAdmin,
    can
  };
})();
