import React from 'react';
import { Heart, Shield, Zap, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GameHUD({ score, lives, hasShield, hasVintage, shieldTimer, vintageTimer, currentLevel, coins, onShowAchievements, onShowUpgrades }) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-start p-3 pointer-events-none">
      <div className="flex flex-col gap-2">
        <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 font-rubik font-bold text-white text-lg">
          ⚽ {score}
        </div>
        {currentLevel && (
          <div className="bg-purple-600/80 backdrop-blur-sm rounded-xl px-3 py-1.5 font-rubik text-white text-sm">
            שלב {currentLevel.level}: {currentLevel.name}
          </div>
        )}
        <div className="flex gap-1">
          {Array.from({ length: lives }).map((_, i) => (
            <Heart key={i} className="w-6 h-6 text-red-500 fill-red-500" />
          ))}
        </div>
      </div>
      
      <div className="flex flex-col gap-2 items-end">
        <div className="bg-accent/80 backdrop-blur-sm rounded-xl px-3 py-1.5 font-rubik text-accent-foreground text-sm font-bold">
          ⭐ {coins}
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={onShowAchievements}
            size="icon"
            className="bg-purple-600/80 hover:bg-purple-700 w-8 h-8"
          >
            <Trophy className="w-4 h-4" />
          </Button>
          <Button 
            onClick={onShowUpgrades}
            size="icon"
            className="bg-blue-600/80 hover:bg-blue-700 w-8 h-8"
          >
            <Sparkles className="w-4 h-4" />
          </Button>
        </div>
        {hasShield && (
          <div className="bg-blue-600/80 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-2 font-rubik text-white text-sm">
            <Shield className="w-4 h-4" />
            הגנה {Math.ceil(shieldTimer / 60)}s
          </div>
        )}
        {hasVintage && (
          <div className="bg-amber-600/80 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-2 font-rubik text-white text-sm">
            <Zap className="w-4 h-4" />
            כדור וינטג׳ {Math.ceil(vintageTimer / 60)}s
          </div>
        )}
      </div>
    </div>
  );
}