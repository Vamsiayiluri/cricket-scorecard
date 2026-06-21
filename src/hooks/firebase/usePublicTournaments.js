import { useMemo } from "react";
import { buildPublicTournamentsQuery } from "../../services/firebase/tournamentService";
import useRealtimeCollection from "./useRealtimeCollection";

const getSortTime = (value) =>
  value?.toMillis?.() ?? new Date(value || 0).getTime();

const usePublicTournaments = () => {
  const queryRef = useMemo(() => buildPublicTournamentsQuery(), []);

  const { data, loading, error } = useRealtimeCollection(queryRef);

  const tournaments = useMemo(
    () =>
      data
        .filter((t) => !t.archivedAt)
        .sort((a, b) => getSortTime(b.updatedAt || b.createdAt) - getSortTime(a.updatedAt || a.createdAt)),
    [data]
  );

  return { tournaments, loading, error };
};

export default usePublicTournaments;
