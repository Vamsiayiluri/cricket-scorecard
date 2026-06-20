import { useEffect, useMemo, useState } from "react";
import { fetchDiscoverMatches } from "../../services/firebase/discoveryService";

const INITIAL = { live: [], results: [], upcoming: [], all: [], loading: true, error: null };

/**
 * One-time fetch of public matches for the /discover page.
 * Not a realtime subscription — data refreshes on page mount.
 */
const useDiscoverMatches = () => {
  const [state, setState] = useState(INITIAL);

  useEffect(() => {
    let cancelled = false;

    fetchDiscoverMatches()
      .then((data) => {
        if (!cancelled) setState({ ...data, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled)
          setState({ live: [], results: [], upcoming: [], all: [], loading: false, error: err });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => state, [state]);
};

export default useDiscoverMatches;
