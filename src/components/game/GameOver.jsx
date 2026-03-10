import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function GameOver({ score, highScore, onRestart, maxCombo }) {
  const isNewHigh = score >= highScore && score > 0;
  const earnedCoins = Math.floor(score / 10);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-6 p-8 bg-card/90 rounded-2xl border border-border max-w-sm mx-4"
      >
        <h2 className="text-4xl font-rubik font-black text-destructive">
          💥 המשחק נגמר!
        </h2>
        
        <div className="text-center space-y-2">
          <p className="text-3xl font-rubik font-bold text-white">{score} נקודות</p>
          {isNewHigh && (
            <motion.p 
              className="text-accent font-rubik font-bold text-lg"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              🏆 שיא חדש!
            </motion.p>
          )}
          <p className="text-muted-foreground font-rubik">שיא: {Math.max(score, highScore)}</p>
          
          <div className="flex gap-4 justify-center pt-2">
            {maxCombo > 0 && (
              <p className="text-orange-400 font-rubik font-bold">
                🔥 קומבו: {maxCombo}
              </p>
            )}
            {earnedCoins > 0 && (
              <p className="text-yellow-400 font-rubik font-bold">
                ⭐ +{earnedCoins}
              </p>
            )}
          </div>
        </div>

        <Button 
          onClick={onRestart}
          className="bg-blue-600 hover:bg-blue-500 text-white font-rubik font-bold text-lg px-10 py-5 rounded-xl shadow-lg shadow-blue-600/40 transition-all hover:scale-105"
        >
          🔄 שחק שוב
        </Button>
      </motion.div>
    </div>
  );
}