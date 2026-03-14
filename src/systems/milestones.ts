import { state } from '../state';
import { on } from '../events';
import { Config } from '../config';

// ── Types ────────────────────────────────────────────────────────────────────

type MilestoneTrigger = 'oxygen' | 'sheets';

interface MilestoneDefinition {
  trigger:   MilestoneTrigger;
  threshold: number;
  message:   string;
}

// ── Definitions ──────────────────────────────────────────────────────────────

const MILESTONES: MilestoneDefinition[] = [
  // Pop count
  { trigger: 'oxygen', threshold: 10, message: '10 POPS — YOU HAVE THE TOUCH' },
  { trigger: 'oxygen', threshold: 100, message: '100 POPS — BUBBLE NOVICE' },
  { trigger: 'oxygen', threshold: 1000, message: '1,000 POPS — GETTING SERIOUS' },
  { trigger: 'oxygen', threshold: 10000, message: '10,000 POPS — BUBBLE ADEPT' },
  { trigger: 'oxygen', threshold: 100000, message: '100,000 POPS — BUBBLE VETERAN' },
  { trigger: 'oxygen', threshold: 1000000, message: '1,000,000 POPS — BUBBLE WRAP CHAMPION' },

  // Sheet count
  { trigger: 'sheets', threshold: 5, message: '5 SHEETS — FIRST STEPS' },
  { trigger: 'sheets', threshold: 50, message: '50 SHEETS — PRODUCTIVE' },
  { trigger: 'sheets', threshold: 500, message: '500 SHEETS — DEDICATED' },
  { trigger: 'sheets', threshold: 5000, message: '5,000 SHEETS — SHEET MACHINE' },
  { trigger: 'sheets', threshold: 50000, message: '50,000 SHEETS — SHEET WRAP CHAMPION' },
  { trigger: 'sheets', threshold: 500000, message: '500,000 SHEETS — SHEET GOD' },
];

// ── State ────────────────────────────────────────────────────────────────────

const bannerEl = document.getElementById('milestoneBanner')!;
let milTimeout: ReturnType<typeof setTimeout> | null = null;

// Tracks milestones shown this session — prevents double-firing
const shown = new Set<string>();

// ── Init ─────────────────────────────────────────────────────────────────────

export function init(): void {
  on('bubble:popped',  () => check('oxygen', Number(state.resources.oxygen)));
  on('sheet:complete', () => check('sheets', state.sheets));
}

// ── Internal ─────────────────────────────────────────────────────────────────

function check(trigger: MilestoneTrigger, value: number): void {
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
