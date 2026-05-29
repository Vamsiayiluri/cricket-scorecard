/* eslint-disable react/prop-types */
import { memo } from "react";
import MatchListSection from "./MatchListSection";
import { getMatchScoreLine, getMatchTitle } from "../../utils/matchDisplay";

const OngoingMatchesCard = memo(({ matches, loading }) => (
  <MatchListSection
    title="Ongoing Matches"
    matches={matches}
    loading={loading}
    emptyTitle="No ongoing matches"
    emptyDescription="Start a match from Create Match to see live games here."
    renderLine={(match) => `${getMatchTitle(match)} — ${getMatchScoreLine(match)}`}
  />
));

OngoingMatchesCard.displayName = "OngoingMatchesCard";

export default OngoingMatchesCard;
