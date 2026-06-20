import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { buildUserTournamentsQuery } from "../../services/firebase/tournamentService";
import useRealtimeCollection from "./useRealtimeCollection";

const useUserTournaments = () => {
  const { user } = useAuth();

  const queryRef = useMemo(() => {
    if (!user?.uid) return null;
    return buildUserTournamentsQuery(user.uid);
  }, [user?.uid]);

  const { data, loading, error } = useRealtimeCollection(queryRef, {
    enabled: Boolean(user?.uid),
  });

  // Client-side filter: exclude archived tournaments from the default list
  const activeTournaments = useMemo(
    () => data.filter((t) => !t.archivedAt),
    [data]
  );

  return { tournaments: activeTournaments, allTournaments: data, loading, error };
};

export default useUserTournaments;
