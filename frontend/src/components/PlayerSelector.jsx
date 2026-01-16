import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGameStore } from "../store/gameStore";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Users, ArrowLeftRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

export const PlayerSelector = () => {
  const { t } = useTranslation();
  const {
    homeTeam,
    awayTeam,
    homeActivePlayers,
    awayActivePlayers,
    selectedPlayer,
    selectPlayer,
    substitutePlayer,
    homePlayerStats,
    awayPlayerStats,
  } = useGameStore();

  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [subTeam, setSubTeam] = useState(null);
  const [subActiveIndex, setSubActiveIndex] = useState(null);

  const handlePlayerClick = (team, playerIndex) => {
    selectPlayer(team, playerIndex);
  };

  const isPlayerSelected = (team, index) => {
    return selectedPlayer?.team === team && selectedPlayer?.index === index;
  };

  const openSubstitutionDialog = (team, activeIndex) => {
    setSubTeam(team);
    setSubActiveIndex(activeIndex);
    setSubDialogOpen(true);
  };

  const handleSubstitution = (benchIndex) => {
    substitutePlayer(subTeam, subActiveIndex, benchIndex);
    setSubDialogOpen(false);
    setSubTeam(null);
    setSubActiveIndex(null);
  };

  const renderTeamPlayers = (team, activePlayers, teamData, playerStats) => {
    const calculateVal = (stats) => {
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

    return (
      <div className="space-y-3">
        {activePlayers.map((playerIndex, activeIdx) => {
          const player = teamData.players[playerIndex];
          const stats = playerStats[playerIndex];
          const isSelected = isPlayerSelected(team, playerIndex);
          const val = calculateVal(stats);

          return (
            <div key={activeIdx} className="relative">
              <Button
                onClick={() => handlePlayerClick(team, playerIndex)}
                variant={isSelected ? "default" : "outline"}
                className="w-full justify-start h-auto py-3 px-4 relative overflow-hidden"
                style={
                  isSelected
                    ? {
                        backgroundColor: teamData.color,
                        borderColor: teamData.color,
                        color: "#ffffff",
                      }
                    : {}
                }
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{
                        backgroundColor: isSelected
                          ? "rgba(255,255,255,0.2)"
                          : teamData.color + "20",
                        color: isSelected ? "#ffffff" : teamData.color,
                      }}
                    >
                      #{player.number}
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold">{player.name}</div>
                      <div className="flex items-center gap-1.5 text-xs opacity-80 flex-wrap">
                        <span>
                          {stats.points} {t("box_score.points")}
                        </span>
                        <span>
                          {stats.rebounds} {t("box_score.rebounds")}
                        </span>
                        <span>
                          {stats.assists} {t("box_score.assists")}
                        </span>
                        <span className="text-muted-foreground">|</span>
                        <span
                          className="inline-flex items-center justify-center h-5 px-1.5 rounded text-white font-bold gap-0.5"
                          style={{
                            backgroundColor: "#ef4444",
                            fontSize: "10px",
                          }}
                        >
                          <span>{stats.foulsCommitted}</span>
                          <span className="text-[8px]">F</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      openSubstitutionDialog(team, activeIdx);
                    }}
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>
                </div>
              </Button>
            </div>
          );
        })}
      </div>
    );
  };

  const getBenchPlayers = (team) => {
    const activePlayers =
      team === "home" ? homeActivePlayers : awayActivePlayers;
    const teamData = team === "home" ? homeTeam : awayTeam;
    return teamData.players
      .map((player, index) => ({ ...player, originalIndex: index }))
      .filter((_, index) => !activePlayers.includes(index));
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Home Team Players */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {homeTeam.name}
              </span>
              <Badge
                variant="outline"
                style={{
                  backgroundColor: homeTeam.color + "20",
                  color: homeTeam.color,
                  borderColor: homeTeam.color,
                }}
              >
                {t("player_selector.home_badge")}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderTeamPlayers(
              "home",
              homeActivePlayers,
              homeTeam,
              homePlayerStats
            )}
          </CardContent>
        </Card>

        {/* Away Team Players */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {awayTeam.name}
              </span>
              <Badge
                variant="outline"
                style={{
                  backgroundColor: awayTeam.color + "20",
                  color: awayTeam.color,
                  borderColor: awayTeam.color,
                }}
              >
                {t("player_selector.away_badge")}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderTeamPlayers(
              "away",
              awayActivePlayers,
              awayTeam,
              awayPlayerStats
            )}
          </CardContent>
        </Card>
      </div>

      {/* Substitution Dialog */}
      <Dialog open={subDialogOpen} onOpenChange={setSubDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("player_selector.substitution_title")}</DialogTitle>
            <DialogDescription>
              {t("player_selector.substitution_desc")}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-2">
              {subTeam &&
                getBenchPlayers(subTeam).map((player) => {
                  const teamData = subTeam === "home" ? homeTeam : awayTeam;
                  const stats = (
                    subTeam === "home" ? homePlayerStats : awayPlayerStats
                  )[player.originalIndex];
                  const val =
                    stats.points +
                    stats.rebounds +
                    stats.assists +
                    stats.steals +
                    stats.blocks -
                    (stats.fg2Attempted - stats.fg2Made) -
                    (stats.fg3Attempted - stats.fg3Made) -
                    (stats.ftAttempted - stats.ftMade) -
                    stats.turnovers;

                  return (
                    <Button
                      key={player.originalIndex}
                      variant="outline"
                      className="w-full justify-start h-auto py-3"
                      onClick={() => handleSubstitution(player.originalIndex)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                          style={{
                            backgroundColor: teamData.color + "20",
                            color: teamData.color,
                          }}
                        >
                          #{player.number}
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-semibold">{player.name}</div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                            <span>
                              {stats.points} {t("box_score.points")}
                            </span>
                            <span>
                              {stats.rebounds} {t("box_score.rebounds")}
                            </span>
                            <span>
                              {stats.assists} {t("box_score.assists")}
                            </span>
                            <span>|</span>
                            <span
                              className="inline-flex items-center justify-center h-5 px-1.5 rounded text-white font-bold gap-0.5"
                              style={{
                                backgroundColor: "#ef4444",
                                fontSize: "10px",
                              }}
                            >
                              <span>{stats.foulsCommitted}</span>
                              <span className="text-[8px]">F</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Button>
                  );
                })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};
