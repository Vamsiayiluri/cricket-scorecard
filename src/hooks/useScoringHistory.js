import { useCallback, useMemo, useState } from "react";

const MAX_HISTORY = 40;

const cloneSnapshot = (snapshot) =>
  JSON.parse(
    JSON.stringify({
      scoreCard: snapshot?.scoreCard || null,
      currentOver: snapshot?.currentOver || [],
      extras: snapshot?.extras || null,
      currentInning: snapshot?.currentInning || 1,
      capturedAt: Date.now(),
    })
  );

export const useScoringHistory = () => {
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const pushSnapshot = useCallback((snapshot) => {
    if (!snapshot?.scoreCard) {
      return;
    }
    const cloned = cloneSnapshot(snapshot);
    setUndoStack((prev) => [...prev.slice(-(MAX_HISTORY - 1)), cloned]);
    setRedoStack([]);
  }, []);

  const undo = useCallback(
    (currentSnapshot, currentInning) => {
      const previous = undoStack[undoStack.length - 1];
      if (!previous || previous.currentInning !== currentInning) {
        return null;
      }

      const clonedCurrent = cloneSnapshot(currentSnapshot);
      setUndoStack((prev) => prev.slice(0, -1));
      setRedoStack((prev) => [...prev, clonedCurrent]);
      return previous;
    },
    [undoStack]
  );

  const redo = useCallback(
    (currentSnapshot, currentInning) => {
      const next = redoStack[redoStack.length - 1];
      if (!next || next.currentInning !== currentInning) {
        return null;
      }

      const clonedCurrent = cloneSnapshot(currentSnapshot);
      setRedoStack((prev) => prev.slice(0, -1));
      setUndoStack((prev) => [...prev.slice(-(MAX_HISTORY - 1)), clonedCurrent]);
      return next;
    },
    [redoStack]
  );

  const canUndo = useMemo(() => undoStack.length > 0, [undoStack.length]);
  const canRedo = useMemo(() => redoStack.length > 0, [redoStack.length]);

  return {
    canUndo,
    canRedo,
    undoCount: undoStack.length,
    redoCount: redoStack.length,
    pushSnapshot,
    undo,
    redo,
  };
};

