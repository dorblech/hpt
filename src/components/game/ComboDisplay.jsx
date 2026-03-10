import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';

export default function ComboDisplay({ combo, multiplier }) {
  if (combo < 2) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 10 }}
        className="absolute top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
      >
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl px-6 py-3 shadow-2xl border-2 border-yellow-400">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-yellow-300 animate-pulse" />
            <div className="font-rubik font-black text-white">
              <div className="text-3xl leading-none">{combo}</div>
              <div className="text-xs text-yellow-200">COMBO</div>
            </div>
            <div className="font-rubik font-black text-yellow-300 text-2xl">
              x{multiplier}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}