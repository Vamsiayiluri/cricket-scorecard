/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import AppDialog from "../ui/AppDialog";
import AppButton from "../ui/AppButton";
import AppInput from "../ui/AppInput";
import { getPublicLiveRoute, getPublicScorecardRoute } from "../../utils/matchDisplay";
import { useToast } from "../../context/ToastContext";

const copyToClipboard = async (text) => {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
};

const ShareMatchDialog = ({ open, onClose, matchId, title }) => {
  const { showToast } = useToast();
  const [sharing, setSharing] = useState(false);

  const { liveUrl, scorecardUrl } = useMemo(() => {
    const origin = window.location.origin;
    const live = `${origin}${getPublicLiveRoute(matchId)}`;
    const scorecard = `${origin}${getPublicScorecardRoute(matchId)}`;
    return { liveUrl: live, scorecardUrl: scorecard };
  }, [matchId]);

  const handleCopy = async (value) => {
    try {
      await copyToClipboard(value);
      showToast("Link copied", "success");
    } catch {
      showToast("Copy failed", "error");
    }
  };

  const handleNativeShare = async () => {
    if (!navigator?.share) {
      showToast("Native share not supported in this browser.", "info");
      return;
    }
    try {
      setSharing(true);
      await navigator.share({
        title: title || "Cricket Match",
        text: "Live cricket score",
        url: liveUrl,
      });
    } catch {
      // user cancelled - ignore
    } finally {
      setSharing(false);
    }
  };

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title="Share match"
      actions={
        <AppButton variant="outlined" onClick={onClose}>
          Close
        </AppButton>
      }
    >
      <Stack spacing={2.25}>
        <Typography variant="body2" color="text.secondary">
          Share viewer-safe links (read-only).
        </Typography>

        <Box>
          <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
            Live score link
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <AppInput value={liveUrl} InputProps={{ readOnly: true }} />
            <AppButton variant="outlined" onClick={() => handleCopy(liveUrl)}>
              Copy
            </AppButton>
          </Stack>
        </Box>

        <Box>
          <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
            Scorecard link
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <AppInput value={scorecardUrl} InputProps={{ readOnly: true }} />
            <AppButton variant="outlined" onClick={() => handleCopy(scorecardUrl)}>
              Copy
            </AppButton>
          </Stack>
        </Box>

        <AppButton onClick={handleNativeShare} disabled={sharing} fullWidth>
          {sharing ? "Sharing…" : "Share (native)"}
        </AppButton>
      </Stack>
    </AppDialog>
  );
};

export default ShareMatchDialog;

