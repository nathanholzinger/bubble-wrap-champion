import './milestones.css';
import { state } from '../../core/state';
import { on } from '../../core/events';
import { Config } from '../../core/config';

// ── Types ────────────────────────────────────────────────────────────────────

type MilestoneTrigger = 'oxygen' | 'sheets';

interface MilestoneDefinition {
  trigger:   MilestoneTrigger;
  threshold: bigint;
  message:   string;
}

// ── Definitions ──────────────────────────────────────────────────────────────

const MILESTONES: MilestoneDefinition[] = [
  // Pop count
  { trigger: 'oxygen', threshold: 10n,   message: '10 POPS — YOU HAVE THE TOUCH' },
  { trigger: 'oxygen', threshold: 100n,  message: '100 POPS — BUBBLE NOVICE' },
  { trigger: 'oxygen', threshold: 1000n, message: '1000 POPS — BUBBLE WRAP CHAMPION' },

  // Sheet count (state.sheets is a number, but BigInt() on small ints is always safe)
  { trigger: 'sheets', threshold: 1n,    message: '1 SHEET — FIRST STEPS' },
  { trigger: 'sheets', threshold: 10n,   message: '10 SHEETS — PRODUCTIVE' },
  { trigger: 'sheets', threshold: 100n,  message: '100 SHEETS — DEDICATED' },
  { trigger: 'sheets', threshold: 1000n, message: '1000 SHEETS — SHEET MACHINE' },
];

// ── State ────────────────────────────────────────────────────────────────────

const bannerEl = document.getElementById('milestoneBanner')!;
let milTimeout: ReturnType<typeof setTimeout> | null = null;

// Tracks milestones shown this session — prevents double-firing
const shown = new Set<string>();

// ── Init ─────────────────────────────────────────────────────────────────────

export function init(): void {
  on('bubble:popped',  () => check('oxygen', state.resources.oxygen));
  // state.sheets is a number but will never approach 2^53 — safe to convert
  on('sheet:complete', () => check('sheets', BigInt(state.completedSheets)));
}

// ── Internal ─────────────────────────────────────────────────────────────────

function check(trigger: MilestoneTrigger, value: bigint): void {
  const id = `${trigger}:${value}`;
  if (shown.has(id)) return;

  const milestone = MILESTONES.find(
    m => m.trigger === trigger && m.threshold === value
  );
  if (!milestone) return;

  shown.add(id);
  showBanner(milestone.message);
}

function showBanner(message: string): void {
  bannerEl.textContent = '>>> ' + message + ' <<<';
  bannerEl.classList.add('show');
  if (milTimeout) clearTimeout(milTimeout);
  milTimeout = setTimeout(
    () => bannerEl.classList.remove('show'),
    Config.milestones.bannerDurationMs,
  );
}
