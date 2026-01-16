import React, { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { BarChart3 } from "lucide-react";

export const BoxScore = ({ open, onOpenChange }) => {
  const { t } = useTranslation();
  const { homeTeam, awayTeam, homePlayerStats, awayPlayerStats } =
    useGameStore();
  const [activeTab, setActiveTab] = useState("home");

  const calculatePercentage = (made, attempted) => {
    if (attempted === 0) return "0.0";
    return ((made / attempted) * 100).toFixed(1);
  };

  const calculateValuation = (stats) => {
    // Fórmula simplificada de valoración
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
      stats.turnovers -
      stats.foulsCommitted
    );
  };

  const renderStatsTable = (teamStats, teamData) => (
    <ScrollArea className="h-[500px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky top-0 bg-background">
              {t("box_score.player")}
            </TableHead>
            <TableHead className="sticky top-0 bg-background text-center">
              {t("box_score.minutes")}
            </TableHead>
            <TableHead className="sticky top-0 bg-background text-center">
              {t("box_score.points")}
            </TableHead>
            <TableHead className="sticky top-0 bg-background text-center">
              {t("box_score.t2")}
            </TableHead>
            <TableHead className="sticky top-0 bg-background text-center">
              {t("box_score.t3")}
            </TableHead>
            <TableHead className="sticky top-0 bg-background text-center">
              {t("box_score.t1")}
            </TableHead>
            <TableHead className="sticky top-0 bg-background text-center">
              {t("box_score.rebounds")}
            </TableHead>
            <TableHead className="sticky top-0 bg-background text-center">
              {t("box_score.assists")}
            </TableHead>
            <TableHead className="sticky top-0 bg-background text-center">
              {t("box_score.steals")}
            </TableHead>
            <TableHead className="sticky top-0 bg-background text-center">
              {t("box_score.turnovers")}
            </TableHead>
            <TableHead className="sticky top-0 bg-background text-center">
              {t("box_score.blocks")}
            </TableHead>
            <TableHead className="sticky top-0 bg-background text-center">
              {t("box_score.blocks_received")}
            </TableHead>
            <TableHead className="sticky top-0 bg-background text-center">
              {t("box_score.fouls_committed")}
            </TableHead>
            <TableHead className="sticky top-0 bg-background text-center">
              {t("box_score.fouls_received")}
            </TableHead>
            <TableHead className="sticky top-0 bg-background text-center">
              {t("box_score.valuation")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teamStats.map((stats, index) => {
            const player = teamData.players[index];
            return (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      #{player.number}
                    </span>
                    {stats.name}
                  </div>
                </TableCell>
                <TableCell className="text-center">{stats.minutes}</TableCell>
                <TableCell className="text-center font-semibold">
                  {stats.points}
                </TableCell>
                <TableCell className="text-center text-xs">
                  {stats.fg2Made}/{stats.fg2Attempted}
                  <br />
                  <span className="text-muted-foreground">
                    {calculatePercentage(stats.fg2Made, stats.fg2Attempted)}%
                  </span>
                </TableCell>
                <TableCell className="text-center text-xs">
                  {stats.fg3Made}/{stats.fg3Attempted}
                  <br />
                  <span className="text-muted-foreground">
                    {calculatePercentage(stats.fg3Made, stats.fg3Attempted)}%
                  </span>
                </TableCell>
                <TableCell className="text-center text-xs">
                  {stats.ftMade}/{stats.ftAttempted}
                  <br />
                  <span className="text-muted-foreground">
                    {calculatePercentage(stats.ftMade, stats.ftAttempted)}%
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {stats.rebounds}
                  <br />
                  <span className="text-xs text-muted-foreground">
                    {stats.reboundsOffensive}+{stats.reboundsDefensive}
                  </span>
                </TableCell>
                <TableCell className="text-center">{stats.assists}</TableCell>
                <TableCell className="text-center">{stats.steals}</TableCell>
                <TableCell className="text-center">{stats.turnovers}</TableCell>
                <TableCell className="text-center">{stats.blocks}</TableCell>
                <TableCell className="text-center">
                  {stats.blocksReceived}
                </TableCell>
                <TableCell className="text-center">
                  {stats.foulsCommitted}
                </TableCell>
                <TableCell className="text-center">
                  {stats.foulsReceived}
                </TableCell>
                <TableCell className="text-center font-semibold">
                  {calculateValuation(stats)}
                </TableCell>
              </TableRow>
            );
          })}
          {/* Team Totals */}
          <TableRow className="font-bold bg-muted/50">
            <TableCell>{t("box_score.total")}</TableCell>
            <TableCell className="text-center">-</TableCell>
            <TableCell className="text-center">
              {teamStats.reduce((sum, s) => sum + s.points, 0)}
            </TableCell>
            <TableCell className="text-center text-xs">
              {teamStats.reduce((sum, s) => sum + s.fg2Made, 0)}/
              {teamStats.reduce((sum, s) => sum + s.fg2Attempted, 0)}
            </TableCell>
            <TableCell className="text-center text-xs">
              {teamStats.reduce((sum, s) => sum + s.fg3Made, 0)}/
              {teamStats.reduce((sum, s) => sum + s.fg3Attempted, 0)}
            </TableCell>
            <TableCell className="text-center text-xs">
              {teamStats.reduce((sum, s) => sum + s.ftMade, 0)}/
              {teamStats.reduce((sum, s) => sum + s.ftAttempted, 0)}
            </TableCell>
            <TableCell className="text-center">
              {teamStats.reduce((sum, s) => sum + s.rebounds, 0)}
            </TableCell>
            <TableCell className="text-center">
              {teamStats.reduce((sum, s) => sum + s.assists, 0)}
            </TableCell>
            <TableCell className="text-center">
              {teamStats.reduce((sum, s) => sum + s.steals, 0)}
            </TableCell>
            <TableCell className="text-center">
              {teamStats.reduce((sum, s) => sum + s.turnovers, 0)}
            </TableCell>
            <TableCell className="text-center">
              {teamStats.reduce((sum, s) => sum + s.blocks, 0)}
            </TableCell>
            <TableCell className="text-center">
              {teamStats.reduce((sum, s) => sum + s.blocksReceived, 0)}
            </TableCell>
            <TableCell className="text-center">
              {teamStats.reduce((sum, s) => sum + s.foulsCommitted, 0)}
            </TableCell>
            <TableCell className="text-center">
              {teamStats.reduce((sum, s) => sum + s.foulsReceived, 0)}
            </TableCell>
            <TableCell className="text-center">
              {teamStats.reduce((sum, s) => sum + calculateValuation(s), 0)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </ScrollArea>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {t("box_score.title")}
          </DialogTitle>
          <DialogDescription>{t("box_score.description")}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="home">{homeTeam.name}</TabsTrigger>
            <TabsTrigger value="away">{awayTeam.name}</TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="mt-4">
            {renderStatsTable(homePlayerStats, homeTeam)}
          </TabsContent>

          <TabsContent value="away" className="mt-4">
            {renderStatsTable(awayPlayerStats, awayTeam)}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
