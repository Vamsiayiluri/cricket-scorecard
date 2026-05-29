import { useCallback, useEffect, useRef, useState } from "react";
import { persistMatchScorecard } from "../services/firebase/scoringService";
import { scoringLog, scoringWarn } from "../utils/scoringDiagnostics";

const getPendingKey = (matchId) => `scoring_pending_write_${matchId}`;

export const useScoringPersistence = (matchId) => {
  const inFlightRef = useRef(false);
  const queuedPayloadRef = useRef(null);
  const pendingPromiseRef = useRef(Promise.resolve());
  const failedPayloadRef = useRef(null);

  const [status, setStatus] = useState("idle"); // idle | saving | saved | failed
  const [error, setError] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [hasPendingWrites, setHasPendingWrites] = useState(false);

  const processQueue = useCallback(async () => {
    if (inFlightRef.current || !queuedPayloadRef.current) {
      return;
    }

    const payload = queuedPayloadRef.current;
    queuedPayloadRef.current = null;
    inFlightRef.current = true;
    setHasPendingWrites(true);
    setStatus("saving");
    setError(null);
    try {
      await persistMatchScorecard(payload);

      failedPayloadRef.current = null;
      setStatus("saved");
      setLastSavedAt(new Date().toISOString());
      if (matchId) {
        localStorage.removeItem(getPendingKey(matchId));
      }
      setHasPendingWrites(Boolean(queuedPayloadRef.current));
      scoringLog("queue.write.saved", { matchId });
    } catch (writeError) {
      failedPayloadRef.current = payload;
      setStatus("failed");
      setError(writeError?.message || "Failed to persist score update");
      if (matchId) {
        localStorage.setItem(getPendingKey(matchId), JSON.stringify(payload));
      }
      setHasPendingWrites(true);
      scoringWarn("queue.write.failed", {
        matchId,
        error: writeError?.message || String(writeError),
      });
    } finally {
      inFlightRef.current = false;
      if (queuedPayloadRef.current) {
        await processQueue();
      } else if (!failedPayloadRef.current) {
        setHasPendingWrites(false);
      }
    }
  }, [matchId]);

  const enqueuePersist = useCallback(
    (payload) => {
      if (!payload?.matchId || !payload?.scoreCard) {
        return;
      }

      queuedPayloadRef.current = payload; // latest-write-wins
      setHasPendingWrites(true);
      if (matchId) {
        localStorage.setItem(getPendingKey(matchId), JSON.stringify(payload));
      }

      pendingPromiseRef.current = pendingPromiseRef.current.then(() =>
        processQueue(),
      );
    },
    [matchId, processQueue],
  );

  const retryFailed = useCallback(() => {
    if (!failedPayloadRef.current) {
      return;
    }
    queuedPayloadRef.current = failedPayloadRef.current;
    pendingPromiseRef.current = pendingPromiseRef.current.then(() =>
      processQueue(),
    );
  }, [processQueue]);

  const flushPending = useCallback(async () => {
    await pendingPromiseRef.current;
    while (inFlightRef.current || queuedPayloadRef.current) {
      // wait for any chained run to finish
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    if (failedPayloadRef.current) {
      throw new Error("Pending scoring write failed");
    }
  }, []);

  useEffect(() => {
    if (!matchId) {
      return;
    }
    const pendingRaw = localStorage.getItem(getPendingKey(matchId));
    if (!pendingRaw) {
      return;
    }
    try {
      const pendingPayload = JSON.parse(pendingRaw);
      if (pendingPayload?.matchId === matchId && pendingPayload?.scoreCard) {
        scoringLog("queue.pending.recovered", { matchId });
        setStatus("saving");
        enqueuePersist(pendingPayload);
      }
    } catch {
      localStorage.removeItem(getPendingKey(matchId));
    }
  }, [enqueuePersist, matchId]);

  useEffect(() => {
    const handleOnline = () => retryFailed();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [retryFailed]);

  return {
    status,
    error,
    lastSavedAt,
    hasPendingWrites,
    hasFailedWrite: Boolean(failedPayloadRef.current),
    enqueuePersist,
    retryFailed,
    flushPending,
  };
};
