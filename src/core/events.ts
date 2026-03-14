export type EventMap = {
  'bubble:popped':    { x: number; y: number };
  'sheet:complete':   undefined;
  'sheet:new':        undefined;
  'stack:restocked':  undefined;
  'resources:produced': undefined;
};

type Handler<T> = (payload: T) => void;

const listeners = new Map<string, Handler<unknown>[]>();

export function on<K extends keyof EventMap>(
  event: K,
  handler: Handler<EventMap[K]>,
): void {
  const list = listeners.get(event) ?? [];
  list.push(handler as Handler<unknown>);
  listeners.set(event, list);
}

// Payload is optional when the event type is undefined
export function emit<K extends keyof EventMap>(
  event: K,
  ...args: EventMap[K] extends undefined ? [payload?: undefined] : [payload: EventMap[K]]
): void {
  listeners.get(event)?.forEach(h => h(args[0] as unknown));
}
