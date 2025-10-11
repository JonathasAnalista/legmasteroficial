// Configurações globais da plataforma (uso opcional)
window.LEGMASTER_CONFIG = Object.assign(
  {
    FREE_UNLOCK_INDEX: 1,
    QUESTOES_TOTAL: 30,
    API_BASE: "", // ex.: https://seu-backend-publico (deixe vazio se backend estiver no mesmo domínio)
    FIREBASE_CONFIG: {
      apiKey: "AIzaSyD5ECjmkyPijREgQ8exkl2V1Er5I9tjowo",
      authDomain: "cfcuba-1e021.firebaseapp.com",
      projectId: "cfcuba-1e021",
      storageBucket: "cfcuba-1e021.firebasestorage.app",
      messagingSenderId: "406314691377",
      appId: "1:406314691377:web:dfffe2da6c46099dfade10",
      measurementId: "G-13LDRJRSFW"
    },
  },
  window.LEGMASTER_CONFIG || {}
);
