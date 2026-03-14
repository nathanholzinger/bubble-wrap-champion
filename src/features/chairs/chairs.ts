import './chairs.css';
import { state } from '../../core/state';

// Purchase order → position (1st=south, 2nd=north, 3rd=east, 4th=west)
const POSITIONS = ['south', 'north', 'east', 'west'] as const;
type ChairPos = typeof POSITIONS[number];

const wrapper = document.querySelector('.sheet-wrapper') as HTMLElement;
const chairEls: Partial<Record<ChairPos, HTMLElement>> = {};

function createChair(pos: ChairPos): HTMLElement {
  const el = document.createElement('div');
  el.className = `chair chair--${pos}`;
  return el;
}

export function updateChairs(): void {
  const count = state.purchases['chairUpgrade'] ?? 0;
  POSITIONS.forEach((pos, i) => {
    const exists      = !!chairEls[pos];
    const shouldExist = i < count;
    if (shouldExist && !exists) {
      const el = createChair(pos);
      wrapper.appendChild(el);
      chairEls[pos] = el;
    } else if (!shouldExist && exists) {
      chairEls[pos]!.remove();
      delete chairEls[pos];
    }
  });
}
