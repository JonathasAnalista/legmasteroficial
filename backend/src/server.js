import { createApp } from './app.js';
import { config, logLoadedConfig } from './config.js';
import { scheduleAccessCleanup } from './jobs/cleanupOldAccesses.js';

export function startServer() {
  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(`[http] Backend ouvindo na porta ${config.port}`);
    logLoadedConfig();
  });

  scheduleAccessCleanup();

  return server;
}

export default startServer;
