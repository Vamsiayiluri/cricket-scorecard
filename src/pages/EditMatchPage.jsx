import React, { useMemo, useState } from "react";
import { Box, Stack, Switch, FormControlLabel } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import PageContainer from "../components/ui/PageContainer";
import ErrorState from "../components/ui/ErrorState";
import { PageLoading } from "../components/ui/LoadingState";
import AppButton from "../components/ui/AppButton";
import useLiveMatch from "../hooks/firebase/useLiveMatch";
import { patchMatchById } from "../services/firebase/matchService";
import { useToast } from "../context/ToastContext";
import {
  validateMatchDetailsStep,
  validateTeamsStep,
  validateTossStep,
  validateRulesStep,
} from "../utils/matchCreationValidation";
import MatchDetailsForm from "../components/MatchCreation/MatchDetailsForm";
import TeamsSetupForm from "../components/MatchCreation/TeamsSetupForm";
import TossDetailsForm from "../components/MatchCreation/TossDetailsForm";
import ScoringRulesForm from "../components/MatchCreation/ScoringRulesForm";
import NotesForm from "../components/MatchCreation/NotesForm";

const EditMatchPage = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { data: match, loading, error } = useLiveMatch(matchId, { enabled: Boolean(matchId) });
  const [saving, setSaving] = useState(false);

  const isLive = match?.status === "in-progress";
  const canEditStructure = match?.status === "scheduled";

  const [formState, setFormState] = useState(null);

  React.useEffect(() => {
    if (!match) return;
    setFormState({
      isPublic: match.isPublic ?? true,
      matchDetails: {
        matchTitle: match.matchDetails?.title || "",
        teamA: match.matchDetails?.teamA || match.teams?.teamA?.name || "",
        teamB: match.matchDetails?.teamB || match.teams?.teamB?.name || "",
        dateTime: match.matchDetails?.date || "",
        venue: match.matchDetails?.location || "",
        matchType: match.matchDetails?.matchType || "T20",
      },
      teams: {
        teamA: {
          name: match.teams?.teamA?.name || "",
          players: match.teams?.teamA?.players || [],
          captain: match.teams?.teamA?.captain || "",
          wicketkeeper: match.teams?.teamA?.wicketkeeper || "",
        },
        teamB: {
          name: match.teams?.teamB?.name || "",
          players: match.teams?.teamB?.players || [],
          captain: match.teams?.teamB?.captain || "",
          wicketkeeper: match.teams?.teamB?.wicketkeeper || "",
        },
      },
      tossDetails: match.tossDetails || { winner: "", decision: "" },
      scoringRules: {
        overs: match.scoringRules?.maxOvers ?? "",
        wide: match.scoringRules?.extras?.wides ?? 1,
        noBall: match.scoringRules?.extras?.noBalls ?? 1,
      },
      notes: match.notes || "",
    });
  }, [match]);

  const stepErrors = useMemo(() => {
    if (!formState) return {};
    return {
      details: validateMatchDetailsStep(formState.matchDetails).errors,
      teams: validateTeamsStep(formState.teams, formState.matchDetails).errors,
      toss: validateTossStep(formState.tossDetails, formState.matchDetails).errors,
      rules: validateRulesStep(formState.scoringRules).errors,
    };
  }, [formState]);

  const hasErrors = useMemo(() => {
    const keys = Object.keys(stepErrors);
    return keys.some((k) => Object.keys(stepErrors[k] || {}).length > 0);
  }, [stepErrors]);

  const handleSave = async () => {
    if (!matchId || !formState) return;

    if (hasErrors) {
      showToast("Fix validation errors before saving.", "warning");
      return;
    }

    setSaving(true);
    try {
      const patch = {
        isPublic: formState.isPublic,
        notes: formState.notes || "",
      };

      // Pre-match: allow full edit (teams/toss/rules)
      if (canEditStructure) {
        patch.matchDetails = {
          teamA: formState.matchDetails.teamA,
          teamB: formState.matchDetails.teamB,
          location: formState.matchDetails.venue,
          date: formState.matchDetails.dateTime,
          ...(formState.matchDetails.matchTitle && { title: formState.matchDetails.matchTitle }),
          ...(formState.matchDetails.matchType && { matchType: formState.matchDetails.matchType }),
        };
        patch.teams = formState.teams;
        patch.tossDetails = formState.tossDetails;
        patch.scoringRules = {
          maxOvers: formState.scoringRules.overs,
          extras: { wides: formState.scoringRules.wide, noBalls: formState.scoringRules.noBall },
        };
      }

      await patchMatchById(matchId, patch);
      showToast("Match updated", "success");
      navigate(`/matches/${matchId}`);
    } catch {
      showToast("Unable to save changes", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!matchId) {
    return (
      <PageContainer title="Edit match">
        <ErrorState message="Invalid match id." />
      </PageContainer>
    );
  }

  if (loading || !formState) {
    return (
      <PageContainer title="Edit match">
        <PageLoading text="Loading match..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Edit match">
        <ErrorState message={error.message || "Unable to load match."} />
      </PageContainer>
    );
  }

  if (!match) {
    return (
      <PageContainer title="Edit match">
        <ErrorState message="Match not found." />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Edit match"
      subtitle={
        canEditStructure
          ? "Safe pre-match editing. Once scoring starts, structural edits are restricted."
          : "Match is live/completed — only safe fields like visibility and notes can be changed."
      }
    >
      {isLive && (
        <ErrorState message="Match is in progress. Structural edits are disabled to protect scoring integrity." />
      )}

      <Stack spacing={3} sx={{ maxWidth: 960 }}>
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(formState.isPublic)}
              onChange={(e) => setFormState((p) => ({ ...p, isPublic: e.target.checked }))}
            />
          }
          label={formState.isPublic ? "Public match (shareable)" : "Private match (restricted)"}
        />

        <Box sx={{ opacity: canEditStructure ? 1 : 0.6, pointerEvents: canEditStructure ? "auto" : "none" }}>
          <MatchDetailsForm
            data={formState.matchDetails}
            errors={stepErrors.details}
            onUpdate={(data) => setFormState((p) => ({ ...p, matchDetails: data }))}
          />
        </Box>

        <Box sx={{ opacity: canEditStructure ? 1 : 0.6, pointerEvents: canEditStructure ? "auto" : "none" }}>
          <TeamsSetupForm
            data={formState.teams}
            teamData={formState.matchDetails}
            errors={stepErrors.teams}
            onUpdate={(data) => setFormState((p) => ({ ...p, teams: data }))}
          />
        </Box>

        <Box sx={{ opacity: canEditStructure ? 1 : 0.6, pointerEvents: canEditStructure ? "auto" : "none" }}>
          <TossDetailsForm
            data={formState.tossDetails}
            teamData={formState.teams}
            errors={stepErrors.toss}
            onUpdate={(data) => setFormState((p) => ({ ...p, tossDetails: data }))}
          />
        </Box>

        <Box sx={{ opacity: canEditStructure ? 1 : 0.6, pointerEvents: canEditStructure ? "auto" : "none" }}>
          <ScoringRulesForm
            data={formState.scoringRules}
            errors={stepErrors.rules}
            onUpdate={(data) => setFormState((p) => ({ ...p, scoringRules: data }))}
          />
        </Box>

        <NotesForm
          data={formState.notes}
          isPublic={formState.isPublic}
          onUpdate={(data) => setFormState((p) => ({ ...p, notes: data }))}
          onUpdateVisibility={(isPublic) => setFormState((p) => ({ ...p, isPublic }))}
        />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <AppButton variant="outlined" onClick={() => navigate(`/matches/${matchId}`)} disabled={saving}>
            Cancel
          </AppButton>
          <AppButton onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </AppButton>
        </Stack>
      </Stack>
    </PageContainer>
  );
};

export default EditMatchPage;

