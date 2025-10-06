import cron from 'node-cron';
import { db } from '../firebase.js';
import { differenceInDays, parseDateBR } from '../utils/dates.js';

export async function cleanupOldAccesses() {
  try {
    const today = new Date();
    const snapshot = await db.collection('acessos').get();
    if (snapshot.empty) return;

    const batch = db.batch();
    let deleted = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (!data?.data) return;
      const docDate = parseDateBR(data.data);
      if (differenceInDays(today, docDate) > 2) {
        batch.delete(doc.ref);
        deleted += 1;
      }
    });

    if (deleted > 0) {
      await batch.commit();
      console.log(`[cron] ${deleted} acessos antigos apagados.`);
    } else {
      console.log('[cron] Nenhum acesso antigo para apagar.');
    }
  } catch (error) {
    console.error('[cron] Falha ao limpar acessos:', error);
  }
}

export function scheduleAccessCleanup() {
  cron.schedule('0 3 * * *', () => {
    console.log('[cron] Iniciando limpeza de acessos antigos...');
    cleanupOldAccesses();
  });
}
