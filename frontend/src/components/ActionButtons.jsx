import React, { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import {
  Plus,
  Minus,
  AlertCircle,
  Hand,
  Users as UsersIcon,
  Shield,
  Ban,
  TrendingUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { toast } from "sonner";

export const ActionButtons = () => {
  const { t } = useTranslation();
  const {
    selectedPlayer,
    clearSelection,
    addPoints,
    addMissedShot,
    addRebound,
    addAssist,
    addSteal,
    addTurnover,
    addBlock,
    addBlockReceived,
    addFoul,
    addFoulReceived,
    homeTeam,
    awayTeam,
    homePlayerStats,
    awayPlayerStats,
    homeActivePlayers,
    awayActivePlayers,
  } = useGameStore();

  const [actionDialog, setActionDialog] = useState({ open: false, type: null });
  const [shotType, setShotType] = useState("2pt");
  const [reboundType, setReboundType] = useState("defensive");
  const [foulType, setFoulType] = useState("personal");
  const [secondaryAction, setSecondaryAction] = useState(null);
  const [freeThrowCount, setFreeThrowCount] = useState(1);
  const [currentFreeThrow, setCurrentFreeThrow] = useState(1);
  const [freeThrowPlayer, setFreeThrowPlayer] = useState(null);

  if (!selectedPlayer) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg z-50">
        <div className="max-w-4xl mx-auto text-center text-muted-foreground">
          {t("action_buttons.select_player_prompt")}
        </div>
      </div>
    );
  }

  const getSelectedPlayerName = () => {
    const teamData = selectedPlayer.team === "home" ? homeTeam : awayTeam;
    return teamData.players[selectedPlayer.index]?.name || "";
  };

  const getOpponentTeam = () => {
    return selectedPlayer.team === "home" ? "away" : "home";
  };

  const getOpponentPlayers = () => {
    const opponentTeam = getOpponentTeam();
    const teamData = opponentTeam === "home" ? homeTeam : awayTeam;
    return teamData.players;
  };

  const getActiveOpponentPlayers = () => {
    const opponentTeam = getOpponentTeam();
    const teamData = opponentTeam === "home" ? homeTeam : awayTeam;
    const activePlayers =
      opponentTeam === "home" ? homeActivePlayers : awayActivePlayers;
    return activePlayers.map((index) => ({
      ...teamData.players[index],
      originalIndex: index,
    }));
  };

  const getActiveSameTeamPlayers = () => {
    const teamData = selectedPlayer.team === "home" ? homeTeam : awayTeam;
    const activePlayers =
      selectedPlayer.team === "home" ? homeActivePlayers : awayActivePlayers;
    return activePlayers
      .filter((index) => index !== selectedPlayer.index)
      .map((index) => ({ ...teamData.players[index], originalIndex: index }));
  };

  const handlePointsClick = () => {
    setActionDialog({ open: true, type: "points" });
    setShotType("2pt");
  };

  const handleConfirmPoints = (made) => {
    if (made) {
      const points = shotType === "3pt" ? 3 : shotType === "2pt" ? 2 : 1;
      addPoints(selectedPlayer.team, selectedPlayer.index, points, shotType);

      // Check for assist (only for 2pt and 3pt)
      if (shotType !== "1pt") {
        setSecondaryAction({ type: "assist", shotType });
        setActionDialog({ open: true, type: "assist-question" });
        return;
      }

      toast.success(t("toasts.points_scored", { points }), { duration: 1500 });
      clearSelection();
    } else {
      addMissedShot(selectedPlayer.team, selectedPlayer.index, shotType);
      // Ask about rebound after missed shot
      setSecondaryAction({ type: "missed-shot-rebound", shotType });
      setActionDialog({ open: true, type: "rebound-question" });
      return;
    }
    setActionDialog({ open: false, type: null });
  };

  const handleAssistQuestion = (hasAssist) => {
    if (hasAssist) {
      setActionDialog({ open: true, type: "assist-player" });
    } else {
      const points = secondaryAction.shotType === "3pt" ? 3 : 2;
      toast.success(t("toasts.points_scored", { points }));
      clearSelection();
      setActionDialog({ open: false, type: null });
      setSecondaryAction(null);
    }
  };

  const handleAssistPlayer = (playerIndex) => {
    addAssist(selectedPlayer.team, playerIndex);
    const points = secondaryAction.shotType === "3pt" ? 3 : 2;
    toast.success(t("toasts.points_with_assist", { points }), {
      duration: 1500,
    });
    clearSelection();
    setActionDialog({ open: false, type: null });
    setSecondaryAction(null);
  };

  const handleReboundQuestion = (hasRebound) => {
    if (hasRebound) {
      setActionDialog({ open: true, type: "rebound-type" });
    } else {
      toast.info(t("toasts.shot_missed"), { duration: 1500 });
      clearSelection();
      setActionDialog({ open: false, type: null });
      setSecondaryAction(null);
    }
  };

  const handleReboundType = (type) => {
    setReboundType(type);
    setActionDialog({ open: true, type: "rebound-player" });
  };

  const handleReboundPlayer = (team, playerIndex) => {
    if (team && playerIndex !== null) {
      addRebound(team, playerIndex, reboundType);
      toast.success(
        t("toasts.rebound_registered", {
          type:
            reboundType === "offensive"
              ? t("actions_dialogs.rebound_offensive")
              : t("actions_dialogs.rebound_defensive"),
        }),
        { duration: 1500 }
      );
    } else {
      // Team rebound
      toast.success(t("toasts.team_rebound_registered"), { duration: 1500 });
    }
    clearSelection();
    setActionDialog({ open: false, type: null });
    setSecondaryAction(null);
  };

  const handleFoulClick = () => {
    setActionDialog({ open: true, type: "foul" });
    setFoulType("personal");
  };

  const handleConfirmFoul = () => {
    addFoul(selectedPlayer.team, selectedPlayer.index, foulType);

    // Only ask for foul received on personal and unsportsmanlike fouls
    if (foulType === "personal" || foulType === "unsportsmanlike") {
      setActionDialog({ open: true, type: "foul-received" });
    } else {
      toast.success(t("toasts.foul_registered"), { duration: 1500 });
      clearSelection();
      setActionDialog({ open: false, type: null });
    }
  };

  const handleFoulReceived = (playerIndex) => {
    addFoulReceived(getOpponentTeam(), playerIndex);
    // Store the player who received the foul
    setFreeThrowPlayer({ team: getOpponentTeam(), index: playerIndex });
    // Ask directly about free throws (skip "shooting foul" question)
    setActionDialog({ open: true, type: "free-throw-count" });
  };

  const handleFreeThrowCount = (count) => {
    if (count === 0) {
      // No free throws
      toast.success(t("toasts.foul_registered"), { duration: 1500 });
      clearSelection();
      setActionDialog({ open: false, type: null });
      setFreeThrowPlayer(null);
    } else {
      setFreeThrowCount(count);
      setCurrentFreeThrow(1);
      setActionDialog({ open: true, type: "free-throw-attempt" });
    }
  };

  const handleFreeThrowAttempt = (made) => {
    const { team, index } = freeThrowPlayer;

    if (made) {
      // Add the free throw point
      addPoints(team, index, 1, "1pt");
    } else {
      // Missed free throw
      addMissedShot(team, index, "1pt");
    }

    // Check if this is the last free throw
    if (currentFreeThrow < freeThrowCount) {
      // More free throws to go
      setCurrentFreeThrow(currentFreeThrow + 1);
      setActionDialog({ open: true, type: "free-throw-attempt" });
    } else {
      // Last free throw
      if (!made) {
        // If last free throw was missed, ask about rebound
        setSecondaryAction({ type: "free-throw-missed-rebound" });
        setActionDialog({ open: true, type: "rebound-question" });
      } else {
        toast.success(t("toasts.free_throw_foul_registered"), {
          duration: 1500,
        });
        clearSelection();
        setActionDialog({ open: false, type: null });
        setFreeThrowPlayer(null);
      }
    }
  };

  const handleReboundClick = () => {
    setActionDialog({ open: true, type: "rebound" });
    setReboundType("defensive");
  };

  const handleConfirmRebound = () => {
    addRebound(selectedPlayer.team, selectedPlayer.index, reboundType);
    toast.success(
      t("toasts.rebound_registered", {
        type:
          reboundType === "offensive"
            ? t("actions_dialogs.rebound_offensive")
            : t("actions_dialogs.rebound_defensive"),
      }),
      { duration: 1500 }
    );
    clearSelection();
    setActionDialog({ open: false, type: null });
  };

  const handleStealClick = () => {
    addSteal(selectedPlayer.team, selectedPlayer.index);
    setActionDialog({ open: true, type: "steal-turnover" });
  };

  const handleStealTurnover = (playerIndex) => {
    addTurnover(getOpponentTeam(), playerIndex);
    toast.success(t("toasts.steal_registered"), { duration: 1500 });
    clearSelection();
    setActionDialog({ open: false, type: null });
  };

  const handleTurnoverClick = () => {
    addTurnover(selectedPlayer.team, selectedPlayer.index);
    setActionDialog({ open: true, type: "turnover-steal" });
  };

  const handleTurnoverSteal = (hasSteal, playerIndex) => {
    if (hasSteal && playerIndex !== null) {
      addSteal(getOpponentTeam(), playerIndex);
      toast.success(t("toasts.turnover_steal_registered"), { duration: 1500 });
    } else {
      toast.success(t("toasts.turnover_registered"), { duration: 1500 });
    }
    clearSelection();
    setActionDialog({ open: false, type: null });
  };

  const handleBlockClick = () => {
    addBlock(selectedPlayer.team, selectedPlayer.index);
    setActionDialog({ open: true, type: "block-shot-type" });
  };

  const handleBlockShotType = (shotType) => {
    setShotType(shotType);
    setActionDialog({ open: true, type: "block-received" });
  };

  const handleBlockReceived = (playerIndex) => {
    addBlockReceived(getOpponentTeam(), playerIndex);
    // Add missed shot for blocked player
    addMissedShot(getOpponentTeam(), playerIndex, shotType);
    // Store block info for rebound question
    setSecondaryAction({ type: "block-rebound", shotType });
    setActionDialog({ open: true, type: "rebound-question" });
  };

  const renderSecondaryDialog = () => {
    if (!actionDialog.open) return null;

    const activeOpponentPlayers = getActiveOpponentPlayers();
    const activeSameTeamPlayers = getActiveSameTeamPlayers();

    switch (actionDialog.type) {
      case "free-throw-count":
        return (
          <Dialog
            open={true}
            onOpenChange={(open) =>
              !open && setActionDialog({ open: false, type: null })
            }
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t("actions_dialogs.free_throws_title")}
                </DialogTitle>
                <DialogDescription>
                  {t("actions_dialogs.free_throws_question")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleFreeThrowCount(0)}
                  className="w-full"
                >
                  {t("actions_dialogs.no_free_throws")}
                </Button>
                <Button
                  onClick={() => handleFreeThrowCount(1)}
                  className="w-full"
                >
                  {t("actions_dialogs.one_free_throw")}
                </Button>
                <Button
                  onClick={() => handleFreeThrowCount(2)}
                  className="w-full"
                >
                  {t("actions_dialogs.two_free_throws")}
                </Button>
                <Button
                  onClick={() => handleFreeThrowCount(3)}
                  className="w-full"
                >
                  {t("actions_dialogs.three_free_throws")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        );

      case "free-throw-attempt":
        const ftPlayerTeam =
          freeThrowPlayer.team === "home" ? homeTeam : awayTeam;
        const ftPlayer = ftPlayerTeam.players[freeThrowPlayer.index];

        return (
          <Dialog
            open={true}
            onOpenChange={(open) =>
              !open && setActionDialog({ open: false, type: null })
            }
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t("actions_dialogs.free_throw_attempt_title", {
                    current: currentFreeThrow,
                    total: freeThrowCount,
                  })}
                </DialogTitle>
                <DialogDescription>
                  {ftPlayerTeam.name} - #{ftPlayer.number} {ftPlayer.name}
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => handleFreeThrowAttempt(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button onClick={() => handleFreeThrowAttempt(true)}>
                  {t("actions_dialogs.shot_made")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        );

      case "rebound-question":
        return (
          <Dialog
            open={true}
            onOpenChange={(open) =>
              !open && setActionDialog({ open: false, type: null })
            }
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t("actions_dialogs.rebound_question_title")}
                </DialogTitle>
                <DialogDescription>
                  {t("actions_dialogs.rebound_question_desc")}
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => handleReboundQuestion(false)}
                >
                  {t("common.no")}
                </Button>
                <Button onClick={() => handleReboundQuestion(true)}>
                  {t("common.yes")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        );

      case "rebound-type":
        return (
          <Dialog
            open={true}
            onOpenChange={(open) =>
              !open && setActionDialog({ open: false, type: null })
            }
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t("actions_dialogs.rebound_type_title")}
                </DialogTitle>
                <DialogDescription>
                  {t("actions_dialogs.rebound_type_question")}
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => handleReboundType("defensive")}
                >
                  {t("actions_dialogs.rebound_defensive")}
                </Button>
                <Button onClick={() => handleReboundType("offensive")}>
                  {t("actions_dialogs.rebound_offensive")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        );

      case "rebound-player":
        const reboundTeam =
          reboundType === "offensive" ? selectedPlayer.team : getOpponentTeam();
        const reboundTeamData = reboundTeam === "home" ? homeTeam : awayTeam;
        const reboundPlayers = reboundTeamData.players;

        return (
          <Dialog
            open={true}
            onOpenChange={(open) =>
              !open && setActionDialog({ open: false, type: null })
            }
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t("actions_dialogs.rebound_player_title")}
                </DialogTitle>
                <DialogDescription>
                  {t("actions_dialogs.rebound_player_desc", {
                    team: reboundTeamData.name,
                  })}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleReboundPlayer(null, null)}
                >
                  {t("actions_dialogs.team_rebound")}
                </Button>
                {reboundPlayers.map((player, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleReboundPlayer(reboundTeam, index)}
                  >
                    #{player.number} {player.name}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        );

      case "assist-question":
        return (
          <Dialog
            open={true}
            onOpenChange={(open) =>
              !open && setActionDialog({ open: false, type: null })
            }
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t("actions_dialogs.assist_question_title")}
                </DialogTitle>
                <DialogDescription>
                  {t("actions_dialogs.assist_question_desc")}
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => handleAssistQuestion(false)}
                >
                  {t("common.no")}
                </Button>
                <Button onClick={() => handleAssistQuestion(true)}>
                  {t("common.yes")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        );

      case "assist-player":
        return (
          <Dialog
            open={true}
            onOpenChange={(open) =>
              !open && setActionDialog({ open: false, type: null })
            }
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t("actions_dialogs.assist_player_title")}
                </DialogTitle>
                <DialogDescription>
                  {t("actions_dialogs.assist_player_desc")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {activeSameTeamPlayers.map((player) => (
                  <Button
                    key={player.originalIndex}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleAssistPlayer(player.originalIndex)}
                  >
                    #{player.number} {player.name}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        );

      case "foul-received":
        return (
          <Dialog
            open={true}
            onOpenChange={(open) =>
              !open && setActionDialog({ open: false, type: null })
            }
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t("actions_dialogs.foul_received_title")}
                </DialogTitle>
                <DialogDescription>
                  {t("actions_dialogs.foul_received_desc")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {activeOpponentPlayers.map((player) => (
                  <Button
                    key={player.originalIndex}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleFoulReceived(player.originalIndex)}
                  >
                    #{player.number} {player.name}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        );

      case "steal-turnover":
        return (
          <Dialog
            open={true}
            onOpenChange={(open) =>
              !open && setActionDialog({ open: false, type: null })
            }
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t("actions_dialogs.turnover_caused_title")}
                </DialogTitle>
                <DialogDescription>
                  {t("actions_dialogs.turnover_caused_desc")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {activeOpponentPlayers.map((player) => (
                  <Button
                    key={player.originalIndex}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleStealTurnover(player.originalIndex)}
                  >
                    #{player.number} {player.name}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        );

      case "turnover-steal":
        return (
          <Dialog
            open={true}
            onOpenChange={(open) =>
              !open && setActionDialog({ open: false, type: null })
            }
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t("actions_dialogs.steal_question_title")}
                </DialogTitle>
                <DialogDescription>
                  {t("actions_dialogs.steal_question_desc")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleTurnoverSteal(false, null)}
                >
                  {t("actions_dialogs.no_steal")}
                </Button>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {activeOpponentPlayers.map((player) => (
                    <Button
                      key={player.originalIndex}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() =>
                        handleTurnoverSteal(true, player.originalIndex)
                      }
                    >
                      #{player.number} {player.name}
                    </Button>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );

      case "block-shot-type":
        return (
          <Dialog
            open={true}
            onOpenChange={(open) =>
              !open && setActionDialog({ open: false, type: null })
            }
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t("actions_dialogs.block_shot_type_title")}
                </DialogTitle>
                <DialogDescription>
                  {t("actions_dialogs.block_shot_type_desc")}
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => handleBlockShotType("2pt")}>
                  {t("actions_dialogs.shot_2pt")}
                </Button>
                <Button onClick={() => handleBlockShotType("3pt")}>
                  {t("actions_dialogs.shot_3pt")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        );

      case "block-received":
        return (
          <Dialog
            open={true}
            onOpenChange={(open) =>
              !open && setActionDialog({ open: false, type: null })
            }
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t("actions_dialogs.block_received_title")}
                </DialogTitle>
                <DialogDescription>
                  {t("actions_dialogs.block_received_desc")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {activeOpponentPlayers.map((player) => (
                  <Button
                    key={player.originalIndex}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleBlockReceived(player.originalIndex)}
                  >
                    #{player.number} {player.name}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
        <div className="max-w-4xl mx-auto p-4 space-y-3">
          {/* Selected Player Info */}
          <div className="text-center">
            <div className="text-sm text-muted-foreground">
              {t("action_buttons.selected_player_label")}
            </div>
            <div className="font-semibold text-lg">
              {getSelectedPlayerName()}
            </div>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2">
            <Button
              variant="default"
              onClick={handlePointsClick}
              className="flex flex-col h-16 gap-1"
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs">{t("action_buttons.points")}</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleFoulClick}
              className="flex flex-col h-16 gap-1"
            >
              <AlertCircle className="h-5 w-5" />
              <span className="text-xs">{t("action_buttons.foul")}</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleReboundClick}
              className="flex flex-col h-16 gap-1"
            >
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs">{t("action_buttons.rebound")}</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleStealClick}
              className="flex flex-col h-16 gap-1"
            >
              <Hand className="h-5 w-5" />
              <span className="text-xs">{t("action_buttons.steal")}</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleTurnoverClick}
              className="flex flex-col h-16 gap-1"
            >
              <Ban className="h-5 w-5" />
              <span className="text-xs">{t("action_buttons.turnover")}</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleBlockClick}
              className="flex flex-col h-16 gap-1"
            >
              <Shield className="h-5 w-5" />
              <span className="text-xs">{t("action_buttons.block")}</span>
            </Button>

            <Button
              variant="ghost"
              onClick={clearSelection}
              className="flex flex-col h-16 gap-1 col-span-2 md:col-span-1 lg:col-span-2"
            >
              <Minus className="h-5 w-5" />
              <span className="text-xs">{t("common.cancel")}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Points Dialog */}
      {actionDialog.open && actionDialog.type === "points" && (
        <Dialog
          open={true}
          onOpenChange={(open) =>
            !open && setActionDialog({ open: false, type: null })
          }
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("actions_dialogs.register_points_title")}
              </DialogTitle>
              <DialogDescription>
                {t("actions_dialogs.register_points_desc")}{" "}
                {getSelectedPlayerName()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <RadioGroup value={shotType} onValueChange={setShotType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1pt" id="1pt" />
                  <Label htmlFor="1pt" className="cursor-pointer">
                    {t("actions_dialogs.shot_1pt")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2pt" id="2pt" />
                  <Label htmlFor="2pt" className="cursor-pointer">
                    {t("actions_dialogs.shot_2pt")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3pt" id="3pt" />
                  <Label htmlFor="3pt" className="cursor-pointer">
                    {t("actions_dialogs.shot_3pt")}
                  </Label>
                </div>
              </RadioGroup>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => handleConfirmPoints(false)}
                >
                  {t("actions_dialogs.shot_missed")}
                </Button>
                <Button onClick={() => handleConfirmPoints(true)}>
                  {t("actions_dialogs.shot_made")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Foul Dialog */}
      {actionDialog.open && actionDialog.type === "foul" && (
        <Dialog
          open={true}
          onOpenChange={(open) =>
            !open && setActionDialog({ open: false, type: null })
          }
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("actions_dialogs.foul_type_title")}</DialogTitle>
              <DialogDescription>
                {t("actions_dialogs.foul_type_desc")} {getSelectedPlayerName()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <RadioGroup value={foulType} onValueChange={setFoulType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="personal" id="personal" />
                  <Label htmlFor="personal" className="cursor-pointer">
                    {t("actions_dialogs.foul_personal")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="technical" id="technical" />
                  <Label htmlFor="technical" className="cursor-pointer">
                    {t("actions_dialogs.foul_technical")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="unsportsmanlike"
                    id="unsportsmanlike"
                  />
                  <Label htmlFor="unsportsmanlike" className="cursor-pointer">
                    {t("actions_dialogs.foul_unsportsmanlike")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="disqualifying" id="disqualifying" />
                  <Label htmlFor="disqualifying" className="cursor-pointer">
                    {t("actions_dialogs.foul_disqualifying")}
                  </Label>
                </div>
              </RadioGroup>
              <div className="flex justify-end">
                <Button onClick={handleConfirmFoul}>
                  {t("common.confirm")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Rebound Dialog */}
      {actionDialog.open && actionDialog.type === "rebound" && (
        <Dialog
          open={true}
          onOpenChange={(open) =>
            !open && setActionDialog({ open: false, type: null })
          }
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("actions_dialogs.rebound_type_title")}
              </DialogTitle>
              <DialogDescription>
                {t("actions_dialogs.rebound_type_desc")}{" "}
                {getSelectedPlayerName()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <RadioGroup value={reboundType} onValueChange={setReboundType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="defensive" id="defensive" />
                  <Label htmlFor="defensive" className="cursor-pointer">
                    {t("actions_dialogs.rebound_defensive")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="offensive" id="offensive" />
                  <Label htmlFor="offensive" className="cursor-pointer">
                    {t("actions_dialogs.rebound_offensive")}
                  </Label>
                </div>
              </RadioGroup>
              <div className="flex justify-end">
                <Button onClick={handleConfirmRebound}>
                  {t("common.confirm")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Secondary Actions Dialogs */}
      {renderSecondaryDialog()}
    </>
  );
};
