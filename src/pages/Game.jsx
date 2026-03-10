import React, { useState, useCallback } from 'react';
import GameCanvas from '../components/game/GameCanvas';
import GameHUD from '../components/game/GameHUD';
import GameMenu from '../components/game/GameMenu';
import GameOver from '../components/game/GameOver';

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

  const handleStart = useCallback(() => {
    setScore(0);
    setLives(3);
    setBonuses({ hasShield: false, hasVintage: false, shieldTimer: 0, vintageTimer: 0 });
    setGameState('playing');
  }, []);

  const handleGameOver = useCallback((finalScore) => {
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('footballDomeHighScore', finalScore.toString());
    }
    setGameState('over');
  }, [highScore]);

  const handleScoreChange = useCallback((newScore) => {
    setScore(newScore);
  }, []);

  const handleLivesChange = useCallback((newLives) => {
    setLives(newLives);
  }, []);

  const handleBonusChange = useCallback((newBonuses) => {
    setBonuses(newBonuses);
  }, []);

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
            />
            <GameCanvas
              gameState={gameState}
              onScoreChange={handleScoreChange}
              onLivesChange={handleLivesChange}
              onGameOver={handleGameOver}
              onBonusChange={handleBonusChange}
            />
          </>
        )}
        
        {gameState === 'menu' && (
          <GameMenu onStart={handleStart} highScore={highScore} />
        )}
        
        {gameState === 'over' && (
          <GameOver score={score} highScore={highScore} onRestart={handleStart} />
        )}
      </div>
    </div>
  );
}