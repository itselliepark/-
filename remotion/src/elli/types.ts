export type SubStyle = 'normal' | 'mint' | 'red' | 'yellow';
export type Sub = {t: number; text: string; style?: SubStyle; label?: string; vo?: string}; // vo: voiceover line read at t ('' = none)
export type Card = {start: number; end: number; kind: 'table' | 'warn' | 'check'; heading: string; rows: string[][]; rowTimes?: number[]; plain?: boolean; note?: string; alpha?: number};
export type Sfx = {t: number; kind: 'pop' | 'whoosh' | 'ding' | 'buzz' | 'thud'};

export type EditSpec = {
  video: string;
  duration: number;
  title?: {line1: string; line2: string; label?: string; end: number};
  subs: Sub[];
  zooms: [number, number][];
  // Optional framing schedule [start s, scale]; when present it replaces `zooms`.
  framing?: [number, number][];
  // Slow zoom ramps [start s, end s, from scale, to scale] (e.g. a gentle push-in right before a punch-in).
  ramps?: [number, number, number, number][];
  tips: {start: number; end: number; n: number; label: string}[];
  total: number;
  cards: Card[];
  // White opacity for cards and tiles (overrides the skin); a card's own `alpha` wins.
  cardAlpha?: number;
  // Term tiles: each pops in when its term is spoken and sits side by side with the others.
  tiles?: {start: number; end: number; title: string; body: string}[];
  // Icon row: each icon pops in at its own start, left to right.
  icons?: {start: number; end: number; kind: 'youtube' | 'instagram' | 'emoji'; emoji?: string; label: string}[];
  // Casual speech-bubble notes (emoji welcome), stacked and slightly tilted.
  bubbles?: {start: number; end: number; text: string; side?: 'left' | 'right'}[];
  // Scattered emoji chips (e.g. "too many materials"), each pops at its own time at x/y in px.
  // Real captures (score reports, DMs) shown big over the face inside a frosted-glass frame.
  // A running list (e.g. ingredients picked) in a glass panel; each item pops at its time.
  list?: {start: number; end: number; title: string; items: {t: number; text: string}[]};
  overlays?: {start: number; end: number; src: string; width?: number; frame?: boolean}[];
  scatter?: {start: number; end: number; emoji: string; x: number; y: number; rot?: number}[];
  cta?: {start: number; text: string};
  sfx: Sfx[];
};
