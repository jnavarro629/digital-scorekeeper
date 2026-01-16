import React, { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Users, Clock, Palette, Play } from "lucide-react";
import { toast } from "sonner";

export const GameSetup = () => {
  const { t } = useTranslation();
  const {
    setTeamConfig,
    setQuarterDuration,
    setGameInfo,
    completeConfiguration,
  } = useGameStore();

  const [homeTeamName, setHomeTeamName] = useState("");
  const [homeTeamColor, setHomeTeamColor] = useState("#0074ff");
  const [homePlayers, setHomePlayers] = useState(Array(12).fill(""));
  const [homePlayerNumbers, setHomePlayerNumbers] = useState(
    Array(12)
      .fill("")
      .map((_, i) => i + 1)
  );

  const [awayTeamName, setAwayTeamName] = useState("");
  const [awayTeamColor, setAwayTeamColor] = useState("#ff4757");
  const [awayPlayers, setAwayPlayers] = useState(Array(12).fill(""));
  const [awayPlayerNumbers, setAwayPlayerNumbers] = useState(
    Array(12)
      .fill("")
      .map((_, i) => i + 1)
  );

  const [quarterDuration, setQuarterDurationLocal] = useState(10);
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");

  const handleHomePlayerChange = (index, value) => {
    const newPlayers = [...homePlayers];
    newPlayers[index] = value;
    setHomePlayers(newPlayers);
  };

  const handleHomePlayerNumberChange = (index, value) => {
    const newNumbers = [...homePlayerNumbers];
    newNumbers[index] = parseInt(value) || index + 1;
    setHomePlayerNumbers(newNumbers);
  };

  const handleAwayPlayerChange = (index, value) => {
    const newPlayers = [...awayPlayers];
    newPlayers[index] = value;
    setAwayPlayers(newPlayers);
  };

  const handleAwayPlayerNumberChange = (index, value) => {
    const newNumbers = [...awayPlayerNumbers];
    newNumbers[index] = parseInt(value) || index + 1;
    setAwayPlayerNumbers(newNumbers);
  };

  const handleStartGame = () => {
    // Validation
    if (!homeTeamName.trim()) {
      toast.error(t("game_setup.validation_home_name"));
      return;
    }
    if (!awayTeamName.trim()) {
      toast.error(t("game_setup.validation_away_name"));
      return;
    }

    const homePlayersFiltered = homePlayers
      .map((name, idx) => ({
        name:
          name.trim() ||
          `${t("game_setup.player_placeholder_prefix")} ${idx + 1}`,
        number: homePlayerNumbers[idx],
      }))
      .filter((_, idx) => idx < 12);

    const awayPlayersFiltered = awayPlayers
      .map((name, idx) => ({
        name:
          name.trim() ||
          `${t("game_setup.player_placeholder_prefix")} ${idx + 1}`,
        number: awayPlayerNumbers[idx],
      }))
      .filter((_, idx) => idx < 12);

    // Save configuration
    setTeamConfig("home", {
      name: homeTeamName.trim(),
      color: homeTeamColor,
      players: homePlayersFiltered,
    });

    setTeamConfig("away", {
      name: awayTeamName.trim(),
      color: awayTeamColor,
      players: awayPlayersFiltered,
    });

    setQuarterDuration(quarterDuration);
    setGameInfo({ city, category });
    completeConfiguration();

    toast.success(t("game_setup.success_message"), {
      duration: 1500,
    });
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold font-digital tracking-wide">
            {t("app.title")}
          </h1>
          <p className="text-muted-foreground">{t("app.subtitle")}</p>
        </div>

        {/* Game Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {t("game_setup.configuration_title")}
            </CardTitle>
            <CardDescription>
              {t("game_setup.configuration_desc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">{t("game_setup.city_label")}</Label>
                <Input
                  id="city"
                  placeholder={t("game_setup.city_placeholder")}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">
                  {t("game_setup.category_label")}
                </Label>
                <Input
                  id="category"
                  placeholder={t("game_setup.category_placeholder")}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Label htmlFor="quarter-duration" className="min-w-[200px]">
                {t("game_setup.quarter_duration_label")}
              </Label>
              <Input
                id="quarter-duration"
                type="number"
                min="1"
                max="20"
                value={quarterDuration}
                onChange={(e) =>
                  setQuarterDurationLocal(parseInt(e.target.value) || 10)
                }
                className="max-w-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Teams Configuration */}
        <Tabs defaultValue="home" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="home" className="gap-2">
              <Users className="w-4 h-4" />
              {t("game_setup.home_team_tab")}
            </TabsTrigger>
            <TabsTrigger value="away" className="gap-2">
              <Users className="w-4 h-4" />
              {t("game_setup.away_team_tab")}
            </TabsTrigger>
          </TabsList>

          {/* Home Team */}
          <TabsContent value="home" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("game_setup.home_team_config_title")}</CardTitle>
                <CardDescription>
                  {t("game_setup.home_team_config_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Team Name */}
                <div className="space-y-2">
                  <Label htmlFor="home-name">
                    {t("game_setup.team_name_label")}
                  </Label>
                  <Input
                    id="home-name"
                    placeholder={t("game_setup.home_team_placeholder")}
                    value={homeTeamName}
                    onChange={(e) => setHomeTeamName(e.target.value)}
                  />
                </div>

                {/* Team Color */}
                <div className="space-y-2">
                  <Label
                    htmlFor="home-color"
                    className="flex items-center gap-2"
                  >
                    <Palette className="w-4 h-4" />
                    {t("game_setup.team_color_label")}
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="home-color"
                      type="color"
                      value={homeTeamColor}
                      onChange={(e) => setHomeTeamColor(e.target.value)}
                      className="w-20 h-10 cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground">
                      {homeTeamColor}
                    </span>
                  </div>
                </div>

                {/* Players */}
                <div className="space-y-3">
                  <Label>{t("game_setup.players_label")}</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {homePlayers.map((player, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="99"
                          value={homePlayerNumbers[index]}
                          onChange={(e) =>
                            handleHomePlayerNumberChange(index, e.target.value)
                          }
                          className="w-16"
                          placeholder="#"
                        />
                        <Input
                          placeholder={`${t(
                            "game_setup.player_placeholder_prefix"
                          )} ${index + 1}`}
                          value={player}
                          onChange={(e) =>
                            handleHomePlayerChange(index, e.target.value)
                          }
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Away Team */}
          <TabsContent value="away" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("game_setup.away_team_config_title")}</CardTitle>
                <CardDescription>
                  {t("game_setup.away_team_config_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Team Name */}
                <div className="space-y-2">
                  <Label htmlFor="away-name">
                    {t("game_setup.team_name_label")}
                  </Label>
                  <Input
                    id="away-name"
                    placeholder={t("game_setup.away_team_placeholder")}
                    value={awayTeamName}
                    onChange={(e) => setAwayTeamName(e.target.value)}
                  />
                </div>

                {/* Team Color */}
                <div className="space-y-2">
                  <Label
                    htmlFor="away-color"
                    className="flex items-center gap-2"
                  >
                    <Palette className="w-4 h-4" />
                    {t("game_setup.team_color_label")}
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="away-color"
                      type="color"
                      value={awayTeamColor}
                      onChange={(e) => setAwayTeamColor(e.target.value)}
                      className="w-20 h-10 cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground">
                      {awayTeamColor}
                    </span>
                  </div>
                </div>

                {/* Players */}
                <div className="space-y-3">
                  <Label>{t("game_setup.players_label")}</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {awayPlayers.map((player, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="99"
                          value={awayPlayerNumbers[index]}
                          onChange={(e) =>
                            handleAwayPlayerNumberChange(index, e.target.value)
                          }
                          className="w-16"
                          placeholder="#"
                        />
                        <Input
                          placeholder={`${t(
                            "game_setup.player_placeholder_prefix"
                          )} ${index + 1}`}
                          value={player}
                          onChange={(e) =>
                            handleAwayPlayerChange(index, e.target.value)
                          }
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Start Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleStartGame}
            size="lg"
            className="gap-2 font-semibold text-lg px-8"
          >
            <Play className="w-5 h-5" />
            {t("game_setup.start_game_button")}
          </Button>
        </div>
      </div>
    </div>
  );
};
