/* eslint-disable react/prop-types */
import { memo } from "react";
import MatchListSection from "./MatchListSection";
import { getCompletedResultLine, getMatchTitle } from "../../utils/matchDisplay";

const CompletedMatchesCard = memo(({ matches, loading }) => (
  <MatchListSection
    title="Completed Matches"
    matches={matches}
    loading={loading}
    emptyTitle="No completed matches"
    emptyDescription="Finished matches will be listed here once marked completed."
    renderLine={(match) => `${getMatchTitle(match)} — ${getCompletedResultLine(match)}`}
  />
));

CompletedMatchesCard.displayName = "CompletedMatchesCard";

export default CompletedMatchesCard;
