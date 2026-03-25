import { useState, useEffect, useCallback, useRef } from "react";

// ── CARD DATA ──
const ALL_CARDS = [
  { emoji: "🌙", label: "Moon" },
  { emoji: "⭐", label: "Star" },
  { emoji: "☀️", label: "Sun" },
  { emoji: "🪐", label: "Saturn" },
  { emoji: "🌌", label: "Galaxy" },
  { emoji: "☄️", label: "Comet" },
  { emoji: "🌠", label: "Shooting Star" },
  { emoji: "🔭", label: "Telescope" },
  { emoji: "🚀", label: "Rocket" },
  { emoji: "👾", label: "Alien" },
  { emoji: "🌍", label: "Earth" },
  { emoji: "💫", label: "Dizzy" },
  { emoji: "🛸", label: "UFO" },
  { emoji: "🔮", label: "Crystal" },
  { emoji: "💎", label: "Diamond" },
  { emoji: "⚡", label: "Lightning" },
  { emoji: "🌊", label: "Wave" },
  { emoji: "🦋", label: "Butterfly" },
  { emoji: "🌺", label: "Flower" },
  { emoji: "🦄", label: "Unicorn" },
  { emoji: "🐉", label: "Dragon" },
  { emoji: "🍄", label: "Mushroom" },
  { emoji: "🦊", label: "Fox" },
];

const DIFFICULTY = {
  easy:   { cols: 4, pairs: 8,  time: 90,  gridClass: "grid-4x4", label: "Easy · 4×4" },
  medium: { cols: 5, pairs: 10, time: 120, gridClass: "grid-4x5", label: "Medium · 4×5" },
  hard:   { cols: 6, pairs: 12, time: 150, gridClass: "grid-4x6", label: "Hard · 4×6" },
};

const RANK_THRESHOLDS = {
  easy:   [2000, 1500, 1000],
  medium: [2500, 1800, 1200],
  hard:   [3000, 2200, 1500],
};

const COMBO_MSGS = ["", "", "🔥 Combo!", "⚡ Hot Streak!", "💫 On Fire!", "🌟 Unstoppable!", "✨ Legendary!"];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(s) {
  if (s <= 0) return "0s";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}:${String(sec).padStart(2, "0")}` : `${sec}s`;
}

function getRank(score, diff) {
  const t = RANK_THRESHOLDS[diff];
  if (score >= t[0]) return "✦ Legendary Memory! Flawless execution.";
  if (score >= t[1]) return "★ Master. Incredibly sharp.";
  if (score >= t[2]) return "◈ Well played! Keep practicing.";
  return "◇ Good effort! Try for a higher score.";
}

function buildCards(diff) {
  const cfg = DIFFICULTY[diff];
  const pool = shuffle([...ALL_CARDS]).slice(0, cfg.pairs);
  return shuffle([...pool, ...pool].map((c, i) => ({ ...c, uid: i })));
}

// ── PARTICLE EFFECT ──
function useParticles() {
  const containerRef = useRef(null);

  const spawnAt = useCallback((cx, cy) => {
    if (!containerRef.current) return;
    const colors = ["#d4a853", "#f0c96e", "#fff9e6", "#3ecfb2", "#e058a0"];
    for (let i = 0; i < 12; i++) {
      const p = document.createElement("div");
      const size = Math.random() * 7 + 3;
      const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.5;
      const dist = 40 + Math.random() * 60;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;
      p.style.cssText = `
        position:fixed; width:${size}px; height:${size}px;
        left:${cx}px; top:${cy}px; border-radius:50%;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        pointer-events:none; z-index:9999;
        animation:particleFly 0.9s ease-out forwards;
        --tx:${tx}px; --ty:${ty}px;
      `;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 950);
    }
  }, []);

  const spawnRandom = useCallback(() => {
    const colors = ["#d4a853", "#f0c96e", "#3ecfb2", "#e058a0", "#fff"];
    const p = document.createElement("div");
    const size = Math.random() * 10 + 4;
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const tx = (Math.random() - 0.5) * 200;
    const ty = (Math.random() - 0.5) * 200;
    p.style.cssText = `
      position:fixed; width:${size}px; height:${size}px;
      left:${x}px; top:${y}px; border-radius:50%;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      pointer-events:none; z-index:9999;
      animation:particleFly 0.9s ease-out forwards;
      --tx:${tx}px; --ty:${ty}px;
    `;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }, []);

  return { containerRef, spawnAt, spawnRandom };
}

// ── CARD COMPONENT ──
function Card({ card, index, isFlipped, isMatched, isShaking, onClick, visible }) {
  const cardRef = useRef(null);

  const classes = [
    "card",
    isFlipped || isMatched ? "flipped" : "",
    isMatched ? "matched" : "",
    isShaking ? "shake" : "",
  ].filter(Boolean).join(" ");

  return (
    <div
      ref={cardRef}
      className={classes}
      data-idx={index}
      data-testid={`card-${index}`}
      onClick={() => onClick(index, cardRef)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.8)",
        transition: `opacity 0.3s ease ${index * 35 + 50}ms, transform 0.3s ease ${index * 35 + 50}ms`,
      }}
    >
      <div className="card-back">
        <span className="card-back-symbol">✦</span>
      </div>
      <div className="card-front">
        <div className="card-emoji">{card.emoji}</div>
        <div className="card-label">{card.label}</div>
        <div className="matched-overlay" />
      </div>
    </div>
  );
}

// ── WIN OVERLAY ──
function WinOverlay({ show, isTimeout, timeTaken, moves, finalScore, diff, pairsFound, totalPairs, onPlayAgain }) {
  if (!show) return null;
  const rank = isTimeout
    ? `⏰ Time's up! Found ${pairsFound} of ${totalPairs} pairs.`
    : getRank(finalScore, diff);

  return (
    <div className="win-overlay show" data-testid="win-overlay">
      <div className="win-card">
        <span className="win-trophy">{isTimeout ? "💀" : "🏆"}</span>
        <div className="win-title">{isTimeout ? "Time's Up!" : "You Won!"}</div>
        <div className="win-sub">{rank}</div>
        <div className="win-stats">
          <div className="win-stat">
            <div className="win-stat-val" data-testid="win-time">{isTimeout ? "0s" : formatTime(timeTaken)}</div>
            <div className="win-stat-label">Time</div>
          </div>
          <div className="win-stat">
            <div className="win-stat-val" data-testid="win-moves">{moves}</div>
            <div className="win-stat-label">Moves</div>
          </div>
          <div className="win-stat">
            <div className="win-stat-val" data-testid="win-score">{finalScore}</div>
            <div className="win-stat-label">Score</div>
          </div>
        </div>
        <button className="btn-play-again" onClick={onPlayAgain}>Play Again ✦</button>
      </div>
    </div>
  );
}

// ── MAIN GAME ──
export default function MemoryMatch() {
  const [diff, setDiffState] = useState("easy");
  const [cards, setCards] = useState(() => buildCards("easy"));
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lockBoard, setLockBoard] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DIFFICULTY.easy.time);
  const [gameStarted, setGameStarted] = useState(false);
  const [bestScores, setBestScores] = useState({ easy: null, medium: null, hard: null });
  const [shakingCards, setShakingCards] = useState(new Set());
  const [cardsVisible, setCardsVisible] = useState(false);
  const [comboMsg, setComboMsg] = useState("");
  const [comboVisible, setComboVisible] = useState(false);
  const [winState, setWinState] = useState(null); // null | { isTimeout, timeTaken, finalScore, pairsFound }
  const [timerClass, setTimerClass] = useState("stat-chip timer-chip");

  const timerRef = useRef(null);
  const comboRef = useRef(0);
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(timeLeft);
  const diffRef = useRef(diff);
  const matchedRef = useRef(matched);
  const cardsRef = useRef(cards);

  const { spawnAt, spawnRandom } = useParticles();

  // Sync refs
  useEffect(() => { comboRef.current = combo; }, [combo]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);
  useEffect(() => { diffRef.current = diff; }, [diff]);
  useEffect(() => { matchedRef.current = matched; }, [matched]);
  useEffect(() => { cardsRef.current = cards; }, [cards]);

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const handleTimeout = useCallback((currentMatched, totalCards, movesCount, currentScore) => {
    stopTimer();
    setLockBoard(true);
    setWinState({
      isTimeout: true,
      timeTaken: 0,
      finalScore: currentScore,
      pairsFound: currentMatched.size / 2,
      totalPairs: totalCards / 2,
    });
  }, [stopTimer]);

  const startTimer = useCallback((currentDiff, currentMatched, totalCards, movesCount) => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        const cfg = DIFFICULTY[diffRef.current];
        const pct = next / cfg.time;
        if (pct < 0.15) setTimerClass("stat-chip timer-chip danger");
        else if (pct < 0.33) setTimerClass("stat-chip timer-chip warn");
        else setTimerClass("stat-chip timer-chip");

        if (next <= 0) {
          clearInterval(timerRef.current);
          handleTimeout(matchedRef.current, cardsRef.current.length, movesCount, scoreRef.current);
          return 0;
        }
        return next;
      });
    }, 1000);
  }, [stopTimer, handleTimeout]);

  const initGame = useCallback((newDiff) => {
    stopTimer();
    const d = newDiff || diff;
    const cfg = DIFFICULTY[d];
    const newCards = buildCards(d);

    setCards(newCards);
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setScore(0);
    setCombo(0);
    comboRef.current = 0;
    scoreRef.current = 0;
    setLockBoard(false);
    setTimeLeft(cfg.time);
    timeLeftRef.current = cfg.time;
    setGameStarted(false);
    setWinState(null);
    setTimerClass("stat-chip timer-chip");
    setCardsVisible(false);
    setShakingCards(new Set());

    setTimeout(() => setCardsVisible(true), 50);
  }, [diff, stopTimer]);

  const setDiff = useCallback((d) => {
    setDiffState(d);
    diffRef.current = d;
    initGame(d);
  }, [initGame]);

  // Initial mount
  useEffect(() => {
    setTimeout(() => setCardsVisible(true), 50);
    return () => stopTimer();
  }, []);

  const showCombo = useCallback((n) => {
    const msg = COMBO_MSGS[Math.min(n, COMBO_MSGS.length - 1)] || `✦ ${n}x Combo!`;
    setComboMsg(msg);
    setComboVisible(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setComboVisible(true);
        setTimeout(() => setComboVisible(false), 1050);
      });
    });
  }, []);

  const winGame = useCallback((currentScore, currentMoves, currentTimeLeft, currentDiff) => {
    stopTimer();
    const cfg = DIFFICULTY[currentDiff];
    const timeTaken = cfg.time - currentTimeLeft;
    const timeBonus = currentTimeLeft * 2;
    const movePenalty = Math.max(0, (currentMoves - cardsRef.current.length / 2) * 10);
    const finalScore = currentScore + timeBonus - movePenalty;

    setBestScores(prev => {
      const updated = { ...prev };
      if (!updated[currentDiff] || finalScore > updated[currentDiff]) {
        updated[currentDiff] = finalScore;
      }
      return updated;
    });

    setWinState({
      isTimeout: false,
      timeTaken,
      finalScore,
      pairsFound: cardsRef.current.length / 2,
      totalPairs: cardsRef.current.length / 2,
    });

    for (let i = 0; i < 30; i++) {
      setTimeout(() => spawnRandom(), i * 60);
    }
  }, [stopTimer, spawnRandom]);

  const handleCardClick = useCallback((idx, cardRef) => {
    setFlipped(prevFlipped => {
      if (lockBoard) return prevFlipped;
      if (matched.has(idx)) return prevFlipped;
      if (prevFlipped.includes(idx)) return prevFlipped;
      if (prevFlipped.length >= 2) return prevFlipped;

      // Start timer on first click
      if (!gameStarted) {
        setGameStarted(true);
        startTimer(diff, matched, cards.length, moves);
      }

      const newFlipped = [...prevFlipped, idx];

      if (newFlipped.length === 2) {
        const [a, b] = newFlipped;
        const cardA = cardsRef.current[a];
        const cardB = cardsRef.current[b];
        const isMatch = cardA.emoji === cardB.emoji;

        setMoves(m => {
          const newMoves = m + 1;

          if (isMatch) {
            const newCombo = comboRef.current + 1;
            setCombo(newCombo);
            comboRef.current = newCombo;

            const basePoints = 100;
            const comboBonus = newCombo > 1 ? (newCombo - 1) * 50 : 0;
            const timeBonus = Math.floor(timeLeftRef.current * 0.5);
            const addedScore = basePoints + comboBonus + timeBonus;
            const newScore = scoreRef.current + addedScore;
            setScore(newScore);
            scoreRef.current = newScore;

            if (newCombo >= 2) showCombo(newCombo);

            setTimeout(() => {
              setMatched(prev => {
                const next = new Set(prev);
                next.add(a);
                next.add(b);
                matchedRef.current = next;

                // Particle effects
                const elA = document.querySelector(`[data-idx="${a}"]`);
                const elB = document.querySelector(`[data-idx="${b}"]`);
                if (elA) {
                  const r = elA.getBoundingClientRect();
                  spawnAt(r.left + r.width / 2, r.top + r.height / 2);
                }
                if (elB) {
                  const r = elB.getBoundingClientRect();
                  spawnAt(r.left + r.width / 2, r.top + r.height / 2);
                }

                if (next.size === cardsRef.current.length) {
                  setTimeout(() => winGame(newScore, newMoves, timeLeftRef.current, diffRef.current), 400);
                }
                return next;
              });
              setFlipped([]);
              setLockBoard(false);
            }, 500);

            setLockBoard(true);
          } else {
            setCombo(0);
            comboRef.current = 0;
            setLockBoard(true);

            setTimeout(() => {
              setShakingCards(new Set([a, b]));
            }, 200);

            setTimeout(() => {
              setFlipped([]);
              setShakingCards(new Set());
              setLockBoard(false);
            }, 900);
          }
          return newMoves;
        });
      }

      return newFlipped;
    });
  }, [lockBoard, matched, gameStarted, diff, cards.length, moves, startTimer, showCombo, winGame, spawnAt]);

  const cfg = DIFFICULTY[diff];
  const pairsFound = matched.size / 2;
  const totalPairs = cards.length / 2;
  const progressPct = cards.length > 0 ? (matched.size / cards.length) * 100 : 0;
  const bestScore = bestScores[diff];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --bg: #07070f;
          --bg2: #0f0f1e;
          --surface: #131326;
          --surface2: #1a1a33;
          --gold: #d4a853;
          --gold2: #f0c96e;
          --gold-dim: rgba(212,168,83,0.15);
          --teal: #3ecfb2;
          --pink: #e058a0;
          --text: #f0eeea;
          --text2: #8a8aaa;
          --border: rgba(212,168,83,0.18);
          --card-back: #1a1a33;
          --glow: rgba(212,168,83,0.35);
          --font-display: 'Playfair Display', Georgia, serif;
          --font-body: 'DM Sans', sans-serif;
          --r: 14px;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .memory-app {
          background: var(--bg);
          color: var(--text);
          font-family: var(--font-body);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow-x: hidden;
          position: relative;
        }

        .memory-app::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 25% 60%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 40% 30%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 55% 80%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 70% 20%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 80% 55%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 10%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 15% 90%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 65% 70%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 35% 45%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 88% 85%, rgba(255,255,255,0.5) 0%, transparent 100%);
          pointer-events: none;
          z-index: 0;
        }

        .memory-app::after {
          content: '';
          position: fixed;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 0;
        }

        header {
          position: relative; z-index: 10;
          text-align: center;
          padding: 2.5rem 2rem 1.5rem;
          width: 100%;
        }

        .title-eyebrow {
          font-family: var(--font-body);
          font-size: 0.7rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 0.5rem;
          opacity: 0.8;
        }

        h1 {
          font-family: var(--font-display);
          font-size: clamp(2.2rem, 5vw, 3.5rem);
          font-weight: 900;
          letter-spacing: -1px;
          line-height: 1;
          background: linear-gradient(135deg, var(--gold2) 0%, var(--gold) 50%, #b8923a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          font-size: 0.85rem;
          color: var(--text2);
          margin-top: 0.4rem;
          letter-spacing: 0.02em;
        }

        .stats-bar {
          position: relative; z-index: 10;
          display: flex; gap: 12px;
          align-items: center; justify-content: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          padding: 0 1rem;
        }

        .stat-chip {
          display: flex; flex-direction: column;
          align-items: center;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 10px 20px;
          min-width: 80px;
        }

        .stat-val {
          font-family: var(--font-display);
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--gold2);
          line-height: 1;
        }

        .stat-label {
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text2);
          margin-top: 3px;
        }

        .timer-chip .stat-val { color: var(--teal); }
        .timer-chip.warn .stat-val { color: #f0a030; }
        .timer-chip.danger .stat-val { color: var(--pink); animation: pulse-text 0.6s ease-in-out infinite; }

        @keyframes pulse-text {
          0%, 100% { opacity: 1; } 50% { opacity: 0.5; }
        }

        .diff-row {
          position: relative; z-index: 10;
          display: flex; gap: 8px;
          margin-bottom: 1.5rem;
          justify-content: center;
        }

        .diff-btn {
          padding: 7px 18px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text2);
          font-family: var(--font-body);
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.04em;
        }

        .diff-btn:hover { border-color: var(--gold); color: var(--gold); }
        .diff-btn.active {
          background: var(--gold-dim);
          border-color: var(--gold);
          color: var(--gold2);
        }

        .grid-wrapper {
          position: relative; z-index: 10;
          width: 100%; max-width: 680px;
          padding: 0 1rem;
          margin-bottom: 2rem;
        }

        .card-grid {
          display: grid;
          gap: 12px;
          perspective: 1200px;
        }

        .grid-4x4 { grid-template-columns: repeat(4, 1fr); }
        .grid-4x5 { grid-template-columns: repeat(5, 1fr); }
        .grid-4x6 { grid-template-columns: repeat(6, 1fr); }

        .card {
          aspect-ratio: 3/4;
          cursor: pointer;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.55s cubic-bezier(0.23, 1, 0.32, 1);
          user-select: none;
        }

        .card.flipped { transform: rotateY(180deg); }
        .card.matched { transform: rotateY(180deg); cursor: default; }
        .card.matched .card-front { animation: matchPulse 0.5s ease forwards; }
        .card.shake { animation: cardShake 0.4s ease; }

        @keyframes matchPulse {
          0% { box-shadow: 0 0 0 0 rgba(212,168,83,0.8); }
          50% { box-shadow: 0 0 0 8px rgba(212,168,83,0); transform: scale(1.04); }
          100% { box-shadow: 0 0 0 0 rgba(212,168,83,0); transform: scale(1); }
        }

        @keyframes cardShake {
          0%, 100% { transform: rotateY(180deg) translateX(0); }
          25% { transform: rotateY(180deg) translateX(-5px); }
          75% { transform: rotateY(180deg) translateX(5px); }
        }

        .card-back, .card-front {
          position: absolute; inset: 0;
          border-radius: var(--r);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          flex-direction: column;
          gap: 6px;
        }

        .card-back {
          background: var(--card-back);
          border: 1px solid var(--border);
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .card:hover:not(.flipped):not(.matched) .card-back {
          border-color: rgba(212,168,83,0.5);
          box-shadow: 0 4px 20px rgba(212,168,83,0.15), inset 0 1px 0 rgba(212,168,83,0.1);
        }

        .card-back::before {
          content: '';
          position: absolute; inset: 0;
          background:
            linear-gradient(135deg, transparent 30%, rgba(212,168,83,0.04) 50%, transparent 70%),
            repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(212,168,83,0.025) 8px, rgba(212,168,83,0.025) 9px);
          border-radius: inherit;
        }

        .card-back-symbol {
          font-size: clamp(1.2rem, 3vw, 1.8rem);
          opacity: 0.25;
          filter: grayscale(0.5);
        }

        .card-front {
          transform: rotateY(180deg);
          background: var(--surface2);
          border: 1px solid var(--border);
        }

        .card.matched .card-front {
          background: linear-gradient(135deg, rgba(212,168,83,0.12), rgba(212,168,83,0.06));
          border-color: rgba(212,168,83,0.6);
        }

        .card-emoji {
          font-size: clamp(1.6rem, 4vw, 2.4rem);
          line-height: 1;
          filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));
          transition: transform 0.3s;
        }

        .card.matched .card-emoji { transform: scale(1.1); }

        .card-label {
          font-size: clamp(0.55rem, 1.2vw, 0.72rem);
          font-weight: 500;
          color: var(--text2);
          letter-spacing: 0.05em;
          text-align: center;
          padding: 0 4px;
        }

        .card.matched .card-label { color: var(--gold); }

        .matched-overlay {
          position: absolute; inset: 0;
          border-radius: var(--r);
          pointer-events: none;
          opacity: 0;
        }

        .card.matched .matched-overlay {
          opacity: 1;
          background: radial-gradient(circle at 50% 50%, rgba(212,168,83,0.15) 0%, transparent 70%);
        }

        @keyframes particleFly {
          0% { opacity: 1; transform: scale(1) translate(0, 0); }
          100% { opacity: 0; transform: scale(0.3) translate(var(--tx), var(--ty)); }
        }

        .actions {
          position: relative; z-index: 10;
          display: flex; gap: 12px;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .btn-reset {
          padding: 0.7rem 2rem;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text2);
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.04em;
        }

        .btn-reset:hover { border-color: var(--gold); color: var(--gold); background: var(--gold-dim); }

        .win-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(7,7,15,0.92);
          display: none;
          align-items: center; justify-content: center;
          backdrop-filter: blur(8px);
        }

        .win-overlay.show { display: flex; }

        .win-card {
          background: var(--surface);
          border: 1px solid rgba(212,168,83,0.4);
          border-radius: 20px;
          padding: 3rem 3.5rem;
          text-align: center;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 0 80px rgba(212,168,83,0.15);
          animation: winCardPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        @keyframes winCardPop {
          from { transform: scale(0.7) translateY(30px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }

        .win-trophy {
          font-size: 4rem; margin-bottom: 1rem;
          display: block;
          animation: trophySpin 1s ease both 0.4s;
        }

        @keyframes trophySpin {
          from { transform: rotate(-20deg) scale(0.5); opacity: 0; }
          to { transform: rotate(0deg) scale(1); opacity: 1; }
        }

        .win-title {
          font-family: var(--font-display);
          font-size: 2.2rem;
          font-weight: 900;
          background: linear-gradient(135deg, var(--gold2), var(--gold));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.4rem;
        }

        .win-sub { color: var(--text2); font-size: 0.9rem; margin-bottom: 1.8rem; }

        .win-stats {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
          margin-bottom: 2rem;
        }

        .win-stat {
          background: var(--bg2);
          border-radius: 10px;
          padding: 12px 8px;
        }

        .win-stat-val {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--gold2);
        }

        .win-stat-label {
          font-size: 0.65rem;
          color: var(--text2);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-top: 2px;
        }

        .btn-play-again {
          width: 100%;
          padding: 0.9rem;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, var(--gold), #b8923a);
          color: #07070f;
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.04em;
          box-shadow: 0 4px 20px rgba(212,168,83,0.3);
        }

        .btn-play-again:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(212,168,83,0.4); }

        .combo-flash {
          position: fixed;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%) scale(0.5);
          z-index: 900;
          font-family: var(--font-display);
          font-size: 3rem;
          font-weight: 900;
          color: var(--gold2);
          pointer-events: none;
          opacity: 0;
          text-shadow: 0 0 30px rgba(212,168,83,0.8);
          white-space: nowrap;
        }

        .combo-flash.show {
          animation: comboAnim 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes comboAnim {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
          70% { opacity: 1; transform: translate(-50%, -60%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -80%) scale(0.9); }
        }

        .progress-wrap {
          position: relative; z-index: 10;
          width: 100%; max-width: 680px;
          padding: 0 1rem;
          margin-bottom: 1rem;
        }

        .progress-label {
          display: flex; justify-content: space-between;
          font-size: 0.72rem;
          color: var(--text2);
          margin-bottom: 6px;
          letter-spacing: 0.04em;
        }

        .progress-bar {
          height: 4px;
          background: var(--surface2);
          border-radius: 999px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--gold), var(--gold2));
          border-radius: 999px;
          transition: width 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          box-shadow: 0 0 10px rgba(212,168,83,0.4);
        }

        .best-badge {
          position: relative; z-index: 10;
          font-size: 0.72rem;
          color: var(--text2);
          margin-bottom: 1.2rem;
          letter-spacing: 0.06em;
        }

        .best-badge span { color: var(--gold); font-weight: 600; }

        @media (max-width: 500px) {
          .card-grid { gap: 8px; }
          .grid-4x4, .grid-4x5, .grid-4x6 { grid-template-columns: repeat(4, 1fr); }
          .win-card { padding: 2rem 1.5rem; }
        }
      `}</style>

      <div className="memory-app">
        <header>
          <div className="title-eyebrow">✦ Memory Challenge ✦</div>
          <h1>Memory Match</h1>
          <div className="subtitle">Flip the cards. Find the pairs. Beat the clock.</div>
        </header>

        <div className="stats-bar" data-testid="stats-bar">
          <div className={timerClass} id="timer-chip" data-testid="timer-chip">
            <div className="stat-val" data-testid="timer-val">{formatTime(timeLeft)}</div>
            <div className="stat-label">Time</div>
          </div>
          <div className="stat-chip">
            <div className="stat-val" data-testid="moves-val">{moves}</div>
            <div className="stat-label">Moves</div>
          </div>
          <div className="stat-chip">
            <div className="stat-val" data-testid="pairs-val">{pairsFound}/{totalPairs}</div>
            <div className="stat-label">Pairs</div>
          </div>
          <div className="stat-chip">
            <div className="stat-val" data-testid="score-val">{score}</div>
            <div className="stat-label">Score</div>
          </div>
        </div>

        <div className="diff-row" data-testid="diff-row">
          {Object.entries(DIFFICULTY).map(([key, val]) => (
            <button
              key={key}
              className={`diff-btn${diff === key ? " active" : ""}`}
              data-diff={key}
              data-testid={`diff-btn-${key}`}
              onClick={() => setDiff(key)}
            >
              {val.label}
            </button>
          ))}
        </div>

        <div className="progress-wrap">
          <div className="progress-label">
            <span>Pairs found</span>
            <span data-testid="progress-text">{pairsFound} of {totalPairs}</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              data-testid="progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="best-badge" data-testid="best-badge">
          Best: <span data-testid="best-val">{bestScore !== null ? bestScore : "—"}</span>
        </div>

        <div className="grid-wrapper">
          <div className={`card-grid ${cfg.gridClass}`} data-testid="card-grid">
            {cards.map((card, idx) => (
              <Card
                key={card.uid}
                card={card}
                index={idx}
                isFlipped={flipped.includes(idx)}
                isMatched={matched.has(idx)}
                isShaking={shakingCards.has(idx)}
                onClick={handleCardClick}
                visible={cardsVisible}
              />
            ))}
          </div>
        </div>

        <div className="actions">
          <button className="btn-reset" data-testid="btn-new-game" onClick={() => initGame()}>↺ New Game</button>
          <button className="btn-reset" data-testid="btn-shuffle" onClick={() => initGame()}>⟳ Shuffle</button>
        </div>

        <div className={`combo-flash${comboVisible ? " show" : ""}`} data-testid="combo-flash">
          {comboMsg}
        </div>

        {winState && (
          <WinOverlay
            show={true}
            isTimeout={winState.isTimeout}
            timeTaken={winState.timeTaken}
            moves={moves}
            finalScore={winState.finalScore}
            diff={diff}
            pairsFound={winState.pairsFound}
            totalPairs={winState.totalPairs}
            onPlayAgain={() => initGame()}
          />
        )}
      </div>
    </>
  );
}
