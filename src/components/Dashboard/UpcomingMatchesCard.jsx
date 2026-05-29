/* eslint-disable react/prop-types */
import { memo } from "react";
import MatchListSection from "./MatchListSection";
import { formatMatchDate, getMatchTitle } from "../../utils/matchDisplay";

const UpcomingMatchesCard = memo(({ matches, loading }) => (
  <MatchListSection
    title="Upcoming Matches"
    matches={matches}
    loading={loading}
    emptyTitle="No upcoming matches"
    emptyDescription="Scheduled matches will appear here after creation."
    renderLine={(match) => `${getMatchTitle(match)} — ${formatMatchDate(match?.matchDetails?.date)}`}
  />
));

UpcomingMatchesCard.displayName = "UpcomingMatchesCard";

export default UpcomingMatchesCard;
