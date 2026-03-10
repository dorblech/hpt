import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const LOGO_IMG = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b06431da918bf146ec7aa5/c142c3bc8_image.png';

export default function GameMenu({ onStart, highScore }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/70 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-6 p-8"
      >
        <motion.h1 
          className="text-4xl md:text-6xl font-rubik font-black text-white text-center"
          style={{ textShadow: '0 0 40px rgba(59,130,246,0.5), 0 4px 8px rgba(0,0,0,0.5)' }}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          יאללה יאללה פ"ת
        </motion.h1>
        <motion.h2 
          className="text-2xl md:text-3xl font-rubik font-bold text-accent text-center -mt-2"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
        >
          היום יוצאים למלחמה
        </motion.h2>
        
        <p className="text-blue-300 font-rubik text-lg text-center max-w-md">
          הגן על האיצטדיון מפני הטילים!
          <br />בעט כדורים כדי ליירט אותם
        </p>

        <img 
          src={LOGO_IMG} 
          alt="logo" 
          className="w-48 h-48 object-contain"
        />

        <div className="flex flex-col items-center gap-3 mt-2">
          <Button 
            onClick={onStart}
            className="bg-blue-600 hover:bg-blue-500 text-white font-rubik font-bold text-xl px-12 py-6 rounded-xl shadow-lg shadow-blue-600/40 transition-all hover:scale-105"
          >
            🚀 התחל משחק
          </Button>
          
          {highScore > 0 && (
            <p className="text-accent font-rubik font-bold text-lg">
              שיא: {highScore} נקודות
            </p>
          )}
        </div>

        <div className="text-sm text-muted-foreground font-rubik text-center mt-4 space-y-1">
          <p>⬅️ ➡️ חצים או גרירה להזיז את השחקן</p>
          <p>רווח או לחיצה לבעוט כדור</p>
        </div>
      </motion.div>
    </div>
  );
}