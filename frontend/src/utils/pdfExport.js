import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const exportGameToPDF = (gameData, includePlayByPlay = false) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();

  // Custom Header (Category | City | Date)
  pdf.setFontSize(10);
  pdf.setFont(undefined, "normal");

  const yHeader = 20;

  // Left: Category/Competition
  if (gameData.category) {
    pdf.text(gameData.category, 14, yHeader, { align: "left" });
  }

  // Center: City
  if (gameData.city) {
    pdf.text(gameData.city, pageWidth / 2, yHeader, { align: "center" });
  }

  // Right: Date
  const today = new Date();
  const dateStr = today.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  pdf.text(dateStr, pageWidth - 14, yHeader, { align: "right" });

  // Teams Title
  pdf.setFontSize(16);
  pdf.setFont(undefined, "bold");
  pdf.text(
    `${gameData.homeTeam.name} vs ${gameData.awayTeam.name}`,
    pageWidth / 2,
    30,
    { align: "center" }
  );

  // Score Title
  pdf.setFontSize(22);
  pdf.text(`${gameData.homeScore} - ${gameData.awayScore}`, pageWidth / 2, 40, {
    align: "center",
  });

  let yPos = 50;

  // Helper function to calculate percentages
  const calcPct = (made, attempted) => {
    if (attempted === 0) return "0.0%";
    return `${((made / attempted) * 100).toFixed(1)}%`;
  };

  // Helper function to calculate valuation
  const calcVal = (stats) => {
    return (
      stats.points +
      stats.rebounds +
      stats.assists +
      stats.steals +
      stats.blocks -
      stats.blocksReceived -
      (stats.fg2Attempted - stats.fg2Made) -
      (stats.fg3Attempted - stats.fg3Made) -
      (stats.ftAttempted - stats.ftMade) -
      stats.turnovers
    );
  };

  // Helper to calculate max values for a team's stats
  const getTeamMaxValues = (playersStats) => {
    const maxValues = {
      points: 0,
      fg2Made: 0,
      fg3Made: 0,
      ftMade: 0,
      rebounds: 0,
      assists: 0,
      steals: 0,
      turnovers: 0,
      blocks: 0,
      foulsCommitted: 0,
      val: -Infinity,
    };

    playersStats.forEach((stats) => {
      maxValues.points = Math.max(maxValues.points, stats.points);
      maxValues.fg2Made = Math.max(maxValues.fg2Made, stats.fg2Made);
      maxValues.fg3Made = Math.max(maxValues.fg3Made, stats.fg3Made);
      maxValues.ftMade = Math.max(maxValues.ftMade, stats.ftMade);
      maxValues.rebounds = Math.max(maxValues.rebounds, stats.rebounds);
      maxValues.assists = Math.max(maxValues.assists, stats.assists);
      maxValues.steals = Math.max(maxValues.steals, stats.steals);
      maxValues.turnovers = Math.max(maxValues.turnovers, stats.turnovers);
      maxValues.blocks = Math.max(maxValues.blocks, stats.blocks);
      maxValues.foulsCommitted = Math.max(
        maxValues.foulsCommitted,
        stats.foulsCommitted
      );
      maxValues.val = Math.max(maxValues.val, calcVal(stats));
    });

    return maxValues;
  };

  // Helper to format cell with bold if max
  const formatCell = (value, checkValue, maxValue) => {
    if (checkValue === maxValue && maxValue > 0) {
      return { content: value, styles: { fontStyle: "bold" } };
    }
    return value;
  };

  // --- Home Team Stats ---
  const homeMax = getTeamMaxValues(gameData.homePlayerStats);

  pdf.setFontSize(14);
  pdf.setFont(undefined, "bold");
  pdf.setTextColor(0, 116, 255); // Home color (blue-ish)
  pdf.text(`${gameData.homeTeam.name}`, 14, yPos);
  pdf.setTextColor(0, 0, 0); // Reset color
  yPos += 8;

  const homeTableData = gameData.homePlayerStats.map((stats, index) => {
    const player = gameData.homeTeam.players[index];
    const val = calcVal(stats);

    return [
      `#${player.number} ${stats.name}`,
      formatCell(stats.points, stats.points, homeMax.points),
      formatCell(
        `${stats.fg2Made}/${stats.fg2Attempted} (${calcPct(
          stats.fg2Made,
          stats.fg2Attempted
        )})`,
        stats.fg2Made,
        homeMax.fg2Made
      ),
      formatCell(
        `${stats.fg3Made}/${stats.fg3Attempted} (${calcPct(
          stats.fg3Made,
          stats.fg3Attempted
        )})`,
        stats.fg3Made,
        homeMax.fg3Made
      ),
      formatCell(
        `${stats.ftMade}/${stats.ftAttempted} (${calcPct(
          stats.ftMade,
          stats.ftAttempted
        )})`,
        stats.ftMade,
        homeMax.ftMade
      ),
      formatCell(
        `${stats.rebounds} (${stats.reboundsOffensive}+${stats.reboundsDefensive})`,
        stats.rebounds,
        homeMax.rebounds
      ),
      formatCell(stats.assists, stats.assists, homeMax.assists),
      formatCell(stats.steals, stats.steals, homeMax.steals),
      formatCell(stats.turnovers, stats.turnovers, homeMax.turnovers),
      formatCell(stats.blocks, stats.blocks, homeMax.blocks),
      formatCell(
        stats.foulsCommitted,
        stats.foulsCommitted,
        homeMax.foulsCommitted
      ),
      formatCell(val, val, homeMax.val),
    ];
  });

  // Add totals row
  const homeTotals = [
    { content: "TOTAL", styles: { fontStyle: "bold" } },
    {
      content: gameData.homePlayerStats.reduce((sum, s) => sum + s.points, 0),
      styles: { fontStyle: "bold" },
    },
    `${gameData.homePlayerStats.reduce(
      (sum, s) => sum + s.fg2Made,
      0
    )}/${gameData.homePlayerStats.reduce((sum, s) => sum + s.fg2Attempted, 0)}`,
    `${gameData.homePlayerStats.reduce(
      (sum, s) => sum + s.fg3Made,
      0
    )}/${gameData.homePlayerStats.reduce((sum, s) => sum + s.fg3Attempted, 0)}`,
    `${gameData.homePlayerStats.reduce(
      (sum, s) => sum + s.ftMade,
      0
    )}/${gameData.homePlayerStats.reduce((sum, s) => sum + s.ftAttempted, 0)}`,
    {
      content: gameData.homePlayerStats.reduce((sum, s) => sum + s.rebounds, 0),
      styles: { fontStyle: "bold" },
    },
    {
      content: gameData.homePlayerStats.reduce((sum, s) => sum + s.assists, 0),
      styles: { fontStyle: "bold" },
    },
    {
      content: gameData.homePlayerStats.reduce((sum, s) => sum + s.steals, 0),
      styles: { fontStyle: "bold" },
    },
    {
      content: gameData.homePlayerStats.reduce(
        (sum, s) => sum + s.turnovers,
        0
      ),
      styles: { fontStyle: "bold" },
    },
    {
      content: gameData.homePlayerStats.reduce((sum, s) => sum + s.blocks, 0),
      styles: { fontStyle: "bold" },
    },
    {
      content: gameData.homePlayerStats.reduce(
        (sum, s) => sum + s.foulsCommitted,
        0
      ),
      styles: { fontStyle: "bold" },
    },
    {
      content: gameData.homePlayerStats.reduce((sum, s) => sum + calcVal(s), 0),
      styles: { fontStyle: "bold" },
    },
  ];

  homeTableData.push(homeTotals);

  autoTable(pdf, {
    startY: yPos,
    head: [
      [
        "Jugador",
        "PTS",
        "T2",
        "T3",
        "T1",
        "REB",
        "AST",
        "BR",
        "BP",
        "TF",
        "FC",
        "VAL",
      ],
    ],
    body: homeTableData,
    theme: "striped",
    headStyles: { fillColor: [0, 116, 255], fontSize: 8, halign: "center" },
    bodyStyles: { fontSize: 7, halign: "center" },
    styles: { cellPadding: 2, valign: "middle" },
    columnStyles: {
      0: { cellWidth: 35, halign: "left" },
    },
  });

  yPos = pdf.lastAutoTable.finalY + 15;

  // --- Away Team Stats ---
  const awayMax = getTeamMaxValues(gameData.awayPlayerStats);

  pdf.setFontSize(14);
  pdf.setFont(undefined, "bold");
  pdf.setTextColor(255, 71, 87); // Away color (red-ish)
  pdf.text(`${gameData.awayTeam.name}`, 14, yPos);
  pdf.setTextColor(0, 0, 0); // Reset color
  yPos += 8;

  const awayTableData = gameData.awayPlayerStats.map((stats, index) => {
    const player = gameData.awayTeam.players[index];
    const val = calcVal(stats);

    return [
      `#${player.number} ${stats.name}`,
      formatCell(stats.points, stats.points, awayMax.points),
      formatCell(
        `${stats.fg2Made}/${stats.fg2Attempted} (${calcPct(
          stats.fg2Made,
          stats.fg2Attempted
        )})`,
        stats.fg2Made,
        awayMax.fg2Made
      ),
      formatCell(
        `${stats.fg3Made}/${stats.fg3Attempted} (${calcPct(
          stats.fg3Made,
          stats.fg3Attempted
        )})`,
        stats.fg3Made,
        awayMax.fg3Made
      ),
      formatCell(
        `${stats.ftMade}/${stats.ftAttempted} (${calcPct(
          stats.ftMade,
          stats.ftAttempted
        )})`,
        stats.ftMade,
        awayMax.ftMade
      ),
      formatCell(
        `${stats.rebounds} (${stats.reboundsOffensive}+${stats.reboundsDefensive})`,
        stats.rebounds,
        awayMax.rebounds
      ),
      formatCell(stats.assists, stats.assists, awayMax.assists),
      formatCell(stats.steals, stats.steals, awayMax.steals),
      formatCell(stats.turnovers, stats.turnovers, awayMax.turnovers),
      formatCell(stats.blocks, stats.blocks, awayMax.blocks),
      formatCell(
        stats.foulsCommitted,
        stats.foulsCommitted,
        awayMax.foulsCommitted
      ),
      formatCell(val, val, awayMax.val),
    ];
  });

  // Add totals row
  const awayTotals = [
    { content: "TOTAL", styles: { fontStyle: "bold" } },
    {
      content: gameData.awayPlayerStats.reduce((sum, s) => sum + s.points, 0),
      styles: { fontStyle: "bold" },
    },
    `${gameData.awayPlayerStats.reduce(
      (sum, s) => sum + s.fg2Made,
      0
    )}/${gameData.awayPlayerStats.reduce((sum, s) => sum + s.fg2Attempted, 0)}`,
    `${gameData.awayPlayerStats.reduce(
      (sum, s) => sum + s.fg3Made,
      0
    )}/${gameData.awayPlayerStats.reduce((sum, s) => sum + s.fg3Attempted, 0)}`,
    `${gameData.awayPlayerStats.reduce(
      (sum, s) => sum + s.ftMade,
      0
    )}/${gameData.awayPlayerStats.reduce((sum, s) => sum + s.ftAttempted, 0)}`,
    {
      content: gameData.awayPlayerStats.reduce((sum, s) => sum + s.rebounds, 0),
      styles: { fontStyle: "bold" },
    },
    {
      content: gameData.awayPlayerStats.reduce((sum, s) => sum + s.assists, 0),
      styles: { fontStyle: "bold" },
    },
    {
      content: gameData.awayPlayerStats.reduce((sum, s) => sum + s.steals, 0),
      styles: { fontStyle: "bold" },
    },
    {
      content: gameData.awayPlayerStats.reduce(
        (sum, s) => sum + s.turnovers,
        0
      ),
      styles: { fontStyle: "bold" },
    },
    {
      content: gameData.awayPlayerStats.reduce((sum, s) => sum + s.blocks, 0),
      styles: { fontStyle: "bold" },
    },
    {
      content: gameData.awayPlayerStats.reduce(
        (sum, s) => sum + s.foulsCommitted,
        0
      ),
      styles: { fontStyle: "bold" },
    },
    {
      content: gameData.awayPlayerStats.reduce((sum, s) => sum + calcVal(s), 0),
      styles: { fontStyle: "bold" },
    },
  ];

  awayTableData.push(awayTotals);

  autoTable(pdf, {
    startY: yPos,
    head: [
      [
        "Jugador",
        "PTS",
        "T2",
        "T3",
        "T1",
        "REB",
        "AST",
        "BR",
        "BP",
        "TF",
        "FC",
        "VAL",
      ],
    ],
    body: awayTableData,
    theme: "striped",
    headStyles: { fillColor: [255, 71, 87], fontSize: 8, halign: "center" },
    bodyStyles: { fontSize: 7, halign: "center" },
    styles: { cellPadding: 2, valign: "middle" },
    columnStyles: {
      0: { cellWidth: 35, halign: "left" },
    },
  });

  // Play by Play (optional)
  if (includePlayByPlay && gameData.playByPlay.length > 0) {
    pdf.addPage();

    pdf.setFontSize(14);
    pdf.setFont(undefined, "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("Jugada a Jugada", 14, 20);

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    };

    const getQuarterLabel = (quarter) => {
      if (quarter <= 4) return `Q${quarter}`;
      return `OT${quarter - 4}`;
    };

    const playByPlayData = gameData.playByPlay.map((play) => [
      getQuarterLabel(play.quarter),
      formatTime(play.time),
      play.text,
    ]);

    autoTable(pdf, {
      startY: 28,
      head: [["Cuarto", "Tiempo", "Jugada"]],
      body: playByPlayData.reverse(),
      theme: "grid",
      headStyles: { fillColor: [0, 116, 255], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      styles: { cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 25 },
        2: { cellWidth: "auto" },
      },
    });
  }

  // Save the PDF
  const filename = `${gameData.homeTeam.name}_vs_${gameData.awayTeam.name}_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  pdf.save(filename);
};
