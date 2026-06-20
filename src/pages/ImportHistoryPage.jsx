/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Chip,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import PageContainer from "../components/ui/PageContainer";
import { useAuth } from "../context/AuthContext";
import { useImportHistory } from "../hooks/firebase/useImportHistory";
import { rollbackImport } from "../services/firebase/importService";

const STATUS_COLOR = {
  Draft: "default",
  Validated: "info",
  Imported: "success",
  RolledBack: "warning",
};

const fmtDate = (ts) => {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString();
};

const ImportHistoryPage = () => {
  const { user } = useAuth();
  const { history, loading, error, reload } = useImportHistory();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [rollbackError, setRollbackError] = useState("");

  const openConfirm = (record) => {
    setSelectedRecord(record);
    setRollbackError("");
    setConfirmOpen(true);
  };
  const closeConfirm = () => {
    setConfirmOpen(false);
    setSelectedRecord(null);
  };

  const handleRollback = async () => {
    if (!selectedRecord) return;
    setRolling(true);
    setRollbackError("");
    try {
      await rollbackImport({
        importId: selectedRecord.importId,
        importBatchId: selectedRecord.importBatchId,
        createdBy: user.uid,
      });
      closeConfirm();
      reload();
    } catch (err) {
      setRollbackError(err.message || "Rollback failed.");
    } finally {
      setRolling(false);
    }
  };

  return (
    <PageContainer title="Import History" subtitle="View and rollback AuctionArena imports">
      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && history.length === 0 && (
        <Stack alignItems="center" spacing={2} py={8}>
          <HistoryIcon sx={{ fontSize: 48, color: "text.secondary" }} />
          <Typography color="text.secondary">No imports yet.</Typography>
          <Button variant="outlined" href="/imports">Go to Import Wizard</Button>
        </Stack>
      )}

      {!loading && history.length > 0 && (
        <Paper variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>File</strong></TableCell>
                <TableCell align="right"><strong>Teams</strong></TableCell>
                <TableCell align="right"><strong>Players</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((rec) => (
                <TableRow key={rec.importId}>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{fmtDate(rec.importedAt)}</TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {rec.fileName || "—"}
                  </TableCell>
                  <TableCell align="right">{rec.teamsCreated ?? "—"}</TableCell>
                  <TableCell align="right">{rec.playersCreated ?? "—"}</TableCell>
                  <TableCell>
                    <Chip
                      label={rec.status}
                      size="small"
                      color={STATUS_COLOR[rec.status] || "default"}
                    />
                  </TableCell>
                  <TableCell>
                    {rec.status === "Imported" && (
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => openConfirm(rec)}
                      >
                        Rollback
                      </Button>
                    )}
                    {rec.status === "RolledBack" && (
                      <Typography variant="caption" color="text.secondary">Rolled back</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Rollback confirmation dialog */}
      <Dialog open={confirmOpen} onClose={closeConfirm} maxWidth="xs" fullWidth>
        <DialogTitle>Rollback Import?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will delete all teams, players, and team assignments created by this import batch.
            Existing data that was not created by this import will not be affected.
          </DialogContentText>
          {rollbackError && <Alert severity="error" sx={{ mt: 2 }}>{rollbackError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm} disabled={rolling}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleRollback} disabled={rolling}>
            {rolling ? "Rolling back…" : "Rollback"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ImportHistoryPage;
