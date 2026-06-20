/* eslint-disable react/prop-types */

const COLUMN_MAP = {
  "team name": "teamName",
  "player name": "playerName",
  "employee id": "employeeId",
  email: "email",
  department: "department",
  "festival team": "festivalTeam",
  "base price": "basePrice",
  "sold price": "soldPrice",
  "credits used": "creditsUsed",
};

const normalizeHeader = (h) => String(h || "").trim().toLowerCase();

const normalizeRow = (headerMap, rawRow) => {
  const row = {};
  for (const [xlCol, field] of Object.entries(headerMap)) {
    const raw = rawRow[xlCol];
    row[field] = raw !== undefined && raw !== null ? String(raw).trim() : "";
  }
  return row;
};

/**
 * Parse an AuctionArena XLSX workbook buffer.
 * Reads only the "ImportData" sheet.
 * Returns { rows, sheetFound } where rows is an array of normalized objects.
 */
export const parseAuctionArenaWorkbook = async (fileBuffer) => {
  const XLSX = await import("xlsx");
  let workbook;
  try {
    workbook = XLSX.read(fileBuffer, { type: "array" });
  } catch {
    return { rows: [], sheetFound: false, parseError: true };
  }

  const sheetName = workbook.SheetNames.find((n) => n.trim() === "ImportData");
  if (!sheetName) {
    return { rows: [], sheetFound: false, parseError: false };
  }

  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  if (!rawRows.length) {
    return { rows: [], sheetFound: true, parseError: false };
  }

  // Build header → field map from first row keys
  const headerMap = {};
  for (const key of Object.keys(rawRows[0])) {
    const norm = normalizeHeader(key);
    if (COLUMN_MAP[norm]) {
      headerMap[key] = COLUMN_MAP[norm];
    }
  }

  const rows = rawRows.map((r) => normalizeRow(headerMap, r));
  return { rows, sheetFound: true, parseError: false };
};
