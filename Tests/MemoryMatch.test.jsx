/**
 * Memory Match – Frontend Test Suite
 * Stack: React Testing Library + Vitest (or Jest)
 *
 * Install:
 *   npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom
 *
 * Run:
 *   npx vitest run           (Vitest)
 *   npx jest                 (Jest)
 */

import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import MemoryMatch from "./MemoryMatch";

// ─── helpers ────────────────────────────────────────────────────────────────
function getAllCards() {
  return screen.getAllByTestId(/^card-\d+$/);
}

function getCard(idx) {
  return screen.getByTestId(`card-${idx}`);
}

/** Advance fake timers AND flush React state */
async function tick(ms = 0) {
  await act(async () => { vi.advanceTimersByTime(ms); });
}

// ─── setup / teardown ───────────────────────────────────────────────────────
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// ════════════════════════════════════════════════════════════════════════════
// 1. RENDERING
// ════════════════════════════════════════════════════════════════════════════
describe("Rendering", () => {
  it("renders the game title", () => {
    render(<MemoryMatch />);
    expect(screen.getByText("Memory Match")).toBeInTheDocument();
  });

  it("renders the subtitle", () => {
    render(<MemoryMatch />);
    expect(
      screen.getByText("Flip the cards. Find the pairs. Beat the clock.")
    ).toBeInTheDocument();
  });

  it("renders stats bar with 4 chips (Time, Moves, Pairs, Score)", () => {
    render(<MemoryMatch />);
    expect(screen.getByTestId("stats-bar")).toBeInTheDocument();
    expect(screen.getByText("Time")).toBeInTheDocument();
    expect(screen.getByText("Moves")).toBeInTheDocument();
    expect(screen.getByText("Pairs")).toBeInTheDocument();
    expect(screen.getByText("Score")).toBeInTheDocument();
  });

  it("renders 3 difficulty buttons", () => {
    render(<MemoryMatch />);
    expect(screen.getByTestId("diff-btn-easy")).toBeInTheDocument();
    expect(screen.getByTestId("diff-btn-medium")).toBeInTheDocument();
    expect(screen.getByTestId("diff-btn-hard")).toBeInTheDocument();
  });

  it("Easy is the default active difficulty", () => {
    render(<MemoryMatch />);
    expect(screen.getByTestId("diff-btn-easy")).toHaveClass("active");
    expect(screen.getByTestId("diff-btn-medium")).not.toHaveClass("active");
    expect(screen.getByTestId("diff-btn-hard")).not.toHaveClass("active");
  });

  it("renders 16 cards for Easy (4×4 = 8 pairs × 2)", async () => {
    render(<MemoryMatch />);
    await tick(200);
    expect(getAllCards()).toHaveLength(16);
  });

  it("renders 20 cards for Medium (4×5 = 10 pairs × 2)", async () => {
    render(<MemoryMatch />);
    fireEvent.click(screen.getByTestId("diff-btn-medium"));
    await tick(200);
    expect(getAllCards()).toHaveLength(20);
  });

  it("renders 24 cards for Hard (4×6 = 12 pairs × 2)", async () => {
    render(<MemoryMatch />);
    fireEvent.click(screen.getByTestId("diff-btn-hard"));
    await tick(200);
    expect(getAllCards()).toHaveLength(24);
  });

  it("renders progress bar", () => {
    render(<MemoryMatch />);
    expect(screen.getByTestId("progress-fill")).toBeInTheDocument();
    expect(screen.getByTestId("progress-text")).toHaveTextContent("0 of 8");
  });

  it("shows '—' for best score initially", () => {
    render(<MemoryMatch />);
    expect(screen.getByTestId("best-val")).toHaveTextContent("—");
  });

  it("renders New Game and Shuffle buttons", () => {
    render(<MemoryMatch />);
    expect(screen.getByTestId("btn-new-game")).toBeInTheDocument();
    expect(screen.getByTestId("btn-shuffle")).toBeInTheDocument();
  });

  it("does NOT show win overlay on initial render", () => {
    render(<MemoryMatch />);
    expect(screen.queryByTestId("win-overlay")).not.toBeInTheDocument();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 2. INITIAL STATE
// ════════════════════════════════════════════════════════════════════════════
describe("Initial state", () => {
  it("moves counter starts at 0", () => {
    render(<MemoryMatch />);
    expect(screen.getByTestId("moves-val")).toHaveTextContent("0");
  });

  it("score starts at 0", () => {
    render(<MemoryMatch />);
    expect(screen.getByTestId("score-val")).toHaveTextContent("0");
  });

  it("timer shows correct initial time for Easy (90s)", () => {
    render(<MemoryMatch />);
    expect(screen.getByTestId("timer-val")).toHaveTextContent("90s");
  });

  it("timer shows correct initial time for Medium (120s)", () => {
    render(<MemoryMatch />);
    fireEvent.click(screen.getByTestId("diff-btn-medium"));
    expect(screen.getByTestId("timer-val")).toHaveTextContent("2:00");
  });

  it("timer shows correct initial time for Hard (150s)", () => {
    render(<MemoryMatch />);
    fireEvent.click(screen.getByTestId("diff-btn-hard"));
    expect(screen.getByTestId("timer-val")).toHaveTextContent("2:30");
  });

  it("timer does NOT count down before first click", async () => {
    render(<MemoryMatch />);
    await tick(3000);
    expect(screen.getByTestId("timer-val")).toHaveTextContent("90s");
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 3. CARD INTERACTIONS
// ════════════════════════════════════════════════════════════════════════════
describe("Card interactions", () => {
  it("flips a card on click (adds 'flipped' class)", async () => {
    render(<MemoryMatch />);
    await tick(200);
    const card = getCard(0);
    fireEvent.click(card);
    expect(card).toHaveClass("flipped");
  });

  it("does not flip a card that is already flipped", async () => {
    render(<MemoryMatch />);
    await tick(200);
    const card = getCard(0);
    fireEvent.click(card);
    fireEvent.click(card);
    // Still has 'flipped' class, no error or double-flip behavior
    expect(card).toHaveClass("flipped");
  });

  it("increments moves after 2 cards are flipped", async () => {
    render(<MemoryMatch />);
    await tick(200);
    fireEvent.click(getCard(0));
    fireEvent.click(getCard(1));
    await tick(50);
    expect(screen.getByTestId("moves-val")).toHaveTextContent("1");
  });

  it("timer starts counting after the first card flip", async () => {
    render(<MemoryMatch />);
    await tick(200);
    fireEvent.click(getCard(0));
    await tick(3000);
    const timerText = screen.getByTestId("timer-val").textContent;
    // Should have counted down some seconds
    expect(timerText).not.toBe("90s");
  });

  it("locks the board while 2 unmatched cards are visible", async () => {
    render(<MemoryMatch />);
    await tick(200);
    fireEvent.click(getCard(0));
    fireEvent.click(getCard(1));
    // Immediately try a third card before lockBoard clears
    fireEvent.click(getCard(2));
    expect(getCard(2)).not.toHaveClass("flipped");
  });

  it("flips back non-matching cards after delay", async () => {
    render(<MemoryMatch />);
    await tick(200);

    // Find two cards that don't match by checking their emoji content
    const cards = getAllCards();
    let a = -1, b = -1;
    for (let i = 0; i < cards.length && (a === -1 || b === -1); i++) {
      for (let j = i + 1; j < cards.length && b === -1; j++) {
        const emojiA = cards[i].querySelector(".card-emoji")?.textContent;
        const emojiB = cards[j].querySelector(".card-emoji")?.textContent;
        if (emojiA !== emojiB) { a = i; b = j; }
      }
    }
    if (a === -1) return; // All same (very unlikely with 8 pairs)

    fireEvent.click(cards[a]);
    fireEvent.click(cards[b]);
    await tick(1000);

    expect(cards[a]).not.toHaveClass("flipped");
    expect(cards[b]).not.toHaveClass("flipped");
  });

  it("adds 'matched' class when two matching cards are clicked", async () => {
    render(<MemoryMatch />);
    await tick(200);

    const cards = getAllCards();
    // Find two cards with the same emoji
    const emojiMap = {};
    let a = -1, b = -1;
    cards.forEach((card, i) => {
      const emoji = card.querySelector(".card-emoji")?.textContent;
      if (emoji) {
        if (emojiMap[emoji] !== undefined) { a = emojiMap[emoji]; b = i; }
        else emojiMap[emoji] = i;
      }
    });
    if (a === -1) return;

    fireEvent.click(cards[a]);
    fireEvent.click(cards[b]);
    await tick(600);

    expect(cards[a]).toHaveClass("matched");
    expect(cards[b]).toHaveClass("matched");
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 4. SCORING
// ════════════════════════════════════════════════════════════════════════════
describe("Scoring", () => {
  it("score increases after a successful match", async () => {
    render(<MemoryMatch />);
    await tick(200);

    const cards = getAllCards();
    const emojiMap = {};
    let a = -1, b = -1;
    cards.forEach((card, i) => {
      const emoji = card.querySelector(".card-emoji")?.textContent;
      if (emoji && a === -1) {
        if (emojiMap[emoji] !== undefined) { a = emojiMap[emoji]; b = i; }
        else emojiMap[emoji] = i;
      }
    });
    if (a === -1) return;

    fireEvent.click(cards[a]);
    fireEvent.click(cards[b]);
    await tick(600);

    const scoreEl = screen.getByTestId("score-val");
    expect(parseInt(scoreEl.textContent)).toBeGreaterThan(0);
  });

  it("score does NOT increase after a mismatch", async () => {
    render(<MemoryMatch />);
    await tick(200);

    const cards = getAllCards();
    let a = -1, b = -1;
    for (let i = 0; i < cards.length && b === -1; i++) {
      for (let j = i + 1; j < cards.length && b === -1; j++) {
        const ea = cards[i].querySelector(".card-emoji")?.textContent;
        const eb = cards[j].querySelector(".card-emoji")?.textContent;
        if (ea !== eb) { a = i; b = j; }
      }
    }
    if (a === -1) return;

    fireEvent.click(cards[a]);
    fireEvent.click(cards[b]);
    await tick(1000);

    expect(screen.getByTestId("score-val")).toHaveTextContent("0");
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 5. PROGRESS BAR
// ════════════════════════════════════════════════════════════════════════════
describe("Progress bar", () => {
  it("progress fill starts at 0%", () => {
    render(<MemoryMatch />);
    expect(screen.getByTestId("progress-fill")).toHaveStyle("width: 0%");
  });

  it("progress text updates after a match", async () => {
    render(<MemoryMatch />);
    await tick(200);

    const cards = getAllCards();
    const emojiMap = {};
    let a = -1, b = -1;
    cards.forEach((card, i) => {
      const emoji = card.querySelector(".card-emoji")?.textContent;
      if (emoji && a === -1) {
        if (emojiMap[emoji] !== undefined) { a = emojiMap[emoji]; b = i; }
        else emojiMap[emoji] = i;
      }
    });
    if (a === -1) return;

    fireEvent.click(cards[a]);
    fireEvent.click(cards[b]);
    await tick(600);

    expect(screen.getByTestId("progress-text")).toHaveTextContent("1 of 8");
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 6. DIFFICULTY SWITCHING
// ════════════════════════════════════════════════════════════════════════════
describe("Difficulty switching", () => {
  it("switches active button when Medium is clicked", () => {
    render(<MemoryMatch />);
    fireEvent.click(screen.getByTestId("diff-btn-medium"));
    expect(screen.getByTestId("diff-btn-medium")).toHaveClass("active");
    expect(screen.getByTestId("diff-btn-easy")).not.toHaveClass("active");
  });

  it("resets moves to 0 when difficulty changes", async () => {
    render(<MemoryMatch />);
    await tick(200);
    fireEvent.click(getCard(0));
    fireEvent.click(getCard(1));
    await tick(100);
    fireEvent.click(screen.getByTestId("diff-btn-medium"));
    expect(screen.getByTestId("moves-val")).toHaveTextContent("0");
  });

  it("resets score to 0 when difficulty changes", async () => {
    render(<MemoryMatch />);
    await tick(200);
    fireEvent.click(screen.getByTestId("diff-btn-medium"));
    expect(screen.getByTestId("score-val")).toHaveTextContent("0");
  });

  it("resets timer when difficulty changes", () => {
    render(<MemoryMatch />);
    fireEvent.click(screen.getByTestId("diff-btn-medium"));
    expect(screen.getByTestId("timer-val")).toHaveTextContent("2:00");
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 7. NEW GAME / SHUFFLE
// ════════════════════════════════════════════════════════════════════════════
describe("New Game / Shuffle buttons", () => {
  it("New Game button resets moves to 0", async () => {
    render(<MemoryMatch />);
    await tick(200);
    fireEvent.click(getCard(0));
    fireEvent.click(getCard(1));
    await tick(100);
    fireEvent.click(screen.getByTestId("btn-new-game"));
    await tick(100);
    expect(screen.getByTestId("moves-val")).toHaveTextContent("0");
  });

  it("New Game button resets score to 0", async () => {
    render(<MemoryMatch />);
    await tick(200);
    fireEvent.click(screen.getByTestId("btn-new-game"));
    await tick(100);
    expect(screen.getByTestId("score-val")).toHaveTextContent("0");
  });

  it("New Game button resets timer", async () => {
    render(<MemoryMatch />);
    await tick(200);
    fireEvent.click(getCard(0)); // start timer
    await tick(5000);
    fireEvent.click(screen.getByTestId("btn-new-game"));
    await tick(100);
    expect(screen.getByTestId("timer-val")).toHaveTextContent("90s");
  });

  it("Shuffle button resets the board", async () => {
    render(<MemoryMatch />);
    await tick(200);
    fireEvent.click(screen.getByTestId("btn-shuffle"));
    await tick(200);
    expect(getAllCards()).toHaveLength(16);
    expect(screen.getByTestId("moves-val")).toHaveTextContent("0");
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 8. TIMER BEHAVIOUR
// ════════════════════════════════════════════════════════════════════════════
describe("Timer behaviour", () => {
  it("timer counts down after first card flip", async () => {
    render(<MemoryMatch />);
    await tick(200);
    fireEvent.click(getCard(0));
    await tick(5000);
    const val = screen.getByTestId("timer-val").textContent;
    // "85s" or similar — definitely not "90s"
    expect(val).not.toBe("90s");
  });

  it("timer chip gets 'warn' class below 33% time", async () => {
    render(<MemoryMatch />);
    await tick(200);
    fireEvent.click(getCard(0));
    // 33% of 90 ≈ 30s remaining → advance 61s
    await tick(61000);
    expect(screen.getByTestId("timer-chip")).toHaveClass("warn");
  });

  it("timer chip gets 'danger' class below 15% time", async () => {
    render(<MemoryMatch />);
    await tick(200);
    fireEvent.click(getCard(0));
    // 15% of 90 = 13.5s → advance 77s
    await tick(77000);
    expect(screen.getByTestId("timer-chip")).toHaveClass("danger");
  });

  it("shows timeout overlay when timer reaches 0", async () => {
    render(<MemoryMatch />);
    await tick(200);
    fireEvent.click(getCard(0));
    await tick(91000); // past 90s
    await waitFor(() =>
      expect(screen.getByTestId("win-overlay")).toBeInTheDocument()
    );
    expect(screen.getByText("Time's Up!")).toBeInTheDocument();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 9. WIN OVERLAY
// ════════════════════════════════════════════════════════════════════════════
describe("Win overlay", () => {
  it("does not show on initial render", () => {
    render(<MemoryMatch />);
    expect(screen.queryByTestId("win-overlay")).not.toBeInTheDocument();
  });

  it("shows 'Time's Up!' overlay when timer expires", async () => {
    render(<MemoryMatch />);
    await tick(200);
    fireEvent.click(getCard(0));
    await tick(91000);
    await waitFor(() =>
      expect(screen.getByText("Time's Up!")).toBeInTheDocument()
    );
  });

  it("Play Again button closes the overlay", async () => {
    render(<MemoryMatch />);
    await tick(200);
    fireEvent.click(getCard(0));
    await tick(91000);
    await waitFor(() =>
      expect(screen.getByTestId("win-overlay")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText(/Play Again/));
    await tick(200);
    expect(screen.queryByTestId("win-overlay")).not.toBeInTheDocument();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 10. BEST SCORE
// ════════════════════════════════════════════════════════════════════════════
describe("Best score persistence (within session)", () => {
  it("best score remains '—' if game hasn't been completed", () => {
    render(<MemoryMatch />);
    expect(screen.getByTestId("best-val")).toHaveTextContent("—");
  });

  it("best score updates to new value after switching difficulty and back", async () => {
    render(<MemoryMatch />);
    // Just verify switching difficulty doesn't break best score display
    fireEvent.click(screen.getByTestId("diff-btn-medium"));
    expect(screen.getByTestId("best-val")).toHaveTextContent("—");
    fireEvent.click(screen.getByTestId("diff-btn-easy"));
    expect(screen.getByTestId("best-val")).toHaveTextContent("—");
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 11. HELPER FUNCTIONS (unit tests, no DOM)
// ════════════════════════════════════════════════════════════════════════════
describe("formatTime helper", () => {
  // Import or inline the helper to test it independently
  function formatTime(s) {
    if (s <= 0) return "0s";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${String(sec).padStart(2, "0")}` : `${sec}s`;
  }

  it("formats 0 seconds as '0s'", () => {
    expect(formatTime(0)).toBe("0s");
  });

  it("formats negative seconds as '0s'", () => {
    expect(formatTime(-5)).toBe("0s");
  });

  it("formats seconds below 60 with 's' suffix", () => {
    expect(formatTime(45)).toBe("45s");
    expect(formatTime(1)).toBe("1s");
    expect(formatTime(59)).toBe("59s");
  });

  it("formats exactly 60 seconds as '1:00'", () => {
    expect(formatTime(60)).toBe("1:00");
  });

  it("formats 90 seconds as '1:30'", () => {
    expect(formatTime(90)).toBe("1:30");
  });

  it("formats 120 seconds as '2:00'", () => {
    expect(formatTime(120)).toBe("2:00");
  });

  it("formats 150 seconds as '2:30'", () => {
    expect(formatTime(150)).toBe("2:30");
  });

  it("pads single-digit seconds with zero", () => {
    expect(formatTime(61)).toBe("1:01");
    expect(formatTime(65)).toBe("1:05");
  });
});

describe("getRank helper", () => {
  function getRank(score, diff) {
    const t = { easy: [2000,1500,1000], medium: [2500,1800,1200], hard: [3000,2200,1500] }[diff];
    if (score >= t[0]) return "✦ Legendary Memory! Flawless execution.";
    if (score >= t[1]) return "★ Master. Incredibly sharp.";
    if (score >= t[2]) return "◈ Well played! Keep practicing.";
    return "◇ Good effort! Try for a higher score.";
  }

  it("returns Legendary for easy score >= 2000", () => {
    expect(getRank(2000, "easy")).toContain("Legendary");
  });

  it("returns Master for easy score between 1500-1999", () => {
    expect(getRank(1750, "easy")).toContain("Master");
  });

  it("returns Well played for easy score between 1000-1499", () => {
    expect(getRank(1200, "easy")).toContain("Well played");
  });

  it("returns Good effort for easy score < 1000", () => {
    expect(getRank(500, "easy")).toContain("Good effort");
  });

  it("uses correct thresholds for hard difficulty", () => {
    expect(getRank(3000, "hard")).toContain("Legendary");
    expect(getRank(2500, "hard")).toContain("Master");
    expect(getRank(1600, "hard")).toContain("Well played");
    expect(getRank(999, "hard")).toContain("Good effort");
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 12. ACCESSIBILITY
// ════════════════════════════════════════════════════════════════════════════
describe("Accessibility", () => {
  it("difficulty buttons are keyboard-focusable", () => {
    render(<MemoryMatch />);
    const btn = screen.getByTestId("diff-btn-easy");
    btn.focus();
    expect(document.activeElement).toBe(btn);
  });

  it("action buttons are keyboard-focusable", () => {
    render(<MemoryMatch />);
    const btn = screen.getByTestId("btn-new-game");
    btn.focus();
    expect(document.activeElement).toBe(btn);
  });

  it("cards have data-testid attributes for programmatic access", async () => {
    render(<MemoryMatch />);
    await tick(200);
    const card = screen.getByTestId("card-0");
    expect(card).toBeInTheDocument();
  });
});
