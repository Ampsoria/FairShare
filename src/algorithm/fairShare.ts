/**
 * ============================================================================
 * FairShare — Greedy Task Distribution Algorithm
 * ============================================================================
 *
 * Distributes an array of tasks among members so that the total "effort score"
 * each member carries is as balanced as possible.
 *
 * APPROACH: Greedy (Longest Processing Time first, "LPT" scheduling)
 *
 *   1. Sort tasks DESCENDING by effortScore (heaviest first).
 *   2. For each task in that order, assign it to the member who currently
 *      has the LOWEST total score.
 *   3. Repeat until no tasks remain.
 *
 * WHY HEAVIEST FIRST?
 *   Imagine assigning the lightest task first. If three people each have a
 *   score of 0, the small task arbitrarily goes to person A. Now person A is
 *   ahead, and the big task that comes later will go to B or C — but at that
 *   point we can no longer balance with smaller tasks. By placing the heavy
 *   tasks first, the smaller ones become "filler" we use to even things out.
 *
 *   This is the classic LPT (Longest Processing Time) heuristic from
 *   scheduling theory. It is provably within 4/3 of the optimal makespan for
 *   the multiprocessor scheduling problem (Graham, 1969). For real-world task
 *   distribution it consistently produces near-optimal results in O(n log n).
 *
 * COMPLEXITY:
 *   Time:  O(T log T + T·M)   where T = #tasks, M = #members
 *          - Sorting tasks once: O(T log T)
 *          - For each of T tasks, scan M members to find the min: O(T·M)
 *   Space: O(T + M)
 *
 *   For very large M, swap the linear scan for a min-heap to get O(T log M).
 *
 * TIE-BREAKING:
 *   When two members share the lowest score, the FIRST one in the input array
 *   wins. This makes the function deterministic — the same input always
 *   produces the same output, which is important for tests and snapshots.
 * ============================================================================
 */

/** A group member who can have tasks assigned to them. */
export interface Member {
  /** Stable unique identifier (e.g. a user UID). */
  id: string | number;
  /** Display name. Not used by the algorithm; carried through for the caller. */
  name: string;
  /** Running total of effort assigned so far. Pass 0 on a fresh run. */
  currentTotalScore: number;
}

/** A task waiting to be assigned. */
export interface Task {
  /** Stable unique identifier. */
  id: string | number;
  /** Display title. Carried through for the caller. */
  title: string;
  /** Difficulty/effort rating. Higher = more demanding. Convention: 1–5. */
  effortScore: number;
}

/** A task after the algorithm has assigned it to a member. */
export interface AssignedTask extends Task {
  /** The member.id this task was given to. */
  assignedTo: string | number;
}

/** Full result of an assignment run — both the per-task assignments and the
 *  updated member totals, so the caller has everything they need in one shot. */
export interface AssignmentResult {
  /** Tasks in the order they were assigned (heaviest → lightest). */
  assignments: AssignedTask[];
  /** A copy of `members` with `currentTotalScore` updated. */
  updatedMembers: Member[];
  /** max(scores) - min(scores). Lower = more balanced. */
  fairnessDelta: number;
}

/**
 * Distribute `tasks` across `members` using the greedy LPT algorithm.
 *
 * IMPORTANT: this function is PURE. It does not mutate the input arrays —
 * callers can re-run it with the same input and always get the same output.
 * This makes it safe to call from React render paths and easy to unit-test.
 *
 * @param members  Group members. Their `currentTotalScore` is the starting
 *                 baseline — pass non-zero values if you are continuing from a
 *                 previous run (e.g. weekly totals carried over).
 * @param tasks    Tasks to assign. Order does not matter; the function sorts
 *                 internally.
 * @returns        See {@link AssignmentResult}.
 *
 * @throws Error if `members` is empty. (Cannot assign tasks to nobody.)
 */
export function assignTasksFairly(
  members: Member[],
  tasks: Task[],
): AssignmentResult {
  // ─── Guard: at least one member required ────────────────────────────────
  // Without members there is no one to assign work to. We throw rather than
  // silently returning an empty result so the bug surfaces loudly.
  if (members.length === 0) {
    throw new Error('assignTasksFairly: members array must not be empty');
  }

  // ─── 1. Clone inputs so the function stays pure ─────────────────────────
  // We will mutate `workingMembers` as we tally scores, but the array the
  // caller passed in must not change.
  const workingMembers: Member[] = members.map((m) => ({ ...m }));

  // ─── 2. Sort tasks by effortScore DESCENDING ────────────────────────────
  // `slice()` first so we don't mutate the caller's `tasks` array.
  // Comparator returns `b - a` to put the LARGEST score first.
  const sortedTasks: Task[] = tasks
    .slice()
    .sort((a, b) => b.effortScore - a.effortScore);

  // ─── 3. Walk the sorted tasks and assign each to the lowest-score member
  const assignments: AssignedTask[] = [];

  for (const task of sortedTasks) {
    // Find the member with the smallest current total. `reduce` starts from
    // index 0 and keeps the smaller of the running candidate vs. the next
    // member. The strict `<` (not `<=`) preserves the tie-break rule:
    // earlier-in-array wins ties.
    const target = workingMembers.reduce((min, current) =>
      current.currentTotalScore < min.currentTotalScore ? current : min,
    );

    // Record the assignment in the result array (immutable view for caller).
    assignments.push({ ...task, assignedTo: target.id });

    // Add this task's effort to the chosen member's running total. This is
    // the only mutation in the function — and it's on our local clone.
    target.currentTotalScore += task.effortScore;
  }

  // ─── 4. Compute fairness delta — a single number summarising balance ────
  // delta = max - min. A delta of 0 means everyone has the same score (best);
  // larger numbers mean the distribution is uneven. A common threshold is 2.
  const scores = workingMembers.map((m) => m.currentTotalScore);
  const fairnessDelta = Math.max(...scores) - Math.min(...scores);

  return {
    assignments,
    updatedMembers: workingMembers,
    fairnessDelta,
  };
}

/**
 * ============================================================================
 * Sample execution
 * ============================================================================
 *
 * Run with:    npx tsx src/algorithm/fairShare.ts
 * (or)         npm install -D tsx && npx tsx src/algorithm/fairShare.ts
 *
 * Expected output below the code.
 */

// Auto-run the demo only when this file is executed directly via Node/tsx
// (`process` does not exist in the browser, hence the typeof guard).
declare const process: { argv: string[] } | undefined;
if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  const members: Member[] = [
    { id: 1, name: 'Ploy', currentTotalScore: 0 },
    { id: 2, name: 'Beam', currentTotalScore: 0 },
    { id: 3, name: 'Mint', currentTotalScore: 0 },
  ];

  const tasks: Task[] = [
    { id: 101, title: 'ทำสไลด์พรีเซนต์',     effortScore: 5 },
    { id: 102, title: 'เขียน abstract',       effortScore: 2 },
    { id: 103, title: 'เขียนรายงาน',          effortScore: 5 },
    { id: 104, title: 'ค้นคว้าข้อมูล',         effortScore: 3 },
    { id: 105, title: 'ออกแบบ poster',        effortScore: 3 },
    { id: 106, title: 'ตรวจการอ้างอิง',       effortScore: 1 },
    { id: 107, title: 'อัดวิดีโอนำเสนอ',      effortScore: 4 },
  ];

  const result = assignTasksFairly(members, tasks);

  console.log('── Assignments (in order processed) ──────────────────────────');
  for (const a of result.assignments) {
    const member = result.updatedMembers.find((m) => m.id === a.assignedTo);
    console.log(
      `  [${a.effortScore}] ${a.title.padEnd(22)} → ${member?.name}`,
    );
  }

  console.log('\n── Final totals ──────────────────────────────────────────────');
  for (const m of result.updatedMembers) {
    console.log(`  ${m.name.padEnd(8)} ${m.currentTotalScore} points`);
  }

  console.log(`\n  fairnessDelta = ${result.fairnessDelta}`);
  console.log(
    `  ${result.fairnessDelta <= 2 ? '✓ Balanced (delta ≤ 2)' : '⚠ Unbalanced'}`,
  );
}

/**
 * ============================================================================
 * Expected output
 * ============================================================================
 *
 * ── Assignments (in order processed) ──────────────────────────
 *   [5] ทำสไลด์พรีเซนต์    → Ploy
 *   [5] เขียนรายงาน         → Beam
 *   [4] อัดวิดีโอนำเสนอ    → Mint
 *   [3] ค้นคว้าข้อมูล        → Mint        ← Mint was at 4, others at 5
 *   [3] ออกแบบ poster      → Ploy        ← Ploy and Beam tied at 5; Ploy first
 *   [2] เขียน abstract     → Beam        ← Beam at 5, others at 7/8
 *   [1] ตรวจการอ้างอิง     → Beam
 *
 * ── Final totals ──────────────────────────────────────────────
 *   Ploy     8 points
 *   Beam     8 points
 *   Mint     7 points
 *
 *   fairnessDelta = 1
 *   ✓ Balanced (delta ≤ 2)
 *
 * Total effort: 5+2+5+3+3+1+4 = 23 points
 * Perfect split: 23/3 ≈ 7.67 per person.
 * Achieved 8/8/7 — only 1 point apart at worst (optimal for integer scores).
 * ============================================================================
 */
