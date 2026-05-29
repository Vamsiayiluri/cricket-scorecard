import React, { useMemo, useState } from "react";
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import ShareIcon from "@mui/icons-material/Share";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { archiveMatch, softDeleteMatch, setMatchVisibility } from "../../services/firebase/matchService";

const MatchActionsMenu = ({ match }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [anchorEl, setAnchorEl] = useState(null);
  const [busy, setBusy] = useState(false);

  const open = Boolean(anchorEl);
  const matchId = match?.matchId || match?.id;

  const canEditPreMatch = match?.status === "scheduled";

  const handleClose = () => setAnchorEl(null);

  const handleArchive = async () => {
    if (!matchId) return;
    handleClose();
    setBusy(true);
    try {
      await archiveMatch(matchId);
      showToast("Match archived", "success");
    } catch {
      showToast("Unable to archive match", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleSoftDelete = async () => {
    if (!matchId) return;
    handleClose();
    const confirmed = window.confirm("Soft delete this match? You can restore later from admin tooling.");
    if (!confirmed) return;
    setBusy(true);
    try {
      await softDeleteMatch(matchId);
      showToast("Match deleted (soft)", "success");
    } catch {
      showToast("Unable to delete match", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleToggleVisibility = async () => {
    if (!matchId) return;
    handleClose();
    setBusy(true);
    try {
      await setMatchVisibility(matchId, !(match?.isPublic ?? true));
      showToast(`Match is now ${(match?.isPublic ?? true) ? "private" : "public"}`, "success");
    } catch {
      showToast("Unable to update visibility", "error");
    } finally {
      setBusy(false);
    }
  };

  const items = useMemo(
    () => [
      {
        key: "details",
        label: "Match details",
        icon: <VisibilityIcon fontSize="small" />,
        action: () => navigate(`/matches/${matchId}`),
        disabled: !matchId,
      },
      {
        key: "edit",
        label: "Edit (pre-match)",
        icon: <EditIcon fontSize="small" />,
        action: () => navigate(`/matches/${matchId}/edit`),
        disabled: !matchId || !canEditPreMatch,
      },
      {
        key: "share",
        label: "Share",
        icon: <ShareIcon fontSize="small" />,
        action: () => navigate(`/matches/${matchId}?share=1`),
        disabled: !matchId,
      },
      {
        key: "visibility",
        label: match?.isPublic === false ? "Make public" : "Make private",
        icon: <VisibilityIcon fontSize="small" />,
        action: handleToggleVisibility,
        disabled: !matchId,
      },
      {
        key: "archive",
        label: "Archive",
        icon: <ArchiveIcon fontSize="small" />,
        action: handleArchive,
        disabled: !matchId || busy,
      },
      {
        key: "delete",
        label: "Delete (soft)",
        icon: <DeleteIcon fontSize="small" />,
        action: handleSoftDelete,
        disabled: !matchId || busy,
      },
    ],
    [busy, canEditPreMatch, handleArchive, handleSoftDelete, match?.isPublic, matchId, navigate]
  );

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        disabled={!matchId}
        aria-label="Match actions"
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {items.map((item) => (
          <MenuItem
            key={item.key}
            onClick={() => {
              handleClose();
              item.action();
            }}
            disabled={item.disabled}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default MatchActionsMenu;

