// Configurações globais da plataforma (uso opcional)
window.LEGMASTER_CONFIG = Object.assign(
  {
    FREE_UNLOCK_INDEX: 1,
    QUESTOES_TOTAL: 30,
    API_BASE: "", // ex.: https://seu-backend-publico (deixe vazio se backend estiver no mesmo domínio)
    FIREBASE_CONFIG: {
      apiKey: "AIzaSyAdOzhxHhVouLd9ZOpMof-YQgTTSfGJSFk",
      authDomain: "simuladoslegmasteroficial.firebaseapp.com",
      projectId: "simuladoslegmasteroficial",
      storageBucket: "simuladoslegmasteroficial.firebasestorage.app",
      messagingSenderId: "487716616363",
      appId: "1:487716616363:web:7fd2ce7a32598f720d1fee",
      measurementId: "G-9KEMDVDGB8",
    },
  },
  window.LEGMASTER_CONFIG || {}
);
