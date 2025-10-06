// Modelo de configuracao para o frontend de uma autoescola.
// Copie este arquivo para `frontend/js/config.js` antes do deploy do cliente
// (ou use o script `scripts/apply-config.js`).
// Preencha os campos com os valores reais do projeto Firebase daquele cliente.

window.LEGMASTER_CONFIG = Object.assign(
  {
    FREE_UNLOCK_INDEX: 1,
    QUESTOES_TOTAL: 30,
    API_BASE: "", // ex.: https://api.autoescola.com.br
    FIREBASE_CONFIG: {
      apiKey: "COLOQUE_A_API_KEY_AQUI",
      authDomain: "PROJETO.firebaseapp.com",
      projectId: "PROJETO",
      storageBucket: "PROJETO.appspot.com",
      messagingSenderId: "",
      appId: "",
      measurementId: ""
    }
  },
  window.LEGMASTER_CONFIG || {}
);
