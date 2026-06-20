import { useMemo } from "react";
import { collection, query, where } from "firebase/firestore";
import db from "../../firebase-config";
import { COLLECTIONS } from "../../services/firebase/constants";
import { useAuth } from "../../context/AuthContext";
import useRealtimeCollection from "./useRealtimeCollection";

const useUserTeams = () => {
  const { user } = useAuth();

  const queryRef = useMemo(() => {
    if (!user?.uid) return null;
    return query(collection(db, COLLECTIONS.TEAMS), where("createdBy", "==", user.uid));
  }, [user?.uid]);

  const { data, loading, error } = useRealtimeCollection(queryRef, { enabled: Boolean(user?.uid) });

  const teams = useMemo(
    () => [...data].sort((a, b) => a.name.localeCompare(b.name)),
    [data]
  );

  return { teams, loading, error };
};

export default useUserTeams;
