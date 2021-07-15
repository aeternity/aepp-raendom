import { serializeError } from 'serialize-error';
import Vue from 'vue';

export default ({ dispatch }) => {
  const reportsToSend = [];
  let showingErrorReportModal = false;

  const handleError = async (error) => {
    reportsToSend.push({
      appName: 'superhero-ui',
      appVersion: process.env.npm_package_version,
      appRevision: process.env.COMMIT_HASH,
      userAgent: window.navigator.userAgent,
      location: window.location.href,
      timestamp: Date.now(),
      error,
    });
    if (showingErrorReportModal) return;
    showingErrorReportModal = true;
    let isReportSubmitted = false;
    while (reportsToSend.length) {
      // eslint-disable-next-line no-await-in-loop
      isReportSubmitted = await dispatch('modals/open', {
        name: 'error-report-modal',
        report: reportsToSend.shift(),
      }) || isReportSubmitted;
    }
    if (isReportSubmitted) {
      await dispatch('modals/open', { name: 'error-report-submitted-modal' });
    }
    showingErrorReportModal = false;
  };

  window.addEventListener('unhandledrejection', (event) => handleError({
    exceptionType: 'unhandled-rejection',
    ...serializeError(event.reason),
  }));
  window.onerror = (message, source, line, col, error) => handleError({
    exceptionType: 'unhandled-error',
    message,
    source,
    line,
    col,
    ...serializeError(error),
  });
  Vue.config.errorHandler = async (error, vm, info) => {
    console.error(error);
    await handleError({
      exceptionType: 'unhandled-vue-error',
      info,
      ...serializeError(error),
    });
  };
};
