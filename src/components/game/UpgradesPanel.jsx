import React from 'react';
import { Zap, User, Circle, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const UPGRADES = [
  { 
    id: 'speed', 
    name: 'מהירות +', 
    icon: Zap, 
    desc: 'שחקן מהיר יותר',
    cost: 200,
    maxLevel: 3
  },
  { 
    id: 'doubleShot', 
    name: 'כדור כפול', 
    icon: Circle, 
    desc: 'ירייה ב-2 כדורים',
    cost: 300,
    maxLevel: 1
  },
  { 
    id: 'bigBall', 
    name: 'כדור ענק', 
    icon: Circle, 
    desc: 'רדיוס פגיעה גדול',
    cost: 250,
    maxLevel: 2
  },
  { 
    id: 'permanentShield', 
    name: 'מגן קבוע', 
    icon: Shield, 
    desc: 'מגן שלא נגמר',
    cost: 500,
    maxLevel: 1
  },
];

export default function UpgradesPanel({ upgrades, coins, onUpgrade, onClose }) {
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
        className="bg-card rounded-2xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-rubik font-bold text-white">שדרוגים</h2>
          <div className="flex items-center gap-2">
            <span className="font-rubik font-bold text-accent text-xl">⭐ {coins}</span>
            <button onClick={onClose} className="text-muted-foreground hover:text-white ml-2">✕</button>
          </div>
        </div>

        <div className="space-y-3">
          {UPGRADES.map((upgrade) => {
            const currentLevel = upgrades[upgrade.id] || 0;
            const maxed = currentLevel >= upgrade.maxLevel;
            const canAfford = coins >= upgrade.cost;
            const Icon = upgrade.icon;
            
            return (
              <div
                key={upgrade.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border border-border/30"
              >
                <div className="p-3 rounded-lg bg-primary/20 text-primary">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-rubik font-bold text-white">{upgrade.name}</h3>
                  <p className="text-sm text-muted-foreground">{upgrade.desc}</p>
                  <p className="text-xs text-accent mt-1">
                    רמה {currentLevel}/{upgrade.maxLevel}
                  </p>
                </div>
                <Button
                  onClick={() => onUpgrade(upgrade.id, upgrade.cost)}
                  disabled={maxed || !canAfford}
                  size="sm"
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {maxed ? '✓ מקסימום' : `⭐ ${upgrade.cost}`}
                </Button>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}