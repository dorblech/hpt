import React from 'react';
import { Trophy, Target, Shield, Zap, Flame, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

const ACHIEVEMENTS = [
  { id: 'score_100', name: 'התחלה טובה', icon: Target, desc: 'הגע ל-100 נקודות', requirement: 100, type: 'score' },
  { id: 'score_500', name: 'מקצוען', icon: Trophy, desc: 'הגע ל-500 נקודות', requirement: 500, type: 'score' },
  { id: 'score_1000', name: 'אלוף', icon: Crown, desc: 'הגע ל-1000 נקודות', requirement: 1000, type: 'score' },
  { id: 'combo_10', name: 'קומבו מאסטר', icon: Flame, desc: '10 פגיעות ברצף', requirement: 10, type: 'combo' },
  { id: 'combo_20', name: 'שרשרת זהב', icon: Zap, desc: '20 פגיעות ברצף', requirement: 20, type: 'combo' },
  { id: 'all_bonuses', name: 'בונוס קולקטור', icon: Shield, desc: 'אסוף את כל סוגי הבונוסים', requirement: 3, type: 'bonusTypes' },
  { id: 'boss_1', name: 'הורס בוסים', icon: Target, desc: 'הבס בוס ראשון', requirement: 1, type: 'bosses' },
  { id: 'boss_3', name: 'מלך הבוסים', icon: Crown, desc: 'הבס 3 בוסים', requirement: 3, type: 'bosses' },
];

export default function AchievementsPanel({ achievements, onClose }) {
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
            הישגים
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-white">✕</button>
        </div>

        <div className="space-y-3">
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = achievements[achievement.id] || false;
            const Icon = achievement.icon;
            
            return (
              <div
                key={achievement.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  unlocked 
                    ? 'bg-accent/10 border-accent/50' 
                    : 'bg-muted/20 border-border/30 opacity-60'
                }`}
              >
                <div className={`p-3 rounded-lg ${unlocked ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-rubik font-bold text-white">{achievement.name}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.desc}</p>
                </div>
                {unlocked && (
                  <div className="text-accent">
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}