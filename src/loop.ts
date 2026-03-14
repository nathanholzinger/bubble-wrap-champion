import { Config } from './config';

type UpdateFn = (dt: number) => void;

const subscribers: UpdateFn[] = [];

export function onUpdate(fn: UpdateFn): void {
  subscribers.push(fn);
}

let lastTime = 0;
let running = false;

function tick(timestamp: number): void {
  // Cap dt at 100ms to avoid huge jumps after tab blur/focus
  const dt = Math.min((timestamp - lastTime) / 1000, Config.loop.maxDeltaSec);
  lastTime = timestamp;
  for (const fn of subscribers) fn(dt);
  requestAnimationFrame(tick);
}

export function startLoop(): void {
  if (running) return;
  running = true;
  requestAnimationFrame((t) => {
    lastTime = t;
    requestAnimationFrame(tick);
  });
}
