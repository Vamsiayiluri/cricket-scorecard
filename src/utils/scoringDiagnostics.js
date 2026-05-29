const isDev = Boolean(import.meta?.env?.DEV);

const createLogPayload = (event, payload) => ({
  event,
  at: new Date().toISOString(),
  ...payload,
});

export const scoringLog = (event, payload = {}) => {
  if (!isDev) return;
  // eslint-disable-next-line no-console
  console.debug("[scoring]", createLogPayload(event, payload));
};

export const scoringWarn = (event, payload = {}) => {
  if (!isDev) return;
  // eslint-disable-next-line no-console
  console.warn("[scoring]", createLogPayload(event, payload));
};

export const scoringMeasure = async (event, fn, payload = {}) => {
  const start = performance.now();
  try {
    const result = await fn();
    scoringLog(`${event}:success`, {
      durationMs: Number((performance.now() - start).toFixed(2)),
      ...payload,
    });
    return result;
  } catch (error) {
    scoringWarn(`${event}:error`, {
      durationMs: Number((performance.now() - start).toFixed(2)),
      error: error?.message || String(error),
      ...payload,
    });
    throw error;
  }
};

