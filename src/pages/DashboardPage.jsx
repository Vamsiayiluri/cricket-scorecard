import { Box, Grid } from "@mui/material";
import MatchOverviewCard from "../components/Dashboard/MatchOverviewCard";
import OngoingMatchesCard from "../components/Dashboard/OngoingMatchesCard";
import UpcomingMatchesCard from "../components/Dashboard/UpcomingMatchesCard";
import CompletedMatchesCard from "../components/Dashboard/CompletedMatchesCard";
import RecentActivityCard from "../components/Dashboard/RecentActivityCard";
import AppButton from "../components/ui/AppButton";
import PageContainer from "../components/ui/PageContainer";
import ErrorState from "../components/ui/ErrorState";
import { useNavigate } from "react-router-dom";
import useDashboardMatches from "../hooks/firebase/useDashboardMatches";
import { useAuth } from "../context/AuthContext";
import AddIcon from "@mui/icons-material/Add";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { isScorer } = useAuth();
  const { ongoing, upcoming, completed, recentActivity, stats, loading, error } =
    useDashboardMatches({ realtime: true });

  return (
    <PageContainer
      title="Match Operations Hub"
      subtitle={
        isScorer
          ? "Create, manage, and livestream professional-grade cricket scorecards."
          : "Browse live scoreboards, match summaries, and analytics tickers."
      }
    >
      {error && <ErrorState message={error.message || "Unable to load dashboard data."} />}
      
      {/* Visual Tech Mesh Hero Banner */}

      <Grid container spacing={2} className="animate-fade-in">
        <Grid item xs={12}>
          <MatchOverviewCard stats={stats} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6}>
          <OngoingMatchesCard matches={ongoing} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6}>
          <UpcomingMatchesCard matches={upcoming} loading={loading} />
        </Grid>
        <Grid item xs={12} lg={6}>
          <CompletedMatchesCard matches={completed} loading={loading} />
        </Grid>
        <Grid item xs={12} lg={6}>
          <RecentActivityCard matches={recentActivity} loading={loading} />
        </Grid>
      </Grid>

      {isScorer && (
        <Box sx={{ textAlign: "center", mt: 2.5 }}>
          <AppButton
            onClick={() => navigate("/create-match")}
            startIcon={<AddIcon />}
            aria-label="Create a new match"
            sx={{
              py: 1,
              width: "100%",
              maxWidth: 380,
              fontSize: "0.85rem",
              background: "linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)",
              boxShadow: "0 4px 12px rgba(108, 99, 255, 0.2)",
            }}
          >
            Create Match
          </AppButton>
        </Box>
      )}
    </PageContainer>
  );
};

export default DashboardPage;
