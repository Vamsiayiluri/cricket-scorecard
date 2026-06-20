import { useEffect, useState } from "react";
import { doc } from "firebase/firestore";
import db from "../../firebase-config";
import { COLLECTIONS } from "../../services/firebase/constants";
import { subscribeToDocument } from "../../services/firebase/firestoreHelpers";

const useTournament = (tournamentId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(tournamentId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tournamentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const ref = doc(db, COLLECTIONS.TOURNAMENTS, tournamentId);
    const unsub = subscribeToDocument(
      ref,
      (snap) => {
        setData(snap);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return unsub;
  }, [tournamentId]);

  return { data, loading, error };
};

export default useTournament;
