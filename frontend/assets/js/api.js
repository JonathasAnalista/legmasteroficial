(() => {
  const STORAGE = {
    token: 'legmaster_api_jwt',
    expiresAt: 'legmaster_api_exp'
  };

  const DEFAULT_BASE_URL = window.__LEGMASTER_API_BASE__ || 'https://api.seudominio.com.br';

  const apiState = {
    baseUrl: DEFAULT_BASE_URL
  };

  function getSubdomainCfcId() {
    try {
      const host = window.location.hostname || '';
      const parts = host.split('.');
      if (parts.length < 3) return null;
      const [maybeCfc] = parts;
      if (!maybeCfc || ['www', 'app'].includes(maybeCfc.toLowerCase())) return null;
      return maybeCfc.toLowerCase();
    } catch (err) {
      console.warn('[api] falha ao detectar subdomínio:', err);
      return null;
    }
  }

  function saveToken(token, expiresInSeconds) {
    if (!token || !expiresInSeconds) return;
    try {
      sessionStorage.setItem(STORAGE.token, token);
      const expireAt = Date.now() + expiresInSeconds * 1000 - 15000; // renova 15s antes
      sessionStorage.setItem(STORAGE.expiresAt, String(expireAt));
    } catch (err) {
      console.warn('[api] não foi possível salvar o token:', err);
    }
  }

  function clearToken() {
    try {
      sessionStorage.removeItem(STORAGE.token);
      sessionStorage.removeItem(STORAGE.expiresAt);
    } catch (err) {
      console.warn('[api] não foi possível limpar o token:', err);
    }
  }

  function getStoredToken() {
    try {
      const token = sessionStorage.getItem(STORAGE.token);
      const expiresAt = Number(sessionStorage.getItem(STORAGE.expiresAt) || '0');
      if (!token || !expiresAt) return null;
      if (Date.now() >= expiresAt) {
        clearToken();
        return null;
      }
      return { token, expiresAt };
    } catch (err) {
      console.warn('[api] falha ao ler token:', err);
      return null;
    }
  }

  async function request(path, options = {}) {
    const url = `${apiState.baseUrl}${path}`;
    const headers = new Headers(options.headers || {});

    const stored = getStoredToken();
    if (stored?.token) headers.set('Authorization', `Bearer ${stored.token}`);
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      clearToken();
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const error = new Error(body?.message || `Erro ${response.status}`);
      error.status = response.status;
      error.details = body;
      throw error;
    }

    return response.json().catch(() => null);
  }

  async function login({ email, senha, cfcId }) {
    const originCfcId = cfcId || getSubdomainCfcId();
    const payload = { email, senha, cfcId: originCfcId };
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (data?.token && data?.expiresIn) {
      saveToken(data.token, data.expiresIn);
    }
    return data;
  }

  async function getConfigCfc(cfcId) {
    const id = cfcId || getSubdomainCfcId();
    return request(`/cfcs/${id}/config`, { method: 'GET' });
  }

  async function getAlunos({ page = 1, pageSize = 20, cfcId } = {}) {
    const id = cfcId || getSubdomainCfcId();
    const params = new URLSearchParams({
      cfcId: id,
      page: String(page),
      pageSize: String(pageSize)
    });
    return request(`/alunos?${params.toString()}`, { method: 'GET' });
  }

  async function createAluno({ nome, email, telefone, cfcId }) {
    const id = cfcId || getSubdomainCfcId();
    return request('/alunos', {
      method: 'POST',
      body: JSON.stringify({ nome, email, telefone, cfcId: id })
    });
  }

  async function getProvas({ cfcId } = {}) {
    const id = cfcId || getSubdomainCfcId();
    const params = new URLSearchParams({ cfcId: id });
    return request(`/provas?${params.toString()}`, { method: 'GET' });
  }

  async function createProva({ titulo, cfcId }) {
    const id = cfcId || getSubdomainCfcId();
    return request('/provas', {
      method: 'POST',
      body: JSON.stringify({ titulo, cfcId: id })
    });
  }

  async function getResultados({ alunoId, cfcId } = {}) {
    const id = cfcId || getSubdomainCfcId();
    const params = new URLSearchParams({ cfcId: id });
    if (alunoId) params.set('alunoId', alunoId);
    return request(`/resultados?${params.toString()}`, { method: 'GET' });
  }

  async function postResultado({ alunoId, provaId, acertos, total, cfcId }) {
    const id = cfcId || getSubdomainCfcId();
    return request('/resultados', {
      method: 'POST',
      body: JSON.stringify({ alunoId, provaId, acertos, total, cfcId: id })
    });
  }

  function logout() {
    clearToken();
  }

  function setBaseUrl(url) {
    if (typeof url === 'string' && url.trim()) {
      apiState.baseUrl = url.trim();
    }
  }

  const api = {
    login,
    logout,
    setBaseUrl,
    getConfigCfc,
    getAlunos,
    createAluno,
    getProvas,
    createProva,
    getResultados,
    postResultado,
    getStoredToken
  };

  window.LegmasterApi = api;
})();
