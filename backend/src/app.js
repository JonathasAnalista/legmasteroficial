import express from 'express';
import cors from 'cors';
// import mercadoPagoRoutes from './routes/mercadoPagoRoutes.js';
import { config, maskEnvValue } from './config.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (config.allowedOrigins.length === 0) return callback(null, true);
        if (config.allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Origem não permitida'), false);
      },
      credentials: true
    })
  );

  app.use(express.json({ type: ['application/json', 'text/plain'] }));
  app.use(express.urlencoded({ extended: true }));

  app.get('/', (_req, res) => res.status(200).send('ok'));
  app.get('/debug/env', (_req, res) =>
    res.json({
      FRONTEND_URL: config.frontendUrl,
      BASE_URL: config.baseUrl,
      MP_ACCESS_TOKEN: maskEnvValue(config.mpAccessToken)
    })
  );

  // Rotas Mercado Pago desativadas temporariamente.
  // app.use('/api/mp', mercadoPagoRoutes);

  return app;
}
