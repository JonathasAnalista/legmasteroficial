const DEFAULT_LOCAL_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

const requiredEnv = (value, name) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const maskEnvValue = (value) =>
  value ? `${String(value).slice(0, 6)}***${String(value).slice(-4)}` : null;

const sanitizePrivateKey = (key) =>
  key ? String(key).replace(/\\n/g, '\n') : undefined;

const extraCorsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 8080),
  frontendUrl: process.env.FRONTEND_URL || null,
  baseUrl: process.env.BASE_URL || null,
  mpAccessToken: process.env.MP_ACCESS_TOKEN || null,
  allowedOrigins: Array.from(
    new Set([
      process.env.FRONTEND_URL,
      ...DEFAULT_LOCAL_ORIGINS,
      ...extraCorsOrigins
    ].filter(Boolean))
  ),
  firebase: {
    projectId: requiredEnv(process.env.FIREBASE_PROJECT_ID, 'FIREBASE_PROJECT_ID'),
    clientEmail: requiredEnv(process.env.FIREBASE_CLIENT_EMAIL, 'FIREBASE_CLIENT_EMAIL'),
    privateKey: requiredEnv(sanitizePrivateKey(process.env.FIREBASE_PRIVATE_KEY), 'FIREBASE_PRIVATE_KEY')
  }
};

export function logLoadedConfig() {
  console.log('[ENV] {');
  console.log('  NODE_ENV     :', `'${config.env}'`, ',');
  console.log('  FRONTEND_URL :', `'${config.frontendUrl}'`, ',');
  console.log('  BASE_URL     :', `'${config.baseUrl}'`, ',');
  console.log('  PORT         :', `'${config.port}'`, ',');
  console.log('  MP_ACCESS_TOKEN:', `'${maskEnvValue(config.mpAccessToken)}'`);
  console.log('}');

  if (!config.mpAccessToken) {
    console.warn('[env] Atenção: MP_ACCESS_TOKEN não definido — rotas Mercado Pago retornarão erro 500.');
  }

  if (!config.baseUrl) {
    console.warn('[env] Atenção: BASE_URL não definido — notificações do Mercado Pago não funcionarão.');
  }

  if (!config.frontendUrl) {
    console.warn('[env] Atenção: FRONTEND_URL não definido — redirecionamentos de pagamento podem quebrar.');
  }
}
