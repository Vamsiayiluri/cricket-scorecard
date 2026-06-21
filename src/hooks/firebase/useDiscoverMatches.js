import { useEffect, useMemo, useState } from "react";
import {
  fetchDiscoverMatches,
  fetchDiscoverTournaments,
} from "../../services/firebase/discoveryService";

const INITIAL = { live: [], results: [], upcoming: [], all: [], tournaments: [], loading: true, error: null };

/**
 * One-time fetch of public matches for the /discover page.
 * Not a realtime subscription — data refreshes on page mount.
 */
const useDiscoverMatches = () => {
  const [state, setState] = useState(INITIAL);

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchDiscoverMatches(), fetchDiscoverTournaments()])
      .then(([matchData, tournaments]) => {
        if (!cancelled) setState({ ...matchData, tournaments, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled)
          setState({ live: [], results: [], upcoming: [], all: [], tournaments: [], loading: false, error: err });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => state, [state]);
};

export default useDiscoverMatches;
