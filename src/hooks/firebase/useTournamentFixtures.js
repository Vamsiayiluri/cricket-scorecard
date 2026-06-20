import { useMemo } from "react";
import { buildFixturesQuery } from "../../services/firebase/fixtureService";
import useRealtimeCollection from "./useRealtimeCollection";

const useTournamentFixtures = (tournamentId) => {
  const queryRef = useMemo(
    () => (tournamentId ? buildFixturesQuery(tournamentId) : null),
    [tournamentId]
  );

  const { data, loading, error } = useRealtimeCollection(queryRef, {
    enabled: Boolean(tournamentId),
  });

  return { fixtures: data, loading, error };
};

export default useTournamentFixtures;
