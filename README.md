# Simulado Agente – Estrutura Profissional

Este repositório mantém o frontend estático da plataforma (`frontend/`) e a API Node.js que integra com Firebase e Mercado Pago (`backend/`). Conteúdos antigos (Android/TWA/scripts manuais) estão arquivados em `legacy/`.

```
simuladosdetranoficial_2/
|-- frontend/           # Site: HTML, CSS, JS, PWA, simulados
|-- backend/            # API Express + Firebase Admin (cron de limpeza incluso)
|   `-- src/            # App Express modularizado (config, jobs, rotas Mercado Pago)
`-- legacy/             # Materiais antigos (APK, gradle, scripts, backend TS)
    `-- server-ts/      # Backend TypeScript arquivado
```

---

## Frontend (`frontend/`)

- `index.html` – shell principal (carrega tema, scripts, integrações)..
- `assets/css/style.css` – estilos globais do app.
- `assets/js/script.js` – lógica principal (auth, provas, UI).
- `assets/js/api.js` – cliente para a API (`window.LegmasterApi`).
- `js/config.js` – configuração Firebase (usa `window.LEGMASTER_CONFIG`).
- `js/firebase.js` – inicialização segura do Firebase no cliente.
- `js/gate.js` – guard que controla acesso FREE/PRO dos simulados..
- `service-worker.js`, `manifest.json`, `icons/` – PWA e ícones.
- `pagamento/{sucesso,pendente,erro}/` – retornos do checkout Mercado Pago.
- `simulados/` – pastas dos simulados com seus `index.html`, `script.js`, `style.css` e assets.
- `manifest-checksum.txt` – hash usado na publicação para invalidar caches.

### Executar localmente

É um site estático: abra `frontend/index.html` ou sirva com seu static server preferido.

### Ajustes rápidos

- Atualize `frontend/js/config.js` com as chaves do novo projeto Firebase.
- Ajuste `window.__LEGMASTER_API_BASE__` em `frontend/index.html` para apontar para a API hospedada.
- Para alterações visuais, edite `assets/css/style.css` (agora centralizado).

---

## Backend (`backend/`)

API Express (Node 18+) usada para Mercado Pago e para aplicar benefícios PRO no Firestore. O código foi modularizado em `src/` (config, rotas Mercado Pago, jobs de limpeza).

### Setup

1. `cd backend`
2. Copie `.env.example` para `.env` e preencha com os valores reais.
3. `npm install`
4. `npm start`

### Cron automático

O job `backend/src/jobs/cleanupOldAccesses.js` usa `node-cron` para executar `cleanupOldAccesses()` todo dia às 03:00 e manter apenas os acessos dos últimos dois dias. O agendamento é iniciado em `backend/src/server.js`.

### Endpoints principais

- `POST /api/mp/create-preference`
- `POST /api/mp/pix/create`
- `GET  /api/mp/payment/:id`
- `POST /api/mp/webhook`
- Health check: `GET /` e `GET /debug/env`

### Deploy

- Render, Railway, Fly.io, Cloud Run, etc.
- Configure as mesmas variáveis de ambiente do `.env`.
- Certifique-se de rodar com Node >= 18.

## Backend TypeScript legado (`legacy/server-ts/`)

Projeto mais antigo (TS) com múltiplos controllers/services. Mantido arquivado em `legacy/server-ts/`. Antes de usar novamente:

1. `cd legacy/server-ts`
2. `npm install`
3. Configure `.env` com as variáveis esperadas.
4. `npm run dev` ou `npm run build && npm run start`

Essa pasta está fora do fluxo atual (fica em `legacy/`) e só deve ser usada para consultas ou migrações.


---

## Legacy (`legacy/`)

- APK assinada antiga, projeto Android (`app/`, `gradle*`, `build/`).
- `server-ts/` (backend TypeScript arquivado) e demais scripts auxiliares.
- `chave-legmaster.json`, `limparAcessos.js`, `twa-manifest.json`, `apply_changes.ps1`, etc.

Esses arquivos ficam guardados, mas não fazem parte do fluxo atual. `legacy/` está no `.gitignore` para evitar commits acidentais.


---

## Multi-cliente (autoescolas)

- Use `configs/template/` como ponto de partida para cada autoescola.
- Preencha `frontend/config.js` e `backend/.env` do cliente com as credenciais corretas.
- Rode `node scripts/apply-config.js nome-do-cliente` para copiar os arquivos para o projeto antes de testar ou fazer deploy.
- Cada deploy (frontend/backend) deve usar os arquivos gerados para aquele cliente.

Veja `configs/README.md` para o passo a passo detalhado.

---

## Fluxo de trabalho recomendado

1. **Frontend**
   - Ajuste configs (`config.js`, `index.html`).
   - Gere build estático (Netlify/Vercel aceita a pasta `frontend/`).
2. **Backend**
   - Configure `.env`.
   - Execute `npm start` localmente ou faça deploy.
3. **Firebase**
   - Console → Authentication: habilitar Email/Senha, adicionar domínios.
   - Console → Firestore: publicar regras permitindo gravação (auth != null) e adicionar índices se necessário.
4. **Migrações**
   - Se precisar migrar dados de outro projeto, exporte/import em Firestore.

---

## Boas práticas em vigor

- Uso defensivo do Firebase client (verifica `window.LEGMASTER_CONFIG`).
- Guards no `gtag` para evitar exceções.
- Service Worker simples que não atrapalha atualizações.
- Créditos e toasts acessíveis (`aria-*`).
- Lógica de simulados agrupada em `assets/js/script.js` (ainda que extensa, centralizada).

---

## Ideias futuras (sem quebrar o existente)

- Migrar simulados para dados (JSON) para reduzir duplicação.
- Adotar bundler (Vite/Parcel) para modularizar JS/CSS.
- Simplificar fluxo de deploy com scripts (`npm run deploy:frontend`, etc.).
- Melhorar regras do Firestore para granularidade por coleção.

---

## Checklist rápido de QA

- [ ] Login/cadastro Firebase funcionando.
- [ ] Salvamento de simulado aparece no Firestore (`desempenhos`).
- [ ] Webhook Mercado Pago ativa plano PRO corretamente.
- [ ] Páginas de retorno do pagamento respondem com o layout esperado.
- [ ] Service Worker registra sem erros no console.

---

Qualquer ajuste adicional (scripts de build, automações CI/CD, limpeza de simulados) é só solicitar.
