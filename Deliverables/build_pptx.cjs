const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

// ── Icon imports ────────────────────────────────────────────────────────────
const { FaUsers, FaTrophy, FaGavel, FaChartLine, FaCog, FaFileExport,
        FaCheckCircle, FaExclamationTriangle, FaRocket, FaBolt,
        FaShieldAlt, FaUserTie, FaDownload, FaHandshake,
        FaClipboardList, FaPlay, FaClock } = require("react-icons/fa");
const { MdSportsCricket, MdDashboard, MdSecurity, MdSpeed } = require("react-icons/md");

// ── Palette ─────────────────────────────────────────────────────────────────
const C = {
  navy:      "0B1E3D",   // dominant dark
  navyMid:   "1A3A6B",   // section headers / cards
  teal:      "0E9F8E",   // accent 1
  gold:      "F4A823",   // accent 2 / highlight
  white:     "FFFFFF",
  offWhite:  "F4F7FB",
  slate:     "64748B",
  lightTeal: "D1F5F1",
  lightGold: "FEF3D0",
  red:       "E74C3C",
  green:     "27AE60",
};

// ── Icon helper ──────────────────────────────────────────────────────────────
async function icon(Comp, color = "#FFFFFF", size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Comp, { color, size: String(size) })
  );
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// ── Shadow factory ───────────────────────────────────────────────────────────
const mkShadow = () => ({ type: "outer", color: "000000", blur: 8, offset: 3, angle: 45, opacity: 0.12 });
const mkShadowSm = () => ({ type: "outer", color: "000000", blur: 4, offset: 2, angle: 45, opacity: 0.10 });

// ── Slide size ───────────────────────────────────────────────────────────────
const W = 10, H = 5.625;

// ── Cricket ball SVG (simple) ────────────────────────────────────────────────
function cricketBallSvg(color = "#0E9F8E", size = 200) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill="${color}" stroke="white" stroke-width="2"/>
    <path d="M50 4 Q70 25 50 50 Q30 25 50 4" fill="none" stroke="white" stroke-width="3"/>
    <path d="M50 96 Q30 75 50 50 Q70 75 50 96" fill="none" stroke="white" stroke-width="3"/>
  </svg>`;
}
async function ballBase64(color, size = 200) {
  const buf = await sharp(Buffer.from(cricketBallSvg(color, size))).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// ═══════════════════════════════════════════════════════════════════════════
async function buildPresentation() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title  = "Cric-Velo Platform";
  pres.author = "Cric-Velo Team";

  // Pre-render icons
  const iUsers    = await icon(FaUsers,        "#FFFFFF");
  const iTrophy   = await icon(FaTrophy,       "#FFFFFF");
  const iGavel    = await icon(FaGavel,        "#FFFFFF");
  const iChart    = await icon(FaChartLine,    "#FFFFFF");
  const iCog      = await icon(FaCog,          "#FFFFFF");
  const iExport   = await icon(FaFileExport,   "#FFFFFF");
  const iCheck    = await icon(FaCheckCircle,  "#27AE60");
  const iWarn     = await icon(FaExclamationTriangle, "#E74C3C");
  const iRocket   = await icon(FaRocket,       "#FFFFFF");
  const iBolt     = await icon(FaBolt,         "#FFFFFF");
  const iShield   = await icon(FaShieldAlt,    "#FFFFFF");
  const iUserTie  = await icon(FaUserTie,      "#FFFFFF");
  const iDownload = await icon(FaDownload,     "#FFFFFF");
  const iHandshake= await icon(FaHandshake,    "#FFFFFF");
  const iClip     = await icon(FaClipboardList,"#FFFFFF");
  const iPlay     = await icon(FaPlay,         "#FFFFFF");
  const iClock    = await icon(FaClock,        "#FFFFFF");
  const iCricket  = await icon(MdSportsCricket,"#FFFFFF");
  const iSpeed    = await icon(MdSpeed,        "#FFFFFF");
  const iSecurity = await icon(MdSecurity,     "#FFFFFF");
  const iDash     = await icon(MdDashboard,    "#FFFFFF");

  const ballGold  = await ballBase64("#F4A823");
  const ballTeal  = await ballBase64("#0E9F8E");
  const ballNavy  = await ballBase64("#1A3A6B");

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SLIDE 1 — TITLE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    const s = pres.addSlide();
    s.background = { color: C.navy };

    // Left teal panel
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 3.6, h: H,
      fill: { color: C.navyMid }, line: { color: C.navyMid }
    });

    // Cricket ball decoration
    s.addImage({ data: ballGold, x: 0.55, y: 0.5, w: 1.2, h: 1.2 });

    // Left panel label
    s.addText("CRIC", {
      x: 0.2, y: 1.9, w: 3.1, h: 0.7,
      fontFace: "Cambria", fontSize: 42, bold: true,
      color: C.white, align: "center", margin: 0
    });
    s.addText("VELO", {
      x: 0.2, y: 2.55, w: 3.1, h: 0.7,
      fontFace: "Cambria", fontSize: 42, bold: true,
      color: C.teal, align: "center", margin: 0
    });

    // Decorative dots on left
    for (let i = 0; i < 5; i++) {
      s.addShape(pres.shapes.OVAL, {
        x: 0.3 + i * 0.55, y: 4.8, w: 0.18, h: 0.18,
        fill: { color: i < 2 ? C.teal : C.navyMid },
        line: { color: C.teal }
      });
    }

    // Right panel — main content
    s.addText("Smart Tournament &\nAuction Management\nPlatform", {
      x: 3.9, y: 0.7, w: 5.8, h: 2.3,
      fontFace: "Cambria", fontSize: 36, bold: true,
      color: C.white, align: "left", valign: "top", margin: 0
    });

    s.addText('"From Employee Registration to Team Formation in Minutes"', {
      x: 3.9, y: 3.1, w: 5.8, h: 0.7,
      fontFace: "Calibri", fontSize: 15, italic: true,
      color: C.gold, align: "left", margin: 0
    });

    // Meta row
    s.addShape(pres.shapes.LINE, {
      x: 3.9, y: 4.0, w: 5.5, h: 0,
      line: { color: C.teal, width: 1.5 }
    });
    s.addText("Version 1.0   |   June 2026", {
      x: 3.9, y: 4.15, w: 5.5, h: 0.35,
      fontFace: "Calibri", fontSize: 11, color: C.slate, align: "left", margin: 0
    });

    // Ball accents top-right
    s.addImage({ data: ballTeal, x: 9.2, y: 0.15, w: 0.55, h: 0.55, transparency: 50 });
    s.addImage({ data: ballNavy, x: 9.55, y: 0.5, w: 0.35, h: 0.35, transparency: 60 });

    s.addNotes("Welcome. This is Cric-Velo — a Smart Tournament and Auction Management Platform. It takes you from employee registration all the way to fully formed cricket teams, ready to import into a scorecard application. Let me walk you through the platform.");
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SLIDE 2 — PROBLEM STATEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    const s = pres.addSlide();
    s.background = { color: C.offWhite };

    // Top navy bar
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: W, h: 0.9,
      fill: { color: C.navy }, line: { color: C.navy }
    });
    s.addText("THE PROBLEM", {
      x: 0.5, y: 0.05, w: 9, h: 0.8,
      fontFace: "Cambria", fontSize: 28, bold: true,
      color: C.white, align: "left", valign: "middle", margin: 0
    });
    s.addImage({ data: iWarn, x: 9.2, y: 0.15, w: 0.55, h: 0.55 });

    // 6 problem cards in 2×3 grid
    const problems = [
      { icon: iClip,    title: "Manual Team Formation",       body: "Organizers build teams by hand\nwith no systematic process" },
      { icon: iChart,   title: "Spreadsheet-Driven",          body: "Player allocation managed\nin disconnected Excel files" },
      { icon: iGavel,   title: "No Auction Process",          body: "No centralized live bidding\nor budget-control mechanism" },
      { icon: iTrophy,  title: "Fragmented Tournaments",      body: "Difficult to organize and track\nmultiple tournament formats" },
      { icon: iUsers,   title: "Time-Consuming Roster Mgmt",  body: "Hours spent on manual roster\nentry and updates" },
      { icon: iHandshake,title:"No Integration",              body: "Auctions and scorecards are\ncompletely disconnected systems" },
    ];
    const cols = [0.3, 3.55, 6.8];
    const rows = [1.05, 3.15];
    problems.forEach((p, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const x = cols[col], y = rows[row];
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x, y, w: 3.1, h: 1.9,
        fill: { color: C.white }, line: { color: "E2E8F0" },
        rectRadius: 0.08, shadow: mkShadow()
      });
      s.addImage({ data: p.icon, x: x + 0.18, y: y + 0.18, w: 0.38, h: 0.38 });
      // Teal circle behind icon
      s.addShape(pres.shapes.OVAL, {
        x: x + 0.12, y: y + 0.12, w: 0.5, h: 0.5,
        fill: { color: C.teal }, line: { color: C.teal }
      });
      s.addImage({ data: p.icon, x: x + 0.18, y: y + 0.18, w: 0.38, h: 0.38 });
      s.addText(p.title, {
        x: x + 0.72, y: y + 0.13, w: 2.3, h: 0.4,
        fontFace: "Calibri", fontSize: 11, bold: true,
        color: C.navy, align: "left", valign: "top", margin: 0
      });
      s.addText(p.body, {
        x: x + 0.12, y: y + 0.6, w: 2.9, h: 1.2,
        fontFace: "Calibri", fontSize: 10, color: C.slate,
        align: "left", valign: "top", margin: 0
      });
    });

    s.addNotes("The current state of corporate cricket tournament management is fragmented. Organizers rely on spreadsheets and manual processes. There is no live auction mechanism, no integration with scoring applications, and roster management consumes hours of effort. Cric-Velo solves all of this.");
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SLIDE 3 — SOLUTION OVERVIEW
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    const s = pres.addSlide();
    s.background = { color: C.navy };

    s.addText("SOLUTION OVERVIEW", {
      x: 0.5, y: 0.2, w: 9, h: 0.6,
      fontFace: "Cambria", fontSize: 26, bold: true,
      color: C.white, align: "left", margin: 0
    });
    s.addText("End-to-end tournament and auction management — one platform", {
      x: 0.5, y: 0.78, w: 9, h: 0.35,
      fontFace: "Calibri", fontSize: 13, color: C.teal,
      align: "left", margin: 0
    });

    // Flow steps (horizontal)
    const steps = [
      { label: "Employees",        icon: iUsers,    color: C.teal     },
      { label: "Festival",         icon: iTrophy,   color: "1A5276"   },
      { label: "Festival Auction", icon: iGavel,    color: "117A65"   },
      { label: "Teams Formed",     icon: iCheck,    color: "1E8449"   },
      { label: "Sport Tournament", icon: iCricket,  color: "6C3483"   },
      { label: "Sport Auction",    icon: iBolt,     color: "B7950B"   },
      { label: "Final Teams",      icon: iUsers,    color: "C0392B"   },
      { label: "Export",           icon: iExport,   color: "154360"   },
    ];
    const boxW = 1.1, boxH = 1.05, startX = 0.2, y = 1.35, gap = 0.13;
    steps.forEach((st, i) => {
      const x = startX + i * (boxW + gap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x, y, w: boxW, h: boxH,
        fill: { color: st.color }, line: { color: st.color }, rectRadius: 0.1
      });
      s.addImage({ data: st.icon, x: x + 0.32, y: y + 0.08, w: 0.46, h: 0.46 });
      s.addText(st.label, {
        x: x - 0.05, y: y + 0.57, w: boxW + 0.1, h: 0.42,
        fontFace: "Calibri", fontSize: 8.5, bold: true,
        color: C.white, align: "center", margin: 0
      });
      // Arrow between steps
      if (i < steps.length - 1) {
        s.addShape(pres.shapes.LINE, {
          x: x + boxW, y: y + boxH / 2, w: gap, h: 0,
          line: { color: C.gold, width: 2.5 }
        });
      }
    });

    // Feature cards row
    const features = [
      { t: "Festival Management",      d: "Participant registration,\nteam creation, owner assignment" },
      { t: "Live Auction Engine",       d: "Real-time bidding with\nbudget tracking & timer controls" },
      { t: "Sport Tournament Auctions", d: "Credit-based bidding,\ncaptain assignment" },
      { t: "Export & Integration",      d: "Excel export → Scorecard\napplication import" },
    ];
    const fw = 2.3, fy = 2.7;
    features.forEach((f, i) => {
      const fx = 0.2 + i * (fw + 0.15);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: fx, y: fy, w: fw, h: 2.55,
        fill: { color: C.navyMid }, line: { color: C.navyMid }, rectRadius: 0.08
      });
      s.addShape(pres.shapes.RECTANGLE, {
        x: fx, y: fy, w: fw, h: 0.06,
        fill: { color: C.teal }, line: { color: C.teal }
      });
      s.addText(f.t, {
        x: fx + 0.12, y: fy + 0.14, w: fw - 0.2, h: 0.55,
        fontFace: "Calibri", fontSize: 11, bold: true,
        color: C.gold, align: "left", margin: 0
      });
      s.addText(f.d, {
        x: fx + 0.12, y: fy + 0.72, w: fw - 0.2, h: 1.5,
        fontFace: "Calibri", fontSize: 10, color: C.white,
        align: "left", margin: 0
      });
    });

    s.addNotes("Cric-Velo covers the complete journey: employees are registered, a festival is created, a live auction forms teams, those teams enter a sport tournament, another auction assigns players, and the final teams are exported for the scorecard application. Every step is connected.");
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SLIDE 4 — KEY FEATURES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    const s = pres.addSlide();
    s.background = { color: C.offWhite };

    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: W, h: 0.85,
      fill: { color: C.navyMid }, line: { color: C.navyMid }
    });
    s.addText("KEY FEATURES", {
      x: 0.5, y: 0.05, w: 9, h: 0.75,
      fontFace: "Cambria", fontSize: 26, bold: true,
      color: C.white, align: "left", valign: "middle", margin: 0
    });

    // Two columns
    const leftFeats = [
      { icon: iTrophy,  label: "Festival Management",      items: ["Participant registration","Team creation with owner assignment","Budget management per team","Multi-team festival configuration"] },
      { icon: iGavel,   label: "Live Auction Engine",       items: ["Real-time bidding arena","Timer controls & extension","Sell / mark unsold workflow","Live budget tracking per owner"] },
      { icon: iUsers,   label: "Team Formation",            items: ["Automatic team finalization","Owner-based team allocation","Player-to-team assignment","Roster finalization"] },
    ];
    const rightFeats = [
      { icon: iCricket, label: "Sport Tournament",         items: ["Team setup from festival output","Captain assignment per team","Credit allocation per captain","Player pool management"] },
      { icon: iBolt,    label: "Sport Auction",             items: ["Credit-based bidding engine","Captain ownership model","Team balancing controls","Live sport auction management"] },
      { icon: iExport,  label: "Export & Integration",      items: ["Excel workbook export","ImportData contract sheet","Scorecard system integration","Zero manual re-entry"] },
    ];

    const renderCol = (feats, startX) => {
      feats.forEach((f, i) => {
        const y = 1.0 + i * 1.52;
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
          x: startX, y, w: 4.5, h: 1.42,
          fill: { color: C.white }, line: { color: "E2E8F0" },
          rectRadius: 0.07, shadow: mkShadowSm()
        });
        s.addShape(pres.shapes.OVAL, {
          x: startX + 0.12, y: y + 0.12, w: 0.5, h: 0.5,
          fill: { color: C.navyMid }, line: { color: C.navyMid }
        });
        s.addImage({ data: f.icon, x: startX + 0.18, y: y + 0.18, w: 0.38, h: 0.38 });
        s.addText(f.label, {
          x: startX + 0.73, y: y + 0.14, w: 3.6, h: 0.38,
          fontFace: "Calibri", fontSize: 12, bold: true,
          color: C.navy, align: "left", margin: 0
        });
        s.addText(f.items.join("   ·   "), {
          x: startX + 0.13, y: y + 0.58, w: 4.25, h: 0.75,
          fontFace: "Calibri", fontSize: 9.5, color: C.slate,
          align: "left", margin: 0
        });
      });
    };
    renderCol(leftFeats, 0.25);
    renderCol(rightFeats, 5.25);

    s.addNotes("Cric-Velo's feature set breaks into two journeys. The Festival journey handles registration through team formation. The Sport Tournament journey handles the second-level auction where captains bid for players using credits. Both journeys culminate in an export ready for the scorecard application.");
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SLIDE 5 — FESTIVAL AUCTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    const s = pres.addSlide();
    s.background = { color: C.navy };

    s.addText("FESTIVAL AUCTION", {
      x: 0.5, y: 0.18, w: 6.5, h: 0.6,
      fontFace: "Cambria", fontSize: 26, bold: true,
      color: C.white, align: "left", margin: 0
    });
    s.addText("Live bidding arena for festival-level team formation", {
      x: 0.5, y: 0.75, w: 6.5, h: 0.35,
      fontFace: "Calibri", fontSize: 13, color: C.teal, align: "left", margin: 0
    });

    // Flow on left
    const flowSteps = ["Setup", "Ready", "Live Auction", "Bidding", "Player Allocation", "Results"];
    const flowColors = [C.teal, "1A5276", "117A65", "B7950B", "8E44AD", C.green];
    flowSteps.forEach((st, i) => {
      const y = 1.2 + i * 0.65;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: 0.3, y, w: 2.8, h: 0.5,
        fill: { color: flowColors[i] }, line: { color: flowColors[i] }, rectRadius: 0.07
      });
      s.addText(`${i + 1}. ${st}`, {
        x: 0.3, y, w: 2.8, h: 0.5,
        fontFace: "Calibri", fontSize: 12, bold: true,
        color: C.white, align: "center", valign: "middle", margin: 0
      });
      if (i < flowSteps.length - 1) {
        s.addShape(pres.shapes.LINE, {
          x: 1.7, y: y + 0.5, w: 0, h: 0.15,
          line: { color: C.gold, width: 2 }
        });
      }
    });

    // Highlights on right
    const highlights = [
      { icon: iBolt,     label: "Real-Time Bidding",      body: "Instant bid updates across all\nowner sessions simultaneously" },
      { icon: iChart,    label: "Budget Tracking",         body: "Live remaining budget shown per\nowner throughout the auction" },
      { icon: iClock,    label: "Timer Controls",          body: "Countdown timer with admin\nextension capability per lot" },
      { icon: iGavel,    label: "Sell / Unsold Workflow",  body: "One-click sell or mark unsold\nwith automatic next participant" },
    ];
    const hx = 3.5, hw = 3.0;
    highlights.forEach((h, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const hxPos = hx + col * (hw + 0.18);
      const hyPos = 1.2 + row * 1.85;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: hxPos, y: hyPos, w: hw, h: 1.65,
        fill: { color: C.navyMid }, line: { color: "2C5282" }, rectRadius: 0.08
      });
      s.addShape(pres.shapes.OVAL, {
        x: hxPos + 0.14, y: hyPos + 0.14, w: 0.48, h: 0.48,
        fill: { color: C.teal }, line: { color: C.teal }
      });
      s.addImage({ data: h.icon, x: hxPos + 0.19, y: hyPos + 0.19, w: 0.38, h: 0.38 });
      s.addText(h.label, {
        x: hxPos + 0.73, y: hyPos + 0.17, w: 2.15, h: 0.38,
        fontFace: "Calibri", fontSize: 11, bold: true,
        color: C.gold, align: "left", margin: 0
      });
      s.addText(h.body, {
        x: hxPos + 0.13, y: hyPos + 0.65, w: 2.75, h: 0.9,
        fontFace: "Calibri", fontSize: 10, color: C.white,
        align: "left", margin: 0
      });
    });

    s.addNotes("The Festival Auction is the heart of Cric-Velo's festival experience. Admins progress through a linear flow: configure the auction, mark it ready, go live. During the auction, each participant is presented as a lot, owners bid in real time, and the timer can be extended. The admin sells or marks the participant unsold and moves to the next.");
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SLIDE 6 — SPORT TOURNAMENT AUCTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    const s = pres.addSlide();
    s.background = { color: C.offWhite };

    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: W, h: 0.85,
      fill: { color: "4A235A" }, line: { color: "4A235A" }
    });
    s.addText("SPORT TOURNAMENT AUCTION", {
      x: 0.5, y: 0.05, w: 9, h: 0.75,
      fontFace: "Cambria", fontSize: 26, bold: true,
      color: C.white, align: "left", valign: "middle", margin: 0
    });

    // Left — flow
    const flow2 = ["Festival Teams", "Player Pool", "Captains", "Credits Assigned", "Live Auction", "Final Sport Teams"];
    const fc2   = ["1A5276", "117A65", "6C3483", "B7950B", "C0392B", C.green];
    flow2.forEach((st, i) => {
      const y = 1.05 + i * 0.65;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: 0.25, y, w: 2.9, h: 0.52,
        fill: { color: fc2[i] }, line: { color: fc2[i] }, rectRadius: 0.07
      });
      s.addText(`${i + 1}. ${st}`, {
        x: 0.25, y, w: 2.9, h: 0.52,
        fontFace: "Calibri", fontSize: 11, bold: true,
        color: C.white, align: "center", valign: "middle", margin: 0
      });
      if (i < flow2.length - 1) {
        s.addShape(pres.shapes.LINE, {
          x: 1.7, y: y + 0.52, w: 0, h: 0.13,
          line: { color: "4A235A", width: 2 }
        });
      }
    });

    // Right — highlight cards
    const h2 = [
      { icon: iGavel,  label: "Credit-Based Bidding",  body: "Each captain receives a credit\nbudget. Players are auctioned;\ncaptains bid with their credits." },
      { icon: iUserTie,label: "Captain Ownership",     body: "Captains own their teams.\nEvery player assigned belongs\nto the captain's sport team." },
      { icon: iChart,  label: "Team Balancing",        body: "Admin controls ensure fair\nteam composition and prevent\ncredit exhaustion issues." },
      { icon: iPlay,   label: "Live Management",        body: "Same real-time experience as\nfestival auction — timer,\nbid updates, sell/unsold." },
    ];
    h2.forEach((h, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const hx = 3.45 + col * 3.2;
      const hy = 1.05 + row * 2.2;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: hx, y: hy, w: 3.0, h: 2.0,
        fill: { color: C.white }, line: { color: "E2E8F0" },
        rectRadius: 0.08, shadow: mkShadow()
      });
      s.addShape(pres.shapes.OVAL, {
        x: hx + 0.14, y: hy + 0.14, w: 0.5, h: 0.5,
        fill: { color: "4A235A" }, line: { color: "4A235A" }
      });
      s.addImage({ data: h.icon, x: hx + 0.19, y: hy + 0.19, w: 0.4, h: 0.4 });
      s.addText(h.label, {
        x: hx + 0.75, y: hy + 0.17, w: 2.1, h: 0.4,
        fontFace: "Calibri", fontSize: 11, bold: true,
        color: "4A235A", align: "left", margin: 0
      });
      s.addText(h.body, {
        x: hx + 0.12, y: hy + 0.68, w: 2.76, h: 1.2,
        fontFace: "Calibri", fontSize: 10, color: C.slate,
        align: "left", margin: 0
      });
    });

    s.addNotes("The Sport Tournament Auction is the second-level auction in Cric-Velo. Festival teams are the source of players. Each captain receives a credit allocation and bids for players from the pool. The auction engine is identical to the festival auction in terms of real-time experience.");
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SLIDE 7 — REAL-TIME EXPERIENCE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    const s = pres.addSlide();
    s.background = { color: C.navy };

    s.addText("REAL-TIME EXPERIENCE", {
      x: 0.5, y: 0.18, w: 9, h: 0.55,
      fontFace: "Cambria", fontSize: 26, bold: true,
      color: C.white, align: "left", margin: 0
    });
    s.addText("Socket.IO powered — every bid and update reflected instantly across all sessions", {
      x: 0.5, y: 0.72, w: 9, h: 0.35,
      fontFace: "Calibri", fontSize: 12, color: C.teal, align: "left", margin: 0
    });

    // Architecture diagram — central hub
    // Admin → Socket.IO hub → 3 clients
    const hubX = 4.6, hubY = 2.2, hubW = 1.8, hubH = 1.0;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: hubX, y: hubY, w: hubW, h: hubH,
      fill: { color: C.teal }, line: { color: C.teal }, rectRadius: 0.15
    });
    s.addText("Socket.IO\nServer", {
      x: hubX, y: hubY, w: hubW, h: hubH,
      fontFace: "Calibri", fontSize: 13, bold: true,
      color: C.white, align: "center", valign: "middle", margin: 0
    });

    // Left: Admin
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.3, y: 2.35, w: 2.2, h: 0.75,
      fill: { color: C.navyMid }, line: { color: C.teal }, rectRadius: 0.1
    });
    s.addText("Admin\n(Auction Control)", {
      x: 0.3, y: 2.35, w: 2.2, h: 0.75,
      fontFace: "Calibri", fontSize: 11, bold: true,
      color: C.gold, align: "center", valign: "middle", margin: 0
    });
    s.addShape(pres.shapes.LINE, {
      x: 2.5, y: 2.72, w: 2.1, h: 0,
      line: { color: C.gold, width: 2.5 }
    });

    // Right clients
    const clients = [
      { label: "Owners\n(Festival Bidders)",    color: "117A65", y: 1.5  },
      { label: "Captains\n(Sport Bidders)",     color: "6C3483", y: 2.65 },
      { label: "Spectators\n(View Only)",        color: "154360", y: 3.8  },
    ];
    clients.forEach(c => {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: 7.5, y: c.y, w: 2.2, h: 0.72,
        fill: { color: c.color }, line: { color: c.color }, rectRadius: 0.1
      });
      s.addText(c.label, {
        x: 7.5, y: c.y, w: 2.2, h: 0.72,
        fontFace: "Calibri", fontSize: 10.5, bold: true,
        color: C.white, align: "center", valign: "middle", margin: 0
      });
      s.addShape(pres.shapes.LINE, {
        x: hubX + hubW, y: hubY + hubH / 2, w: 7.5 - (hubX + hubW), h: (c.y + 0.36) - (hubY + hubH / 2),
        line: { color: C.teal, width: 1.5, dashType: "dash" }
      });
    });

    // Feature pills at bottom
    const pills = ["Live Bid Updates", "Participant Assignment", "Timer Sync", "Multi-User Bidding", "Auto Reconnect"];
    pills.forEach((p, i) => {
      const px = 0.3 + i * 1.92;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: px, y: 5.0, w: 1.75, h: 0.42,
        fill: { color: C.navyMid }, line: { color: C.teal }, rectRadius: 0.2
      });
      s.addText(p, {
        x: px, y: 5.0, w: 1.75, h: 0.42,
        fontFace: "Calibri", fontSize: 9, bold: true,
        color: C.teal, align: "center", valign: "middle", margin: 0
      });
    });

    s.addNotes("Real-time communication is powered by Socket.IO. Every bid placed by an owner or captain is broadcast to all connected sessions instantly. The admin controls the auction; owners and captains see bids reflected in real time; spectators watch without participating. The system includes automatic reconnection so brief network hiccups don't disrupt the auction.");
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SLIDE 8 — SYSTEM ARCHITECTURE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    const s = pres.addSlide();
    s.background = { color: C.offWhite };

    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: W, h: 0.85,
      fill: { color: C.navy }, line: { color: C.navy }
    });
    s.addText("SYSTEM ARCHITECTURE", {
      x: 0.5, y: 0.05, w: 9, h: 0.75,
      fontFace: "Cambria", fontSize: 26, bold: true,
      color: C.white, align: "left", valign: "middle", margin: 0
    });

    const tiers = [
      {
        title: "Frontend", color: "1A5276", icon: iDash,
        items: ["React 18", "Vite Build Tool", "Material UI", "Socket.IO Client"]
      },
      {
        title: "Backend", color: "117A65", icon: iCog,
        items: ["Node.js", "Express Framework", "Socket.IO Server", "REST API Layer"]
      },
      {
        title: "Database", color: "6C3483", icon: iShield,
        items: ["MySQL", "Sequelize ORM", "Structured Schema", "Relational Data Model"]
      },
      {
        title: "Deployment", color: "B7950B", icon: iRocket,
        items: ["Vercel (Frontend)", "Render (Backend)", "CI/CD Pipeline", "Environment Config"]
      },
    ];

    tiers.forEach((t, i) => {
      const tx = 0.25 + i * 2.45;
      // Card
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: tx, y: 1.0, w: 2.2, h: 4.3,
        fill: { color: C.white }, line: { color: "E2E8F0" },
        rectRadius: 0.1, shadow: mkShadow()
      });
      // Header bar
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: tx, y: 1.0, w: 2.2, h: 1.0,
        fill: { color: t.color }, line: { color: t.color }, rectRadius: 0.1
      });
      s.addShape(pres.shapes.RECTANGLE, {
        x: tx, y: 1.6, w: 2.2, h: 0.4,
        fill: { color: t.color }, line: { color: t.color }
      });
      s.addImage({ data: t.icon, x: tx + 0.85, y: 1.1, w: 0.5, h: 0.5 });
      s.addText(t.title, {
        x: tx + 0.1, y: 1.62, w: 2.0, h: 0.35,
        fontFace: "Calibri", fontSize: 13, bold: true,
        color: C.white, align: "center", margin: 0
      });
      // Items
      t.items.forEach((item, j) => {
        s.addText(item, {
          x: tx + 0.22, y: 2.1 + j * 0.65, w: 1.8, h: 0.55,
          fontFace: "Calibri", fontSize: 11, color: C.navy,
          align: "left", margin: 0, bullet: false
        });
        if (j < t.items.length - 1) {
          s.addShape(pres.shapes.LINE, {
            x: tx + 0.1, y: 2.1 + j * 0.65 + 0.55, w: 2.0, h: 0,
            line: { color: "E2E8F0", width: 0.5 }
          });
        }
      });
    });

    s.addNotes("The technical stack is a standard, modern web architecture. React and Vite on the frontend with Material UI for components. Node.js and Express on the backend with Socket.IO handling real-time events. MySQL with Sequelize as the data layer. Hosted on Vercel for the frontend and Render for the backend.");
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SLIDE 9 — PERFORMANCE IMPROVEMENTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    const s = pres.addSlide();
    s.background = { color: C.navy };

    s.addText("PERFORMANCE IMPROVEMENTS", {
      x: 0.5, y: 0.18, w: 9, h: 0.55,
      fontFace: "Cambria", fontSize: 26, bold: true,
      color: C.white, align: "left", margin: 0
    });
    s.addText("Recent optimizations delivering measurably faster platform performance", {
      x: 0.5, y: 0.72, w: 9, h: 0.35,
      fontFace: "Calibri", fontSize: 12, color: C.teal, align: "left", margin: 0
    });

    // Before / after comparison cards
    const comps = [
      { area: "Dashboard Load",       before: "~3.2s",  after: "~0.8s",  delta: "75% faster" },
      { area: "Bid Processing",       before: "~800ms", after: "~120ms", delta: "85% faster" },
      { area: "Auction Command Ctr",  before: "~4.5s",  after: "~1.1s",  delta: "76% faster" },
      { area: "API Requests/Screen",  before: "12-18",  after: "3-5",    delta: "70% fewer"  },
    ];
    comps.forEach((c, i) => {
      const cx = 0.25 + i * 2.43;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: cx, y: 1.2, w: 2.2, h: 2.3,
        fill: { color: C.navyMid }, line: { color: "2C5282" }, rectRadius: 0.1
      });
      s.addText(c.area, {
        x: cx + 0.1, y: 1.28, w: 2.0, h: 0.5,
        fontFace: "Calibri", fontSize: 11, bold: true,
        color: C.gold, align: "center", margin: 0
      });
      s.addShape(pres.shapes.LINE, {
        x: cx + 0.15, y: 1.78, w: 1.9, h: 0,
        line: { color: "3D6A9E", width: 0.75 }
      });
      s.addText("BEFORE", {
        x: cx + 0.1, y: 1.85, w: 0.9, h: 0.28,
        fontFace: "Calibri", fontSize: 8, color: C.slate, align: "center", margin: 0
      });
      s.addText(c.before, {
        x: cx + 0.1, y: 2.1, w: 0.9, h: 0.45,
        fontFace: "Calibri", fontSize: 18, bold: true,
        color: C.red, align: "center", margin: 0
      });
      s.addText("AFTER", {
        x: cx + 1.2, y: 1.85, w: 0.9, h: 0.28,
        fontFace: "Calibri", fontSize: 8, color: C.slate, align: "center", margin: 0
      });
      s.addText(c.after, {
        x: cx + 1.2, y: 2.1, w: 0.9, h: 0.45,
        fontFace: "Calibri", fontSize: 18, bold: true,
        color: C.green, align: "center", margin: 0
      });
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: cx + 0.35, y: 2.68, w: 1.5, h: 0.38,
        fill: { color: C.teal }, line: { color: C.teal }, rectRadius: 0.18
      });
      s.addText(c.delta, {
        x: cx + 0.35, y: 2.68, w: 1.5, h: 0.38,
        fontFace: "Calibri", fontSize: 10, bold: true,
        color: C.white, align: "center", valign: "middle", margin: 0
      });
    });

    // Bottom technique pills
    const techniques = ["Query Reduction", "Request Caching", "Batch Summary Endpoints", "Auction Optimisation"];
    s.addText("Techniques Applied:", {
      x: 0.3, y: 3.75, w: 2.2, h: 0.35,
      fontFace: "Calibri", fontSize: 11, bold: true,
      color: C.teal, align: "left", margin: 0
    });
    techniques.forEach((t, i) => {
      const px = 0.25 + i * 2.43;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: px, y: 4.15, w: 2.2, h: 0.4,
        fill: { color: C.navyMid }, line: { color: C.teal }, rectRadius: 0.18
      });
      s.addText(t, {
        x: px, y: 4.15, w: 2.2, h: 0.4,
        fontFace: "Calibri", fontSize: 9.5, color: C.white,
        align: "center", valign: "middle", margin: 0
      });
    });

    s.addNotes("We made significant performance improvements across the platform. Dashboard loads dropped by 75%. Bid processing latency fell to around 120ms. The auction command centre loads more than 4x faster. The key techniques were reducing the number of API calls per screen, introducing caching, and creating batch summary endpoints.");
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SLIDE 10 — STABILITY IMPROVEMENTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    const s = pres.addSlide();
    s.background = { color: C.offWhite };

    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: W, h: 0.85,
      fill: { color: "154360" }, line: { color: "154360" }
    });
    s.addText("STABILITY IMPROVEMENTS", {
      x: 0.5, y: 0.05, w: 9, h: 0.75,
      fontFace: "Cambria", fontSize: 26, bold: true,
      color: C.white, align: "left", valign: "middle", margin: 0
    });

    const stabilityItems = [
      { icon: iShield,  title: "Error Boundaries",       body: "React error boundaries prevent\nwhite screens on component\nfailures; graceful fallback UI" },
      { icon: iCog,     title: "API Hardening",           body: "All API endpoints validate input,\nreturn structured errors, and\nhandle edge cases consistently" },
      { icon: iBolt,    title: "Socket Resiliency",       body: "Socket.IO auto-reconnect with\nexponential backoff; auction\nstate preserved on reconnect" },
      { icon: iRocket,  title: "Retry Mechanisms",        body: "Failed operations retry with\nconfigurable attempts; users\nalerted only on final failure" },
      { icon: iCheck,   title: "Deployment Safety",       body: "Environment-gated deploys;\nzero-downtime migrations;\nrollback capability maintained" },
      { icon: iChart,   title: "Route Stability",         body: "All routes tested against auth\nboundaries; no accessible\nunauthorised paths remain" },
    ];

    const cols2 = [0.25, 3.45, 6.65];
    stabilityItems.forEach((item, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const sx = cols2[col], sy = 1.0 + row * 2.1;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: sx, y: sy, w: 3.0, h: 1.9,
        fill: { color: C.white }, line: { color: "E2E8F0" },
        rectRadius: 0.08, shadow: mkShadow()
      });
      s.addShape(pres.shapes.OVAL, {
        x: sx + 0.14, y: sy + 0.14, w: 0.5, h: 0.5,
        fill: { color: "154360" }, line: { color: "154360" }
      });
      s.addImage({ data: item.icon, x: sx + 0.19, y: sy + 0.19, w: 0.4, h: 0.4 });
      s.addText(item.title, {
        x: sx + 0.74, y: sy + 0.15, w: 2.14, h: 0.42,
        fontFace: "Calibri", fontSize: 11, bold: true,
        color: "154360", align: "left", margin: 0
      });
      s.addText(item.body, {
        x: sx + 0.12, y: sy + 0.65, w: 2.76, h: 1.1,
        fontFace: "Calibri", fontSize: 9.5, color: C.slate,
        align: "left", margin: 0
      });
    });

    s.addNotes("Stability work has been a priority. Error boundaries prevent any component failure from crashing the whole application. The Socket.IO layer auto-reconnects so brief network drops don't end an auction. All API endpoints are hardened. The outcome is noticeably improved production reliability.");
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SLIDE 11 — EXPORT FUNCTIONALITY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    const s = pres.addSlide();
    s.background = { color: C.navy };

    s.addText("EXPORT FUNCTIONALITY", {
      x: 0.5, y: 0.18, w: 9, h: 0.55,
      fontFace: "Cambria", fontSize: 26, bold: true,
      color: C.white, align: "left", margin: 0
    });
    s.addText("Structured Excel export that feeds directly into the scorecard application", {
      x: 0.5, y: 0.72, w: 9, h: 0.35,
      fontFace: "Calibri", fontSize: 12, color: C.teal, align: "left", margin: 0
    });

    // Flow diagram
    const exportFlow = [
      { label: "Completed\nTournament",   color: C.navyMid  },
      { label: "Trigger\nExport",         color: "1A5276"   },
      { label: "Excel\nWorkbook",         color: "117A65"   },
      { label: "ImportData\nSheet",       color: "6C3483"   },
      { label: "Scorecard\nApplication",  color: C.teal     },
    ];
    const efW = 1.65, efH = 1.0, efY = 1.2, efGap = 0.28;
    const efStartX = (W - (exportFlow.length * efW + (exportFlow.length - 1) * efGap)) / 2;
    exportFlow.forEach((ef, i) => {
      const ex = efStartX + i * (efW + efGap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: ex, y: efY, w: efW, h: efH,
        fill: { color: ef.color }, line: { color: ef.color }, rectRadius: 0.1
      });
      s.addText(ef.label, {
        x: ex, y: efY, w: efW, h: efH,
        fontFace: "Calibri", fontSize: 11, bold: true,
        color: C.white, align: "center", valign: "middle", margin: 0
      });
      if (i < exportFlow.length - 1) {
        s.addShape(pres.shapes.LINE, {
          x: ex + efW, y: efY + efH / 2, w: efGap, h: 0,
          line: { color: C.gold, width: 2.5 }
        });
      }
    });

    // ImportData contract detail
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.25, y: 2.55, w: 9.5, h: 2.75,
      fill: { color: C.navyMid }, line: { color: "2C5282" }, rectRadius: 0.1
    });
    s.addText("ImportData Contract — What Gets Exported", {
      x: 0.5, y: 2.65, w: 9, h: 0.42,
      fontFace: "Calibri", fontSize: 13, bold: true,
      color: C.gold, align: "left", margin: 0
    });
    const contractCols = [
      { head: "Festival Export", items: ["Team names", "Owner assignments", "Participant allocation", "Budget utilisation"] },
      { head: "Sport Export",    items: ["Sport team rosters", "Captain assignments", "Player allocation", "Credit usage"] },
      { head: "Excel Sheets",    items: ["Summary sheet", "ImportData sheet", "Team rosters", "Metadata"] },
      { head: "Scorecard Ready", items: ["Auto team creation", "Auto player assignment", "Zero manual entry", "Direct import path"] },
    ];
    contractCols.forEach((col, i) => {
      const cx = 0.5 + i * 2.4;
      s.addText(col.head, {
        x: cx, y: 3.12, w: 2.2, h: 0.35,
        fontFace: "Calibri", fontSize: 11, bold: true,
        color: C.teal, align: "left", margin: 0
      });
      col.items.forEach((item, j) => {
        s.addText(`• ${item}`, {
          x: cx, y: 3.5 + j * 0.42, w: 2.2, h: 0.38,
          fontFace: "Calibri", fontSize: 10, color: C.white,
          align: "left", margin: 0
        });
      });
    });

    s.addNotes("Export is the bridge between Cric-Velo and the scorecard application. Once an auction is complete, the admin exports an Excel workbook. The ImportData sheet follows a strict contract that the scorecard application reads to create teams and assign players automatically. No manual data entry required on the scorecard side.");
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SLIDE 12 — FUTURE SCORECARD INTEGRATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    const s = pres.addSlide();
    s.background = { color: C.offWhite };

    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: W, h: 0.85,
      fill: { color: C.teal }, line: { color: C.teal }
    });
    s.addText("FUTURE: SCORECARD INTEGRATION", {
      x: 0.5, y: 0.05, w: 9, h: 0.75,
      fontFace: "Cambria", fontSize: 26, bold: true,
      color: C.white, align: "left", valign: "middle", margin: 0
    });

    // Vision flow
    const visionSteps = [
      { l: "AuctionArena\n(Cric-Velo)", c: C.navyMid },
      { l: "Export\nExcel",             c: "117A65"   },
      { l: "ImportData\nContract",       c: "6C3483"   },
      { l: "Cricket\nScorecard",         c: "C0392B"   },
      { l: "Auto Team\nCreation",        c: "B7950B"   },
      { l: "Auto Player\nAssignment",    c: C.teal     },
    ];
    const vsW = 1.45, vsH = 0.88, vsY = 1.1, vsGap = 0.2;
    const vsStart = (W - (visionSteps.length * vsW + (visionSteps.length - 1) * vsGap)) / 2;
    visionSteps.forEach((vs, i) => {
      const vx = vsStart + i * (vsW + vsGap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: vx, y: vsY, w: vsW, h: vsH,
        fill: { color: vs.c }, line: { color: vs.c }, rectRadius: 0.1
      });
      s.addText(vs.l, {
        x: vx, y: vsY, w: vsW, h: vsH,
        fontFace: "Calibri", fontSize: 10, bold: true,
        color: C.white, align: "center", valign: "middle", margin: 0
      });
      if (i < visionSteps.length - 1) {
        s.addShape(pres.shapes.LINE, {
          x: vx + vsW, y: vsY + vsH / 2, w: vsGap, h: 0,
          line: { color: C.gold, width: 2.5 }
        });
      }
    });

    // Benefits
    const benefits = [
      { icon: iRocket, title: "Zero Manual Setup",      body: "Scorecard teams and players created automatically from the ImportData contract. Organizers never re-enter data." },
      { icon: iBolt,   title: "Faster Operations",      body: "What previously took hours of setup is completed in minutes. Tournament play begins immediately after export." },
      { icon: iCheck,  title: "Seamless Integration",   body: "Cric-Velo and the scorecard application share a defined data contract. Any scorecard system can adopt the format." },
    ];
    benefits.forEach((b, i) => {
      const bx = 0.25 + i * 3.25;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: bx, y: 2.25, w: 3.0, h: 3.05,
        fill: { color: C.white }, line: { color: "E2E8F0" },
        rectRadius: 0.1, shadow: mkShadow()
      });
      s.addShape(pres.shapes.OVAL, {
        x: bx + 1.2, y: 2.35, w: 0.6, h: 0.6,
        fill: { color: C.teal }, line: { color: C.teal }
      });
      s.addImage({ data: b.icon, x: bx + 1.27, y: 2.42, w: 0.46, h: 0.46 });
      s.addText(b.title, {
        x: bx + 0.12, y: 3.08, w: 2.76, h: 0.42,
        fontFace: "Calibri", fontSize: 12, bold: true,
        color: C.navy, align: "center", margin: 0
      });
      s.addText(b.body, {
        x: bx + 0.12, y: 3.55, w: 2.76, h: 1.6,
        fontFace: "Calibri", fontSize: 10, color: C.slate,
        align: "left", margin: 0
      });
    });

    s.addNotes("The vision for Cric-Velo's future is a seamless pipeline from auction to scorecard. The ImportData contract that currently requires a manual import step will be extended to a direct API integration, where the scorecard application subscribes to export events and creates teams automatically. This eliminates the last remaining manual step in the tournament operations workflow.");
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SLIDE 13 — USER ROLES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    const s = pres.addSlide();
    s.background = { color: C.navy };

    s.addText("USER ROLES", {
      x: 0.5, y: 0.18, w: 9, h: 0.55,
      fontFace: "Cambria", fontSize: 26, bold: true,
      color: C.white, align: "left", margin: 0
    });
    s.addText("Role-based access ensures each user sees exactly what they need", {
      x: 0.5, y: 0.72, w: 9, h: 0.35,
      fontFace: "Calibri", fontSize: 12, color: C.teal, align: "left", margin: 0
    });

    const roles = [
      {
        title: "Admin",
        icon: iShield,
        color: "1A3A6B",
        capabilities: [
          "Full platform control",
          "Create & manage festivals",
          "Configure & run auctions",
          "Manage all users & roles",
          "Export completed auctions",
          "Access all dashboards",
        ]
      },
      {
        title: "Team Owner",
        icon: iUserTie,
        color: "117A65",
        capabilities: [
          "Festival bidding access",
          "Real-time bid placement",
          "Live budget monitoring",
          "View own team formation",
          "Access own auction results",
          "No admin functions",
        ]
      },
      {
        title: "Captain",
        icon: iCricket,
        color: "6C3483",
        capabilities: [
          "Sport auction bidding",
          "Credit-based bid placement",
          "View assigned player pool",
          "Monitor team composition",
          "Access own sport results",
          "No festival-level access",
        ]
      },
      {
        title: "Spectator",
        icon: iChart,
        color: "154360",
        capabilities: [
          "View-only access",
          "Watch live auction progress",
          "See current bids & timer",
          "Follow team formation",
          "No bidding capability",
          "No administrative access",
        ]
      },
    ];

    roles.forEach((r, i) => {
      const rx = 0.25 + i * 2.43;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: rx, y: 1.18, w: 2.2, h: 4.18,
        fill: { color: C.navyMid }, line: { color: "2C5282" }, rectRadius: 0.1
      });
      // Header
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: rx, y: 1.18, w: 2.2, h: 1.18,
        fill: { color: r.color }, line: { color: r.color }, rectRadius: 0.1
      });
      s.addShape(pres.shapes.RECTANGLE, {
        x: rx, y: 1.8, w: 2.2, h: 0.56,
        fill: { color: r.color }, line: { color: r.color }
      });
      s.addImage({ data: r.icon, x: rx + 0.85, y: 1.26, w: 0.5, h: 0.5 });
      s.addText(r.title, {
        x: rx + 0.08, y: 1.8, w: 2.04, h: 0.42,
        fontFace: "Calibri", fontSize: 13, bold: true,
        color: C.white, align: "center", margin: 0
      });
      // Capabilities
      r.capabilities.forEach((cap, j) => {
        s.addText(`✓  ${cap}`, {
          x: rx + 0.14, y: 2.48 + j * 0.45, w: 1.95, h: 0.42,
          fontFace: "Calibri", fontSize: 9.5, color: C.white,
          align: "left", margin: 0
        });
      });
    });

    s.addNotes("Cric-Velo implements four roles. Admins control everything. Team Owners participate in festival auctions with real budget. Captains bid in sport auctions using credits. Spectators watch everything in real time but cannot bid. Every user sees only what their role permits.");
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SLIDE 14 — BUSINESS IMPACT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    const s = pres.addSlide();
    s.background = { color: C.offWhite };

    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: W, h: 0.85,
      fill: { color: C.navy }, line: { color: C.navy }
    });
    s.addText("BUSINESS IMPACT", {
      x: 0.5, y: 0.05, w: 9, h: 0.75,
      fontFace: "Cambria", fontSize: 26, bold: true,
      color: C.white, align: "left", valign: "middle", margin: 0
    });

    const impacts = [
      { icon: iSpeed,     stat: "75%",  label: "Faster Team Creation",     body: "Teams formed in minutes vs. hours of manual assignment" },
      { icon: iChart,     stat: "85%",  label: "Lower Bid Latency",         body: "Real-time bids processed within 120ms average response" },
      { icon: iUsers,     stat: "4x",   label: "More Engagement",           body: "Spectators can follow auctions live; participation increases" },
      { icon: iCheck,     stat: "0",    label: "Manual Re-Entry",            body: "Export contract eliminates data re-entry into scorecard" },
      { icon: iHandshake, stat: "100%", label: "Auction Transparency",      body: "Every bid visible to all participants in real time" },
      { icon: iRocket,    stat: "∞",    label: "Ecosystem Ready",            body: "Open export contract supports future scorecard integrations" },
    ];

    const cols3 = [0.25, 3.45, 6.65];
    impacts.forEach((imp, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const ix = cols3[col], iy = 1.0 + row * 2.05;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: ix, y: iy, w: 3.0, h: 1.85,
        fill: { color: C.white }, line: { color: "E2E8F0" },
        rectRadius: 0.08, shadow: mkShadow()
      });
      s.addShape(pres.shapes.OVAL, {
        x: ix + 0.14, y: iy + 0.14, w: 0.52, h: 0.52,
        fill: { color: C.navyMid }, line: { color: C.navyMid }
      });
      s.addImage({ data: imp.icon, x: ix + 0.20, y: iy + 0.20, w: 0.40, h: 0.40 });
      s.addText(imp.stat, {
        x: ix + 0.77, y: iy + 0.1, w: 1.0, h: 0.55,
        fontFace: "Cambria", fontSize: 30, bold: true,
        color: C.teal, align: "left", margin: 0
      });
      s.addText(imp.label, {
        x: ix + 0.77, y: iy + 0.55, w: 2.05, h: 0.32,
        fontFace: "Calibri", fontSize: 10.5, bold: true,
        color: C.navy, align: "left", margin: 0
      });
      s.addText(imp.body, {
        x: ix + 0.12, y: iy + 0.95, w: 2.76, h: 0.8,
        fontFace: "Calibri", fontSize: 9.5, color: C.slate,
        align: "left", margin: 0
      });
    });

    s.addNotes("The business impact of Cric-Velo is concrete. Tournament setup that previously took hours is done in minutes. Bid latency has been driven to 120ms. The export contract means zero manual data entry for the scorecard team. And the platform is built for expansion — any scorecard system can consume the export contract.");
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SLIDE 15 — DEMO FLOW
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    const s = pres.addSlide();
    s.background = { color: C.navy };

    s.addText("DEMO FLOW", {
      x: 0.5, y: 0.18, w: 9, h: 0.55,
      fontFace: "Cambria", fontSize: 26, bold: true,
      color: C.white, align: "left", margin: 0
    });
    s.addText("The complete journey we will walk through together", {
      x: 0.5, y: 0.72, w: 9, h: 0.35,
      fontFace: "Calibri", fontSize: 12, color: C.teal, align: "left", margin: 0
    });

    const demoSteps = [
      { n: "01", label: "Create Festival",           desc: "Set up the festival,\nadd participants & teams",   icon: iTrophy,   c: "1A5276" },
      { n: "02", label: "Configure Teams",           desc: "Assign team owners,\nset budgets",                  icon: iUsers,    c: "117A65" },
      { n: "03", label: "Festival Auction",          desc: "Run live bidding,\nform festival teams",            icon: iGavel,    c: "6C3483" },
      { n: "04", label: "Team Formation",            desc: "Review completed\nteam rosters",                    icon: iCheck,    c: "1E8449" },
      { n: "05", label: "Sport Tournament",          desc: "Create tournament,\nassign captains & credits",     icon: iCricket,  c: "B7950B" },
      { n: "06", label: "Sport Auction",             desc: "Captains bid for\nplayers with credits",            icon: iBolt,     c: "C0392B" },
      { n: "07", label: "Export Teams",              desc: "Generate Excel\nImportData export",                 icon: iExport,   c: "154360" },
      { n: "08", label: "Import to Scorecard",       desc: "Load into scorecard\napp automatically",            icon: iDownload, c: C.teal   },
    ];

    const stepW = 1.1, stepH = 2.5, stepGap = 0.08;
    const totalW = demoSteps.length * stepW + (demoSteps.length - 1) * stepGap;
    const startX = (W - totalW) / 2;

    demoSteps.forEach((ds, i) => {
      const dx = startX + i * (stepW + stepGap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: dx, y: 1.15, w: stepW, h: stepH,
        fill: { color: ds.c }, line: { color: ds.c }, rectRadius: 0.1
      });
      // Step number badge
      s.addShape(pres.shapes.OVAL, {
        x: dx + 0.3, y: 1.22, w: 0.5, h: 0.5,
        fill: { color: "FFFFFF33" }, line: { color: "FFFFFF" }
      });
      s.addText(ds.n, {
        x: dx + 0.3, y: 1.22, w: 0.5, h: 0.5,
        fontFace: "Calibri", fontSize: 11, bold: true,
        color: C.white, align: "center", valign: "middle", margin: 0
      });
      s.addImage({ data: ds.icon, x: dx + 0.3, y: 1.85, w: 0.5, h: 0.5 });
      s.addText(ds.label, {
        x: dx - 0.08, y: 2.45, w: stepW + 0.16, h: 0.52,
        fontFace: "Calibri", fontSize: 9, bold: true,
        color: C.white, align: "center", margin: 0
      });
      s.addText(ds.desc, {
        x: dx - 0.08, y: 2.97, w: stepW + 0.16, h: 0.58,
        fontFace: "Calibri", fontSize: 8, color: "CCDDFF",
        align: "center", margin: 0
      });
      // Connector arrow
      if (i < demoSteps.length - 1) {
        s.addShape(pres.shapes.LINE, {
          x: dx + stepW, y: 1.15 + stepH / 2, w: stepGap, h: 0,
          line: { color: C.gold, width: 2 }
        });
      }
    });

    // Bottom CTA
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 2.5, y: 4.8, w: 5.0, h: 0.55,
      fill: { color: C.teal }, line: { color: C.teal }, rectRadius: 0.25
    });
    s.addText("Ready to see it live? Let's begin the demo.", {
      x: 2.5, y: 4.8, w: 5.0, h: 0.55,
      fontFace: "Calibri", fontSize: 12, bold: true,
      color: C.white, align: "center", valign: "middle", margin: 0
    });

    s.addNotes("This is the complete demo journey. We start by creating a festival and configuring teams, then run the live festival auction to form teams. We then create a sport tournament, assign captains with credits, and run the sport auction. Finally we export the teams as an Excel file which the scorecard application imports automatically. Let's go.");
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SLIDE 16 — THANK YOU
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    const s = pres.addSlide();
    s.background = { color: C.navy };

    // Left panel
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 4.0, h: H,
      fill: { color: C.navyMid }, line: { color: C.navyMid }
    });

    s.addImage({ data: ballGold, x: 0.6, y: 0.6, w: 1.4, h: 1.4 });
    s.addText("CRIC", {
      x: 0.2, y: 2.2, w: 3.5, h: 0.7,
      fontFace: "Cambria", fontSize: 46, bold: true,
      color: C.white, align: "center", margin: 0
    });
    s.addText("VELO", {
      x: 0.2, y: 2.85, w: 3.5, h: 0.7,
      fontFace: "Cambria", fontSize: 46, bold: true,
      color: C.teal, align: "center", margin: 0
    });
    s.addText("Tournament & Auction\nManagement Platform", {
      x: 0.2, y: 3.65, w: 3.5, h: 0.7,
      fontFace: "Calibri", fontSize: 11, color: C.slate,
      align: "center", margin: 0
    });

    // Right
    s.addText("Thank You", {
      x: 4.3, y: 1.2, w: 5.5, h: 1.1,
      fontFace: "Cambria", fontSize: 52, bold: true,
      color: C.white, align: "left", margin: 0
    });
    s.addText("Questions & Discussion", {
      x: 4.3, y: 2.38, w: 5.5, h: 0.5,
      fontFace: "Calibri", fontSize: 18, color: C.gold,
      align: "left", margin: 0
    });
    s.addShape(pres.shapes.LINE, {
      x: 4.3, y: 3.1, w: 5.3, h: 0,
      line: { color: C.teal, width: 1.5 }
    });

    const contactItems = [
      "Cric-Velo Platform  ·  Version 1.0",
      "June 2026",
      "From Employee Registration to Team Formation in Minutes",
    ];
    contactItems.forEach((c, i) => {
      s.addText(c, {
        x: 4.3, y: 3.3 + i * 0.42, w: 5.5, h: 0.38,
        fontFace: "Calibri", fontSize: 11, color: C.slate,
        align: "left", margin: 0
      });
    });

    // Ball accents
    s.addImage({ data: ballTeal, x: 9.2, y: 4.9, w: 0.6, h: 0.6, transparency: 40 });

    s.addNotes("Thank you for your time. I'm happy to take questions on any aspect of the platform — the auction engine, the real-time architecture, the export contract, or the performance and stability improvements. Over to you.");
  }

  await pres.writeFile({ fileName: "Cric-Velo-presentation.pptx" });
  console.log("Done: Cric-Velo-presentation.pptx");
}

buildPresentation().catch(e => { console.error(e); process.exit(1); });
