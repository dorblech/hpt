import React, { useRef, useEffect, useState, useCallback } from 'react';
import useGameLoop from './useGameLoop';

// Image URLs
const STADIUM_IMG = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_69a95f6464e92d6d7459eef2/2f3681176_image.png';
const PLAYER_IMG = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b06431da918bf146ec7aa5/e91ad0ca7_Gemini_Generated_Image_61sfuh61sfuh61sf.png';
const SCARF_IMG = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_69a95f6464e92d6d7459eef2/66fcc071c_image.png';
const RETRO_IMG = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_69a95f6464e92d6d7459eef2/d8bfe6ea0_image.png';
const LUZON_IMG = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_69a95f6464e92d6d7459eef2/a5e297469_image.png';

const GAME_CONFIG = {
  BASE_PLAYER_SPEED: 6,
  BALL_SPEED: 8,
  BALL_RADIUS: 8,
  VINTAGE_BALL_RADIUS: 16,
  MISSILE_WIDTH: 30,
  MISSILE_HEIGHT: 60,
  PLAYER_WIDTH: 100,
  PLAYER_HEIGHT: 130,
  BONUS_SIZE: 50,
  SHOOT_COOLDOWN: 12,
  SHIELD_DURATION: 600,
  VINTAGE_DURATION: 480,
};

// Level configurations
const LEVELS = [
  { 
    level: 1, 
    missileSpeed: 1.5, 
    spawnInterval: 120, 
    wobbleIntensity: 0.3, 
    bonusChance: 0.2,
    name: 'התחלה קלה'
  },
  { 
    level: 2, 
    missileSpeed: 2, 
    spawnInterval: 100, 
    wobbleIntensity: 0.5, 
    bonusChance: 0.18,
    name: 'התחממות'
  },
  { 
    level: 3, 
    missileSpeed: 2.5, 
    spawnInterval: 80, 
    wobbleIntensity: 0.8, 
    bonusChance: 0.15,
    name: 'קצב עולה'
  },
  { 
    level: 4, 
    missileSpeed: 3, 
    spawnInterval: 65, 
    wobbleIntensity: 1.2, 
    bonusChance: 0.12,
    name: 'אתגר אמיתי'
  },
  { 
    level: 5, 
    missileSpeed: 3.5, 
    spawnInterval: 50, 
    wobbleIntensity: 1.5, 
    bonusChance: 0.1,
    name: 'מטר טילים'
  },
  { 
    level: 6, 
    missileSpeed: 4, 
    spawnInterval: 40, 
    wobbleIntensity: 2, 
    bonusChance: 0.08,
    name: 'בלתי אפשרי'
  },
];

function getLevelConfig(score) {
  const levelIndex = Math.min(Math.floor(score / 100), LEVELS.length - 1);
  return LEVELS[levelIndex];
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export default function GameCanvas({ onScoreChange, onLivesChange, onGameOver, onBonusChange, onLevelChange, onComboChange, onBossDefeated, onBonusCollected, upgrades, combo, multiplier, gameState }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const imagesRef = useRef({});
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Load all images
  useEffect(() => {
    Promise.all([
      loadImage(STADIUM_IMG),
      loadImage(PLAYER_IMG),
      loadImage(SCARF_IMG),
      loadImage(RETRO_IMG),
      loadImage(LUZON_IMG),
    ]).then(([stadium, player, scarf, retro, luzon]) => {
      imagesRef.current = { stadium, player, scarf, retro, luzon };
      setImagesLoaded(true);
    });
  }, []);

  // Initialize game state
  useEffect(() => {
    if (gameState !== 'playing' || !imagesLoaded) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    stateRef.current = {
      player: { x: canvas.width / 2, y: canvas.height - 120 },
      balls: [],
      missiles: [],
      bonuses: [],
      explosions: [],
      score: 0,
      lives: 3,
      hasShield: false,
      hasVintage: false,
      shieldTimer: 0,
      vintageTimer: 0,
      spawnTimer: 0,
      shootCooldown: 0,
      frameCount: 0,
      keys: {},
      showMangal: false,
      mangalTimer: 0,
      touching: false,
      touchX: 0,
      currentLevel: 0,
      kickAnimation: 0,
      ballAtFoot: null,
      combo: 0,
      multiplier: 1,
      missedShot: false,
      bossMode: false,
      boss: null,
      earnedCoins: 0,
    };
  }, [gameState, imagesLoaded]);

  // Input handlers
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e) => {
      if (!stateRef.current) return;
      stateRef.current.keys[e.code] = true;
      if (e.code === 'Space') {
        e.preventDefault();
        shootBall();
      }
    };
    const handleKeyUp = (e) => {
      if (!stateRef.current) return;
      stateRef.current.keys[e.code] = false;
    };

    const handleTouchStart = (e) => {
      if (!stateRef.current) return;
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      stateRef.current.touching = true;
      stateRef.current.touchX = (touch.clientX - rect.left) * (canvas.width / rect.width);
      shootBall();
    };

    const handleTouchMove = (e) => {
      if (!stateRef.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      stateRef.current.touchX = (touch.clientX - rect.left) * (canvas.width / rect.width);
    };

    const handleTouchEnd = () => {
      if (!stateRef.current) return;
      stateRef.current.touching = false;
    };

    const handleClick = (e) => {
      if (!stateRef.current) return;
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
      stateRef.current.player.x = clickX;
      shootBall();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    const canvas = canvasRef.current;
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('click', handleClick);
    };
  }, [gameState]);

  const shootBall = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.shootCooldown > 0 || s.kickAnimation > 0) return;
    
    // Start kick animation
    s.kickAnimation = 20;
    const radius = s.hasVintage ? GAME_CONFIG.VINTAGE_BALL_RADIUS : GAME_CONFIG.BALL_RADIUS;
    s.ballAtFoot = {
      x: s.player.x,
      y: s.player.y - 15, // Position at feet level
      radius,
      isVintage: s.hasVintage,
    };
    s.shootCooldown = GAME_CONFIG.SHOOT_COOLDOWN;
  }, []);

  // Resize canvas
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      canvas.width = Math.min(parent.clientWidth, 600);
      canvas.height = Math.min(parent.clientHeight, 900);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Game loop
  useGameLoop(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const s = stateRef.current;
    const imgs = imagesRef.current;
    
    if (!ctx || !s || gameState !== 'playing') return;

    const W = canvas.width;
    const H = canvas.height;
    
    s.frameCount++;

    // --- UPDATE ---
    
    // Player movement (with speed upgrade)
    const speedMultiplier = 1 + (upgrades?.speed || 0) * 0.2;
    const playerSpeed = GAME_CONFIG.BASE_PLAYER_SPEED * speedMultiplier;
    
    if (s.keys['ArrowLeft'] || s.keys['KeyA']) {
      s.player.x -= playerSpeed;
    }
    if (s.keys['ArrowRight'] || s.keys['KeyD']) {
      s.player.x += playerSpeed;
    }
    if (s.touching) {
      const diff = s.touchX - s.player.x;
      s.player.x += Math.sign(diff) * Math.min(Math.abs(diff), playerSpeed);
    }
    s.player.x = Math.max(GAME_CONFIG.PLAYER_WIDTH / 2, Math.min(W - GAME_CONFIG.PLAYER_WIDTH / 2, s.player.x));

    // Shoot cooldown
    if (s.shootCooldown > 0) s.shootCooldown--;

    // Kick animation
    if (s.kickAnimation > 0) {
      s.kickAnimation--;
      if (s.kickAnimation === 10 && s.ballAtFoot) {
        // Release ball at mid-kick
        const ballRadius = s.ballAtFoot.radius * (1 + (upgrades?.bigBall || 0) * 0.3);
        
        // Double shot upgrade
        if (upgrades?.doubleShot >= 1) {
          s.balls.push({
            x: s.ballAtFoot.x - 15,
            y: s.ballAtFoot.y - 10,
            radius: ballRadius,
            isVintage: s.ballAtFoot.isVintage,
            speed: GAME_CONFIG.BALL_SPEED,
          });
          s.balls.push({
            x: s.ballAtFoot.x + 15,
            y: s.ballAtFoot.y - 10,
            radius: ballRadius,
            isVintage: s.ballAtFoot.isVintage,
            speed: GAME_CONFIG.BALL_SPEED,
          });
        } else {
          s.balls.push({
            x: s.ballAtFoot.x,
            y: s.ballAtFoot.y - 10,
            radius: ballRadius,
            isVintage: s.ballAtFoot.isVintage,
            speed: GAME_CONFIG.BALL_SPEED,
          });
        }
        s.ballAtFoot = null;
      }
      if (s.kickAnimation === 0) {
        s.ballAtFoot = null;
      }
    }

    // Update ball at foot position
    if (s.ballAtFoot) {
      s.ballAtFoot.x = s.player.x;
      s.ballAtFoot.y = s.player.y - 15; // Keep at feet level
    }

    // Level progression and boss mode
    const levelConfig = getLevelConfig(s.score);
    const newLevel = levelConfig.level - 1;
    if (newLevel !== s.currentLevel) {
      s.currentLevel = newLevel;
      if (onLevelChange) {
        onLevelChange(levelConfig);
      }
      
      // Boss every 5 levels
      if ((newLevel + 1) % 5 === 0 && !s.bossMode) {
        s.bossMode = true;
        s.boss = {
          x: W / 2,
          y: 100,
          health: 10,
          maxHealth: 10,
          direction: 1,
          shootTimer: 0,
        };
      }
    }

    // Spawn missiles / bonuses based on level
    s.spawnTimer++;
    if (s.spawnTimer >= levelConfig.spawnInterval) {
      s.spawnTimer = 0;
      
      if (Math.random() < levelConfig.bonusChance) {
        // Spawn bonus
        const bonusTypes = ['scarf', 'retro', 'luzon'];
        const type = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
        s.bonuses.push({
          x: Math.random() * (W - 60) + 30,
          y: -GAME_CONFIG.BONUS_SIZE,
          type,
          speed: 2 + Math.random(),
        });
      } else {
        // Spawn missile with level-based properties
        s.missiles.push({
          x: Math.random() * (W - 40) + 20,
          y: -GAME_CONFIG.MISSILE_HEIGHT,
          speed: levelConfig.missileSpeed + Math.random() * 0.5,
          wobble: (Math.random() * 2 - 1) * levelConfig.wobbleIntensity,
          wobblePhase: Math.random() * Math.PI * 2,
        });
      }
    }

    // Update balls
    s.balls = s.balls.filter(ball => {
      ball.y -= ball.speed;
      
      // Check if ball missed (went off screen without hitting anything)
      if (ball.y < -20) {
        s.missedShot = true;
        return false;
      }
      return true;
    });

    // Update missiles
    s.missiles = s.missiles.filter(missile => {
      missile.y += missile.speed;
      missile.x += Math.sin(s.frameCount * 0.05 + missile.wobblePhase) * missile.wobble;

      // Check collision with balls
      for (let i = s.balls.length - 1; i >= 0; i--) {
        const ball = s.balls[i];
        const dx = ball.x - missile.x;
        const dy = ball.y - missile.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const hitRadius = ball.radius + GAME_CONFIG.MISSILE_WIDTH / 2;
        
        if (dist < hitRadius) {
          // Missile destroyed!
          s.balls.splice(i, 1);
          
          // Combo system
          s.combo++;
          s.multiplier = Math.min(Math.floor(s.combo / 5) + 1, 5);
          const points = 10 * s.multiplier;
          s.score += points;
          s.earnedCoins += Math.floor(points / 10);
          onScoreChange(s.score);
          onComboChange(s.combo, s.multiplier);
          
          s.explosions.push({ x: missile.x, y: missile.y, timer: 30, size: 40 });
          return false;
        }
      }

      // Missile reached player
      if (missile.y > s.player.y - GAME_CONFIG.PLAYER_HEIGHT / 2) {
        const dx = Math.abs(missile.x - s.player.x);
        if (dx < (GAME_CONFIG.PLAYER_WIDTH + GAME_CONFIG.MISSILE_WIDTH) / 2) {
          const hasPermaShield = upgrades?.permanentShield >= 1;
          if (s.hasShield || hasPermaShield) {
            s.explosions.push({ x: missile.x, y: missile.y, timer: 30, size: 40 });
            if (!hasPermaShield) {
              s.hasShield = false;
              s.shieldTimer = 0;
              onBonusChange({ hasShield: false, hasVintage: s.hasVintage, shieldTimer: 0, vintageTimer: s.vintageTimer });
            }
            return false;
          }
          s.lives--;
          s.combo = 0;
          s.multiplier = 1;
          onComboChange(0, 1);
          onLivesChange(s.lives);
          s.explosions.push({ x: missile.x, y: missile.y, timer: 40, size: 60 });
          if (s.lives <= 0) {
            onGameOver(s.score, s.earnedCoins);
          }
          return false;
        }
      }

      // Off screen
      return missile.y < H + 20;
    });

    // Update bonuses
    s.bonuses = s.bonuses.filter(bonus => {
      bonus.y += bonus.speed;
      
      // Check collision with balls
      for (let i = s.balls.length - 1; i >= 0; i--) {
        const ball = s.balls[i];
        const dx = ball.x - bonus.x;
        const dy = ball.y - bonus.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < ball.radius + GAME_CONFIG.BONUS_SIZE / 2) {
          s.balls.splice(i, 1);
          
          if (bonus.type === 'scarf') {
            s.hasShield = true;
            s.shieldTimer = GAME_CONFIG.SHIELD_DURATION;
            onBonusChange({ hasShield: true, hasVintage: s.hasVintage, shieldTimer: s.shieldTimer, vintageTimer: s.vintageTimer });
            onBonusCollected('scarf');
          } else if (bonus.type === 'retro') {
            s.hasVintage = true;
            s.vintageTimer = GAME_CONFIG.VINTAGE_DURATION;
            onBonusChange({ hasShield: s.hasShield, hasVintage: true, shieldTimer: s.shieldTimer, vintageTimer: s.vintageTimer });
            onBonusCollected('retro');
          } else if (bonus.type === 'luzon') {
            onBonusCollected('luzon');
            // Destroy all missiles with radial explosion
            const centerX = bonus.x;
            const centerY = bonus.y;
            
            s.missiles.forEach((m, idx) => {
              // Delayed radial explosion effect
              setTimeout(() => {
                s.explosions.push({ 
                  x: m.x, 
                  y: m.y, 
                  timer: 40, 
                  size: 60,
                  color: 'luzon'
                });
              }, idx * 30);
            });
            
            // Giant central explosion
            s.explosions.push({ 
              x: centerX, 
              y: centerY, 
              timer: 60, 
              size: 100,
              color: 'luzon'
            });
            
            s.score += s.missiles.length * 10;
            onScoreChange(s.score);
            s.missiles = [];
            s.showMangal = true;
            s.mangalTimer = 120;
          }
          
          s.explosions.push({ x: bonus.x, y: bonus.y, timer: 20, size: 30, color: 'gold' });
          return false;
        }
      }

      return bonus.y < H + 30;
    });

    // Update boss
    if (s.bossMode && s.boss) {
      const boss = s.boss;
      
      // Boss movement
      boss.x += boss.direction * 2;
      if (boss.x < 100 || boss.x > W - 100) {
        boss.direction *= -1;
      }
      
      // Boss shooting
      boss.shootTimer++;
      if (boss.shootTimer >= 60) {
        boss.shootTimer = 0;
        s.missiles.push({
          x: boss.x,
          y: boss.y + 40,
          speed: 2,
          wobble: 0,
          wobblePhase: 0,
        });
      }
      
      // Check collision with balls
      for (let i = s.balls.length - 1; i >= 0; i--) {
        const ball = s.balls[i];
        const dx = ball.x - boss.x;
        const dy = ball.y - boss.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < ball.radius + 50) {
          s.balls.splice(i, 1);
          boss.health--;
          s.combo++;
          s.multiplier = Math.min(Math.floor(s.combo / 5) + 1, 5);
          const points = 20 * s.multiplier;
          s.score += points;
          s.earnedCoins += Math.floor(points / 10);
          onScoreChange(s.score);
          onComboChange(s.combo, s.multiplier);
          s.explosions.push({ x: boss.x, y: boss.y, timer: 20, size: 30, color: 'boss' });
          
          if (boss.health <= 0) {
            // Boss defeated!
            s.bossMode = false;
            s.boss = null;
            s.score += 100;
            s.earnedCoins += 20;
            onScoreChange(s.score);
            onBossDefeated();
            s.explosions.push({ x: boss.x, y: boss.y, timer: 60, size: 120, color: 'boss' });
          }
        }
      }
    }

    // Reset combo if missed shot
    if (s.missedShot) {
      s.combo = 0;
      s.multiplier = 1;
      onComboChange(0, 1);
      s.missedShot = false;
    }

    // Timer updates
    if (s.hasShield) {
      s.shieldTimer--;
      if (s.shieldTimer <= 0) {
        s.hasShield = false;
        onBonusChange({ hasShield: false, hasVintage: s.hasVintage, shieldTimer: 0, vintageTimer: s.vintageTimer });
      }
    }
    if (s.hasVintage) {
      s.vintageTimer--;
      if (s.vintageTimer <= 0) {
        s.hasVintage = false;
        onBonusChange({ hasShield: s.hasShield, hasVintage: false, shieldTimer: s.shieldTimer, vintageTimer: 0 });
      }
    }
    if (s.showMangal) {
      s.mangalTimer--;
      if (s.mangalTimer <= 0) s.showMangal = false;
    }

    // Update explosions
    s.explosions = s.explosions.filter(e => {
      e.timer--;
      e.size += 2;
      return e.timer > 0;
    });

    // --- DRAW ---
    ctx.clearRect(0, 0, W, H);

    // Background stadium
    if (imgs.stadium) {
      ctx.drawImage(imgs.stadium, 0, 0, W, H);
      ctx.fillStyle = 'rgba(0,0,10,0.4)';
      ctx.fillRect(0, 0, W, H);
    } else {
      ctx.fillStyle = '#0a1628';
      ctx.fillRect(0, 0, W, H);
    }

    // Draw missiles
    s.missiles.forEach(missile => {
      // Missile body
      ctx.save();
      ctx.translate(missile.x, missile.y);
      
      // Missile shape
      ctx.fillStyle = '#666';
      ctx.beginPath();
      ctx.moveTo(0, -GAME_CONFIG.MISSILE_HEIGHT / 2);
      ctx.lineTo(GAME_CONFIG.MISSILE_WIDTH / 2, GAME_CONFIG.MISSILE_HEIGHT / 4);
      ctx.lineTo(GAME_CONFIG.MISSILE_WIDTH / 2, GAME_CONFIG.MISSILE_HEIGHT / 2);
      ctx.lineTo(-GAME_CONFIG.MISSILE_WIDTH / 2, GAME_CONFIG.MISSILE_HEIGHT / 2);
      ctx.lineTo(-GAME_CONFIG.MISSILE_WIDTH / 2, GAME_CONFIG.MISSILE_HEIGHT / 4);
      ctx.closePath();
      ctx.fill();
      
      // Nose cone
      ctx.fillStyle = '#cc0000';
      ctx.beginPath();
      ctx.moveTo(0, -GAME_CONFIG.MISSILE_HEIGHT / 2);
      ctx.lineTo(8, -GAME_CONFIG.MISSILE_HEIGHT / 4);
      ctx.lineTo(-8, -GAME_CONFIG.MISSILE_HEIGHT / 4);
      ctx.closePath();
      ctx.fill();

      // Flames
      const flameSize = 10 + Math.random() * 10;
      ctx.fillStyle = '#ff6600';
      ctx.beginPath();
      ctx.moveTo(-8, GAME_CONFIG.MISSILE_HEIGHT / 2);
      ctx.lineTo(8, GAME_CONFIG.MISSILE_HEIGHT / 2);
      ctx.lineTo(0, GAME_CONFIG.MISSILE_HEIGHT / 2 + flameSize);
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.moveTo(-4, GAME_CONFIG.MISSILE_HEIGHT / 2);
      ctx.lineTo(4, GAME_CONFIG.MISSILE_HEIGHT / 2);
      ctx.lineTo(0, GAME_CONFIG.MISSILE_HEIGHT / 2 + flameSize * 0.6);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    });

    // Draw bonuses
    s.bonuses.forEach(bonus => {
      const img = bonus.type === 'scarf' ? imgs.scarf : bonus.type === 'retro' ? imgs.retro : imgs.luzon;
      if (img) {
        const sz = GAME_CONFIG.BONUS_SIZE;
        ctx.save();
        // Glow
        ctx.shadowColor = bonus.type === 'luzon' ? '#ff4444' : '#ffcc00';
        ctx.shadowBlur = 15 + Math.sin(s.frameCount * 0.1) * 5;
        ctx.drawImage(img, bonus.x - sz / 2, bonus.y - sz / 2, sz, sz);
        ctx.restore();
      }
    });

    // Draw ball at foot (before kick)
    if (s.ballAtFoot) {
      const ball = s.ballAtFoot;
      const kickProgress = 1 - (s.kickAnimation / 20);
      const offsetY = kickProgress * 15;
      
      ctx.save();
      if (ball.isVintage) {
        ctx.fillStyle = '#d4a017';
        ctx.strokeStyle = '#8b6914';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y - offsetY, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = '#8b6914';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y - offsetY, ball.radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y - offsetY, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y - offsetY, ball.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Draw balls
    s.balls.forEach(ball => {
      ctx.save();
      if (ball.isVintage) {
        // Vintage ball - bigger, golden
        ctx.fillStyle = '#d4a017';
        ctx.strokeStyle = '#8b6914';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Pattern
        ctx.strokeStyle = '#8b6914';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Normal football
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
        // Pentagon pattern
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // Draw player with kick animation
    if (imgs.player) {
      const pw = GAME_CONFIG.PLAYER_WIDTH;
      const ph = GAME_CONFIG.PLAYER_HEIGHT;
      
      // Shield glow
      if (s.hasShield) {
        ctx.save();
        ctx.strokeStyle = `rgba(59, 130, 246, ${0.5 + Math.sin(s.frameCount * 0.1) * 0.3})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(s.player.x, s.player.y - ph / 4, pw * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = `rgba(59, 130, 246, 0.1)`;
        ctx.fill();
        ctx.restore();
      }

      ctx.save();
      
      // Kick animation - tilt player slightly
      if (s.kickAnimation > 0) {
        const kickAngle = (s.kickAnimation > 10 ? (20 - s.kickAnimation) : s.kickAnimation) * 0.05;
        ctx.translate(s.player.x, s.player.y - ph / 2);
        ctx.rotate(kickAngle);
        ctx.drawImage(imgs.player, -pw / 2, -ph / 2, pw, ph);
        
        // Draw kicking leg motion blur
        if (s.kickAnimation > 8 && s.kickAnimation < 15) {
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = '#3b82f6';
          ctx.beginPath();
          ctx.ellipse(0, ph / 4, 8, 20, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      } else {
        ctx.drawImage(imgs.player, s.player.x - pw / 2, s.player.y - ph, pw, ph);
      }
      
      ctx.restore();
    }

    // Draw explosions
    s.explosions.forEach(e => {
      ctx.save();
      const alpha = e.timer / 40;
      
      let outerColor, innerColor;
      if (e.color === 'gold') {
        outerColor = `rgba(255, 200, 0, ${alpha})`;
        innerColor = `rgba(255, 255, 200, ${alpha * 0.5})`;
      } else if (e.color === 'luzon') {
        // Avi Luzon special radial explosion - red/orange/yellow
        outerColor = `rgba(255, 60, 0, ${alpha})`;
        innerColor = `rgba(255, 200, 0, ${alpha * 0.7})`;
        
        // Extra radial rays
        ctx.strokeStyle = `rgba(255, 150, 0, ${alpha * 0.5})`;
        ctx.lineWidth = 3;
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 / 8) * i + s.frameCount * 0.1;
          ctx.beginPath();
          ctx.moveTo(e.x, e.y);
          ctx.lineTo(
            e.x + Math.cos(angle) * e.size * 1.5,
            e.y + Math.sin(angle) * e.size * 1.5
          );
          ctx.stroke();
        }
      } else if (e.color === 'boss') {
        // Boss explosion - purple/pink
        outerColor = `rgba(138, 43, 226, ${alpha})`;
        innerColor = `rgba(255, 20, 147, ${alpha * 0.7})`;
      } else {
        outerColor = `rgba(255, 100, 0, ${alpha})`;
        innerColor = `rgba(255, 255, 200, ${alpha * 0.5})`;
      }
      
      ctx.fillStyle = outerColor;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = innerColor;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw boss
    if (s.bossMode && s.boss) {
      const boss = s.boss;
      
      ctx.save();
      // Boss body - giant missile
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(boss.x, boss.y, 50, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#cc0000';
      ctx.beginPath();
      ctx.arc(boss.x, boss.y, 35, 0, Math.PI * 2);
      ctx.fill();
      
      // Boss eyes
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(boss.x - 15, boss.y - 10, 8, 0, Math.PI * 2);
      ctx.arc(boss.x + 15, boss.y - 10, 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(boss.x - 15, boss.y - 10, 4, 0, Math.PI * 2);
      ctx.arc(boss.x + 15, boss.y - 10, 4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
      
      // Boss health bar
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(boss.x - 60, boss.y - 70, 120, 10);
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(boss.x - 60, boss.y - 70, 120 * (boss.health / boss.maxHealth), 10);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(boss.x - 60, boss.y - 70, 120, 10);
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Rubik';
      ctx.textAlign = 'center';
      ctx.fillText('BOSS', boss.x, boss.y - 80);
      ctx.restore();
    }

    // Draw "תפתחו מנגלים" text
    if (s.showMangal) {
      ctx.save();
      const alpha = s.mangalTimer / 120;
      ctx.fillStyle = `rgba(255, 200, 0, ${alpha})`;
      ctx.font = `bold ${Math.min(W * 0.08, 40)}px Rubik, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(255, 100, 0, 0.8)';
      ctx.shadowBlur = 20;
      ctx.fillText('🔥 תפתחו מנגלים! 🔥', W / 2, H / 3);
      ctx.restore();
    }
  });

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {!imagesLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-30">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 font-rubik text-white">טוען תמונות...</span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="block max-w-full max-h-full rounded-lg"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}