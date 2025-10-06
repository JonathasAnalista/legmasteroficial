// Inicialização defensiva do Firebase no cliente
// - Usa window.LEGMASTER_CONFIG.FIREBASE_CONFIG, se disponível
// - Só inicializa se os scripts do Firebase (CDN) estiverem carregados
// - Evita re-inicialização se window.firebaseAppInitialized já estiver setado

(function initFirebaseClient(){
  try {
    if (!window.firebase) return; // CDN ainda não carregou
    if (window.firebaseAppInitialized) return; // já inicializado em outro ponto

    var cfg = (window.LEGMASTER_CONFIG && window.LEGMASTER_CONFIG.FIREBASE_CONFIG) || null;
    if (!cfg) return;

    firebase.initializeApp(cfg);
    window.firebaseAppInitialized = true;

    // Exponha utilitários mínimos (opcional)
    window.fb = window.fb || {};
    try { window.fb.auth = firebase.auth(); } catch(e){}
    try { window.fb.db   = firebase.firestore ? firebase.firestore() : null; } catch(e){}
  } catch (e) {
    console.warn('[firebase.js] falha ao inicializar:', e);
  }
})();

