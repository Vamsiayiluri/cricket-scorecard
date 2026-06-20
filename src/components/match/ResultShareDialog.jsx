/* eslint-disable react/prop-types */
import { useRef, useState } from "react";
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import ShareIcon from "@mui/icons-material/Share";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ResultShareCard from "./ResultShareCard";
import AppButton from "../ui/AppButton";
import { useToast } from "../../context/ToastContext";
import {
  buildFilename,
  captureElement,
  copyCanvasToClipboard,
  downloadCanvas,
  shareCanvas,
} from "../../utils/shareCard";
import { getMatchTitle, getPublicScorecardRoute } from "../../utils/matchDisplay";

/**
 * Dialog that renders a preview of the ResultShareCard and offers
 * Download PNG, Share (native), and Copy Image actions.
 *
 * Props:
 *   open       — boolean
 *   onClose    — () => void
 *   match      — Firestore match document
 */
const ResultShareDialog = ({ open, onClose, match }) => {
  const { showToast } = useToast();
  const cardRef = useRef(null);
  const hiddenRef = useRef(null);

  const [capturing, setCapturing] = useState(false);

  const title = match ? getMatchTitle(match) : "Match";
  const filename = buildFilename(title);
  const matchId = match?.matchId || match?.id;
  const scorecardUrl = matchId
    ? `${window.location.origin}${getPublicScorecardRoute(matchId)}`
    : window.location.href;

  const capture = async () => {
    // Prefer the hidden full-size element; fall back to the visible preview
    const target = hiddenRef.current || cardRef.current;
    if (!target) throw new Error("Card element not found.");
    setCapturing(true);
    try {
      return await captureElement(target);
    } finally {
      setCapturing(false);
    }
  };

  const handleDownload = async () => {
    try {
      const canvas = await capture();
      downloadCanvas(canvas, filename);
      showToast("Image downloaded.", "success");
    } catch {
      showToast("Download failed. Please try again.", "error");
    }
  };

  const handleShare = async () => {
    try {
      const canvas = await capture();
      await shareCanvas(canvas, { title, url: scorecardUrl });
    } catch (err) {
      if (err?.message?.includes("not supported")) {
        showToast("Native sharing not supported. Try Download instead.", "info");
      } else {
        showToast("Share failed. Please try Download.", "error");
      }
    }
  };

  const handleCopyImage = async () => {
    try {
      const canvas = await capture();
      await copyCanvasToClipboard(canvas);
      showToast("Image copied to clipboard.", "success");
    } catch {
      showToast("Clipboard copy not supported. Try Download instead.", "info");
    }
  };

  const canNativeShare = Boolean(navigator.share);

  if (!match) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          pb: 1,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pr: 1.5,
        }}
      >
        Share Result Card
        <Tooltip title="Close">
          <IconButton size="small" onClick={onClose} sx={{ ml: 1 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Share this match result on WhatsApp, Instagram, or any platform.
          </Typography>

          {/* Card preview — scaled to fit dialog width */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              bgcolor: (t) =>
                t.palette.mode === "dark"
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(0,0,0,0.04)",
              borderRadius: 2,
              p: 2,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                transform: { xs: "scale(0.82)", sm: "scale(0.92)" },
                transformOrigin: "top center",
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
              }}
            >
              {/* Visible preview card */}
              <ResultShareCard ref={cardRef} match={match} />
            </Box>
          </Box>

          {/* Action buttons */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <AppButton
              variant="contained"
              startIcon={
                capturing ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <DownloadIcon />
                )
              }
              onClick={handleDownload}
              disabled={capturing}
              sx={{ flex: 1 }}
            >
              {capturing ? "Generating…" : "Download PNG"}
            </AppButton>

            {canNativeShare && (
              <AppButton
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={handleShare}
                disabled={capturing}
                sx={{ flex: 1 }}
              >
                Share
              </AppButton>
            )}

            <AppButton
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyImage}
              disabled={capturing}
              sx={{ flex: 1 }}
            >
              Copy Image
            </AppButton>
          </Stack>

          <Typography
            variant="caption"
            color="text.secondary"
            textAlign="center"
            sx={{ display: "block" }}
          >
            Download or copy the image, then paste it into WhatsApp, Instagram Stories, or any chat.
          </Typography>
        </Stack>
      </DialogContent>

      {/* Hidden full-size card for capture (avoids dialog/MUI overlay interference) */}
      <Box
        aria-hidden
        sx={{
          position: "fixed",
          left: -9999,
          top: 0,
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <ResultShareCard ref={hiddenRef} match={match} />
      </Box>
    </Dialog>
  );
};

export default ResultShareDialog;
