import React from 'react';
import { Trophy, Medal, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function LeaderboardPanel({ onClose }) {
  const { data: highScores, isLoading } = useQuery({
    queryKey: ['highScores'],
    queryFn: () => base44.entities.HighScore.list('-score', 10),
    initialData: [],
  });

  const getRankIcon = (index) => {
    if (index === 0) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-300" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-muted-foreground font-bold">{index + 1}</span>;
  };

  const getRankBg = (index) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/50';
    if (index === 1) return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50';
    if (index === 2) return 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/50';
    return 'bg-muted/20 border-border/30';
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-card rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-rubik font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-accent" />
            לוח תוצאות
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-white">✕</button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : highScores.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground font-rubik">
            אין עדיין שיאים. היה הראשון!
          </div>
        ) : (
          <div className="space-y-2">
            {highScores.map((score, index) => (
              <motion.div
                key={score.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${getRankBg(index)}`}
              >
                <div className="flex items-center justify-center w-10">
                  {getRankIcon(index)}
                </div>
                <div className="flex-1">
                  <h3 className="font-rubik font-bold text-white">{score.player_name}</h3>
                  <div className="flex gap-3 text-sm">
                    <span className="text-accent">🎯 {score.score}</span>
                    {score.coins > 0 && <span className="text-yellow-400">⭐ {score.coins}</span>}
                    {score.level_reached > 0 && <span className="text-blue-400">📊 שלב {score.level_reached}</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-muted/20 rounded-lg border border-border/30">
          <p className="text-sm text-muted-foreground font-rubik text-center">
            💡 הגע לניקוד גבוה כדי להיכנס ללוח!
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}