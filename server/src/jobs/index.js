import { startCloseExpiredSurveysJob } from './closeExpiredSurveys.js';
import { startRevertPendingPaymentsJob } from './revertPendingPayments.js';

export const initializeCronJobs = () => {
  const closeExpired = startCloseExpiredSurveysJob();
  const revertPending = startRevertPendingPaymentsJob();

  closeExpired.start();
  revertPending.start();

  console.log('✅ Cron jobs initialized');
};
