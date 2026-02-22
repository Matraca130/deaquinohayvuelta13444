// ============================================================
// Axon — FSRS v4 (Free Spaced Repetition Scheduler)
// Client-side implementation for scheduling flashcard reviews
//
// Reference: https://github.com/open-spaced-repetition/fsrs4anki
// ============================================================

export type FSRSState = 'new' | 'learning' | 'review' | 'relearning';

export interface FSRSCard {
  flashcard_id: string;
  stability: number;       // S: memory stability in days
  difficulty: number;      // D: 0-10
  due_at: string;          // ISO date
  last_review_at: string | null;
  reps: number;
  lapses: number;
  state: FSRSState;
}

export interface FSRSScheduleResult {
  stability: number;
  difficulty: number;
  due_at: string;
  last_review_at: string;
  reps: number;
  lapses: number;
  state: FSRSState;
}

// ── Default parameters (FSRS v4 defaults) ─────────────────

const W = [
  0.4, 0.6, 2.4, 5.8,       // w0-w3: initial stability
  4.93, 0.94, 0.86, 0.01,    // w4-w7: difficulty
  1.49, 0.14, 0.94,          // w8-w10: stability increase
  2.18, 0.05, 0.34, 1.26,    // w11-w14: recall
  0.29, 2.61,                // w15-w16: forget
];

// ── Core calculations ──────────────────────────────────────

/** Initial stability for a new card based on first rating (grade 0-5) */
function initialStability(grade: number): number {
  // Clamp grade to valid range for initial stability lookup
  const g = Math.max(1, Math.min(4, Math.round(grade)));
  return Math.max(0.1, W[g - 1]);
}

/** Initial difficulty based on first rating */
function initialDifficulty(grade: number): number {
  // D0(G) = w4 - (G - 3) * w5
  return clamp(W[4] - (grade - 3) * W[5], 1, 10);
}

/** Update difficulty after a review */
function nextDifficulty(d: number, grade: number): number {
  // D'(D, G) = w7 * D0(4) + (1 - w7) * (D - w6 * (G - 3))
  const d0 = initialDifficulty(4);
  const newD = W[7] * d0 + (1 - W[7]) * (d - W[6] * (grade - 3));
  return clamp(newD, 1, 10);
}

/** Calculate retrievability (probability of recall) */
function retrievability(stability: number, elapsedDays: number): number {
  if (stability <= 0 || elapsedDays <= 0) return 1;
  return Math.pow(1 + elapsedDays / (9 * stability), -1);
}

/** Next stability after successful recall */
function nextStabilitySuccess(
  d: number,
  s: number,
  r: number,
  grade: number
): number {
  // S'r = S * (e^(w8) * (11 - D) * S^(-w9) * (e^(w10 * (1 - R)) - 1) * hardPenalty * easyBonus + 1)
  const hardPenalty = grade === 2 ? W[15] : 1;
  const easyBonus = grade === 4 ? W[16] : 1;
  const newS =
    s *
    (1 +
      Math.exp(W[8]) *
        (11 - d) *
        Math.pow(s, -W[9]) *
        (Math.exp(W[10] * (1 - r)) - 1) *
        hardPenalty *
        easyBonus);
  return Math.max(0.1, newS);
}

/** Next stability after forgetting (lapse) */
function nextStabilityFail(
  d: number,
  s: number,
  r: number
): number {
  // S'f = w11 * D^(-w12) * ((S + 1)^w13 - 1) * e^(w14 * (1 - R))
  const newS =
    W[11] *
    Math.pow(d, -W[12]) *
    (Math.pow(s + 1, W[13]) - 1) *
    Math.exp(W[14] * (1 - r));
  return Math.max(0.1, Math.min(newS, s)); // never higher than current
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

// ── Main scheduling function ───────────────────────────────

/**
 * Schedule the next review for a card based on the student's grade.
 *
 * @param card Current FSRS state
 * @param grade Student's self-assessment (1 = Again, 2 = Hard, 3 = Good, 4 = Easy, 5 = Perfect)
 *              We map 0-5 backend grades to FSRS 1-4 internally
 * @returns Updated FSRS parameters
 */
export function scheduleReview(
  card: FSRSCard,
  grade: number // 0-5 scale from UI
): FSRSScheduleResult {
  const now = new Date();
  const nowISO = now.toISOString();

  // Map 0-5 grade to FSRS quality (1=Again, 2=Hard, 3=Good, 4=Easy)
  const fsrsGrade = mapGradeToFSRS(grade);
  const passed = fsrsGrade >= 3; // Good or Easy = pass

  // Calculate elapsed days since last review
  let elapsedDays = 0;
  if (card.last_review_at) {
    const lastReview = new Date(card.last_review_at);
    elapsedDays = Math.max(0, (now.getTime() - lastReview.getTime()) / 86400000);
  }

  let newS: number;
  let newD: number;
  let newState: FSRSState;
  let newReps = card.reps;
  let newLapses = card.lapses;

  if (card.state === 'new') {
    // First review of a new card
    newS = initialStability(fsrsGrade);
    newD = initialDifficulty(fsrsGrade);
    newReps = 1;
    newState = passed ? 'review' : 'learning';
    if (!passed) newLapses++;
  } else {
    // Subsequent reviews
    const r = retrievability(card.stability, elapsedDays);
    newD = nextDifficulty(card.difficulty, fsrsGrade);
    newReps = card.reps + 1;

    if (passed) {
      newS = nextStabilitySuccess(newD, card.stability, r, fsrsGrade);
      newState = 'review';
    } else {
      newS = nextStabilityFail(newD, card.stability, r);
      newLapses = card.lapses + 1;
      newState = card.state === 'review' ? 'relearning' : 'learning';
    }
  }

  // Calculate next due date
  let intervalDays: number;
  if (!passed) {
    // Failed: short interval (1 min → ~0.0007 days, but we use at least 10 minutes)
    intervalDays = newState === 'learning' ? 0.007 : 0.01; // ~10-15 min
  } else if (fsrsGrade === 2) {
    // Hard: interval = stability * 1.2 (but at least 1 day)
    intervalDays = Math.max(1, newS * 1.2);
  } else if (fsrsGrade === 3) {
    // Good: interval = stability
    intervalDays = Math.max(1, newS);
  } else {
    // Easy: interval = stability * 1.3 (generous)
    intervalDays = Math.max(1, newS * 1.3);
  }

  const dueDate = new Date(now.getTime() + intervalDays * 86400000);

  return {
    stability: Math.round(newS * 100) / 100,
    difficulty: Math.round(newD * 100) / 100,
    due_at: dueDate.toISOString(),
    last_review_at: nowISO,
    reps: newReps,
    lapses: newLapses,
    state: newState,
  };
}

/** Map UI grade (0-5) to FSRS grade (1-4) */
function mapGradeToFSRS(grade: number): number {
  if (grade <= 1) return 1;      // Again
  if (grade === 2) return 2;     // Hard
  if (grade === 3 || grade === 4) return 3; // Good
  return 4;                       // Easy (grade 5)
}

/**
 * Create a default FSRS card for a flashcard that hasn't been studied yet
 */
export function createNewFSRSCard(flashcardId: string): FSRSCard {
  return {
    flashcard_id: flashcardId,
    stability: 0,
    difficulty: 0,
    due_at: new Date().toISOString(),
    last_review_at: null,
    reps: 0,
    lapses: 0,
    state: 'new',
  };
}

/**
 * Check if a card is due for review
 */
export function isDue(card: FSRSCard): boolean {
  if (card.state === 'new') return true;
  return new Date(card.due_at) <= new Date();
}

/**
 * Sort cards for study: due cards first (by urgency), then new cards
 */
export function sortForStudy(cards: FSRSCard[]): FSRSCard[] {
  const now = new Date();
  return [...cards].sort((a, b) => {
    // New cards go last
    if (a.state === 'new' && b.state !== 'new') return 1;
    if (a.state !== 'new' && b.state === 'new') return -1;
    // Learning/relearning before review
    if ((a.state === 'learning' || a.state === 'relearning') && b.state === 'review') return -1;
    if (a.state === 'review' && (b.state === 'learning' || b.state === 'relearning')) return 1;
    // Within same state: most overdue first
    return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
  });
}
