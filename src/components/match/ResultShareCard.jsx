/* eslint-disable react/prop-types */
import { forwardRef } from "react";
import { getMatchOutcome, formatMatchDate } from "../../utils/matchDisplay";

const formatScore = (inning) => {
  if (!inning) return "—";
  const overs =
    typeof inning.overs === "number" ? inning.overs.toFixed(1) : "0.0";
  return `${inning.runs ?? 0}/${inning.wickets ?? 0} (${overs} ov)`;
};

const CARD_W = 400;

// ─── Sub-components (all inline styles for html2canvas reliability) ──────────

const Divider = ({ color = "rgba(255,255,255,0.08)" }) => (
  <div style={{ height: 1, background: color, margin: "0 20px" }} />
);

const TeamRow = ({ name, score, isWinner, isTie }) => {
  const accentColor = isTie ? "#94A3B8" : isWinner ? "#F59E0B" : "#CBD5E1";
  const scoreColor = isTie ? "#94A3B8" : isWinner ? "#FBBF24" : "#94A3B8";

  return (
    <div
      style={{
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: isWinner
          ? "rgba(245,158,11,0.07)"
          : "transparent",
        position: "relative",
      }}
    >
      {/* Winner indicator stripe */}
      {isWinner && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            background: "linear-gradient(180deg, #F59E0B, #FBBF24)",
          }}
        />
      )}

      <div style={{ flex: 1, minWidth: 0, paddingLeft: isWinner ? 8 : 0 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: accentColor,
            letterSpacing: "-0.3px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </div>
        {isWinner && !isTie && (
          <div
            style={{
              fontSize: 10,
              color: "#F59E0B",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              marginTop: 2,
            }}
          >
            WINNER
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: 20,
          fontWeight: 900,
          color: scoreColor,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.5px",
          flexShrink: 0,
          marginLeft: 12,
        }}
      >
        {score}
      </div>
    </div>
  );
};

// ─── Main card ────────────────────────────────────────────────────────────────

/**
 * Self-contained share card rendered with inline CSS for html2canvas capture.
 * Fixed width: 400px. Height is auto (content-driven, roughly 520-600px).
 */
const ResultShareCard = forwardRef(function ResultShareCard({ match }, ref) {
  const innings = match?.scoreCard?.innings || [];
  const inning1 = innings[0];
  const inning2 = innings[1];

  const team1Key = inning1?.team;
  const team2Key = inning2?.team;
  const team1Name =
    team1Key ? (match?.teams?.[team1Key]?.name || "Team A") : "Team A";
  const team2Name =
    team2Key ? (match?.teams?.[team2Key]?.name || "Team B") : "Team B";

  const score1 = formatScore(inning1);
  const score2 = formatScore(inning2);

  const outcome = getMatchOutcome(match);
  const isTie = outcome?.isTie;
  const winnerName = outcome?.winner;
  const isTeam1Winner = !isTie && winnerName === team1Name;
  const isTeam2Winner = !isTie && winnerName === team2Name;

  const resultLine = match?.resultSummary || outcome?.margin || "Match completed";
  const potm = match?.playerOfTheMatch;

  const rawDate = match?.matchDetails?.date;
  const dateStr = rawDate ? formatMatchDate(rawDate) : null;
  const venue = match?.matchDetails?.location;
  const title = match?.matchDetails?.title;

  return (
    <div
      ref={ref}
      style={{
        width: CARD_W,
        background: "linear-gradient(160deg, #0A0E1A 0%, #121828 55%, #1A0F3C 100%)",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        color: "#F8FAFC",
        borderRadius: 16,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          height: 4,
          background: "linear-gradient(90deg, #6C63FF 0%, #A78BFA 60%, #EC4899 100%)",
        }}
      />

      {/* Header: brand + label */}
      <div
        style={{
          padding: "16px 20px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              fontWeight: 900,
              color: "#fff",
            }}
          >
            C
          </div>
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 900,
                color: "#F8FAFC",
                letterSpacing: "-0.2px",
                lineHeight: 1,
              }}
            >
              CricVelo
            </div>
            <div
              style={{
                fontSize: 9,
                color: "#6C63FF",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                lineHeight: 1.4,
              }}
            >
              Cricket Scorecard
            </div>
          </div>
        </div>

        <div
          style={{
            background: "rgba(108,99,255,0.15)",
            border: "1px solid rgba(108,99,255,0.3)",
            borderRadius: 6,
            padding: "4px 10px",
            fontSize: 10,
            fontWeight: 800,
            color: "#A78BFA",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
          }}
        >
          Match Result
        </div>
      </div>

      <Divider />

      {/* Match title / venue / date */}
      <div style={{ padding: "10px 20px" }}>
        {title && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#94A3B8",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 2,
            }}
          >
            {title}
          </div>
        )}
        <div
          style={{
            fontSize: 11,
            color: "#475569",
            display: "flex",
            flexWrap: "wrap",
            gap: "4px 10px",
          }}
        >
          {venue && <span>📍 {venue}</span>}
          {dateStr && <span>🗓 {dateStr}</span>}
        </div>
      </div>

      <Divider />

      {/* Scores */}
      <div style={{ paddingTop: 4, paddingBottom: 4 }}>
        <TeamRow
          name={team1Name}
          score={score1}
          isWinner={isTeam1Winner}
          isTie={isTie}
        />
        <div
          style={{
            textAlign: "center",
            fontSize: 10,
            color: "#475569",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1px",
            padding: "2px 0",
          }}
        >
          vs
        </div>
        <TeamRow
          name={team2Name}
          score={score2}
          isWinner={isTeam2Winner}
          isTie={isTie}
        />
      </div>

      <Divider />

      {/* Result banner */}
      <div
        style={{
          margin: "12px 20px",
          padding: "12px 16px",
          borderRadius: 10,
          background: isTie
            ? "rgba(148,163,184,0.1)"
            : "linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(251,191,36,0.08) 100%)",
          border: isTie
            ? "1px solid rgba(148,163,184,0.2)"
            : "1px solid rgba(245,158,11,0.25)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 900,
            color: isTie ? "#94A3B8" : "#F59E0B",
            letterSpacing: "-0.3px",
            lineHeight: 1.2,
          }}
        >
          {isTie ? "Match Tied" : winnerName}
        </div>
        {!isTie && winnerName && (
          <div
            style={{
              fontSize: 12,
              color: "#CBD5E1",
              marginTop: 4,
              fontWeight: 600,
            }}
          >
            {resultLine}
          </div>
        )}
      </div>

      {/* Player of the Match */}
      {potm && (
        <>
          <Divider />
          <div
            style={{
              padding: "12px 20px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(251,191,36,0.12) 100%)",
                border: "1px solid rgba(245,158,11,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              🏆
            </div>
            <div>
              <div
                style={{
                  fontSize: 9,
                  color: "#D97706",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  marginBottom: 2,
                }}
              >
                Player of the Match
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#FBBF24",
                  letterSpacing: "-0.2px",
                }}
              >
                {potm}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div
        style={{
          marginTop: 8,
          padding: "10px 20px",
          background: "rgba(108,99,255,0.08)",
          borderTop: "1px solid rgba(108,99,255,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: "#6C63FF",
            fontWeight: 700,
            letterSpacing: "0.3px",
          }}
        >
          cricvelo.app
        </div>
        <div
          style={{
            fontSize: 10,
            color: "#334155",
            fontWeight: 500,
          }}
        >
          Score every moment.
        </div>
      </div>
    </div>
  );
});

export default ResultShareCard;
