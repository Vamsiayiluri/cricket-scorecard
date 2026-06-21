/* eslint-disable react/prop-types */
import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  LinearProgress,
  Alert,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import PageContainer from "../components/ui/PageContainer";
import { useAuth } from "../context/AuthContext";
import { parseAuctionArenaWorkbook } from "../utils/excelParser";
import { validateImportRows } from "../utils/importValidator";
import { createImportRecord, executeImport } from "../services/firebase/importService";

const STEPS = ["Upload Workbook", "Preview Teams", "Preview Players", "Confirm Import", "Complete"];

// ─── Step 1: Upload ───────────────────────────────────────────────────────────

const UploadStep = ({ onParsed, onError }) => {
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const inputRef = useRef();

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    if (!file.name.match(/\.xlsx$/i)) {
      onError("Only .xlsx files are supported.");
      return;
    }
    setParsing(true);
    try {
      const buffer = await file.arrayBuffer();
      const { rows, sheetFound, parseError } = await parseAuctionArenaWorkbook(new Uint8Array(buffer));
      if (parseError) {
        onError("Invalid workbook. Could not read the file.");
        return;
      }
      if (!sheetFound) {
        onError('No "ImportData" sheet found in this workbook. Please export from AuctionArena and try again.');
        return;
      }
      onParsed({ rows, fileName: file.name });
    } catch {
      onError("Failed to parse workbook.");
    } finally {
      setParsing(false);
    }
  }, [onParsed, onError]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <Stack spacing={3} alignItems="center">
      <Paper
        variant="outlined"
        sx={{
          width: "100%",
          maxWidth: 480,
          p: 6,
          textAlign: "center",
          borderStyle: "dashed",
          borderColor: dragging ? "primary.main" : "divider",
          bgcolor: dragging ? "action.hover" : "background.paper",
          cursor: "pointer",
          transition: "all 200ms ease",
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <UploadFileIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
        <Typography variant="h6" gutterBottom>
          Drop your AuctionArena workbook here
        </Typography>
        <Typography variant="body2" color="text.secondary">
          or click to browse — .xlsx files only
        </Typography>
        {parsing && <LinearProgress sx={{ mt: 2 }} />}
      </Paper>
      <Typography variant="caption" color="text.secondary">
       The Excel workbook must contain a worksheet named <strong>ImportData</strong>. All other sheets are ignored.
      </Typography>
    </Stack>
  );
};

// ─── Step 2: Preview Teams ────────────────────────────────────────────────────

const TeamsPreviewStep = ({ teams, teamConflict, onConflictChange }) => (
  <Stack spacing={3}>
    <FormControl size="small" sx={{ maxWidth: 280 }}>
      <InputLabel>If team already exists</InputLabel>
      <Select
        value={teamConflict}
        label="If team already exists"
        onChange={(e) => onConflictChange(e.target.value)}
      >
        <MenuItem value="merge">Merge (keep existing players)</MenuItem>
        <MenuItem value="skip">Skip (leave team untouched)</MenuItem>
        <MenuItem value="replace">Replace (clear existing players)</MenuItem>
      </Select>
    </FormControl>

    <Paper variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: "action.hover" }}>
            <TableCell><strong>#</strong></TableCell>
            <TableCell><strong>Team Name</strong></TableCell>
            <TableCell align="right"><strong>Players</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[...teams.entries()].map(([name, { playerCount }], i) => (
            <TableRow key={name}>
              <TableCell>{i + 1}</TableCell>
              <TableCell>{name}</TableCell>
              <TableCell align="right">{playerCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
    <Typography variant="caption" color="text.secondary">
      {teams.size} team{teams.size !== 1 ? "s" : ""} found in workbook.
    </Typography>
  </Stack>
);

// ─── Step 3: Preview Players ──────────────────────────────────────────────────

const PlayersPreviewStep = ({ players, warnings, playerConflict, onConflictChange }) => {
  const warnSet = new Set(warnings.map((w) => {
    const m = w.match(/Row (\d+)/);
    return m ? Number(m[1]) : -1;
  }));

  return (
    <Stack spacing={3}>
      <FormControl size="small" sx={{ maxWidth: 280 }}>
        <InputLabel>If Employee ID already exists</InputLabel>
        <Select
          value={playerConflict}
          label="If Employee ID already exists"
          onChange={(e) => onConflictChange(e.target.value)}
        >
          <MenuItem value="update">Update Existing</MenuItem>
          <MenuItem value="skip">Skip</MenuItem>
        </Select>
      </FormControl>

      {warnings.length > 0 && (
        <Alert severity="warning" icon={<WarningAmberIcon />}>
          {warnings.length} warning{warnings.length !== 1 ? "s" : ""}. Import can still proceed.
        </Alert>
      )}

      <Paper variant="outlined" sx={{ maxHeight: 400, overflow: "auto" }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: "action.hover" }}>
              <TableCell><strong>#</strong></TableCell>
              <TableCell><strong>Player Name</strong></TableCell>
              <TableCell><strong>Employee ID</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Team</strong></TableCell>
              <TableCell><strong>Warn</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {players.map((p, i) => (
              <TableRow key={p.employeeId + i} sx={{ bgcolor: warnSet.has(p.rowNum) ? "warning.lighter" : undefined }}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{p.playerName}</TableCell>
                <TableCell>{p.employeeId}</TableCell>
                <TableCell sx={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>{p.email || "—"}</TableCell>
                <TableCell>{p.teamName}</TableCell>
                <TableCell>{warnSet.has(p.rowNum) ? <WarningAmberIcon fontSize="small" color="warning" /> : null}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Typography variant="caption" color="text.secondary">
        {players.length} player{players.length !== 1 ? "s" : ""} ready to import.
      </Typography>
    </Stack>
  );
};

// ─── Step 4: Confirm ──────────────────────────────────────────────────────────

const ConfirmStep = ({ teams, players, warnings, teamConflict, playerConflict }) => (
  <Stack spacing={3}>
    <Stack direction="row" spacing={2} flexWrap="wrap">
      <Paper variant="outlined" sx={{ p: 2, minWidth: 140, textAlign: "center" }}>
        <GroupsIcon color="primary" />
        <Typography variant="h4" fontWeight={700}>{teams.size}</Typography>
        <Typography variant="caption" color="text.secondary">Teams</Typography>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, minWidth: 140, textAlign: "center" }}>
        <PersonIcon color="primary" />
        <Typography variant="h4" fontWeight={700}>{players.length}</Typography>
        <Typography variant="caption" color="text.secondary">Players</Typography>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, minWidth: 140, textAlign: "center" }}>
        <Typography variant="h4" fontWeight={700}>{players.length}</Typography>
        <Typography variant="caption" color="text.secondary">Assignments</Typography>
      </Paper>
    </Stack>

    <Divider />

    <Stack spacing={1}>
      <Typography variant="body2"><strong>Team conflict resolution:</strong> {teamConflict}</Typography>
      <Typography variant="body2"><strong>Player conflict resolution:</strong> {playerConflict}</Typography>
    </Stack>

    {warnings.length > 0 && (
      <Alert severity="warning">
        {warnings.length} warning{warnings.length !== 1 ? "s" : ""} will be carried into the import log.
      </Alert>
    )}

    <Alert severity="info">
      Clicking <strong>Run Import</strong> will write to Firestore. This action can be rolled back from Import History.
    </Alert>
  </Stack>
);

// ─── Step 5: Complete ─────────────────────────────────────────────────────────

const CompleteStep = ({ result, onViewTeams, onCreateMatch }) => (
  <Stack spacing={3} alignItems="center" textAlign="center">
    <CheckCircleOutlineIcon sx={{ fontSize: 64, color: "success.main" }} />
    <Typography variant="h5" fontWeight={700}>Import Complete</Typography>

    <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
      <Chip icon={<GroupsIcon />} label={`${result.teamsCreated} Teams Created`} color="primary" />
      <Chip icon={<PersonIcon />} label={`${result.playersCreated} Players Created`} color="primary" />
      <Chip label={`${result.assignmentsCreated} Assignments`} />
    </Stack>

    <Stack direction="row" spacing={2} justifyContent="center">
      <Button variant="outlined" onClick={onViewTeams}>View Teams</Button>
      <Button variant="contained" onClick={onCreateMatch}>Create Match</Button>
    </Stack>
  </Stack>
);

// ─── Main Wizard ──────────────────────────────────────────────────────────────

const ImportsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [parseResult, setParseResult] = useState(null); // { rows, fileName }
  const [validation, setValidation] = useState(null);   // { errors, warnings, teams, players }
  const [teamConflict, setTeamConflict] = useState("merge");
  const [playerConflict, setPlayerConflict] = useState("update");
  const [uploadError, setUploadError] = useState("");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState("");

  const handleParsed = ({ rows, fileName }) => {
    const v = validateImportRows(rows);
    setValidation(v);
    setParseResult({ rows, fileName });
    if (v.errors.length > 0) {
      setUploadError("");
      setActiveStep(1); // show errors on next step still — we navigate forward but show error block
    } else {
      setUploadError("");
      setActiveStep(1);
    }
  };

  const handleNext = () => setActiveStep((s) => s + 1);
  const handleBack = () => setActiveStep((s) => s - 1);

  const handleRunImport = async () => {
    setImporting(true);
    setImportError("");
    setProgress(0);
    try {
      const { importId, importBatchId } = await createImportRecord({
        fileName: parseResult.fileName,
        importedBy: user.uid,
      });
      const result = await executeImport({
        importId,
        importBatchId,
        teams: validation.teams,
        players: validation.players,
        createdBy: user.uid,
        teamConflict,
        playerConflict,
        onProgress: setProgress,
      });
      setImportResult(result);
      setActiveStep(4);
    } catch (err) {
      setImportError(err.message || "Import failed. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  const canProceedFromStep1 = validation && validation.errors.length === 0;

  return (
    <PageContainer title="AuctionArena Import" subtitle="Import teams and players from an AuctionArena workbook">
      <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
        {STEPS.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      <Box sx={{ maxWidth: 720, mx: "auto" }}>
        {/* Step 0: Upload */}
        {activeStep === 0 && (
          <Stack spacing={2}>
            <UploadStep onParsed={handleParsed} onError={setUploadError} />
            {uploadError && <Alert severity="error">{uploadError}</Alert>}
          </Stack>
        )}

        {/* Step 1: Preview Teams */}
        {activeStep === 1 && validation && (
          <Stack spacing={2}>
            {validation.errors.length > 0 && (
              <Alert severity="error">
                <strong>{validation.errors.length} error{validation.errors.length !== 1 ? "s" : ""} found. Fix the workbook and re-upload.</strong>
                <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                  {validation.errors.slice(0, 10).map((e, i) => <li key={i}>{e}</li>)}
                  {validation.errors.length > 10 && <li>…and {validation.errors.length - 10} more</li>}
                </Box>
              </Alert>
            )}
            {validation.errors.length === 0 && (
              <TeamsPreviewStep
                teams={validation.teams}
                teamConflict={teamConflict}
                onConflictChange={setTeamConflict}
              />
            )}
          </Stack>
        )}

        {/* Step 2: Preview Players */}
        {activeStep === 2 && validation && (
          <PlayersPreviewStep
            players={validation.players}
            warnings={validation.warnings}
            playerConflict={playerConflict}
            onConflictChange={setPlayerConflict}
          />
        )}

        {/* Step 3: Confirm */}
        {activeStep === 3 && validation && (
          <Stack spacing={2}>
            <ConfirmStep
              teams={validation.teams}
              players={validation.players}
              warnings={validation.warnings}
              teamConflict={teamConflict}
              playerConflict={playerConflict}
            />
            {importError && <Alert severity="error">{importError}</Alert>}
            {importing && (
              <Stack spacing={1}>
                <LinearProgress variant="determinate" value={progress} />
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  Importing… {progress}%
                </Typography>
              </Stack>
            )}
          </Stack>
        )}

        {/* Step 4: Complete */}
        {activeStep === 4 && importResult && (
          <CompleteStep
            result={importResult}
            onViewTeams={() => navigate("/teams")}
            onCreateMatch={() => navigate("/create-match")}
          />
        )}

        {/* Navigation */}
        {activeStep < 4 && (
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
            <Button
              disabled={activeStep === 0 || importing}
              onClick={activeStep === 1 && validation?.errors.length > 0 ? () => setActiveStep(0) : handleBack}
            >
              {activeStep === 1 && validation?.errors.length > 0 ? "Re-upload" : "Back"}
            </Button>

            {activeStep === 3 ? (
              <Button
                variant="contained"
                onClick={handleRunImport}
                disabled={importing}
              >
                Run Import
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={
                  (activeStep === 0 && !validation) ||
                  (activeStep === 1 && !canProceedFromStep1)
                }
              >
                Next
              </Button>
            )}
          </Stack>
        )}
      </Box>
    </PageContainer>
  );
};

export default ImportsPage;
