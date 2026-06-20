/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getImportHistory } from "../../services/firebase/importService";

export const useImportHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = async () => {
    if (!user?.uid) return;
    setLoading(true);
    setError(null);
    try {
      const records = await getImportHistory(user.uid);
      records.sort((a, b) => {
        const ta = a.importedAt?.toMillis?.() || 0;
        const tb = b.importedAt?.toMillis?.() || 0;
        return tb - ta;
      });
      setHistory(records);
    } catch (err) {
      setError(err.message || "Failed to load import history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  return { history, loading, error, reload };
};
