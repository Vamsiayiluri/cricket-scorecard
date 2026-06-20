/* eslint-disable react/prop-types */

/**
 * Validate parsed rows from the AuctionArena ImportData sheet.
 * Returns { errors, warnings, teams, players }
 *   errors   — blocks import
 *   warnings — may continue
 *   teams    — Map<teamName, { playerCount }>
 *   players  — deduplicated player list with teamName
 */
export const validateImportRows = (rows) => {
  const errors = [];
  const warnings = [];

  if (!rows || rows.length === 0) {
    errors.push("ImportData sheet contains no rows.");
    return { errors, warnings, teams: new Map(), players: [] };
  }

  const seenEmployeeIds = new Map(); // employeeId → first row index
  const seenPlayers = new Map(); // "name::team" → first row index
  const teams = new Map(); // teamName → { playerCount }
  const players = [];

  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // 1-indexed + header row

    const isEmpty =
      !row.teamName && !row.playerName && !row.employeeId && !row.email;
    if (isEmpty) {
      warnings.push(`Row ${rowNum}: Empty row skipped.`);
      return;
    }

    let rowValid = true;

    if (!row.teamName) {
      errors.push(`Row ${rowNum}: Missing Team Name.`);
      rowValid = false;
    }
    if (!row.playerName) {
      errors.push(`Row ${rowNum}: Missing Player Name.`);
      rowValid = false;
    }
    if (!row.employeeId) {
      errors.push(`Row ${rowNum}: Missing Employee ID.`);
      rowValid = false;
    }

    if (!rowValid) return;

    // Duplicate employee ID
    if (seenEmployeeIds.has(row.employeeId)) {
      errors.push(
        `Row ${rowNum}: Duplicate Employee ID "${row.employeeId}" (first seen at row ${seenEmployeeIds.get(row.employeeId)}).`
      );
      return;
    }
    seenEmployeeIds.set(row.employeeId, rowNum);

    // Duplicate player name + team
    const playerKey = `${row.playerName.toLowerCase()}::${row.teamName.toLowerCase()}`;
    if (seenPlayers.has(playerKey)) {
      warnings.push(
        `Row ${rowNum}: Duplicate player "${row.playerName}" in team "${row.teamName}" (first seen at row ${seenPlayers.get(playerKey)}).`
      );
    } else {
      seenPlayers.set(playerKey, rowNum);
    }

    // Accumulate teams
    if (!teams.has(row.teamName)) {
      teams.set(row.teamName, { playerCount: 0 });
    }
    teams.get(row.teamName).playerCount += 1;

    players.push({
      playerName: row.playerName,
      employeeId: row.employeeId,
      email: row.email || "",
      teamName: row.teamName,
      department: row.department || "",
      festivalTeam: row.festivalTeam || "",
      soldPrice: row.soldPrice || "",
      creditsUsed: row.creditsUsed || "",
      rowNum,
    });
  });

  return { errors, warnings, teams, players };
};
