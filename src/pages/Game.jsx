import React, { useState, useCallback, useEffect } from 'react';
import GameCanvas from '../components/game/GameCanvas';
import GameHUD from '../components/game/GameHUD';
import GameMenu from '../components/game/GameMenu';
import GameOver from '../components/game/GameOver';
import AchievementsPanel from '../components/game/AchievementsPanel';
import UpgradesPanel from '../components/game/UpgradesPanel';
import ComboDisplay from '../components/game/ComboDisplay';
import LeaderboardPanel from '../components/game/LeaderboardPanel';
import { base44 } from '@/api/base44Client';

export default function Game() {
  const [gameState, setGameState] = useState('menu'); // menu | playing | over
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('footballDomeHighScore');
    return saved ? parseInt(saved) : 0;
  });
  const [bonuses, setBonuses] = useState({
    hasShield: false,
    hasVintage: false,
    shieldTimer: 0,
    vintageTimer: 0,
  });
  const [currentLevel, setCurrentLevel] = useState(null);
  
  // Gamification states
  const [combo, setCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem('footballDomeCoins');
    return saved ? parseInt(saved) : 0;
  });
  const [achievements, setAchievements] = useState(() => {
    const saved = localStorage.getItem('footballDomeAchievements');
    return saved ? JSON.parse(saved) : {};
  });
  const [upgrades, setUpgrades] = useState(() => {
    const saved = localStorage.getItem('footballDomeUpgrades');
    return saved ? JSON.parse(saved) : {};
  });
  const [stats, setStats] = useState({
    maxCombo: 0,
    bossesDefeated: 0,
    bonusTypesCollected: new Set(),
  });
  const [showAchievements, setShowAchievements] = useState(false);
  const [showUpgrades, setShowUpgrades] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const handleStart = useCallback(() => {
    setScore(0);
    setLives(3);
    setBonuses({ hasShield: false, hasVintage: false, shieldTimer: 0, vintageTimer: 0 });
    setCurrentLevel(null);
    setCombo(0);
    setMultiplier(1);
    setStats({ maxCombo: 0, bossesDefeated: 0, bonusTypesCollected: new Set() });
    setGameState('playing');
  }, []);

  const handleGameOver = useCallback(async (finalScore, earnedCoins) => {
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('footballDomeHighScore', finalScore.toString());
    }
    const newCoins = coins + earnedCoins;
    setCoins(newCoins);
    localStorage.setItem('footballDomeCoins', newCoins.toString());
    
    // Save to global leaderboard
    try {
      const user = await base44.auth.me();
      await base44.entities.HighScore.create({
        player_name: user?.full_name || 'שחקן אנונימי',
        score: finalScore,
        coins: earnedCoins,
        level_reached: currentLevel?.level || 1,
      });
    } catch (error) {
      console.log('Failed to save high score:', error);
    }
    
    setGameState('over');
  }, [highScore, coins, currentLevel]);

  const handleScoreChange = useCallback((newScore) => {
    setScore(newScore);
  }, []);

  const handleLivesChange = useCallback((newLives) => {
    setLives(newLives);
  }, []);

  const handleBonusChange = useCallback((newBonuses) => {
    setBonuses(newBonuses);
  }, []);

  const handleLevelChange = useCallback((newLevel) => {
    setCurrentLevel(newLevel);
  }, []);

  const handleComboChange = useCallback((newCombo, newMultiplier) => {
    setCombo(newCombo);
    setMultiplier(newMultiplier);
    
    if (newCombo > stats.maxCombo) {
      setStats(prev => ({ ...prev, maxCombo: newCombo }));
    }
    
    // Check combo achievements
    if (newCombo >= 10 && !achievements.combo_10) {
      unlockAchievement('combo_10');
    }
    if (newCombo >= 20 && !achievements.combo_20) {
      unlockAchievement('combo_20');
    }
  }, [stats.maxCombo, achievements]);

  const handleBossDefeated = useCallback(() => {
    const newBossCount = stats.bossesDefeated + 1;
    setStats(prev => ({ ...prev, bossesDefeated: newBossCount }));
    
    if (newBossCount >= 1 && !achievements.boss_1) {
      unlockAchievement('boss_1');
    }
    if (newBossCount >= 3 && !achievements.boss_3) {
      unlockAchievement('boss_3');
    }
  }, [stats.bossesDefeated, achievements]);

  const handleBonusCollected = useCallback((bonusType) => {
    const newSet = new Set(stats.bonusTypesCollected);
    newSet.add(bonusType);
    setStats(prev => ({ ...prev, bonusTypesCollected: newSet }));
    
    if (newSet.size >= 3 && !achievements.all_bonuses) {
      unlockAchievement('all_bonuses');
    }
  }, [stats.bonusTypesCollected, achievements]);

  const unlockAchievement = useCallback((achievementId) => {
    const newAchievements = { ...achievements, [achievementId]: true };
    setAchievements(newAchievements);
    localStorage.setItem('footballDomeAchievements', JSON.stringify(newAchievements));
  }, [achievements]);

  const handleUpgrade = useCallback((upgradeId, cost) => {
    if (coins >= cost) {
      const newUpgrades = { ...upgrades, [upgradeId]: (upgrades[upgradeId] || 0) + 1 };
      setUpgrades(newUpgrades);
      localStorage.setItem('footballDomeUpgrades', JSON.stringify(newUpgrades));
      
      const newCoins = coins - cost;
      setCoins(newCoins);
      localStorage.setItem('footballDomeCoins', newCoins.toString());
    }
  }, [coins, upgrades]);

  // Check score achievements
  React.useEffect(() => {
    if (score >= 100 && !achievements.score_100) unlockAchievement('score_100');
    if (score >= 500 && !achievements.score_500) unlockAchievement('score_500');
    if (score >= 1000 && !achievements.score_1000) unlockAchievement('score_1000');
  }, [score, achievements]);

  return (
    <div className="fixed inset-0 bg-background overflow-hidden flex items-center justify-center">
      <div className="relative w-full h-full max-w-[600px]">
        {gameState === 'playing' && (
          <>
            <GameHUD 
              score={score} 
              lives={lives} 
              hasShield={bonuses.hasShield}
              hasVintage={bonuses.hasVintage}
              shieldTimer={bonuses.shieldTimer}
              vintageTimer={bonuses.vintageTimer}
              currentLevel={currentLevel}
              coins={coins}
              onShowAchievements={() => setShowAchievements(true)}
              onShowUpgrades={() => setShowUpgrades(true)}
            />
            <ComboDisplay combo={combo} multiplier={multiplier} />
            <GameCanvas
              gameState={gameState}
              onScoreChange={handleScoreChange}
              onLivesChange={handleLivesChange}
              onGameOver={handleGameOver}
              onBonusChange={handleBonusChange}
              onLevelChange={handleLevelChange}
              onComboChange={handleComboChange}
              onBossDefeated={handleBossDefeated}
              onBonusCollected={handleBonusCollected}
              upgrades={upgrades}
              combo={combo}
              multiplier={multiplier}
            />
          </>
        )}
        
        {gameState === 'menu' && (
          <GameMenu 
            onStart={handleStart} 
            highScore={highScore} 
            coins={coins}
            onShowAchievements={() => setShowAchievements(true)}
            onShowUpgrades={() => setShowUpgrades(true)}
            onShowLeaderboard={() => setShowLeaderboard(true)}
          />
        )}
        
        {gameState === 'over' && (
          <GameOver 
            score={score} 
            highScore={highScore} 
            onRestart={handleStart}
            maxCombo={stats.maxCombo}
          />
        )}

        {showAchievements && (
          <AchievementsPanel 
            achievements={achievements}
            onClose={() => setShowAchievements(false)}
          />
        )}

        {showUpgrades && (
          <UpgradesPanel 
            upgrades={upgrades}
            coins={coins}
            onUpgrade={handleUpgrade}
            onClose={() => setShowUpgrades(false)}
          />
        )}

        {showLeaderboard && (
          <LeaderboardPanel 
            onClose={() => setShowLeaderboard(false)}
          />
        )}
      </div>
    </div>
  );
}