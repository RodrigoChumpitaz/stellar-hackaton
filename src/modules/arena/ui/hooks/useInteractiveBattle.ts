"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Card } from "@/modules/cards/domain/types";
import type { CardElement } from "@/modules/cards/domain/constants";
import {
  COMBAT_CONFIG,
  type Combatant,
  type BotIntent,
  type CombatLogEntry,
  type FloatingCombatText,
  calculateElementalMultiplier,
  resolveDamage,
  generateBotIntent,
  forgeCardInBattle,
} from "../../domain/combat-rules";

interface UseInteractiveBattleProps {
  playerName: string;
  playerAvatar: string;
  playerDeck: Card[];
  botRival: {
    name: string;
    avatar: string;
    element: string;
    atk: number;
    def: number;
    speed: number;
    deckPower: number;
  };
  onBurnAndMint?: (burnedA: Card, burnedB: Card, mintedCard: Card) => void;
  onVictoryReward?: (xlmReward: number) => void;
}

export function useInteractiveBattle({
  playerName,
  playerAvatar,
  playerDeck,
  botRival,
  onBurnAndMint,
  onVictoryReward,
}: UseInteractiveBattleProps) {
  // Combatants
  const [player, setPlayer] = useState<Combatant>({
    id: "player",
    name: playerName || "Invocador",
    avatar: playerAvatar || "✦",
    element: "AETHER",
    hp: COMBAT_CONFIG.INITIAL_HP,
    maxHp: COMBAT_CONFIG.INITIAL_HP,
    shield: 0,
    energy: COMBAT_CONFIG.MAX_ENERGY,
    maxEnergy: COMBAT_CONFIG.MAX_ENERGY,
  });

  const [bot, setBot] = useState<Combatant>({
    id: "bot",
    name: botRival.name,
    avatar: botRival.avatar,
    element: (botRival.element as CardElement) || "FIRE",
    hp: COMBAT_CONFIG.INITIAL_HP,
    maxHp: COMBAT_CONFIG.INITIAL_HP,
    shield: 0,
    energy: COMBAT_CONFIG.MAX_ENERGY,
    maxEnergy: COMBAT_CONFIG.MAX_ENERGY,
    isBot: true,
  });

  // Flow & State
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<"player_turn" | "bot_turn" | "victory" | "defeat">("player_turn");
  const [isActing, setIsActing] = useState(false);

  // Deck & Hand
  const [deckPile, setDeckPile] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);

  // Bot Intent
  const [botIntent, setBotIntent] = useState<BotIntent>(() =>
    generateBotIntent(botRival.name, (botRival.element as CardElement) || "FIRE", 1, COMBAT_CONFIG.INITIAL_HP)
  );

  // In-Battle Tactical Forge State
  const [isForgeOpen, setIsForgeOpen] = useState(false);
  const [forgeSlotA, setForgeSlotA] = useState<Card | null>(null);
  const [forgeSlotB, setForgeSlotB] = useState<Card | null>(null);
  const [forgedCardInBattleState, setForgedCardInBattleState] = useState<Card | null>(null);
  const [forgeSuccessMsg, setForgeSuccessMsg] = useState<string | null>(null);

  // Floating notifications & combat logs
  const [floatingTexts, setFloatingTexts] = useState<FloatingCombatText[]>([]);
  const [combatLogs, setCombatLogs] = useState<CombatLogEntry[]>([]);

  const playerDeckRef = useRef(playerDeck);
  playerDeckRef.current = playerDeck;

  // Helpers for feedback
  const addFloatingText = useCallback((text: string, color: FloatingCombatText["color"]) => {
    const id = `float-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setFloatingTexts((prev) => [...prev, { id, text, color }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 2000);
  }, []);

  const addCombatLog = useCallback(
    (actor: string, actionType: CombatLogEntry["actionType"], text: string, damage?: number, shield?: number) => {
      const entry: CombatLogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        round,
        actor,
        actionType,
        text,
        damage,
        shield,
      };
      setCombatLogs((prev) => [entry, ...prev.slice(0, 19)]);
    },
    [round]
  );

  // Initialize deck and draw initial hand
  const initBattle = useCallback(() => {
    const currentDeckSource = playerDeckRef.current || [];
    const pool = currentDeckSource.length > 0 ? [...currentDeckSource] : [];
    // Shuffle pool
    const shuffled = pool.sort(() => Math.random() - 0.5);
    const initialHand = shuffled.slice(0, COMBAT_CONFIG.HAND_SIZE);
    const remainingDeck = shuffled.slice(COMBAT_CONFIG.HAND_SIZE);

    setDeckPile(remainingDeck);
    setHand(initialHand);
    setRound(1);
    setPhase("player_turn");
    setIsActing(false);
    setIsForgeOpen(false);
    setForgeSlotA(null);
    setForgeSlotB(null);
    setForgedCardInBattleState(null);
    setForgeSuccessMsg(null);
    setFloatingTexts([]);

    setPlayer({
      id: "player",
      name: playerName || "Invocador",
      avatar: playerAvatar || "✦",
      element: "AETHER",
      hp: COMBAT_CONFIG.INITIAL_HP,
      maxHp: COMBAT_CONFIG.INITIAL_HP,
      shield: 0,
      energy: COMBAT_CONFIG.MAX_ENERGY,
      maxEnergy: COMBAT_CONFIG.MAX_ENERGY,
    });

    const initialBotIntent = generateBotIntent(
      botRival.name,
      (botRival.element as CardElement) || "FIRE",
      1,
      COMBAT_CONFIG.INITIAL_HP
    );

    setBot({
      id: "bot",
      name: botRival.name,
      avatar: botRival.avatar,
      element: (botRival.element as CardElement) || "FIRE",
      hp: COMBAT_CONFIG.INITIAL_HP,
      maxHp: COMBAT_CONFIG.INITIAL_HP,
      shield: 0,
      energy: COMBAT_CONFIG.MAX_ENERGY,
      maxEnergy: COMBAT_CONFIG.MAX_ENERGY,
      isBot: true,
    });

    setBotIntent(initialBotIntent);
    setCombatLogs([
      {
        id: "start-log",
        round: 1,
        actor: "Arena",
        actionType: "info",
        text: `⚔️ ¡Duelo iniciado! Te enfrentas al ${botRival.name} (Elemento: ${botRival.element}).`,
      },
    ]);
  }, [playerName, playerAvatar, botRival]);

  useEffect(() => {
    initBattle();
  }, [botRival.name, initBattle]);

  // Action: Play Attack Card
  const playAttackCard = useCallback(
    (card: Card) => {
      if (phase !== "player_turn" || isActing || player.energy < 1) return;

      setIsActing(true);
      const rawAtk = card.atk || 6;
      const { multiplier, isAdvantage, label } = calculateElementalMultiplier(card.element, bot.element);
      const finalAtk = Math.max(1, Math.round(rawAtk * multiplier));

      // Consume 1 energy and remove card from hand
      setPlayer((prev) => ({ ...prev, energy: prev.energy - 1 }));
      setHand((prev) => prev.filter((c) => c.id !== card.id));

      const { finalShield, finalHp, absorbedByShield, hpDamage } = resolveDamage(finalAtk, bot.shield, bot.hp);

      setBot((prev) => ({
        ...prev,
        shield: finalShield,
        hp: finalHp,
      }));

      // Visual feedback
      if (isAdvantage) {
        addFloatingText(`💥 ¡CRÍTICO ELEMENTAL! -${finalAtk}`, "amber");
      } else if (absorbedByShield > 0 && hpDamage === 0) {
        addFloatingText(`🛡️ ¡Bloqueado por Escudo! -${absorbedByShield}`, "cyan");
      } else {
        addFloatingText(`-${finalAtk} HP`, "red");
      }

      addCombatLog(
        player.name,
        isAdvantage ? "critical" : "attack",
        `${player.name} jugó "${card.name}" causando ${finalAtk} de daño.${label ? ` (${label})` : ""}`,
        finalAtk
      );

      // Check Bot Defeat
      if (finalHp <= 0) {
        setTimeout(() => {
          setPhase("victory");
          addCombatLog("Arena", "info", `🏆 ¡Victoria! Has derrotado al ${bot.name}.`);
          onVictoryReward?.(COMBAT_CONFIG.VICTORY_XLM_REWARD);
          setIsActing(false);
        }, 800);
        return;
      }

      setTimeout(() => setIsActing(false), 300);
    },
    [phase, isActing, player.energy, player.name, bot.element, bot.shield, bot.hp, bot.name, addFloatingText, addCombatLog, onVictoryReward]
  );

  // Action: Play Defend Card
  const playDefendCard = useCallback(
    (card: Card) => {
      if (phase !== "player_turn" || isActing || player.energy < 1) return;

      setIsActing(true);
      const rawDef = card.def || 6;

      // Consume 1 energy and remove card from hand
      setPlayer((prev) => ({
        ...prev,
        energy: prev.energy - 1,
        shield: prev.shield + rawDef,
      }));
      setHand((prev) => prev.filter((c) => c.id !== card.id));

      addFloatingText(`+${rawDef} Escudo`, "cyan");
      addCombatLog(
        player.name,
        "defend",
        `${player.name} jugó "${card.name}" levantando +${rawDef} de Escudo protector.`,
        undefined,
        rawDef
      );

      setTimeout(() => setIsActing(false), 300);
    },
    [phase, isActing, player.energy, player.name, addFloatingText, addCombatLog]
  );

  // In-Battle Tactical Forge: Select slot
  const selectCardForForge = useCallback(
    (card: Card) => {
      if (round > COMBAT_CONFIG.FORGE_MAX_ROUND) return;

      if (!forgeSlotA) {
        setForgeSlotA(card);
      } else if (!forgeSlotB && forgeSlotA.id !== card.id) {
        setForgeSlotB(card);
      } else if (forgeSlotA.id === card.id) {
        setForgeSlotA(null);
      } else if (forgeSlotB?.id === card.id) {
        setForgeSlotB(null);
      }
    },
    [round, forgeSlotA, forgeSlotB]
  );

  // In-Battle Tactical Forge: Execute fusion
  const executeInBattleForge = useCallback(() => {
    if (round > COMBAT_CONFIG.FORGE_MAX_ROUND) return;
    if (!forgeSlotA || !forgeSlotB || player.energy < 2 || isActing) return;

    setIsActing(true);

    const forgedCard = forgeCardInBattle(forgeSlotA, forgeSlotB, round);

    // Consume 2 energy
    setPlayer((prev) => ({ ...prev, energy: prev.energy - 2 }));

    // Burn the 2 parent cards from hand and insert the newly forged card
    setHand((prev) => {
      const filtered = prev.filter((c) => c.id !== forgeSlotA.id && c.id !== forgeSlotB.id);
      return [forgedCard, ...filtered];
    });

    // Notify parent to burn the 2 cards and mint the new one permanently in userDeck!
    onBurnAndMint?.(forgeSlotA, forgeSlotB, forgedCard);

    setForgedCardInBattleState(forgedCard);
    setForgeSuccessMsg(`¡${forgedCard.name} forjada con éxito! (+25% bono de combate)`);

    addFloatingText(`⚡ ¡FORJA EXITOSA!`, "purple");
    addCombatLog(
      player.name,
      "forge",
      `🔥 ¡FORJA TÁCTICA! ${player.name} quemó "${forgeSlotA.name}" y "${forgeSlotB.name}" para forjar a "${forgedCard.name}".`
    );

    // Reset slots
    setForgeSlotA(null);
    setForgeSlotB(null);

    setTimeout(() => {
      setIsActing(false);
      setForgeSuccessMsg(null);
      setIsForgeOpen(false);
    }, 1400);
  }, [round, forgeSlotA, forgeSlotB, player.energy, isActing, player.name, onBurnAndMint, addFloatingText, addCombatLog]);

  // End Player Turn -> Trigger Bot Turn
  const endPlayerTurn = useCallback(() => {
    if (phase !== "player_turn" || isActing) return;

    setPhase("bot_turn");
    setIsActing(true);
    setIsForgeOpen(false);

    // Execute Bot Move after slight realistic delay
    setTimeout(() => {
      const intent = botIntent;

      if (intent.type === "defend") {
        setBot((prev) => ({ ...prev, shield: prev.shield + intent.value }));
        addFloatingText(`🛡️ +${intent.value} Escudo Bot`, "cyan");
        addCombatLog(bot.name, "bot", `${bot.name} ejecutó "${intent.name}" acumulando +${intent.value} de Escudo.`);
      } else {
        // Attack
        const { multiplier, isAdvantage, label } = calculateElementalMultiplier(intent.element, player.element);
        const damage = Math.max(1, Math.round(intent.value * multiplier));

        const { finalShield, finalHp, absorbedByShield, hpDamage } = resolveDamage(damage, player.shield, player.hp);

        setPlayer((prev) => ({
          ...prev,
          shield: finalShield,
          hp: finalHp,
        }));

        if (isAdvantage) {
          addFloatingText(`💥 ¡GOLPE ELEMENTAL DEL BOT! -${damage}`, "red");
        } else if (absorbedByShield > 0 && hpDamage === 0) {
          addFloatingText(`🛡️ ¡Tu escudo absorbió el golpe!`, "cyan");
        } else {
          addFloatingText(`-${damage} HP`, "red");
        }

        addCombatLog(
          bot.name,
          "bot",
          `${bot.name} atacó con "${intent.name}" infligiendo ${damage} de daño.${label ? ` (${label})` : ""}`,
          damage
        );

        // Check Player Defeat
        if (finalHp <= 0) {
          setTimeout(() => {
            setPhase("defeat");
            addCombatLog("Arena", "info", `💥 Has sido derrotado por el ${bot.name}.`);
            setIsActing(false);
          }, 800);
          return;
        }
      }

      // Prepare Next Round
      setTimeout(() => {
        const nextRound = round + 1;
        setRound(nextRound);

        // Draw cards to hand up to 4 without duplicating cards already held in hand
        setHand((prevHand) => {
          const cardsNeeded = COMBAT_CONFIG.HAND_SIZE - prevHand.length;
          if (cardsNeeded <= 0) return prevHand;

          const existingIds = new Set(prevHand.map((c) => c.id));
          let currentDeck = deckPile.filter((c) => !existingIds.has(c.id));

          if (currentDeck.length < cardsNeeded) {
            const pool = (playerDeckRef.current || []).filter((c) => !existingIds.has(c.id));
            currentDeck = pool.sort(() => Math.random() - 0.5);
          }

          const drawn = currentDeck.slice(0, cardsNeeded);
          setDeckPile(currentDeck.slice(cardsNeeded));
          return [...prevHand, ...drawn];
        });

        // Refill player energy
        setPlayer((prev) => ({
          ...prev,
          energy: COMBAT_CONFIG.MAX_ENERGY,
          // Keep 50% of unused shield for tactics
          shield: Math.floor(prev.shield * 0.5),
        }));

        // Reset bot shield and calculate next intent
        setBot((prev) => ({
          ...prev,
          shield: 0,
        }));

        const nextIntent = generateBotIntent(bot.name, bot.element, nextRound, bot.hp);
        setBotIntent(nextIntent);

        setPhase("player_turn");
        setIsActing(false);
        addCombatLog("Arena", "info", `⏳ Ronda ${nextRound} iniciada. Cristales de Energía recargados (3/3).`);
      }, 1000);
    }, 1200);
  }, [phase, isActing, botIntent, bot.name, bot.element, bot.hp, player.element, player.shield, player.hp, round, deckPile, addFloatingText, addCombatLog]);

  return {
    player,
    bot,
    round,
    phase,
    isActing,
    hand,
    botIntent,
    canForge: round <= COMBAT_CONFIG.FORGE_MAX_ROUND && player.energy >= 2,
    forgeSlotA,
    forgeSlotB,
    isForgeOpen,
    forgedCardInBattleState,
    forgeSuccessMsg,
    floatingTexts,
    combatLogs,
    playAttackCard,
    playDefendCard,
    selectCardForForge,
    setIsForgeOpen,
    executeInBattleForge,
    endPlayerTurn,
    initBattle,
  };
}
