import { useMemo } from "react";
import { collection, query, where } from "firebase/firestore";
import db from "../../firebase-config";
import { COLLECTIONS } from "../../services/firebase/constants";
import { useAuth } from "../../context/AuthContext";
import useRealtimeCollection from "./useRealtimeCollection";

const useUserPlayers = () => {
  const { user } = useAuth();

  const queryRef = useMemo(() => {
    if (!user?.uid) return null;
    return query(collection(db, COLLECTIONS.PLAYERS), where("createdBy", "==", user.uid));
  }, [user?.uid]);

  const { data, loading, error } = useRealtimeCollection(queryRef, { enabled: Boolean(user?.uid) });

  const players = useMemo(
    () => [...data].sort((a, b) => a.name.localeCompare(b.name)),
    [data]
  );

  return { players, loading, error };
};

export default useUserPlayers;
