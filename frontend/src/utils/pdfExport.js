import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportGameToPDF = (gameData, includePlayByPlay = false) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Title
  pdf.setFontSize(20);
  pdf.setFont(undefined, 'bold');
  pdf.text('Box Score - Partido de Baloncesto', pageWidth / 2, 20, { align: 'center' });
  
  // Game Info
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'normal');
  pdf.text(`${gameData.homeTeam.name} vs ${gameData.awayTeam.name}`, pageWidth / 2, 30, { align: 'center' });
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.text(`${gameData.homeScore} - ${gameData.awayScore}`, pageWidth / 2, 40, { align: 'center' });
  
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  pdf.text(`Cuarto: ${gameData.currentQuarter} | Duración: ${gameData.quarterDuration} min`, pageWidth / 2, 48, { align: 'center' });
  
  let yPos = 58;
  
  // Helper function to calculate percentages
  const calcPct = (made, attempted) => {
    if (attempted === 0) return '0.0%';
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
      (stats.fg2Attempted - stats.fg2Made) -
      (stats.fg3Attempted - stats.fg3Made) -
      (stats.ftAttempted - stats.ftMade) -
      stats.turnovers
    );
  };
  
  // Home Team Stats
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text(`${gameData.homeTeam.name}`, 14, yPos);
  yPos += 8;
  
  const homeTableData = gameData.homePlayerStats.map((stats, index) => {
    const player = gameData.homeTeam.players[index];
    return [
      `#${player.number} ${stats.name}`,
      stats.points,
      `${stats.fg2Made}/${stats.fg2Attempted} (${calcPct(stats.fg2Made, stats.fg2Attempted)})`,
      `${stats.fg3Made}/${stats.fg3Attempted} (${calcPct(stats.fg3Made, stats.fg3Attempted)})`,
      `${stats.ftMade}/${stats.ftAttempted} (${calcPct(stats.ftMade, stats.ftAttempted)})`,
      `${stats.rebounds} (${stats.reboundsOffensive}+${stats.reboundsDefensive})`,
      stats.assists,
      stats.steals,
      stats.turnovers,
      stats.blocks,
      stats.foulsCommitted,
      calcVal(stats),
    ];
  });
  
  // Add totals row
  const homeTotals = [
    'TOTAL',
    gameData.homePlayerStats.reduce((sum, s) => sum + s.points, 0),
    `${gameData.homePlayerStats.reduce((sum, s) => sum + s.fg2Made, 0)}/${gameData.homePlayerStats.reduce((sum, s) => sum + s.fg2Attempted, 0)}`,
    `${gameData.homePlayerStats.reduce((sum, s) => sum + s.fg3Made, 0)}/${gameData.homePlayerStats.reduce((sum, s) => sum + s.fg3Attempted, 0)}`,
    `${gameData.homePlayerStats.reduce((sum, s) => sum + s.ftMade, 0)}/${gameData.homePlayerStats.reduce((sum, s) => sum + s.ftAttempted, 0)}`,
    gameData.homePlayerStats.reduce((sum, s) => sum + s.rebounds, 0),
    gameData.homePlayerStats.reduce((sum, s) => sum + s.assists, 0),
    gameData.homePlayerStats.reduce((sum, s) => sum + s.steals, 0),
    gameData.homePlayerStats.reduce((sum, s) => sum + s.turnovers, 0),
    gameData.homePlayerStats.reduce((sum, s) => sum + s.blocks, 0),
    gameData.homePlayerStats.reduce((sum, s) => sum + s.foulsCommitted, 0),
    gameData.homePlayerStats.reduce((sum, s) => sum + calcVal(s), 0),
  ];
  
  homeTableData.push(homeTotals);
  
  autoTable(pdf, {
    startY: yPos,
    head: [['Jugador', 'PTS', 'T2', 'T3', 'T1', 'REB', 'AST', 'BR', 'BP', 'TF', 'FC', 'VAL']],
    body: homeTableData,
    theme: 'striped',
    headStyles: { fillColor: [0, 116, 255], fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    styles: { cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 35 },
    },
  });
  
  yPos = pdf.lastAutoTable.finalY + 15;
  
  // Away Team Stats
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text(`${gameData.awayTeam.name}`, 14, yPos);
  yPos += 8;
  
  const awayTableData = gameData.awayPlayerStats.map((stats, index) => {
    const player = gameData.awayTeam.players[index];
    return [
      `#${player.number} ${stats.name}`,
      stats.points,
      `${stats.fg2Made}/${stats.fg2Attempted} (${calcPct(stats.fg2Made, stats.fg2Attempted)})`,
      `${stats.fg3Made}/${stats.fg3Attempted} (${calcPct(stats.fg3Made, stats.fg3Attempted)})`,
      `${stats.ftMade}/${stats.ftAttempted} (${calcPct(stats.ftMade, stats.ftAttempted)})`,
      `${stats.rebounds} (${stats.reboundsOffensive}+${stats.reboundsDefensive})`,
      stats.assists,
      stats.steals,
      stats.turnovers,
      stats.blocks,
      stats.foulsCommitted,
      calcVal(stats),
    ];
  });
  
  // Add totals row
  const awayTotals = [
    'TOTAL',
    gameData.awayPlayerStats.reduce((sum, s) => sum + s.points, 0),
    `${gameData.awayPlayerStats.reduce((sum, s) => sum + s.fg3Made, 0)}/${gameData.awayPlayerStats.reduce((sum, s) => sum + s.fg2Attempted, 0)}`,
    `${gameData.awayPlayerStats.reduce((sum, s) => sum + s.fg3Made, 0)}/${gameData.awayPlayerStats.reduce((sum, s) => sum + s.fg3Attempted, 0)}`,
    `${gameData.awayPlayerStats.reduce((sum, s) => sum + s.ftMade, 0)}/${gameData.awayPlayerStats.reduce((sum, s) => sum + s.ftAttempted, 0)}`,
    gameData.awayPlayerStats.reduce((sum, s) => sum + s.rebounds, 0),
    gameData.awayPlayerStats.reduce((sum, s) => sum + s.assists, 0),
    gameData.awayPlayerStats.reduce((sum, s) => sum + s.steals, 0),
    gameData.awayPlayerStats.reduce((sum, s) => sum + s.turnovers, 0),
    gameData.awayPlayerStats.reduce((sum, s) => sum + s.blocks, 0),
    gameData.awayPlayerStats.reduce((sum, s) => sum + s.foulsCommitted, 0),
    gameData.awayPlayerStats.reduce((sum, s) => sum + calcVal(s), 0),
  ];
  
  awayTableData.push(awayTotals);
  
  autoTable(pdf, {
    startY: yPos,
    head: [['Jugador', 'PTS', 'T2', 'T3', 'T1', 'REB', 'AST', 'BR', 'BP', 'TF', 'FC', 'VAL']],
    body: awayTableData,
    theme: 'striped',
    headStyles: { fillColor: [255, 71, 87], fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    styles: { cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 35 },
    },
  });
  
  // Play by Play (optional)
  if (includePlayByPlay && gameData.playByPlay.length > 0) {
    pdf.addPage();
    
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text('Jugada a Jugada', 14, 20);
    
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    const getQuarterLabel = (quarter) => {
      if (quarter <= 4) return `Q${quarter}`;
      return `OT${quarter - 4}`;
    };
    
    const playByPlayData = gameData.playByPlay.map(play => [
      getQuarterLabel(play.quarter),
      formatTime(play.time),
      play.text,
    ]);
    
    autoTable(pdf, {
      startY: 28,
      head: [['Cuarto', 'Tiempo', 'Jugada']],
      body: playByPlayData.reverse(),
      theme: 'grid',
      headStyles: { fillColor: [0, 116, 255], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      styles: { cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 25 },
        2: { cellWidth: 'auto' },
      },
    });
  }
  
  // Save the PDF
  const filename = `${gameData.homeTeam.name}_vs_${gameData.awayTeam.name}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
};
